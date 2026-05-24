"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@clerk/nextjs";
import OrdersDropdown from "@/components/orders/OrdersDropdown";

interface TopSearchBarProps {
  showCartButton?: boolean;
  onCartClick?: () => void;
  onSearch?: (search: string) => void;
  searchValue?: string;
  onSearchValueChange?: (search: string) => void;
  showSearch?: boolean;
}

export default function TopSearchBar({
  showCartButton = false,
  onCartClick,
  onSearch,
  searchValue,
  onSearchValueChange,
  showSearch = true,
}: TopSearchBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);
  const [localSearchText, setLocalSearchText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchText = searchValue ?? localSearchText;

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

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    onSearch?.(searchText.trim());
  };

  const handleSearchTextChange = (value: string) => {
    if (searchValue === undefined) {
      setLocalSearchText(value);
    }

    onSearchValueChange?.(value);
  };

  const handleClearSearch = () => {
    handleSearchTextChange("");
    onSearch?.("");
  };

  return (
    <header
      className="
        flex
        flex-wrap
        items-center
        justify-between
        gap-3
        rounded-2xl
        bg-white
        border
        border-stone-200
        p-3
        sm:gap-4
        sm:p-4
      "
    >
      {/* LOGO */}
      <Link
        href="/dashboard"
        className="flex min-w-0 flex-1 items-center gap-2 rounded-xl transition hover:opacity-85 sm:flex-none"
        aria-label="Ir al dashboard"
      >
        <Image
          src="/buildnow-logo.png"
          alt="BuildNow"
          width={40}
          height={40}
          className="h-9 w-9 shrink-0 rounded-xl object-cover sm:h-10 sm:w-10"
          priority
        />

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-stone-900 sm:text-lg">
            BuildNow
          </h1>

          <p className="hidden text-xs text-stone-500 sm:block">
            Materiales para construcción
          </p>
        </div>
      </Link>

      {showSearch ? (
        <form
          onSubmit={handleSearchSubmit}
          className="order-3 flex w-full gap-2 sm:order-none sm:flex-1 sm:max-w-2xl"
        >
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                handleSearchTextChange(event.target.value)
              }
              placeholder="Buscar productos..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-300
                bg-stone-50
                px-4
                pr-11
                text-sm
                outline-none
                transition
                focus:border-orange-500
                focus:bg-white
                sm:h-12
                sm:text-base
              "
            />

            {searchText && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
                className="
                  absolute
                  right-2
                  top-1/2
                  flex
                  h-7
                  w-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  text-lg
                  font-medium
                  text-stone-500
                  transition
                  hover:bg-stone-200
                  hover:text-orange-600
                "
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            className="
              h-11
              shrink-0
              rounded-xl
              bg-orange-500
              px-4
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-orange-600
              sm:h-12
              sm:px-5
            "
          >
            Buscar
          </button>
        </form>
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}

      {/* USER AND CART */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* ORDERS BUTTON */}
        <button
          onClick={() =>
            setIsOrdersDropdownOpen(!isOrdersDropdownOpen)
          }
          className="
            h-10
            w-10
            max-[420px]:h-9
            max-[420px]:w-9
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
              max-[420px]:h-9
              max-[420px]:w-9
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
                max-[420px]:h-9
                max-[420px]:w-9
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
