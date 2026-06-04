import "server-only";

import { apiClient } from "@/server/integrations/baseClient";
import { mockSellerOrderService } from "@/server/mockSeller";
import { SELLER_API_URL, useSellerMock } from "./seller.config";
import type {
  BuyerOrderDto,
  CreateOrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from "./seller.types";

export async function createOrder(
  dto: CreateOrderDto
): Promise<OrderResponseDto> {
  if (!useSellerMock) {
    return apiClient("/api/orders", {
      method: "POST",
      serviceUrl: SELLER_API_URL,
      body: JSON.stringify(dto),
    }) as Promise<OrderResponseDto>;
  }

  return mockSellerOrderService.createOrder(dto);
}

export async function getOrderById(
  orderId: string
): Promise<OrderResponseDto> {
  if (!useSellerMock) {
    return apiClient(`/api/orders/${orderId}`, {
      method: "GET",
      serviceUrl: SELLER_API_URL,
    }) as Promise<OrderResponseDto>;
  }

  return mockSellerOrderService.getOrderById(orderId);
}

export async function getBuyerOrders(
  buyerId: string
): Promise<BuyerOrderDto[]> {
  if (!useSellerMock) {
    return apiClient("/api/orders", {
      method: "POST",
      serviceUrl: SELLER_API_URL,
      body: JSON.stringify({ buyerId }),
    }) as Promise<BuyerOrderDto[]>;
  }

  return mockSellerOrderService.getBuyerOrders(buyerId);
}

export async function updateOrderStatus(
  dto: UpdateOrderStatusDto
): Promise<OrderResponseDto> {
  if (!useSellerMock) {
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
