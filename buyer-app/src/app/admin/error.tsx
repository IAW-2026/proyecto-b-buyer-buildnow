"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
      <section className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-orange-600">
          Panel de administracion
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-950">
          No pudimos cargar el panel
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Si acabas de iniciar sesion, puede ser una demora al validar tus permisos.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
