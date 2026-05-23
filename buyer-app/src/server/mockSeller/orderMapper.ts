import "server-only";

/**
 * Mapper para transformar entidades Prisma a DTOs
 * Responsabilidad: transformación de datos
 * NO expone entidades Prisma directamente a la UI
 */

import type {
  OrderResponseDto,
  BuyerOrderDto,
} from "./orderTypes";
import type { MockSellerOrder, MockSellerOrderItem } from "@prisma/client";

export const orderMapper = {
  /**
   * Transforma una orden Prisma a DTO de respuesta
   */
  toOrderResponseDto(
    order: MockSellerOrder & {
      items: MockSellerOrderItem[];
    },
    storeName: string,
    productNames: Map<string, string>
  ): OrderResponseDto {
    return {
      id: order.id,
      buyerId: order.buyerId,
      storeId: order.storeId,
      storeName,
      totalAmount: Number(order.totalAmount),
      totalWeight: Number(order.totalWeight),
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName:
          productNames.get(item.productId) ||
          `Producto ${item.productId.slice(0, 8)}`,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  },

  /**
   * Transforma una orden Prisma a DTO simplificado para listados
   */
  toBuyerOrderDto(
    order: MockSellerOrder & {
      items: MockSellerOrderItem[];
    },
    storeName: string
  ): BuyerOrderDto {
    return {
      id: order.id,
      storeId: order.storeId,
      storeName,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  },
};
