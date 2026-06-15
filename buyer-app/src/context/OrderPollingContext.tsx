"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  fetchBuyerOrdersAction,
  fetchOrderByIdAction,
  fetchDeliveryTrackingAction,
} from "@/actions/buyerActions";
import type { OrderResponseDto } from "@/types/order";
import type { DeliveryTracking } from "@/types/delivery";

// Simple option inside the code to easily disable periodic queries
const ENABLE_ORDER_POLLING = true;

export interface OrderPollingContextType {
  orders: Record<string, OrderResponseDto>;
  deliveryTrackings: Record<string, DeliveryTracking | null>;
  shippingCosts: Record<string, number>;
  serviceFees: Record<string, number>;
  registerOrder: (
    order: OrderResponseDto,
    deliveryTracking: DeliveryTracking | null,
    shippingCost: number,
    serviceFee: number
  ) => void;
  refetchOrder: (orderId: string) => Promise<void>;
}

const OrderPollingContext = createContext<OrderPollingContextType | null>(null);

export function OrderPollingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [orders, setOrders] = useState<Record<string, OrderResponseDto>>({});
  const [deliveryTrackings, setDeliveryTrackings] = useState<Record<string, DeliveryTracking | null>>({});
  const [shippingCosts, setShippingCosts] = useState<Record<string, number>>({});
  const [serviceFees, setServiceFees] = useState<Record<string, number>>({});

  const activeOrderIdsRef = useRef<Set<string>>(new Set());
  const lastPolledTimesRef = useRef<Record<string, number>>({});

  const registerOrder = (
    order: OrderResponseDto,
    deliveryTracking: DeliveryTracking | null,
    shippingCost: number,
    serviceFee: number
  ) => {
    const orderId = order.orderId || order.id;
    setOrders((prev) => {
      if (prev[orderId] && prev[orderId].estadoDelPedido === order.estadoDelPedido) {
        return prev;
      }
      const updated = { ...prev };
      updated[orderId] = order;
      return updated;
    });
    setDeliveryTrackings((prev) => {
      if (prev[orderId] === deliveryTracking) return prev;
      const updated = { ...prev };
      updated[orderId] = deliveryTracking;
      return updated;
    });
    setShippingCosts((prev) => {
      if (prev[orderId] === shippingCost) return prev;
      const updated = { ...prev };
      updated[orderId] = shippingCost;
      return updated;
    });
    setServiceFees((prev) => {
      if (prev[orderId] === serviceFee) return prev;
      const updated = { ...prev };
      updated[orderId] = serviceFee;
      return updated;
    });

    if (order.estadoDelPedido !== "DELIVERED" && order.estadoDelPedido !== "CANCELLED") {
      activeOrderIdsRef.current.add(orderId);
    } else {
      activeOrderIdsRef.current.delete(orderId);
    }
  };

  const refetchOrder = async (orderId: string) => {
    const res = await fetchOrderByIdAction(orderId);
    if (res.success && res.data) {
      const updatedOrder = res.data;
      const prevOrder = orders[orderId];

      // Update UI only if there's a change in the status of the order
      if (!prevOrder || prevOrder.estadoDelPedido !== updatedOrder.estadoDelPedido) {
        setOrders((prev) => {
          const updated = { ...prev };
          updated[orderId] = updatedOrder;
          return updated;
        });

        // If status became ON_THE_WAY, fetch delivery tracking
        if (updatedOrder.estadoDelPedido === "ON_THE_WAY") {
          const trackRes = await fetchDeliveryTrackingAction(orderId);
          if (trackRes.success) {
            setDeliveryTrackings((prev) => {
              const updated = { ...prev };
              updated[orderId] = trackRes.data ?? null;
              return updated;
            });
          }
        }
      }

      if (updatedOrder.estadoDelPedido === "DELIVERED" || updatedOrder.estadoDelPedido === "CANCELLED") {
        activeOrderIdsRef.current.delete(orderId);
      } else {
        activeOrderIdsRef.current.add(orderId);
      }
    }
  };

  // Fetch all orders on mount to discover active orders
  useEffect(() => {
    if (!ENABLE_ORDER_POLLING) return;

    const initActiveOrders = async () => {
      const res = await fetchBuyerOrdersAction();
      if (res.success && res.data) {
        res.data.forEach((order) => {
          if (order.status !== "DELIVERED" && order.status !== "CANCELLED") {
            activeOrderIdsRef.current.add(order.id);
          }
        });
      }
    };
    void initActiveOrders();
  }, []);

  // Main polling interval check (runs every 5 seconds to check elapsed time since last poll)
  useEffect(() => {
    if (!ENABLE_ORDER_POLLING) return;

    const intervalId = setInterval(async () => {
      const now = Date.now();
      const activeIds = Array.from(activeOrderIdsRef.current);
      if (activeIds.length === 0) return;

      // Extract current tracked order ID from pathname, e.g. /orders/some-id/tracking
      const match = pathname.match(/^\/orders\/([^/]+)\/tracking/);
      const trackedOrderId = match ? match[1] : null;

      // Check if we should poll the currently tracked order (every 15 seconds)
      if (trackedOrderId && activeOrderIdsRef.current.has(trackedOrderId)) {
        const lastPolled = lastPolledTimesRef.current[trackedOrderId] || 0;
        if (now - lastPolled >= 15000) {
          lastPolledTimesRef.current[trackedOrderId] = now;
          void refetchOrder(trackedOrderId);
        }
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [pathname, orders]);

  return (
    <OrderPollingContext.Provider
      value={{
        orders,
        deliveryTrackings,
        shippingCosts,
        serviceFees,
        registerOrder,
        refetchOrder,
      }}
    >
      {children}
    </OrderPollingContext.Provider>
  );
}

export function useOrderPolling() {
  const context = useContext(OrderPollingContext);
  if (!context) {
    throw new Error("useOrderPolling must be used within OrderPollingProvider");
  }
  return context;
}
