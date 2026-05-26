"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type Props = {
  id: string;
  img: string;
  name: string;
  storeId: string;
  storeName?: string;
  categoryName?: string;
  price: number;
  weight: number;
  stock?: number;
  available?: boolean;
  quantity: number;
  onAdd: (id: string) => void | Promise<void>;
  onDecrease: (id: string) => void | Promise<void>;
  onSetQuantity: (
    id: string,
    quantity: number
  ) => void | Promise<void>;
};

export default function ProductCard({
  id,
  img,
  name,
  categoryName,
  storeName,
  price,
  weight,
  stock,
  available = true,
  quantity,
  onAdd,
  onDecrease,
  onSetQuantity,
}: Props) {
  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [imageFailed, setImageFailed] =
    useState(false);
  const [draftQuantity, setDraftQuantity] =
    useState<string | null>(null);
  const [isUpdatingQuantity, setIsUpdatingQuantity] =
    useState(false);
  const [isAdjustingQuantity, setIsAdjustingQuantity] =
    useState(false);

  // ==============================
  // FORMATTERS
  // ==============================

  const formattedPrice = `$${price.toFixed(2)}`;

  const formattedWeight = `${weight} g`;
  const maxQuantity = stock ?? 999;
  const quantityInputValue =
    draftQuantity ?? String(quantity > 0 ? quantity : 1);

  const fallbackLabel =
    categoryName ?? name.split(" ")[0] ?? "Producto";

  const fallbackInitial = fallbackLabel
    .charAt(0)
    .toUpperCase();

  const renderImage = (sizes: string) => {
    if (imageFailed) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-[#FFF4E8] to-stone-200 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#ED6F00] shadow-sm">
            {fallbackInitial}
          </div>
          <p className="mt-3 line-clamp-2 text-sm font-semibold text-[#823A00]">
            {name}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {fallbackLabel}
          </p>
        </div>
      );
    }

    return (
      <Image
        src={img}
        alt={name}
        fill
        sizes={sizes}
        className="object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  };

  // ==============================
  // MODAL HANDLERS
  // ==============================

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // ==============================
  // PRODUCT ACTIONS
  // ==============================

  const handleAdd = useCallback(
    async (
      event?: React.MouseEvent<HTMLButtonElement>
    ) => {
      event?.stopPropagation();

      if (isAdjustingQuantity) return;

      setIsAdjustingQuantity(true);

      try {
        await onAdd(id);
        setDraftQuantity(null);
      } finally {
        setIsAdjustingQuantity(false);
      }
    },
    [id, isAdjustingQuantity, onAdd]
  );

  const handleDecrease = useCallback(
    async (
      event?: React.MouseEvent<HTMLButtonElement>
    ) => {
      event?.stopPropagation();

      if (isAdjustingQuantity) return;

      setIsAdjustingQuantity(true);

      try {
        await onDecrease(id);
        setDraftQuantity(null);
      } finally {
        setIsAdjustingQuantity(false);
      }
    },
    [id, isAdjustingQuantity, onDecrease]
  );

  const handleSetQuantity = useCallback(
    async (nextQuantity: number) => {
      const safeQuantity = Math.min(
        Math.max(0, Math.floor(nextQuantity)),
        maxQuantity
      );

      setIsUpdatingQuantity(true);

      try {
        await onSetQuantity(id, safeQuantity);
        setDraftQuantity(null);
      } finally {
        setIsUpdatingQuantity(false);
      }
    },
    [id, maxQuantity, onSetQuantity]
  );

  const handleQuantityInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.replace(/\D/g, "");
    setDraftQuantity(value);
  };

  const commitDraftQuantity = () => {
    const nextQuantity = Number(quantityInputValue || "0");
    void handleSetQuantity(nextQuantity);
  };

  // ==============================
  // ESC TO CLOSE
  // ==============================

  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, closeModal]);

  // ==============================
  // CART CONTROLS
  // ==============================

  const renderCartControls = () => {
    if (!available) {
      return (
        <div className="
            rounded-xl
            border
            border-[#F8C58D]
            bg-[#FFF4E8]
            px-4
            py-2
            text-center
            text-sm
            font-medium
            text-stone-500
          ">
          No disponible
        </div>
      );
    }

    if (quantity <= 0) {
      return (
        <div
          onClick={(event) =>
            event.stopPropagation()
          }
          className="flex gap-2"
        >
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantityInputValue}
            onChange={handleQuantityInputChange}
            onBlur={() => {
              if (!draftQuantity) {
                setDraftQuantity("1");
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitDraftQuantity();
              }
            }}
            className="h-10 w-20 rounded-xl border border-orange-200 bg-white px-3 text-center text-sm font-semibold text-[#823A00] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A76E04] focus:shadow-[0_0_0_3px_rgba(237,111,0,0.12)]"
            aria-label="Cantidad a agregar"
          />
          <button
            type="button"
            onClick={() => commitDraftQuantity()}
            disabled={isUpdatingQuantity || isAdjustingQuantity}
            className="
              min-w-0
              flex-1
              brand-button-primary
              px-3
              py-2
              text-sm
            "
          >
            Agregar
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="
          flex
          items-center
          justify-between
          rounded-xl
          bg-[#ED6F00]
          px-4
          py-2
          text-white
        "
      >
        <button
          type="button"
          onClick={handleDecrease}
          disabled={isUpdatingQuantity || isAdjustingQuantity}
          className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-white/20
            text-lg
            font-bold
            transition-[background-color,opacity,transform]
            duration-150
            ease-out
            hover:bg-white/30
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          −
        </button>

        <input
          type="number"
          min={0}
          max={maxQuantity}
          value={quantityInputValue}
          onChange={handleQuantityInputChange}
          onBlur={commitDraftQuantity}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraftQuantity();
            }
          }}
          disabled={isUpdatingQuantity || isAdjustingQuantity}
          className="h-7 w-14 rounded-lg border border-white/30 bg-white text-center text-sm font-semibold text-[#823A00] outline-none transition-[box-shadow] duration-150 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.24)] disabled:opacity-70"
          aria-label="Cantidad en carrito"
        />

        <button
          type="button"
          onClick={handleAdd}
          disabled={isUpdatingQuantity || isAdjustingQuantity}
          className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-white/20
            text-lg
            font-bold
            transition-[background-color,opacity,transform]
            duration-150
            ease-out
            hover:bg-white/30
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          +
        </button>
      </div>
    );
  };

  // ==============================
  // RENDER
  // ==============================

  return (
    <>
      {/* CARD */}
      <article
        onClick={openModal}
        className={
          `
          brand-card
          brand-card-hover
          bg-[#fffdf9]
          p-4
          hover:-translate-y-1
          ${available ? "cursor-pointer" : "opacity-70"}
        `
        }
      >
        {/* IMAGE */}
        <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-stone-100 shadow-inner">
          {renderImage("(max-width: 640px) 100vw, 256px")}
        </div>

        {/* INFO */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#823A00]">
            {name}
          </h3>

          <p className="text-lg font-bold text-[#ED6F00]">
            {formattedPrice}
          </p>

          {renderCartControls()}
        </div>
      </article>

      {/* MODAL */}
      {isModalOpen && (
        <div
          onClick={closeModal}
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              relative
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-6
              shadow-xl
            "
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={closeModal}
              className="
                absolute
                right-4
                top-4
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-stone-100
                text-stone-600
                transition
                hover:bg-stone-200
              "
            >
              ✕
            </button>

            {/* IMAGE */}
            <div className="relative mb-6 aspect-square overflow-hidden rounded-xl bg-stone-100">
              {renderImage("(max-width: 640px) 100vw, 448px")}
            </div>

            {/* CONTENT */}
            <div className="space-y-5">
              {/* TITLE */}
              <div>
                <h2 className="text-xl font-semibold text-[#823A00]">
                  {name}
                </h2>
                {storeName ? (
                  <p className="mt-1 text-sm text-stone-500">
                    Vendido por {storeName}
                  </p>
                ) : null}
              </div>

              {/* DETAILS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">
                    Precio
                  </span>

                  <span className="text-2xl font-bold text-[#ED6F00]">
                    {formattedPrice}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500">
                    Peso
                  </span>

                  <span className="font-medium text-stone-900">
                    {formattedWeight}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="pt-2">
                {renderCartControls()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
