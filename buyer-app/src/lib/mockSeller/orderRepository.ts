/**
 * Repository para acceso a Prisma
 * Responsabilidad: persistencia de datos
 * NO contiene lógica de negocio
 */

import { prisma } from "@/lib/prisma";
import type {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderResponseDto,
} from "./orderTypes";

export const orderRepository = {
  /**
   * Crea una orden con sus items en la base de datos
   */
  async createOrder(
    buyerId: string,
    storeId: string,
    deliveryAddress: string,
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
    totalAmount: number,
    totalWeight: number
  ) {
    return await prisma.mockSellerOrder.create({
      data: {
        buyerId,
        storeId,
        deliveryAddress,
        totalAmount,
        totalWeight,
        status: "PENDING_PAYMENT",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  },

  /**
   * Obtiene una orden por ID con sus items
   */
  async getOrderById(orderId: string) {
    return await prisma.mockSellerOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });
  },

  /**
   * Obtiene todas las órdenes de un comprador
   */
  async getBuyerOrders(buyerId: string) {
    return await prisma.mockSellerOrder.findMany({
      where: { buyerId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Actualiza el estado de una orden
   */
  async updateOrderStatus(
    orderId: string,
    status: "PENDING_PAYMENT" | "CONFIRMED" | "READY" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED"
  ) {
    return await prisma.mockSellerOrder.update({
      where: { id: orderId },
      data: {
        status,
      },
      include: {
        items: true,
      },
    });
  },
};
