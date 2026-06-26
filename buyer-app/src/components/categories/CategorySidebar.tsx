"use client";

import { useRef, useState, useEffect } from "react";

import { fetchCategoriesAction } from "@/actions/buyerActions";

import type { Category } from "@/types/catalog";

type Props = {
  selectedCategory: Category | null;
  onSelectCategory: (category: Category | null) => void;
};

export default function CategorySidebar({
  selectedCategory,
  onSelectCategory,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesAction();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

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

  const handleSelectCategory = (category: Category) => {
    if (selectedCategory?.id === category.id) {
      onSelectCategory(null);
      return;
    }

    onSelectCategory(category);
  };

  const getCategoryButtonClassName = (category: Category) => {
    const isSelected = selectedCategory?.id === category.id;

    return `
      rounded-xl
      px-3
      py-2
      text-sm
      transition-[background-color,border-color,color,transform]
      duration-200
      ease-out
      text-left
      w-full
      max-w-[200px]
      ${
        isSelected
          ? "border border-orange-200 bg-[#FFF4E8] text-[#823A00] font-semibold"
          : "text-stone-700 hover:bg-[#FFF4E8] hover:text-[#823A00]"
      }
    `;
  };

  if (loading) {
    return (
      <div className="brand-card bg-[#fffdf9] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#823A00] mb-4">
          Categorías
        </h2>

        <div className="text-stone-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="brand-card bg-[#fffdf9] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#823A00] mb-4">
        Categorías
      </h2>

      {/* MOBILE/TABLET */}
      <div className="lg:hidden flex flex-col gap-3">
        {selectedCategory && (
          <div className="flex items-center min-w-0">
            <button
              onClick={() => onSelectCategory(null)}
              className="flex items-center gap-2 rounded-full border border-orange-200 bg-[#FFF4E8] px-3 py-1.5 text-sm font-semibold text-[#823A00] transition-colors hover:bg-orange-100 max-w-full"
            >
              <span className="truncate" title={selectedCategory.name}>
                {selectedCategory.name}
              </span>
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-200/50 text-xs font-bold leading-none">
                &times;
              </span>
            </button>
          </div>
        )}

        <div className="relative flex items-center gap-2">
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
              border-[#A76E04]
              text-[#823A00]
              text-sm
              transition-[background-color,border-color,transform,opacity]
              duration-200
              ease-out
              hover:enabled:bg-[#FFF4E8]
              hover:enabled:border-[#A76E04]
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
                key={category.id}
                onClick={() => handleSelectCategory(category)}
                className={getCategoryButtonClassName(category)}
              >
                <span className="truncate block w-full" title={category.name}>
                  {category.name}
                </span>
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
              border-[#A76E04]
              text-[#823A00]
              text-sm
              transition-[background-color,border-color,transform,opacity]
              duration-200
              ease-out
              hover:enabled:bg-[#FFF4E8]
              hover:enabled:border-[#A76E04]
              disabled:opacity-30
              disabled:cursor-not-allowed
            "
          >
            →
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex lg:flex-col lg:space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleSelectCategory(category)}
            className={getCategoryButtonClassName(category)}
          >
            <span className="truncate block w-full" title={category.name}>
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
