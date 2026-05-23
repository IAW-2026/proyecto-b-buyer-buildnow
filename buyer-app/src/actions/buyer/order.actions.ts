"use server";

import {
  clearBuyerCart,
  findCurrentBuyer,
  getCartItemsWithProductDetails,
} from "@/server/services/buyer.service";
import {
  createOrder,
  getBuyerOrders,
} from "@/server/integrations/seller/seller.client";
import { requireBuyer } from "@/lib/auth/requireBuyer";
import type { ActionResponse } from "@/types/action-response";
import type {
  BuyerOrderDto,
  OrderResponseDto,
} from "@/server/mockSeller";

export async function fetchBuyerOrdersAction(): Promise<
  ActionResponse<BuyerOrderDto[]>
> {
  try {
    const { userId } = await requireBuyer();
    const buyer = await findCurrentBuyer(userId);

    if (!buyer) {
      return {
        success: false,
        error: "Comprador no encontrado",
        data: [],
      };
    }

    const orders = await getBuyerOrders(buyer.id);

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Error fetching buyer orders:", error);

    return {
      success: false,
      error: "Ocurrió un error al obtener los pedidos",
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
    const buyer = await findCurrentBuyer(userId);

    if (!buyer) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    const order = await createOrder({
      buyerId: buyer.id,
      storeId,
      deliveryAddress,
      items,
    });

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Error creating order:", error);

    return {
      success: false,
      error: "Ocurrió un error al crear la orden",
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
    const buyer = await findCurrentBuyer(userId);

    if (!buyer) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    const defaultAddress = buyer.addresses[0];
    const resolvedDeliveryAddress =
      deliveryAddress.trim() &&
      deliveryAddress !== "Dirección de entrega"
        ? deliveryAddress.trim()
        : defaultAddress
          ? `${defaultAddress.street}, ${defaultAddress.city}`
          : deliveryAddress.trim();

    const cartItems =
      await getCartItemsWithProductDetails(userId);

    if (cartItems.length === 0) {
      return {
        success: false,
        error: "El carrito está vacío",
      };
    }

    const itemsByStore: Record<
      string,
      Array<{ productId: string; quantity: number; price: number }>
    > = {};

    for (const item of cartItems) {
      itemsByStore[item.storeId] ??= [];
      itemsByStore[item.storeId].push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    const createdOrders: OrderResponseDto[] = [];

    for (const [storeId, items] of Object.entries(
      itemsByStore
    )) {
      const order = await createOrder({
        buyerId: buyer.id,
        storeId,
        deliveryAddress: resolvedDeliveryAddress,
        items,
      });

      createdOrders.push(order);
    }

    if (createdOrders.length === 0) {
      return {
        success: false,
        error: "No se pudieron crear las órdenes",
      };
    }

    await clearBuyerCart(userId);

    return {
      success: true,
      data: {
        orderId: createdOrders[0].id,
        orders: createdOrders,
      },
    };
  } catch (error) {
    console.error("Error in checkout:", error);

    return {
      success: false,
      error: "Ocurrió un error al procesar el checkout",
    };
  }
}
