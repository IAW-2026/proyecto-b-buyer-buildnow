"use client";

import { useCallback } from "react";

type Props = {
  cartItemId: string;
  productId: string;
  img: string;
  name: string;
  price: number;
  weight: number;
  quantity: number;
  onAdd: (productId: string) => void;
  onDecrease: (productId: string) => void;
};

export default function CartItemCard({
  productId,
  img,
  name,
  price,
  weight,
  quantity,
  onAdd,
  onDecrease,
}: Props) {
  // ==============================
  // FORMATTERS
  // ==============================

  const formattedWeight = `${weight} g`;

  const numericPrice = Number(price);

  const formattedPrice = `$${numericPrice.toFixed(2)}`;

  const subtotal = numericPrice * quantity;

  const formattedSubtotal = `$${subtotal.toFixed(2)}`;

  // ==============================
  // HANDLERS
  // ==============================

  const handleAdd = useCallback(
    (
      event?: React.MouseEvent<HTMLButtonElement>
    ) => {
      event?.stopPropagation();

      onAdd(productId);
    },
    [productId, onAdd]
  );

  const handleDecrease = useCallback(
    (
      event?: React.MouseEvent<HTMLButtonElement>
    ) => {
      event?.stopPropagation();

      onDecrease(productId);
    },
    [productId, onDecrease]
  );

  // ==============================
  // RENDER
  // ==============================

  return (
    <div
      className="
        flex
        gap-3
        rounded-xl
        border
        border-stone-200
        bg-stone-50
        p-3
        transition
        hover:border-orange-300
        hover:bg-stone-100
      "
    >
      {/* IMAGE */}
      <div
        className="
          h-24
          w-24
          flex-shrink-0
          rounded-lg
          bg-stone-200
        "
        style={{
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* INFO */}
      <div className="flex flex-1 flex-col justify-between py-1">
        {/* NAME & WEIGHT */}
        <div>
          <h3 className="text-sm font-medium text-stone-900">
            {name}
          </h3>

          <p className="mt-1 text-xs text-stone-500">
            {formattedWeight}
          </p>
        </div>

        {/* QUANTITY CONTROLS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecrease}
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-orange-500
              text-white
              text-xs
              font-bold
              transition
              hover:bg-orange-600
            "
          >
            −
          </button>

          <span className="text-xs font-semibold text-stone-900 w-4 text-center">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleAdd}
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-orange-500
              text-white
              text-xs
              font-bold
              transition
              hover:bg-orange-600
            "
          >
            +
          </button>
        </div>
      </div>

      {/* PRICE */}
      <div className="flex flex-col items-end justify-between py-1">
        <div className="text-right">
          <p className="text-xs text-stone-500">
            {formattedPrice}
          </p>

          <p className="mt-1 text-lg font-bold text-orange-500">
            {formattedSubtotal}
          </p>
        </div>
      </div>
    </div>
  );
}
