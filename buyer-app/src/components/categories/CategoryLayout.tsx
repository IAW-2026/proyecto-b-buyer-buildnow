"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/products/ProductCard";

import { fetchCategoryProductsAction } from "@/actions/buyerActions";

import { useCart } from "@/context/CartContext";

import type {
  Category,
  Product,
} from "@/lib/apiClients/sellerApi";

type Props = {
  category: Category;
};

export default function CategoryLayout({
  category,
}: Props) {
  const [products, setProducts] = useState<
    Product[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const {
    addItem,
    decreaseItem,
    getProductQuantity,
  } = useCart();

  // ==============================
  // FETCH PRODUCTS
  // ==============================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const data =
          await fetchCategoryProductsAction(
            category.id
          );

        const availableProducts =
          data.filter(
            (product) =>
              product.available
          );

        setProducts(availableProducts);
      } catch (error) {
        console.error(
          "Failed to load category products:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category.id]);

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

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200 p-6">
        <p className="text-stone-400">
          Cargando productos...
        </p>
      </div>
    );
  }

  // ==============================
  // EMPTY STATE
  // ==============================

  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
              Categoría seleccionada
            </p>

            <h1 className="mt-1 text-2xl font-bold text-stone-800">
              {category.name}
            </h1>
          </div>

          <div className="rounded-xl bg-stone-100 px-4 py-2 text-sm text-stone-600">
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
    <div className="rounded-2xl bg-white border border-stone-200 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
            Categoría seleccionada
          </p>

          <h1 className="mt-1 text-2xl font-bold text-stone-800">
            {category.name}
          </h1>
        </div>

        <div className="rounded-xl bg-stone-100 px-4 py-2 text-sm text-stone-600">
          {products.length} producto
          {products.length !== 1
            ? "s"
            : ""}{" "}
          disponibles
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            storeId={product.storeId}
            price={product.price}
            weight={product.weight}
            available={product.available}
            quantity={getProductQuantity(
              product.id
            )}
            onAdd={handleAdd}
            onDecrease={handleDecrease}
          />
        ))}
      </div>
    </div>
  );
}