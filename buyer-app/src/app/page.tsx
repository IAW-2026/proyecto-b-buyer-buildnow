import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// # Página de inicio, redirige según el estado de autenticación
export default async function HomePage() {
  const { userId } = await auth();

  // user no autenticado, redirigir a login
  if (!userId) {
    redirect("/login");
  }
  // user autenticado, redirigir a dashboard
  redirect("/dashboard");
}