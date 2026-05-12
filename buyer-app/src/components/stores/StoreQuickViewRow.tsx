"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import ProductCard from "@/components/products/ProductCard";

import {
  addToCartAction,
  decreaseCartItemAction,
  fetchStoreProductsWithCartQuantityAction,
} from "@/actions/buyerActions";

import type { Product } from "@/lib/apiClients/sellerApi";

type Props = {
  storeId: string;
  name: string;
  status: "OPEN" | "CLOSE";
};

type ProductWithQuantity = Product & { quantity: number; };

export default function StoreQuickViewRow({
  storeId,
  name,
  status,
}: Props) {
  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  const errorTimeoutRef =
    useRef<NodeJS.Timeout | null>(null);

  const [products, setProducts] = useState<
    ProductWithQuantity[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(true);

  // ==============================
  // ERROR HANDLING
  // ==============================

  const showError = (message: string) => {
    setErrorMessage(message);

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  // ==============================
  // PRODUCT QUANTITY HELPERS
  // ==============================

  const updateProductQuantity = (
    productId: string,
    delta: number
  ) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              quantity: Math.max(
                0,
                product.quantity + delta
              ),
            }
          : product
      )
    );
  };

  // ==============================
  // INITIAL FETCH
  // ==============================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data =
          await fetchStoreProductsWithCartQuantityAction(
            storeId
          );

        setProducts(data);
      } catch (error) {
        console.error(
          `Failed to load products for store ${storeId}:`,
          error
        );

        showError(
          "No se pudieron cargar los productos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [storeId]);

  // ==============================
  // CART ACTIONS
  // ==============================

  const handleAdd = async (
    productId: string
  ) => {
    // optimistic update
    updateProductQuantity(productId, +1);

    const response = await addToCartAction(
      productId
    );

    if (!response.success) {
      // rollback
      updateProductQuantity(productId, -1);

      showError(
        response.error ??
          "Error al agregar producto"
      );
    }
  };

  const handleDecrease = async (
    productId: string
  ) => {
    // optimistic update
    updateProductQuantity(productId, -1);

    const response =
      await decreaseCartItemAction(productId);

    if (!response.success) {
      // rollback
      updateProductQuantity(productId, +1);

      showError(
        response.error ??
          "Error al actualizar carrito"
      );
    }
  };

  // ==============================
  // HORIZONTAL SCROLL
  // ==============================

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;

    const {
      scrollLeft,
      scrollWidth,
      clientWidth,
    } = scrollContainerRef.current;

    setCanScrollLeft(scrollLeft > 0);

    setCanScrollRight(
      scrollLeft <
        scrollWidth - clientWidth - 10
    );
  };

  const scroll = (
    direction: "left" | "right"
  ) => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 320;

    scrollContainerRef.current.scrollBy({
      left:
        direction === "left"
          ? -scrollAmount
          : scrollAmount,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 300);
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="text-stone-400">
          Cargando productos...
        </div>
      </section>
    );
  }

  // ==============================
  // STORE CLOSED
  // ==============================

  if (status === "CLOSE") {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5 opacity-50">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-stone-900">
            {name}
          </h2>

          <p className="text-sm text-stone-500">
            Tienda cerrada
          </p>
        </div>
      </section>
    );
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            {name}
          </h2>

          <p className="text-sm text-stone-500">
            Productos destacados
          </p>
        </div>

        <button className="text-sm font-medium text-orange-500 hover:underline">
          Ver tienda
        </button>
      </div>

      {/* ERROR */}
      {errorMessage && (
        <div
          className="
            mb-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
            transition-all
            duration-300
          "
        >
          {errorMessage}
        </div>
      )}

      {/* PRODUCTS */}
      <div className="relative flex items-center gap-3">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="
            absolute
            left-0
            z-10
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-stone-200
            bg-white
            text-stone-600
            transition
            hover:enabled:border-orange-300
            hover:enabled:bg-orange-50
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          ←
        </button>

        {/* PRODUCT LIST */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="
            flex
            gap-4
            overflow-x-auto
            scroll-smooth
            px-12
            py-1
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-64 flex-shrink-0"
            >
              <ProductCard
                id={product.id}
                name={product.name}
                storeId={product.storeId}
                price={product.price}
                weight={product.weight}
                quantity={product.quantity}
                onAdd={handleAdd}
                onDecrease={handleDecrease}
              />
            </div>
          ))}
        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="
            absolute
            right-0
            z-10
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-stone-200
            bg-white
            text-stone-600
            transition
            hover:enabled:border-orange-300
            hover:enabled:bg-orange-50
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          →
        </button>
      </div>
    </section>
  );
}