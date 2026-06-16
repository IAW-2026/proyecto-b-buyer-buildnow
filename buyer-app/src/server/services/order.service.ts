import "server-only";

import { getOrderTracking, getDeliveryQuote, normalizeDeliveryQuoteAddress } from "@/server/integrations/delivery/delivery.client";
import {
  createOrder,
  getBuyerOrders,
  getOrderById,
  getProductDetails,
  getStores,
} from "@/server/integrations/seller";
import { createPayment } from "@/server/integrations/payment";
import {
  findCurrentBuyer,
  getCartItemsWithProductDetails,
  getCurrentBuyer,
  clearBuyerCart,
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
  shippingCost: number;
  serviceFee: number;
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

  const defaultAddress = buyer.addresses[0];
  const fallbackAddress = defaultAddress
    ? `${defaultAddress.street}, ${defaultAddress.city}`
    : undefined;

  const resolvedDeliveryAddress = resolveDeliveryAddress(
    deliveryAddress,
    fallbackAddress
  );

  const normalizedDeliveryAddress = normalizeDeliveryQuoteAddress(
    resolvedDeliveryAddress
  );

  return createOrder({
    buyerId: clerkId,
    storeId,
    deliveryAddress: normalizedDeliveryAddress,
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
      deliveryAddress: normalizeDeliveryQuoteAddress(resolvedDeliveryAddress),
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

function resolveDeliveryAddress(
  deliveryAddress: string,
  fallbackAddress?: string
): string {
  const placeholderAddress = "Dirección de entrega";
  const cleanedDeliveryAddress = deliveryAddress?.trim();

  if (
    !cleanedDeliveryAddress ||
    cleanedDeliveryAddress === placeholderAddress
  ) {
    return fallbackAddress?.trim() ?? "";
  }

  return cleanedDeliveryAddress;
}

export async function getBuyerOrderTrackingService(
  clerkId: string,
  orderId: string
): Promise<OrderTrackingData | null> {
  const buyer = await getCurrentBuyer(clerkId);
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
      ? await getOrderTracking(order.orderId || order.id)
      : [];

  let shippingCost = 1500;
  try {
    const stores = await getStores();
    const store = stores.find((s) => s.id === order.storeId);
    const storeAddress = store ? store.address : "";
    const fallbackDeliveryAddress = buyer.addresses?.[0]
      ? `${buyer.addresses[0].street}, ${buyer.addresses[0].city}`
      : "";
    const resolvedDeliveryAddress = resolveDeliveryAddress(
      order.deliveryAddress,
      fallbackDeliveryAddress
    );

    const quoteRes = await getDeliveryQuote(
      storeAddress,
      resolvedDeliveryAddress,
      order.orderId || order.id
    );
    shippingCost = quoteRes.quote.price;
  } catch (error) {
    console.error("Error fetching delivery quote in tracking service:", error);
  }

  const serviceFee = 1000;

  return {
    order,
    deliveryTracking: deliveryTracking[0] ?? null,
    productDetailsById: Object.fromEntries(productDetails),
    shippingCost,
    serviceFee,
  };
}

export async function prepareCheckoutService(
  clerkId: string,
  deliveryAddress: string
): Promise<{
  orderId: string;
  subtotal: number;
  shippingCost: number;
  serviceFee: number;
  total: number;
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

  const cartItems = await getCartItemsWithProductDetails(clerkId);

  if (cartItems.length === 0) {
    throw new Error("EMPTY_CART");
  }

  const storeId = cartItems[0].storeId;

  const items = cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
  }));

  const order = await createOrder({
    buyerId: clerkId,
    storeId,
    deliveryAddress: normalizeDeliveryQuoteAddress(resolvedDeliveryAddress),
    items,
  });

  const orderId = order.orderId || order.id;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const stores = await getStores();
  const store = stores.find((s) => s.id === storeId);
  const storeAddress = store ? store.address : "";

  let shippingCost = 1500;
  try {
    const quoteRes = await getDeliveryQuote(
      storeAddress,
      resolvedDeliveryAddress,
      orderId
    );
    shippingCost = quoteRes.quote.price;
  } catch (error) {
    console.error("Error fetching delivery quote:", error);
  }

  const serviceFee = 1000;
  const total = subtotal + serviceFee + shippingCost;

  return {
    orderId,
    subtotal,
    shippingCost,
    serviceFee,
    total,
  };
}

export async function initiatePaymentService(
  clerkId: string,
  orderId: string,
  shippingCost: number,
  serviceFee: number
): Promise<{
  payment: import("@/server/integrations/payment").PaymentResponseDto;
}> {
  const buyer = await findCurrentBuyer(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const itemsForPayment = order.itemsOrders.map((item) => ({
    title: item.productName || `Producto ${item.productId.slice(0, 8)}`,
    quantity: item.quantity,
    unit_price: Number(item.price),
  }));

  itemsForPayment.push({
    title: "Costo de envío",
    quantity: 1,
    unit_price: Number(shippingCost),
  });

  itemsForPayment.push({
    title: "Tarifa de servicio",
    quantity: 1,
    unit_price: Number(serviceFee),
  });

  const totalAmount = order.precioTotal + shippingCost + serviceFee;

  let payment;
  try {
    payment = await createPayment({
      orderId: orderId,
      totalAmount: totalAmount,
      items: itemsForPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new Error("PAYMENT_CREATION_FAILED");
  }

  try {
    await clearBuyerCart(clerkId);
  } catch (error) {
    console.error("Error clearing cart after payment creation:", error);
  }

  return {
    payment,
  };
}
