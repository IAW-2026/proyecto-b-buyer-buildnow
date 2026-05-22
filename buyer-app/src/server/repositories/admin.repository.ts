import "server-only";

import { prisma } from "@/lib/prisma";

export async function countBuyers() {
  return prisma.buyer.count();
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

export async function findAdminBuyers() {
  return prisma.buyer.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
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
