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
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <section className="max-w-md rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-orange-600">
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
          <div className="mt-3 space-y-1 rounded-lg bg-stone-100 px-3 py-2 text-left text-xs text-stone-600">
            <p>
              UserId:{" "}
              <span className="font-medium text-stone-900">
                {user.userId}
              </span>
            </p>
            <p>
              Fuente:{" "}
              <span className="font-medium text-stone-900">
                {user.roleSource}
              </span>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">
              Buyer App
            </p>
            <h1 className="text-2xl font-bold text-stone-950">
              Panel de administración
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-300 hover:text-orange-700"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <SignOutButton redirectUrl="/login">
              <button
                type="button"
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
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
