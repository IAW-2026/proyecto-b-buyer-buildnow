import {
  createBuyer,
  findBuyerByClerkId,
} from "../repositories/buyer.repository";

export async function registerBuyer(data: {
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
  const existing = await findBuyerByClerkId(data.clerkId);

  if (existing) {
    throw new Error("Buyer already exists");
  }

  return createBuyer(data);
}

export async function findCurrentBuyer(clerkId: string) {
  return findBuyerByClerkId(clerkId);
}

export async function getCurrentBuyer(clerkId: string) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("Buyer not found");
  }

  return buyer;
}