import { prisma } from "@/lib/prisma";

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