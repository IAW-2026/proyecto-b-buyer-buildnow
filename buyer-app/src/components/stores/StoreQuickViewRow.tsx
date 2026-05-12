"use client";

import { useRef, useState } from "react";
import ProductCard from "@/components/products/ProductCard";

type Props = {
  name: string;
};

const products = [
  {
    id: 1,
    name: "Cemento Portland",
    price: "$7.850",
    weight: "50 kg",
  },
  {
    id: 2,
    name: "Ladrillo común",
    price: "$180",
    weight: "2.5 kg",
  },
  {
    id: 3,
    name: "Pintura Látex",
    price: "$26.500",
    weight: "20 L",
  },
];

export default function StoreQuickViewRow({ name }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one product card + gap
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Check scroll state after animation
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="rounded-2xl bg-white border border-stone-200 p-5">
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

        <button
          className="
            text-sm
            font-medium
            text-orange-500
            hover:underline
          "
        >
          Ver tienda
        </button>
      </div>

      {/* CAROUSEL */}
      <div className="relative flex items-center gap-3">
        {/* LEFT ARROW */}
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
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            border
            border-stone-200
            text-stone-600
            transition
            hover:enabled:bg-orange-50
            hover:enabled:border-orange-300
            disabled:opacity-30
            disabled:cursor-not-allowed
          "
        >
          ←
        </button>

        {/* PRODUCTS CONTAINER */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onLoad={checkScroll}
          className="
            flex
            gap-4
            overflow-x-auto
            scroll-smooth
            px-12
            py-1
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-64">
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                weight={product.weight}
              />
            </div>
          ))}
        </div>

        {/* RIGHT ARROW */}
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
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            border
            border-stone-200
            text-stone-600
            transition
            hover:enabled:bg-orange-50
            hover:enabled:border-orange-300
            disabled:opacity-30
            disabled:cursor-not-allowed
          "
        >
          →
        </button>
      </div>
    </section>
  );
}