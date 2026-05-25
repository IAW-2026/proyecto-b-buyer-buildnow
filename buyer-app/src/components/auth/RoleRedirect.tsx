"use client";

import { useEffect } from "react";

type RoleRedirectProps = {
  target: string;
};

export default function RoleRedirect({
  target,
}: RoleRedirectProps) {
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF4E8] px-6">
      <section className="w-full max-w-md rounded-xl border border-[#A76E04] bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-[#ED6F00]">
          BuildNow
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-950">
          Redirigiendo
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Estamos preparando tu panel.
        </p>
        <div className="mx-auto mt-5 h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-[#ED6F00]" />
      </section>
    </main>
  );
}
