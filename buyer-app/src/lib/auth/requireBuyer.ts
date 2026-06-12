import { getCurrentUser } from "./getCurrentUser";

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

export async function requireBuyer() {
  const user = await getCurrentUser();

  if (!user.userId) {
    throw new UnauthorizedError();
  }

  if (user.role !== "buyer") {
    throw new ForbiddenError();
  }

  return {
    userId: user.userId,
    role: user.role,
  };
}
