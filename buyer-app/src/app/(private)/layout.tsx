import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkOnboarding } from "@/lib/auth/check-onboarding";
import { requireBuyer } from "@/lib/auth/requireBuyer";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  await checkOnboarding();
  await requireBuyer();

  return (
    <main className="min-h-screen bg-stone-50">
      {children}
    </main>
  );
}
