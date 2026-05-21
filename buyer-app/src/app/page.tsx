import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { findCurrentBuyer } from "@/server/services/buyer.service";

export default async function HomePage() {
  const { userId } = await auth();

  // No autenticado
  if (!userId) {
    redirect("/login");
  }

  const buyer = await findCurrentBuyer(userId);

  if (!buyer) {
    redirect("/settings/profile?onboarding=true");
  }

  // Usuario completo
  redirect("/dashboard");
}
