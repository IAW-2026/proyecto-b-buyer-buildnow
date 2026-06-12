import "server-only";

import {
  countAddresses,
  countBuyers,
  countCartItems,
  countCarts,
  deleteAdminAddress,
  findAdminAddressById,
  findAdminAddresses,
  findAdminBuyerById,
  findAdminBuyers,
  findAdminCartById,
  findAdminCarts,
  updateAdminAddress,
  updateAdminBuyer,
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

export function getAdminBuyers() {
  return findAdminBuyers();
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

export async function getAdminCartReport() {
  const carts = await findAdminCarts();

  const totalCarts = carts.length;
  const totalItems = carts.reduce(
    (sum, cart) => sum + cart.items.length,
    0
  );
  const totalEstimated = carts.reduce(
    (sum, cart) =>
      sum +
      cart.items.reduce(
        (cartSum, item) =>
          cartSum + item.quantity * Number(item.price),
        0
      ),
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
