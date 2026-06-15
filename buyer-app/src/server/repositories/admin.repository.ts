import "server-only";

import type { BuyerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function countBuyers() {
  return prisma.buyer.count();
}

export async function countBuyersByStatus(status: BuyerStatus) {
  return prisma.buyer.count({
    where: { status },
  });
}

export async function countBuyersWithAddress() {
  return prisma.buyer.count({
    where: {
      addresses: {
        some: {},
      },
    },
  });
}

export async function countAddresses() {
  return prisma.address.count();
}

export async function countCarts() {
  return prisma.cart.count({
    where: {
      items: {
        some: {},
      },
    },
  });
}

export async function countCartItems() {
  return prisma.cartItem.count();
}

export async function findAdminBuyers(options?: {
  skip?: number;
  take?: number;
}) {
  return prisma.buyer.findMany({
    skip: options?.skip,
    take: options?.take,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      clerkId: true,
      _count: {
        select: {
          addresses: true,
        },
      },
      cart: {
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      },
    },
  });
}

export async function findAdminBuyerById(id: string) {
  return prisma.buyer.findUnique({
    where: { id },
    include: {
      addresses: {
        orderBy: {
          createdAt: "desc",
        },
      },
      cart: {
        include: {
          items: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });
}

export async function updateAdminBuyer(
  buyerId: string,
  data: {
    name: string;
    phone: string;
  }
) {
  return prisma.buyer.update({
    where: { id: buyerId },
    data,
  });
}

export async function updateAdminBuyerStatus(
  buyerId: string,
  status: BuyerStatus
) {
  return prisma.buyer.update({
    where: { id: buyerId },
    data: { status },
  });
}

export async function findBuyerCityEntries() {
  return prisma.address.findMany({
    select: {
      buyerId: true,
      city: true,
    },
  });
}

export async function findRecentBuyerActivity(limit: number) {
  const [buyers, addresses, carts, cartItems] =
    await Promise.all([
      prisma.buyer.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.address.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.cart.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.cartItem.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

  return {
    buyers,
    addresses,
    carts,
    cartItems,
  };
}

export async function findAdminAddresses() {
  return prisma.address.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function findAdminAddressById(id: string) {
  return prisma.address.findUnique({
    where: { id },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function updateAdminAddress(
  addressId: string,
  data: {
    street: string;
    city: string;
    notes?: string;
  }
) {
  return prisma.address.update({
    where: { id: addressId },
    data,
  });
}

export async function deleteAdminAddress(
  addressId: string
) {
  return prisma.address.delete({
    where: { id: addressId },
  });
}

export async function findAdminCarts() {
  return prisma.cart.findMany({
    where: {
      items: {
        some: {},
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: true,
    },
  });
}

export async function findAdminCartById(id: string) {
  return prisma.cart.findUnique({
    where: { id },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}
