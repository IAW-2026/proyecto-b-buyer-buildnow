import {
  ForbiddenError,
  UnauthorizedError,
} from "./requireBuyer";
import { getCurrentUser } from "./getCurrentUser";

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user.userId) {
    throw new UnauthorizedError();
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new ForbiddenError();
  }

  return {
    userId: user.userId,
    role: user.role,
  };
}
