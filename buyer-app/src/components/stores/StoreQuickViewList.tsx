"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoreQuickViewRow from "./StoreQuickViewRow";
import { fetchStoresPageAction } from "@/actions/buyerActions";
import type { Store } from "@/types/catalog";

const PAGE_SIZE = 4;

export default function StoreQuickViewList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storesPageParam = Number(
    searchParams.get("storesPage")
  );
  const [stores, setStores] = useState<Store[]>([]);
  const page =
    Number.isFinite(storesPageParam) &&
      storesPageParam > 0
      ? storesPageParam
      : 1;
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);

        const data = await fetchStoresPageAction({
          search: "",
          pageNumber: page,
          pageSize: PAGE_SIZE,
        });

        setStores(data.data);
        setTotalPages(data.totalPages);
        setTotalStores(data.total);
      } catch (error) {
        console.error("Failed to load stores:", error);
        setStores([]);
        setTotalPages(1);
        setTotalStores(0);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, [page]);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const updatePage = (nextPage: number) => {
    const safePage = Math.min(
      Math.max(1, nextPage),
      totalPages
    );
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (safePage === 1) {
      params.delete("storesPage");
    } else {
      params.set("storesPage", String(safePage));
    }

    const query = params.toString();
    router.replace(
      query ? `/dashboard?${query}` : "/dashboard",
      {
        scroll: false,
      }
    );
  };

  if (loading) {
    return <div className="text-[#A76E04]">Cargando tiendas...</div>;
  }

  return (
    <div className="space-y-4">
      {stores.length === 0 ? (
        <section className="brand-card p-6">
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
            dashboardPage={page}
          />
        ))
      )}

      <div className="brand-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#823A00]">
          Pagina {page} de {totalPages} · {totalStores} tiendas
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              updatePage(page - 1)
            }
            disabled={!canGoPrevious}
            className="brand-button-soft px-3 py-2 text-sm"
          >
            {"<"} Anterior
          </button>

          <div className="flex items-center gap-1">
            {pages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => updatePage(pageNumber)}
                className={
                  pageNumber === page
                    ? "brand-button-primary flex h-10 w-10 items-center justify-center text-sm"
                    : "brand-button-soft flex h-10 w-10 items-center justify-center text-sm"
                }
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              updatePage(page + 1)
            }
            disabled={!canGoNext}
            className="brand-button-soft px-3 py-2 text-sm"
          >
            Siguiente {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
