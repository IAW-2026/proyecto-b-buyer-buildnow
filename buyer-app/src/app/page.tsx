import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentBuyer } from "@/server/services/buyer.service";

export default async function HomePage() {
  const { userId } = await auth();

  // No autenticado
  if (!userId) {
    redirect("/login");
  }

  // Buscar buyer en Prisma
  const buyer =
    await getCurrentBuyer(userId);

  // Usuario autenticado pero sin onboarding
  if (!buyer) {
    redirect(
      "/settings/profile?onboarding=true"
    );
  }

  // Usuario completo
  redirect("/dashboard");
}