"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import OrdersDropdown from "@/components/orders/OrdersDropdown";

interface TopSearchBarProps {
  showCartButton?: boolean;
  onCartClick?: () => void;
}

export default function TopSearchBar({ showCartButton = false, onCartClick }: TopSearchBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-2xl
        bg-white
        border
        border-stone-200
        p-4
      "
    >
      {/* LOGO */}
      <div className="flex items-center gap-2">
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-orange-500
            text-white
            font-bold
          "
        >
          B
        </div>

        <div>
          <h1 className="text-lg font-bold text-stone-900">
            BuildNow
          </h1>

          <p className="text-xs text-stone-500">
            Materiales para construcción
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex-1 max-w-2xl">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="
            w-full
            rounded-xl
            border
            border-stone-300
            bg-stone-50
            px-4
            py-3
            outline-none
            transition
            focus:border-orange-500
            focus:bg-white
          "
        />
      </div>

      {/* USER AND CART */}
      <div className="flex items-center gap-3">
        {/* ORDERS BUTTON */}
        <button
          onClick={() =>
            setIsOrdersDropdownOpen(!isOrdersDropdownOpen)
          }
          className="
            h-10
            w-10
            rounded-full
            bg-stone-200
            flex
            items-center
            justify-center
            hover:bg-stone-300
            transition
            text-lg
          "
          title="Ver mis pedidos"
        >
          📦
        </button>

        {showCartButton && (
          <button
            onClick={onCartClick}
            className="
              h-10
              w-10
              rounded-full
              bg-stone-200
              flex
              items-center
              justify-center
              hover:bg-stone-300
              transition
            "
          >
            🛒
          </button>
        )}

        <div
          ref={dropdownRef}
          className="relative"
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="
              flex
              items-center
              gap-2
              p-2
              hover:bg-stone-100
              rounded-xl
              transition
            "
          >
            <div
              className="
                h-10
                w-10
                rounded-full
                bg-stone-200
                flex
                items-center
                justify-center
              "
            >
              👤
            </div>

            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-stone-800">
                Hola
              </p>

              <p className="text-xs text-stone-500">
                Mi cuenta
              </p>
            </div>
          </button>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <div
              className="
                absolute
                right-0
                mt-2
                w-48
                bg-white
                border
                border-stone-200
                rounded-xl
                shadow-lg
                z-50
              "
            >
              <Link
                href="/me"
                onClick={() => setIsDropdownOpen(false)}
                className="
                  block
                  px-4
                  py-3
                  text-sm
                  text-stone-800
                  hover:bg-orange-50
                  hover:text-orange-600
                  transition
                  rounded-t-xl
                "
              >
                👤 Mi perfil
              </Link>

              <Link
                href="/me#addresses"
                onClick={() => setIsDropdownOpen(false)}
                className="
                  block
                  px-4
                  py-3
                  text-sm
                  text-stone-800
                  hover:bg-orange-50
                  hover:text-orange-600
                  transition
                  border-t
                  border-stone-200
                "
              >
                📍 Mis direcciones
              </Link>

              <SignOutButton>
                <button
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    text-sm
                    text-red-600
                    hover:bg-red-50
                    transition
                    border-t
                    border-stone-200
                    rounded-b-xl
                  "
                >
                  🚪 Cerrar sesión
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>

      {/* ORDERS DROPDOWN */}
      <OrdersDropdown
        isOpen={isOrdersDropdownOpen}
        onClose={() => setIsOrdersDropdownOpen(false)}
      />
    </header>
  );
}