import { redirect } from "next/navigation";
import Link from "next/link";
import { checkOnboarding } from "@/lib/auth/check-onboarding";
import {
  UnauthorizedError,
  ForbiddenError,
  requireBuyer,
} from "@/lib/auth/requireBuyer";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user.userId) {
    redirect("/login");
  }

  try {
    await requireBuyer();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }

    if (error instanceof ForbiddenError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFF4E8] px-6">
          <section className="max-w-md rounded-xl border border-orange-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-[#ED6F00]">
              Acceso restringido
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#823A00]">
              No tenés permisos de comprador
            </h1>
            <p className="mt-3 text-sm text-stone-600">
              Para entrar a esta seccion, tu usuario debe tener{" "}
              <span className="font-medium text-stone-900">
                publicMetadata.role = &quot;buyer&quot;
              </span>
              .
            </p>
            <p className="mt-3 rounded-lg bg-[#FFF4E8] px-3 py-2 text-sm text-stone-700">
              Rol detectado:{" "}
              <span className="font-medium">
                {user.role ?? "sin rol"}
              </span>
            </p>
            {user.role === "admin" ? (
              <Link
                href="/admin"
                className="mt-5 inline-flex rounded-lg bg-[#ED6F00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04]"
              >
                Volver al panel admin
              </Link>
            ) : null}
          </section>
        </main>
      );
    }

    throw error;
  }

  await checkOnboarding();

  return (
    <main className="min-h-screen bg-[#FFF4E8]">
      {children}
    </main>
  );
}
