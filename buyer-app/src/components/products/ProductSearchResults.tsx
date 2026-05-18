"use client";

import { useEffect, useMemo, useState } from "react";

import { searchProductsAction } from "@/actions/buyerActions";
import ProductCard from "@/components/products/ProductCard";
import { useCart } from "@/context/CartContext";

import type {
  Product,
  ProductsSearchResponse,
} from "@/lib/apiClients/sellerApi";

const PAGE_SIZE = 9;

type Props = {
  search: string;
};

export default function ProductSearchResults({
  search,
}: Props) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [result, setResult] =
    useState<ProductsSearchResponse>({
      total: 0,
      page: 1,
      pageSize: PAGE_SIZE,
      totalPages: 1,
      data: [],
    });

  const {
    addItem,
    decreaseItem,
    getProductQuantity,
  } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const data = await searchProductsAction({
          search,
          pageNumber: page,
          pageSize: PAGE_SIZE,
        });

        setResult(data);
      } catch (error) {
        console.error(
          "Failed to search products:",
          error
        );

        setResult({
          total: 0,
          page: 1,
          pageSize: PAGE_SIZE,
          totalPages: 1,
          data: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, search]);

  const pages = useMemo(() => {
    const totalPages = result.totalPages;
    const currentPage = result.page;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    );
  }, [result.page, result.totalPages]);

  const handleAdd = async (productId: string) => {
    await addItem(productId);
  };

  const handleDecrease = async (productId: string) => {
    await decreaseItem(productId);
  };

  const renderProduct = (product: Product) => (
    <ProductCard
      key={product.id}
      id={product.id}
      name={product.name}
      storeId={product.storeId}
      price={product.price}
      weight={product.weight}
      available={product.available}
      quantity={getProductQuantity(product.id)}
      onAdd={handleAdd}
      onDecrease={handleDecrease}
    />
  );

  const firstVisible =
    result.total === 0
      ? 0
      : (result.page - 1) * result.pageSize + 1;
  const lastVisible = Math.min(
    result.page * result.pageSize,
    result.total
  );

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
            Resultados de busqueda
          </p>

          <h1 className="mt-1 text-2xl font-bold text-stone-800">
            {search}
          </h1>
        </div>

        <div className="rounded-xl bg-stone-100 px-4 py-2 text-sm text-stone-600">
          {result.total} producto
          {result.total !== 1 ? "s" : ""}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-center">
          <p className="text-stone-500">
            Buscando productos...
          </p>
        </div>
      ) : result.data.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-center">
          <p className="text-stone-500">
            No se encontraron productos para esta busqueda.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {result.data.map(renderProduct)}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-500">
              Mostrando {firstVisible}-{lastVisible} de{" "}
              {result.total}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={result.page <= 1}
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
                      pageNumber === result.page
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
                  setPage((current) =>
                    Math.min(result.totalPages, current + 1)
                  )
                }
                disabled={result.page >= result.totalPages}
                className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente {">"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
