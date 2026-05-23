import { redirect } from "next/navigation";
import RoleRedirect from "@/components/auth/RoleRedirect";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { findCurrentBuyer } from "@/server/services/buyer.service";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user.userId) {
    redirect("/login");
  }

  if (user.role === "admin") {
    return <RoleRedirect target="/admin" />;
  }

  const buyer = await findCurrentBuyer(user.userId);

  if (!buyer) {
    return (
      <RoleRedirect target="/settings/profile?onboarding=true" />
    );
  }

  return <RoleRedirect target="/dashboard" />;
}
