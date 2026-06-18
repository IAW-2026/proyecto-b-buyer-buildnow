"use client";

import { useEffect, useMemo, useState } from "react";

import ProductCard from "@/components/products/ProductCard";
import ProductSortControl, {
  sortProducts,
  type ProductSort,
} from "@/components/products/ProductSortControl";

import {
  fetchCategoryProductsAction,
  fetchStoresAction,
} from "@/actions/buyerActions";

import { useCart } from "@/context/CartContext";

import type {
  Category,
  ProductsSearchResponse,
  Store,
} from "@/types/catalog";

const PAGE_SIZE = 9;

type Props = {
  category: Category;
};

export default function CategoryLayout({
  category,
}: Props) {
  const [page, setPage] = useState(1);
  const [result, setResult] =
    useState<ProductsSearchResponse>({
      total: 0,
      page: 1,
      pageSize: PAGE_SIZE,
      totalPages: 1,
      data: [],
    });

  const [loading, setLoading] =
    useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [sort, setSort] =
    useState<ProductSort>("default");

  const {
    addItem,
    decreaseItem,
    setItemQuantity,
    getProductQuantity,
    cartStoreId,
  } = useCart();

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await fetchStoresAction();
        setStores(data);
      } catch (error) {
        console.error("Failed to load stores:", error);
        setStores([]);
      }
    };

    loadStores();
  }, []);

  // ==============================
  // FETCH PRODUCTS
  // ==============================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const data =
          await fetchCategoryProductsAction(category.id, {
            pageNumber: page,
            pageSize: PAGE_SIZE,
          });

        setResult(data);
      } catch (error) {
        console.error(
          "Failed to load category products:",
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
  }, [category.id, page]);

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

  const storeNamesById = useMemo(() => {
    return new Map(
      stores.map((store) => [store.id, store.name])
    );
  }, [stores]);

  const sortedProducts = useMemo(() => {
    return sortProducts(result.data, sort);
  }, [result.data, sort]);

  const firstVisible =
    result.total === 0
      ? 0
      : (result.page - 1) * result.pageSize + 1;
  const lastVisible = Math.min(
    result.page * result.pageSize,
    result.total
  );

  // ==============================
  // CART ACTIONS
  // ==============================

  const handleAdd = async (
    productId: string
  ) => {
    await addItem(productId);
  };

  const handleDecrease = async (
    productId: string
  ) => {
    await decreaseItem(productId);
  };

  const handleSetQuantity = async (
    productId: string,
    quantity: number
  ) => {
    await setItemQuantity(productId, quantity);
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="brand-card p-6">
        <p className="text-[#A76E04]">
          Cargando productos...
        </p>
      </div>
    );
  }

  // ==============================
  // EMPTY STATE
  // ==============================

  if (result.data.length === 0) {
    return (
      <div className="brand-card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-wide text-[#A76E04] font-semibold">
              Categoría seleccionada
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#823A00] truncate" title={category.name}>
              {category.name}
            </h1>
          </div>

          <div className="brand-panel px-4 py-2 text-sm font-medium">
            0 productos disponibles
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-center">
          <p className="text-stone-500">
            No hay productos disponibles
            para esta categoría.
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="brand-card p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-wide text-[#A76E04] font-semibold">
            Categoría seleccionada
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#823A00] truncate" title={category.name}>
            {category.name}
          </h1>
        </div>

        <div className="brand-panel px-4 py-2 text-sm font-medium">
          {result.total} producto
          {result.total !== 1
            ? "s"
            : ""}{" "}
          disponibles
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <ProductSortControl
          value={sort}
          onChange={setSort}
        />
      </div>

      {/* PRODUCTS */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            img={product.img}
            name={product.name}
            storeId={product.storeId}
            storeName={storeNamesById.get(product.storeId)}
            categoryName={product.categoryName}
            price={product.price}
            weight={product.weight}
            stock={product.stock}
            available={product.available}
            blockedReason={
              cartStoreId && cartStoreId !== product.storeId
                ? "El producto no pertenece a la tienda en la que está comprando"
                : undefined
            }
            quantity={getProductQuantity(
              product.id
            )}
            onAdd={handleAdd}
            onDecrease={handleDecrease}
            onSetQuantity={handleSetQuantity}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-orange-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="brand-button-soft px-3 py-2 text-sm"
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
              setPage((current) =>
                Math.min(result.totalPages, current + 1)
              )
            }
            disabled={result.page >= result.totalPages}
            className="brand-button-soft px-3 py-2 text-sm"
          >
            Siguiente {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
