"use server";

import { requireBuyer } from "@/lib/auth/requireBuyer";
import {
  checkoutBuyerCartService,
  createBuyerOrderService,
  getBuyerOrdersService,
} from "@/server/services/order.service";
import type { ActionResponse } from "@/types/action-response";
import type {
  BuyerOrderDto,
  OrderResponseDto,
} from "@/types/order";

function buyerNotFoundResponse<T>(): ActionResponse<T> {
  return {
    success: false,
    error: "Comprador no encontrado",
  };
}

export async function fetchBuyerOrdersAction(): Promise<
  ActionResponse<BuyerOrderDto[]>
> {
  try {
    const { userId } = await requireBuyer();
    const orders = await getBuyerOrdersService(userId);

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Error fetching buyer orders:", error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        ...buyerNotFoundResponse<BuyerOrderDto[]>(),
        data: [],
      };
    }

    return {
      success: false,
      error: "Ocurrio un error al obtener los pedidos",
      data: [],
    };
  }
}

export async function createOrderAction(
  storeId: string,
  deliveryAddress: string,
  items: Array<{ productId: string; quantity: number }>
): Promise<ActionResponse<OrderResponseDto>> {
  try {
    const { userId } = await requireBuyer();
    const order = await createBuyerOrderService(
      userId,
      storeId,
      deliveryAddress,
      items
    );

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Error creating order:", error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return buyerNotFoundResponse<OrderResponseDto>();
    }

    return {
      success: false,
      error: "Ocurrio un error al crear la orden",
    };
  }
}

export async function checkoutAction(
  deliveryAddress: string
): Promise<
  ActionResponse<{
    orderId: string;
    orders: OrderResponseDto[];
  }>
> {
  try {
    const { userId } = await requireBuyer();
    const checkout = await checkoutBuyerCartService(
      userId,
      deliveryAddress
    );

    return {
      success: true,
      data: checkout,
    };
  } catch (error) {
    console.error("Error in checkout:", error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return buyerNotFoundResponse<{
        orderId: string;
        orders: OrderResponseDto[];
      }>();
    }

    if (
      error instanceof Error &&
      error.message === "EMPTY_CART"
    ) {
      return {
        success: false,
        error: "El carrito esta vacio",
      };
    }

    if (
      error instanceof Error &&
      error.message === "ORDER_CREATION_FAILED"
    ) {
      return {
        success: false,
        error: "No se pudieron crear las ordenes",
      };
    }

    return {
      success: false,
      error: "Ocurrio un error al procesar el checkout",
    };
  }
}
