import "server-only";

import { getOrderTracking } from "@/server/integrations/delivery/delivery.client";
import {
  createOrder,
  getBuyerOrders,
  getOrderById,
  getProductDetails,
} from "@/server/integrations/seller";
import { createPayment } from "@/server/integrations/payment";
import {
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

  return getBuyerOrders(clerkId);
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
    buyerId: clerkId,
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
  payment?: import("@/server/integrations/payment").PaymentResponseDto;
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

  if (!resolvedDeliveryAddress) {
    throw new Error("DELIVERY_ADDRESS_REQUIRED");
  }

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
      buyerId: clerkId,
      storeId,
      deliveryAddress: resolvedDeliveryAddress,
      items,
    });

    createdOrders.push(order);
  }

  if (createdOrders.length === 0) {
    throw new Error("ORDER_CREATION_FAILED");
  }

  const mainOrderId = createdOrders[0].orderId || createdOrders[0].id;

  // Calculate total amount from cart items
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let payment;
  try {
    const itemsForPayment = cartItems.map((item) => ({
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
    }));
    
    payment = await createPayment({
      orderId: mainOrderId,
      totalAmount: totalAmount,
      items: itemsForPayment,
      // urlReturn: `/orders/${mainOrderId}/tracking`, // Disabled for now
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new Error("PAYMENT_CREATION_FAILED");
  }

  return {
    orderId: mainOrderId, // Fallback to 'id' if 'orderId' is not available
    orders: createdOrders,
    payment,
  };
}

export async function getBuyerOrderTrackingService(
  clerkId: string,
  orderId: string
): Promise<OrderTrackingData | null> {
  //const buyer = await getCurrentBuyer(clerkId);
  const order = await getOrderById(orderId);

  const productDetails = await Promise.all(
    order.itemsOrders.map(async (itemsOrders) => {
      const product = await getProductDetails(
        itemsOrders.productId
      );
      console.log("Product details for tracking:", product.name);
      return [
        itemsOrders.productId,
        {
          name: product.name,
          weight: product.weight,
        },
      ] as const;
    })
  );

  const deliveryTracking =
    order.estadoDelPedido === "ON_THE_WAY"
      ? await getOrderTracking(order.orderId)
      : [];

  return {
    order,
    deliveryTracking: deliveryTracking[0] ?? null,
    productDetailsById: Object.fromEntries(productDetails),
  };
}
