"use client";

import { useEffect, useState } from "react";
import StoreQuickViewRow from "./StoreQuickViewRow";
import { fetchStoresAction } from "@/actions/buyerActions";
import type { Store } from "@/server/integrations/seller/seller.types";

const PAGE_SIZE = 4;

export default function StoreQuickViewList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [maxKnownPage, setMaxKnownPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);

        const data = await fetchStoresAction({
          search: "",
          pageNumber: page,
          pageSize: PAGE_SIZE,
        });

        setStores(data);
        setMaxKnownPage((current) =>
          data.length === PAGE_SIZE
            ? Math.max(current, page + 1)
            : Math.max(current, page)
        );
      } catch (error) {
        console.error("Failed to load stores:", error);
        setStores([]);
        setMaxKnownPage((current) =>
          Math.max(current, page)
        );
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, [page]);

  const canGoPrevious = page > 1;
  const canGoNext = stores.length === PAGE_SIZE;
  const pages = Array.from(
    { length: maxKnownPage },
    (_, index) => index + 1
  );

  if (loading) {
    return <div className="text-stone-400">Cargando tiendas...</div>;
  }

  return (
    <div className="space-y-4">
      {stores.length === 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-stone-500">
            No se encontraron tiendas para mostrar.
          </p>
        </section>
      ) : (
        stores.map((store) => (
          <StoreQuickViewRow
            key={store.id}
            storeId={store.id}
            name={store.name}
            status={store.status}
          />
        ))
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">
          Pagina {page}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1)
              )
            }
            disabled={!canGoPrevious}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {"<"} Anterior
          </button>

          <div className="flex items-center gap-1">
            {pages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={
                  pageNumber === page
                    ? "h-10 w-10 rounded-xl bg-orange-500 text-sm font-semibold text-white"
                    : "h-10 w-10 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-700 transition hover:border-orange-300 hover:text-orange-600"
                }
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setPage((current) => current + 1)
            }
            disabled={!canGoNext}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
