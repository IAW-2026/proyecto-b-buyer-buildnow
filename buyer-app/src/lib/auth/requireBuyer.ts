import { getCurrentUser } from "./getCurrentUser";
import { findCurrentBuyer } from "@/server/services/buyer.service";

export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class BuyerNotFoundError extends Error {
  constructor() {
    super("BUYER_NOT_FOUND");
    this.name = "BuyerNotFoundError";
  }
}

export class BuyerDisabledError extends Error {
  constructor() {
    super("BUYER_DISABLED");
    this.name = "BuyerDisabledError";
  }
}

export async function requireBuyer() {
  const user = await getCurrentUser();

  if (!user.userId) {
    throw new UnauthorizedError();
  }

  if (user.role !== "buyer") {
    throw new ForbiddenError();
  }

  const buyer = await findCurrentBuyer(user.userId);

  if (!buyer) {
    throw new BuyerNotFoundError();
  }

  if (buyer.status === "DISABLED") {
    throw new BuyerDisabledError();
  }

  return {
    ...buyer,
    userId: user.userId,
    role: user.role,
  };
}
