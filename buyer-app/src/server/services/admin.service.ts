import "server-only";

import type { BuyerStatus } from "@prisma/client";
import {
  countAddresses,
  countBuyers,
  countBuyersByStatus,
  countBuyersWithAddress,
  countCartItems,
  countCarts,
  deleteAdminAddress,
  findAdminAddressById,
  findAdminAddresses,
  findAdminBuyerById,
  findAdminBuyers,
  findAdminCartById,
  findAdminCarts,
  findBuyerCityEntries,
  findRecentBuyerActivity,
  updateAdminAddress,
  updateAdminBuyer,
  updateAdminBuyerStatus,
} from "../repositories/admin.repository";

export async function getAdminSummary() {
  const [
    totalBuyers,
    totalAddresses,
    totalCarts,
    totalCartItems,
  ] = await Promise.all([
    countBuyers(),
    countAddresses(),
    countCarts(),
    countCartItems(),
  ]);

  return {
    totalBuyers,
    totalAddresses,
    totalCarts,
    totalCartItems,
  };
}

export async function getAdminBuyers(options?: {
  skip?: number;
  take?: number;
}) {
  const buyers = await findAdminBuyers(options);

  return buyers.map((buyer) => ({
    id: buyer.id,
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    clerkId: buyer.clerkId,
    addressesCount: buyer._count.addresses,
    cartItemsCount: buyer.cart?._count.items ?? 0,
  }));
}

export function getAdminBuyerById(id: string) {
  return findAdminBuyerById(id);
}

export function saveAdminBuyer(
  buyerId: string,
  data: {
    name: string;
    phone: string;
  }
) {
  return updateAdminBuyer(buyerId, data);
}

export function getAdminAddresses() {
  return findAdminAddresses();
}

export function getAdminAddressById(id: string) {
  return findAdminAddressById(id);
}

export function saveAdminAddress(
  addressId: string,
  data: {
    street: string;
    city: string;
    notes?: string;
  }
) {
  return updateAdminAddress(addressId, data);
}

export function removeAdminAddress(addressId: string) {
  return deleteAdminAddress(addressId);
}

export function getAdminCarts() {
  return findAdminCarts();
}

export function getAdminCartById(id: string) {
  return findAdminCartById(id);
}

function getCartEstimatedValue(
  items: Array<{ quantity: number; price: unknown }>
) {
  return items.reduce(
    (sum, item) => sum + item.quantity * Number(item.price),
    0
  );
}

