import { SignOutButton } from "@clerk/nextjs";

export default function AccountDisabledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF4E8] px-6">
      <section className="max-w-md rounded-xl border border-orange-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-[#ED6F00]">
          Acceso restringido
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#823A00]">
          Tu cuenta está deshabilitada
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Contactá a soporte para solicitar la reactivación de tu
          cuenta.
        </p>
        <SignOutButton redirectUrl="/login">
          <button
            type="button"
            className="mt-5 rounded-lg bg-[#ED6F00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04]"
          >
            Cerrar sesión
          </button>
        </SignOutButton>
      </section>
    </main>
  );
}
