import "server-only";

import { apiClient } from "@/server/integrations/baseClient";
import { mockSellerOrderService } from "@/server/mockSeller";
import {
  SELLER_API_URL,
  useSellerOrderMock,
} from "./seller.config";
import type {
  BuyerOrderDto,
  CreateOrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from "./seller.types";

export async function createOrder(
  dto: CreateOrderDto
): Promise<OrderResponseDto> {
  if (!useSellerOrderMock) {
    const response = await apiClient("/api/orders", {
      method: "POST",
      serviceUrl: SELLER_API_URL,
      body: JSON.stringify(dto),
    });
    const order: OrderResponseDto = response.data ?? response;
    console.log("Create order response");
    console.log(order);
    return order;
  }

  return mockSellerOrderService.createOrder(dto);
}

export async function getOrderById(
  orderId: string
): Promise<OrderResponseDto> {
  console.log("orderId: ", orderId);
  if (!useSellerOrderMock) {
    const response = await apiClient(`/api/orders/${orderId}`, {
      method: "GET",
      serviceUrl: SELLER_API_URL,
    });
    const order: OrderResponseDto = response.data ?? response;
    console.log("Order details response");
    console.log(order);
    return order;
  } 
  return mockSellerOrderService.getOrderById(orderId);
}

export async function getBuyerOrders(
  buyerId: string
): Promise<BuyerOrderDto[]> {
  if (!useSellerOrderMock) {
    console.log("Fetching buyer orders for buyer ID:", buyerId);
    const response = await apiClient(
      `/api/orders?buyerId=${encodeURIComponent(buyerId)}`, {
      method: "GET",
      serviceUrl: SELLER_API_URL,
    });
    const orders: BuyerOrderDto[] = response.data ?? response;
    console.log("Buyer orders response");
    console.log(orders);
    return orders;
  }

  return mockSellerOrderService.getBuyerOrders(buyerId);
}

export async function updateOrderStatus(
  dto: UpdateOrderStatusDto
): Promise<OrderResponseDto> {
  if (!useSellerOrderMock) {
    return apiClient(
      `/api/orders/${dto.orderId}/status`,
      {
        method: "PATCH",
        serviceUrl: SELLER_API_URL,
        body: JSON.stringify({ status: dto.status }),
      }
    ) as Promise<OrderResponseDto>;
  }

  return mockSellerOrderService.updateOrderStatus(dto);
}
