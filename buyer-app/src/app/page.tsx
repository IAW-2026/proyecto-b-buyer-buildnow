import { redirect } from "next/navigation";
import RoleRedirect from "@/components/auth/RoleRedirect";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  BuyerDisabledError,
  BuyerNotFoundError,
  requireBuyer,
} from "@/lib/auth/requireBuyer";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user.userId) {
    redirect("/login");
  }

  if (user.role === "admin") {
    return <RoleRedirect target="/admin" />;
  }

  try {
    await requireBuyer();
  } catch (error) {
    if (error instanceof BuyerNotFoundError) {
      return (
        <RoleRedirect target="/settings/profile?onboarding=true" />
      );
    }

    if (error instanceof BuyerDisabledError) {
      return <RoleRedirect target="/account-disabled" />;
    }

    throw error;
  }

  return <RoleRedirect target="/dashboard" />;
}
