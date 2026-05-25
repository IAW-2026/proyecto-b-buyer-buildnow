import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/buyers", label: "Compradores" },
  { href: "/admin/addresses", label: "Direcciones" },
  { href: "/admin/carts", label: "Carritos" },
  { href: "/admin/reports", label: "Reportes" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user.userId) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF4E8] px-6">
        <section className="max-w-md rounded-xl border border-[#A76E04] bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-[#ED6F00]">
            Acceso restringido
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-950">
            No tenés permisos de administrador
          </h1>
          <p className="mt-3 text-sm text-stone-600">
            Para entrar a este panel, tu usuario debe tener{" "}
            <span className="font-medium text-stone-900">
              publicMetadata.role = &quot;admin&quot;
            </span>
            .
          </p>
          <p className="mt-3 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">
            Rol detectado:{" "}
            <span className="font-medium">
              {user.role ?? "sin rol"}
            </span>
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-lg bg-[#ED6F00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04]"
          >
            Volver al dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF4E8]">
      <header className="border-b border-[#A76E04] bg-[#823A00]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#F8C58D]">
              Buyer App
            </p>
            <h1 className="text-2xl font-bold text-white">
              Panel de administración
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-[#A76E04] px-3 py-2 text-sm font-medium text-[#FFF4E8] transition hover:bg-[#A76E04] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <SignOutButton redirectUrl="/login">
              <button
                type="button"
                className="rounded-lg border border-[#F8C58D] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04]"
              >
                Cerrar sesión
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </div>
    </main>
  );
}