export async function getAdminCartReport() {
  const carts = await findAdminCarts();

  const totalCarts = carts.length;
  const totalItems = carts.reduce(
    (sum, cart) => sum + cart.items.length,
    0
  );
  const totalEstimated = carts.reduce(
    (sum, cart) =>
      sum + getCartEstimatedValue(cart.items),
    0
  );
  const productTotals = new Map<string, number>();

  for (const cart of carts) {
    for (const item of cart.items) {
      productTotals.set(
        item.productId,
        (productTotals.get(item.productId) ?? 0) +
          item.quantity
      );
    }
  }

  const topProducts = Array.from(productTotals.entries())
    .map(([productId, quantity]) => ({
      productId,
      quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalCarts,
    totalEstimated,
    averageItemsPerCart:
      totalCarts === 0 ? 0 : totalItems / totalCarts,
    topProducts,
  };
}

export async function getAnalyticsBuyerSummary() {
  const [totalBuyers, buyersWithAddress, carts] =
    await Promise.all([
      countBuyers(),
      countBuyersWithAddress(),
      findAdminCarts(),
    ]);

  return {
    totalBuyers,
    buyersWithAddress,
    activeCarts: carts.length,
    estimatedCartValue: carts.reduce(
      (sum, cart) => sum + getCartEstimatedValue(cart.items),
      0
    ),
  };
}

export async function getBuyersByCity() {
  const entries = await findBuyerCityEntries();
  const buyersByCity = new Map<string, Set<string>>();

  for (const entry of entries) {
    let value = entry.city.trim();

    if (!value) continue;

    // Remove trailing Argentina from the city string for analytics output only.
    value = value.replace(/,\s*argentina$/i, "").trim();

    const parts = value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const province = parts.length > 1 ? parts[parts.length - 1] : "";
    const city = parts.length > 1 ? parts.slice(0, -1).join(", ") : parts[0];

    if (!city) continue;

    const key = `${city}|${province}`;
    const buyerIds =
      buyersByCity.get(key) ?? new Set<string>();
    buyerIds.add(entry.buyerId);
    buyersByCity.set(key, buyerIds);
  }

  return Array.from(buyersByCity.entries())
    .map(([key, buyerIds]) => {
      const [city, province] = key.split("|");
      return {
        city,
        province,
        buyers: buyerIds.size,
      };
    })
    .sort((a, b) => b.buyers - a.buyers);
}

export async function getTopCartProducts(limit = 10) {
  const carts = await findAdminCarts();
  const productTotals = new Map<string, number>();

  for (const cart of carts) {
    for (const item of cart.items) {
      productTotals.set(
        item.productId,
        (productTotals.get(item.productId) ?? 0) + item.quantity
      );
    }
  }

  return Array.from(productTotals.entries())
    .map(([productId, timesAdded]) => ({
      productId,
      timesAdded,
    }))
    .sort((a, b) => b.timesAdded - a.timesAdded)
    .slice(0, limit);
}

export async function getTopBuyersByCartValue(limit = 10) {
  const carts = await findAdminCarts();

  return carts
    .map((cart) => ({
      buyerId: cart.buyer.id,
      buyerName: cart.buyer.name ?? cart.buyer.email,
      estimatedValue: getCartEstimatedValue(cart.items),
    }))
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, limit);
}

type BuyerActivity = {
  type:
    | "BUYER_REGISTERED"
    | "ADDRESS_ADDED"
    | "CART_CREATED"
    | "PRODUCT_ADDED_TO_CART";
  description: string;
  createdAt: Date;
};

export async function getRecentBuyerActivity(limit = 20) {
  const activity = await findRecentBuyerActivity(limit);
  const events: BuyerActivity[] = [
    ...activity.buyers.map((buyer) => ({
      type: "BUYER_REGISTERED" as const,
      description: "Buyer registered",
      createdAt: buyer.createdAt,
    })),
    ...activity.addresses.map((address) => ({
      type: "ADDRESS_ADDED" as const,
      description: "Address added",
      createdAt: address.createdAt,
    })),
    ...activity.carts.map((cart) => ({
      type: "CART_CREATED" as const,
      description: "Cart created",
      createdAt: cart.createdAt,
    })),
    ...activity.cartItems.map((cartItem) => ({
      type: "PRODUCT_ADDED_TO_CART" as const,
      description: "Product added to cart",
      createdAt: cartItem.createdAt,
    })),
  ];

  return events
    .sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
    .slice(0, limit);
}

export async function getControlPlaneBuyerSummary() {
  const [
    totalBuyers,
    activeBuyers,
    disabledBuyers,
    buyersWithAddress,
  ] = await Promise.all([
    countBuyers(),
    countBuyersByStatus("ACTIVE"),
    countBuyersByStatus("DISABLED"),
    countBuyersWithAddress(),
  ]);

  return {
    totalBuyers,
    activeBuyers,
    disabledBuyers,
    buyersWithAddress,
  };
}

export async function getControlPlaneBuyers(options?: {
  skip?: number;
  take?: number;
}) {
  const buyers = await findAdminBuyers(options);

  return buyers.map((buyer) => ({
    id: buyer.id,
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    addressesCount: buyer._count.addresses,
    status: buyer.status,
  }));
}

export async function getControlPlaneBuyerById(id: string) {
  const buyer = await findAdminBuyerById(id);

  if (!buyer) {
    return null;
  }

  const cartItems = buyer.cart?.items ?? [];

  return {
    buyer: {
      id: buyer.id,
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      status: buyer.status,
    },
    addresses: buyer.addresses.map((address) => ({
      id: address.id,
      street: address.street,
      city: address.city,
      notes: address.notes,
    })),
    cart: buyer.cart
      ? {
          itemsCount: cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          estimatedValue: getCartEstimatedValue(cartItems),
        }
      : null,
    cartItems: cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  };
}

export function setAdminBuyerStatus(
  buyerId: string,
  status: BuyerStatus
) {
  return updateAdminBuyerStatus(buyerId, status);
}
