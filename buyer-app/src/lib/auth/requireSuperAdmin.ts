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

  console.log("[Analytics Endpoint] User role:", user.role, "UserId:", user.userId);

  if (user.role !== "superadmin" && user.role !== "admin") {
    throw new ForbiddenError();
  }

  return {
    userId: user.userId,
    role: user.role,
  };
}
