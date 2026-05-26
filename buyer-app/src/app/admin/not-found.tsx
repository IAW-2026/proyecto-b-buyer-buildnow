import Image from "next/image";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF4E8] px-6 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-orange-200 bg-white p-8 text-center shadow-sm">
        <Image
          src="/buildnow-logo.png"
          alt="BuildNow"
          width={72}
          height={72}
          className="mx-auto rounded-2xl object-cover"
          priority
        />

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-[#ED6F00]">
          Error 404
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#823A00]">
          Página no encontrada
        </h1>

        <p className="mt-3 text-sm leading-6 text-stone-600">
          La página de administración que buscás no existe o ya no
          está disponible.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            href="/admin"
            className="brand-button-primary px-5 py-3 text-sm"
          >
            Ir al panel admin
          </Link>
        </div>
      </section>
    </main>
  );
}
