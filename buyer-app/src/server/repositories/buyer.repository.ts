import { prisma } from "@/lib/prisma";

export async function createBuyer(data: {
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
}) {
  return prisma.buyer.create({data,});
}

export async function findBuyerByClerkId(clerkId: string) {
  return prisma.buyer.findUnique({
    where: {
      clerkId,
    },
  });
}