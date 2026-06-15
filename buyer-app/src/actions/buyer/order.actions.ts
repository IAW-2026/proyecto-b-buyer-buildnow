"use server";

import { requireBuyer } from "@/lib/auth/requireBuyer";
import { getCurrentBuyer } from "@/server/services/buyer.service";
import {
  checkoutBuyerCartService,
  createBuyerOrderService,
  getBuyerOrdersService,
  prepareCheckoutService,
  initiatePaymentService,
  getBuyerOrderTrackingService,
} from "@/server/services/order.service";
import { getOrderById } from "@/server/integrations/seller";
import { getOrderTracking } from "@/server/integrations/delivery/delivery.client";
import type { ActionResponse } from "@/types/action-response";
import type {
  BuyerOrderDto,
  OrderResponseDto,
} from "@/types/order";
import type { DeliveryTracking } from "@/types/delivery";
import type { PaymentResponseDto } from "@/server/integrations/payment";

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
    const buyer = getCurrentBuyer(userId);
    const orders = await getBuyerOrdersService((await buyer).clerkId);

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
    payment?: PaymentResponseDto;
  }>
> {
  try {
    const { userId } = await requireBuyer();
    const clerkId = await getCurrentBuyer(userId).then((buyer) => buyer.clerkId);
    const checkout = await checkoutBuyerCartService(
      clerkId,
      deliveryAddress
    );
    console.log("Checkout result:");
    console.log(checkout);
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
        payment?: PaymentResponseDto;
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
      error.message === "DELIVERY_ADDRESS_REQUIRED"
    ) {
      return {
        success: false,
        error: "Debes seleccionar una direccion de entrega",
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

    if (
      error instanceof Error &&
      error.message === "PAYMENT_CREATION_FAILED"
    ) {
      return {
        success: false,
        error: "No se pudo iniciar el proceso de pago. Intenta nuevamente.",
      };
    }

    return {
      success: false,
      error: "Ocurrio un error al procesar el checkout",
    };
  }
}

export async function prepareCheckoutAction(
  deliveryAddress: string
): Promise<
  ActionResponse<{
    orderId: string;
    subtotal: number;
    shippingCost: number;
    serviceFee: number;
    total: number;
  }>
> {
  try {
    const { userId } = await requireBuyer();
    const clerkId = await getCurrentBuyer(userId).then((buyer) => buyer.clerkId);
    const result = await prepareCheckoutService(clerkId, deliveryAddress);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error in prepareCheckoutAction:", error);
    if (error instanceof Error && error.message === "BUYER_NOT_FOUND") {
      return buyerNotFoundResponse<{
        orderId: string;
        subtotal: number;
        shippingCost: number;
        serviceFee: number;
        total: number;
      }>();
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al procesar el checkout",
    };
  }
}

export async function initiatePaymentAction(
  orderId: string,
  shippingCost: number,
  serviceFee: number
): Promise<
  ActionResponse<{
    payment: PaymentResponseDto;
  }>
> {
  try {
    const { userId } = await requireBuyer();
    const clerkId = await getCurrentBuyer(userId).then((buyer) => buyer.clerkId);
    const result = await initiatePaymentService(clerkId, orderId, shippingCost, serviceFee);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error in initiatePaymentAction:", error);
    if (error instanceof Error && error.message === "BUYER_NOT_FOUND") {
      return buyerNotFoundResponse<{
        payment: PaymentResponseDto;
      }>();
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al iniciar el pago",
    };
  }
}

export async function fetchOrderByIdAction(
  orderId: string
): Promise<ActionResponse<OrderResponseDto>> {
  try {
    await requireBuyer();
    const order = await getOrderById(orderId);
    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Error in fetchOrderByIdAction:", error);
    return {
      success: false,
      error: "Error al obtener la orden",
    };
  }
}

export async function fetchDeliveryTrackingAction(
  orderId: string
): Promise<ActionResponse<DeliveryTracking | null>> {
  try {
    await requireBuyer();
    const tracking = await getOrderTracking(orderId);
    return {
      success: true,
      data: tracking[0] ?? null,
    };
  } catch (error) {
    console.error("Error in fetchDeliveryTrackingAction:", error);
    return {
      success: false,
      error: "Error al obtener seguimiento de entrega",
    };
  }
}

