import "server-only";

import { getOrderTracking } from "@/server/integrations/delivery/delivery.client";
import {
  createOrder,
  getBuyerOrders,
  getOrderById,
  getProductDetails,
} from "@/server/integrations/seller";
import {
  clearBuyerCart,
  findCurrentBuyer,
  getCartItemsWithProductDetails,
  getCurrentBuyer,
} from "@/server/services/buyer.service";
import type { DeliveryTracking } from "@/types/delivery";
import type {
  BuyerOrderDto,
  OrderResponseDto,
} from "@/types/order";

type OrderTrackingData = {
  order: OrderResponseDto;
  deliveryTracking: DeliveryTracking | null;
  productDetailsById: Record<
    string,
    {
      name: string;
      weight: number;
    }
  >;
};

export async function getBuyerOrdersService(
  clerkId: string
): Promise<BuyerOrderDto[]> {
  const buyer = await findCurrentBuyer(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  return getBuyerOrders(buyer.id);
}

export async function createBuyerOrderService(
  clerkId: string,
  storeId: string,
  deliveryAddress: string,
  items: Array<{ productId: string; quantity: number }>
): Promise<OrderResponseDto> {
  const buyer = await findCurrentBuyer(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  return createOrder({
    buyerId: buyer.id,
    storeId,
    deliveryAddress,
    items,
  });
}

export async function checkoutBuyerCartService(
  clerkId: string,
  deliveryAddress: string
): Promise<{
  orderId: string;
  orders: OrderResponseDto[];
}> {
  const buyer = await findCurrentBuyer(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
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
    await getCartItemsWithProductDetails(clerkId);

  if (cartItems.length === 0) {
    throw new Error("EMPTY_CART");
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
    throw new Error("ORDER_CREATION_FAILED");
  }

  await clearBuyerCart(clerkId);

  return {
    orderId: createdOrders[0].id,
    orders: createdOrders,
  };
}

export async function getBuyerOrderTrackingService(
  clerkId: string,
  orderId: string
): Promise<OrderTrackingData | null> {
  const buyer = await getCurrentBuyer(clerkId);
  const order = await getOrderById(orderId);

  if (!order || order.buyerId !== buyer.id) {
    return null;
  }

  const productDetails = await Promise.all(
    order.items.map(async (item) => {
      const product = await getProductDetails(
        item.productId
      );

      return [
        item.productId,
        {
          name: product.name,
          weight: product.weight,
        },
      ] as const;
    })
  );

  const deliveryTracking =
    order.status === "ON_THE_WAY"
      ? await getOrderTracking(order.id)
      : [];

  return {
    order,
    deliveryTracking: deliveryTracking[0] ?? null,
    productDetailsById: Object.fromEntries(productDetails),
  };
}
