"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRouteRetry() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setRetrying(true);
      router.refresh();
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF4E8] px-6">
      <section className="w-full max-w-md rounded-xl border border-orange-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-[#ED6F00]">
          Panel de administracion
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#823A00]">
          Cargando acceso
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Estamos validando tu sesion y permisos de administrador.
        </p>
        <div className="mx-auto mt-5 h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-[#ED6F00]" />
        <p className="mt-4 text-xs text-stone-500">
          {retrying
            ? "Reintentando carga del panel..."
            : "Esto puede tardar unos segundos luego de iniciar sesion."}
        </p>
      </section>
    </main>
  );
}
