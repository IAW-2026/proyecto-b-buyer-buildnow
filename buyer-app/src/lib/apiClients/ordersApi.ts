/**
 * Orders API Client
 * 
 * DEPRECATED: Este archivo se mantiene por compatibilidad.
 * El código nuevo debe usar sellerApi directamente.
 * 
 * sellerApi.ts es ahora la puerta de acceso única a Seller App,
 * incluyendo gestión de órdenes.
 */

import { Order, OrderItem } from "@/types/order";
import * as sellerApi from "./sellerApi";

export const ordersApi = {
  /**
   * Get all orders for a buyer
   * @deprecated Use sellerApi.getBuyerOrders() instead
   */
  getOrdersByBuyer: async (buyerId: string): Promise<Order[]> => {
    try {
      const orders =
        await sellerApi.getBuyerOrders(buyerId);

      return orders.map((order) => ({
        id: order.id,
        buyerId,
        storeId: order.storeId,
        storeName: order.storeName,
        totalAmount: order.totalAmount,
        status: order.status as Order["status"],
        deliveryAddress: order.deliveryAddress,
        items: [],
        createdAt: order.createdAt,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  /**
   * Create a new order
   * @deprecated Use sellerApi.createOrder() instead
   */
  createOrder: async (
    buyerId: string,
    storeId: string,
    deliveryAddress: string,
    items: OrderItem[]
  ): Promise<Order | null> => {
    try {
      const response = await sellerApi.createOrder({
        buyerId,
        storeId,
        deliveryAddress,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      if (response) {
        return {
          id: response.id,
          buyerId: response.buyerId,
          storeId: response.storeId,
          storeName: response.storeName,
          totalAmount: response.totalAmount,
          status: response.status as Order["status"],
          deliveryAddress: response.deliveryAddress,
          items: response.items || [],
          createdAt: response.createdAt,
        };
      }

      return null;
    } catch (error) {
      console.error("Error creating order:", error);
      return null;
    }
  },

  /**
   * Get a specific order by ID
   * @deprecated Use sellerApi.getOrderById() instead
   */
  getOrderById: async (
    orderId: string
  ): Promise<Order | null> => {
    try {
      const response =
        await sellerApi.getOrderById(orderId);

      if (response) {
        return {
          id: response.id,
          buyerId: response.buyerId,
          storeId: response.storeId,
          storeName: response.storeName,
          totalAmount: response.totalAmount,
          status: response.status as Order["status"],
          deliveryAddress: response.deliveryAddress,
          items: response.items || [],
          createdAt: response.createdAt,
        };
      }

      return null;
    } catch (error) {
      console.error(
        `Error fetching order ${orderId}:`,
        error
      );
      return null;
    }
  },
};
