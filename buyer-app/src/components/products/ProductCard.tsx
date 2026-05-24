"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type Props = {
  id: string;
  name: string;
  storeId: string;
  storeName?: string;
  price: number;
  weight: number;
  available?: boolean;
  quantity: number;
  onAdd: (id: string) => void;
  onDecrease: (id: string) => void;
};

export default function ProductCard({
  id,
  name,
  storeName,
  price,
  weight,
  available = true,
  quantity,
  onAdd,
  onDecrease,
}: Props) {
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  // ==============================
  // FORMATTERS
  // ==============================

  const formattedPrice = `$${price.toFixed(2)}`;

  const formattedWeight = `${weight} g`;

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
    (
      event?: React.MouseEvent<HTMLButtonElement>
    ) => {
      event?.stopPropagation();

      onAdd(id);
    },
    [id, onAdd]
  );

  const handleDecrease = useCallback(
    (
      event?: React.MouseEvent<HTMLButtonElement>
    ) => {
      event?.stopPropagation();

      onDecrease(id);
    },
    [id, onDecrease]
  );

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
            border-stone-200
            bg-stone-50
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
        <button
          type="button"
          onClick={handleAdd}
          className="
            w-full
            rounded-xl
            bg-orange-500
            px-4
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:opacity-90
          "
        >
          Agregar
        </button>
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
          bg-orange-500
          px-4
          py-2
          text-white
        "
      >
        <button
          type="button"
          onClick={handleDecrease}
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
            transition
            hover:bg-white/30
          "
        >
          −
        </button>

        <span className="text-sm font-semibold">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleAdd}
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
            transition
            hover:bg-white/30
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
          rounded-2xl
          border
          border-stone-200
          p-4
          transition
          hover:border-orange-300
          hover:shadow-md
          ${available ? "cursor-pointer" : "opacity-70"}
        `
        }
      >
        {/* IMAGE */}
        <div
          className="
            mb-4
            aspect-square
            rounded-xl
            bg-stone-100
          "
        />

        {/* INFO */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-stone-800">
            {name}
          </h3>

          <p className="text-lg font-bold text-orange-500">
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
            <div
              className="
                mb-6
                aspect-square
                rounded-xl
                bg-stone-100
              "
            />

            {/* CONTENT */}
            <div className="space-y-5">
              {/* TITLE */}
              <div>
                <h2 className="text-xl font-semibold text-stone-900">
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

                  <span className="text-2xl font-bold text-orange-500">
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
