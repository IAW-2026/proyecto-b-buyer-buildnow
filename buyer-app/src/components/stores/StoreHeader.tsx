import type { Store } from "@/server/integrations/seller/seller.types";

type Props = {
  store: Store;
  productCount: number;
};

export default function StoreHeader({
  store,
  productCount,
}: Props) {
  return (
    <section className="rounded-2xl bg-white border border-[#A76E04] p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-[#823A00]">
              {store.name}
            </h1>

            <span
              className={`
                rounded-full
                px-3
                py-1
                text-sm
                font-semibold
                ${
                  store.status === "OPEN"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#FFF4E8] text-[#823A00]"
                }
              `}
            >
              {store.status === "OPEN" ? "Abierta" : "Cerrada"}
            </span>
          </div>

          <p className="max-w-3xl text-stone-600">
            {store.description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#FFF4E8] p-4">
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Productos
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#823A00]">
              {productCount}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFF4E8] p-4">
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Dirección
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {store.address}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
