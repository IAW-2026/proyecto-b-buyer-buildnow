"use client";

import { useRef, useState } from "react";

const categories = [
  "Cemento y Cal",
  "Herramientas",
  "Electricidad",
  "Ferretería",
  "Pinturas",
  "Sanitarios",
  "Materiales de obra",
];

export default function CategorySidebar() {
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
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-500 mb-4">
        Categorías
      </h2>

      {/* MOBILE/TABLET: HORIZONTAL CAROUSEL */}
      <div className="lg:hidden relative flex items-center gap-2">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="
            absolute
            left-0
            z-10
            flex
            h-8
            w-8
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            border
            border-stone-200
            text-stone-600
            text-sm
            transition
            hover:enabled:bg-orange-50
            hover:enabled:border-orange-300
            disabled:opacity-30
            disabled:cursor-not-allowed
          "
        >
          ←
        </button>

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onLoad={checkScroll}
          className="
            flex
            gap-2
            overflow-x-auto
            scroll-smooth
            px-8
            py-1
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {categories.map((category) => (
            <button
              key={category}
              className="
                flex-shrink-0
                rounded-xl
                px-3
                py-2
                text-sm
                text-stone-700
                transition
                hover:bg-stone-100
                whitespace-nowrap
              "
            >
              {category}
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="
            absolute
            right-0
            z-10
            flex
            h-8
            w-8
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            border
            border-stone-200
            text-stone-600
            text-sm
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

      {/* DESKTOP: VERTICAL LIST */}
      <div className="hidden lg:flex lg:flex-col lg:space-y-2">
        {categories.map((category) => (
          <button
            key={category}
            className="
              rounded-xl
              px-3
              py-2
              text-sm
              text-stone-700
              transition
              hover:bg-stone-100
              w-full
              text-left
            "
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}