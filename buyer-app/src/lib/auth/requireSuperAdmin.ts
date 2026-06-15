import { getCurrentUser } from "./getCurrentUser";
import {
  ForbiddenError,
  UnauthorizedError,
} from "./requireBuyer";

export async function requireSuperAdmin() {
  const user = await getCurrentUser();

  if (!user.userId) {
    throw new UnauthorizedError();
  }

  if (user.role !== "superadmin") {
    throw new ForbiddenError();
  }

  return {
    userId: user.userId,
    role: user.role,
  };
}
