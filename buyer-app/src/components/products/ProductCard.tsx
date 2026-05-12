"use client";

import { useState } from "react";

type Props = {
  id: number;
  name: string;
  price: string;
  weight: string;
};

export default function ProductCard({ id, name, price, weight }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* PRODUCT CARD */}
      <article
        onClick={() => setIsOpen(true)}
        className="
          rounded-2xl
          border
          border-stone-200
          p-4
          transition
          hover:shadow-md
          cursor-pointer
          hover:border-orange-300
        "
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
            {price}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
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
        </div>
      </article>

      {/* MODAL */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black
            bg-opacity-50
            p-4
          "
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              relative
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-6
              shadow-lg
            "
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsOpen(false)}
              className="
                absolute
                top-4
                right-4
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
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-stone-900">
                  {name}
                </h2>
              </div>

              {/* PRICE & WEIGHT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Precio:</span>
                  <span className="text-2xl font-bold text-orange-500">
                    {price}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Peso:</span>
                  <span className="font-medium text-stone-900">
                    {weight}
                  </span>
                </div>
              </div>

              {/* ADD BUTTON */}
              <button
                onClick={() => setIsOpen(false)}
                className="
                  w-full
                  rounded-xl
                  bg-orange-500
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:opacity-90
                  mt-6
                "
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}