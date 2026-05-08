import { createBuyer, findBuyerByClerkId, } from "../repositories/buyer.repository";

export async function registerBuyer(data: {
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
}) {
  const existing = await findBuyerByClerkId(data.clerkId);

  if (existing) {
    return existing;
  }

  return createBuyer(data);
}

export async function getCurrentBuyer(
  clerkId: string
) {
  return findBuyerByClerkId(clerkId);
}