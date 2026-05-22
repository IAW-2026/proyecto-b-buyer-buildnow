import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { findCurrentBuyer } from "@/server/services/buyer.service";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user.userId) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  const buyer = await findCurrentBuyer(user.userId);

  if (!buyer) {
    redirect("/settings/profile?onboarding=true");
  }

  redirect("/dashboard");
}
