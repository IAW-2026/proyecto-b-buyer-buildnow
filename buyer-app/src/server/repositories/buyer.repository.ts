import { prisma } from "@/lib/prisma";

// ==============================
// HELPER TYPES
// ==============================

export async function createBuyer(data: {
  clerkId: string;
  name: string;
  email: string;
  phone?: string;

  address: {
    street: string;
    city: string;
    notes?: string;
  };
}) {
  return prisma.buyer.create({
    data: {
      clerkId: data.clerkId,
      name: data.name,
      email: data.email,
      phone: data.phone,

      addresses: {
        create: {
          street: data.address.street,
          city: data.address.city,
          notes: data.address.notes,
        },
      },
    },

    include: {
      addresses: true,
    },
  });
}

export async function findBuyerByClerkId(clerkId: string) {
  return prisma.buyer.findUnique({
    where: {
      clerkId,
    },

    include: {
      addresses: true,
    },
  });
}

//CART
export async function getCartByBuyerId(buyerId: string) {
  return prisma.cart.findFirst({
    where: {
      buyerId,
    },
  });
}

export async function createCart(buyerId: string) {
  return prisma.cart.create({
    data: {
      buyerId,
    },
  });
}

export async function getCartItem(cartId: string, productId: string) {
  return prisma.cartItem.findFirst({
    where: {
      cartId,
      productId,
    },
  });
}

export async function getCartItems(cartId: string) {
  return prisma.cartItem.findMany({
    where: {
      cartId,
    },
  });
}

export async function findCartItemFromDifferentStore(cartId: string, storeId: string) {
  return prisma.cartItem.findFirst({
    where: {
      cartId,
      storeId: {
        not: storeId,
      },
    },
  });
}

type CreateCartItemInput = {
  cartId: string;
  productId: string;
  storeId: string;
  quantity: number;
  price: number;
};

export async function createCartItem(data: CreateCartItemInput) {
  return prisma.cartItem.create({
    data,
  });
}

export async function incrementCartItem(id: string) {
  return prisma.cartItem.update({
    where: { id },
    data: {
      quantity: {
        increment: 1,
      },
    },
  });
}

export async function decrementCartItem(id: string) {
  return prisma.cartItem.update({
    where: { id },
    data: {
      quantity: {
        decrement: 1,
      },
    },
  });
}

export async function deleteCartItem(id: string) {
  return prisma.cartItem.delete({
    where: { id },
  });
}

export async function getCartItemsDetailed(cartId: string) {
  return prisma.cartItem.findMany({
    where: {
      cartId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function clearCartByBuyerId(buyerId: string) {
  const cart = await getCartByBuyerId(buyerId);
  
  if (!cart) {
    return { deletedCount: 0 };
  }

  const result = await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return result;
}

// ==============================
// BUYER PROFILE
// ==============================

export async function updateBuyer(buyerId: string, data: {
  name?: string;
  phone?: string;
}) {
  return prisma.buyer.update({
    where: { id: buyerId },
    data,
    include: {
      addresses: true,
    },
  });
}

// ==============================
// ADDRESSES
// ==============================

export async function createAddress(data: {
  buyerId: string;
  street: string;
  city: string;
  notes?: string;
}) {
  return prisma.address.create({
    data: {
      buyerId: data.buyerId,
      street: data.street,
      city: data.city,
      notes: data.notes,
    },
  });
}

export async function updateAddress(addressId: string, data: {
  street?: string;
  city?: string;
  notes?: string;
}) {
  return prisma.address.update({
    where: { id: addressId },
    data,
  });
}

export async function deleteAddress(addressId: string) {
  return prisma.address.delete({
    where: { id: addressId },
  });
}

export async function getAddressesByBuyerId(buyerId: string) {
  return prisma.address.findMany({
    where: { buyerId },
    orderBy: {
      createdAt: "desc",
    },
  });
}