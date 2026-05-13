"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import ProductCard from "@/components/products/ProductCard";

import { useCart } from "@/context/CartContext";

import {
  fetchStoreProductsWithCartQuantityAction,
} from "@/actions/buyerActions";

import type { Product } from "@/lib/apiClients/sellerApi";

type Props = {
  storeId: string;
  name: string;
  status: "OPEN" | "CLOSE";
};

type ProductWithQuantity = Product & {
  quantity: number;
};

export default function StoreQuickViewRow({
  storeId,
  name,
  status,
}: Props) {
  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  const messageTimeoutRef =
    useRef<NodeJS.Timeout | null>(null);

  const [products, setProducts] = useState<
    ProductWithQuantity[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(true);

  const {
    getProductQuantity,
    addItem,
    decreaseItem,
  } = useCart();

  // ==============================
  // MESSAGE HANDLING
  // ==============================

  const showMessage = useCallback(
    (
      type: "success" | "error",
      text: string
    ) => {
      setMessage({ type, text });

      if (messageTimeoutRef.current) {
        clearTimeout(
          messageTimeoutRef.current
        );
      }

      messageTimeoutRef.current =
        setTimeout(() => {
          setMessage(null);
        }, 5000);
    },
    []
  );

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

        showMessage(
          "error",
          "No se pudieron cargar los productos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(
          messageTimeoutRef.current
        );
      }
    };
  }, [storeId, showMessage]);

  // ==============================
  // CART ACTIONS
  // ==============================

  const handleAdd = useCallback(
    async (productId: string) => {
      const result = await addItem(productId);

      if (!result.success) {
        showMessage(
          "error",
          result.error ||
            "Error al agregar producto"
        );

        return;
      }

      showMessage(
        "success",
        "Producto agregado al carrito"
      );
    },
    [addItem, showMessage]
  );

  const handleDecrease = useCallback(
    async (productId: string) => {
      const result =
        await decreaseItem(productId);

      if (!result.success) {
        showMessage(
          "error",
          result.error ||
            "Error al actualizar carrito"
        );

        return;
      }

      showMessage(
        "success",
        "Cantidad actualizada"
      );
    },
    [decreaseItem, showMessage]
  );

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

      {/* MESSAGE */}
      {message && (
        <div
          className={`
            mb-4
            rounded-xl
            border
            px-4
            py-3
            text-sm
            transition-all
            duration-300
            ${
              message.type === "success"
                ? `
                  border-green-200
                  bg-green-50
                  text-green-700
                `
                : `
                  border-red-200
                  bg-red-50
                  text-red-700
                `
            }
          `}
        >
          {message.text}
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
                quantity={getProductQuantity(
                  product.id
                )}
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