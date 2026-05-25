"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@clerk/nextjs";
import OrdersDropdown from "@/components/orders/OrdersDropdown";

const SEARCH_HISTORY_KEY = "buildnow:search-history";
const MAX_SEARCH_HISTORY = 6;

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
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] =
    useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(
    () => {
      if (typeof window === "undefined") {
        return [];
      }

      try {
        const stored = window.localStorage.getItem(
          SEARCH_HISTORY_KEY
        );

        if (!stored) return [];

        const parsed = JSON.parse(stored) as unknown;

        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter(
            (item): item is string =>
              typeof item === "string" &&
              item.trim().length > 0
          )
          .slice(0, MAX_SEARCH_HISTORY);
      } catch {
        return [];
      }
    }
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const searchText = searchValue ?? localSearchText;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchHistoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const persistSearchHistory = (history: string[]) => {
    setSearchHistory(history);
    window.localStorage.setItem(
      SEARCH_HISTORY_KEY,
      JSON.stringify(history)
    );
  };

  const addSearchToHistory = (search: string) => {
    const normalizedSearch = search.trim();

    if (!normalizedSearch) return;

    const nextHistory = [
      normalizedSearch,
      ...searchHistory.filter(
        (item) =>
          item.toLocaleLowerCase() !==
          normalizedSearch.toLocaleLowerCase()
      ),
    ].slice(0, MAX_SEARCH_HISTORY);

    persistSearchHistory(nextHistory);
  };

  const removeSearchFromHistory = (search: string) => {
    persistSearchHistory(
      searchHistory.filter((item) => item !== search)
    );
  };

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const nextSearch = searchText.trim();
    addSearchToHistory(nextSearch);
    setIsSearchHistoryOpen(false);
    onSearch?.(nextSearch);
  };

  const handleSearchTextChange = (value: string) => {
    if (searchValue === undefined) {
      setLocalSearchText(value);
    }

    onSearchValueChange?.(value);
  };

  const handleClearSearch = () => {
    handleSearchTextChange("");
    setIsSearchHistoryOpen(false);
    onSearch?.("");
  };

  const handleHistorySearch = (search: string) => {
    handleSearchTextChange(search);
    addSearchToHistory(search);
    setIsSearchHistoryOpen(false);
    onSearch?.(search);
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
          ref={searchRef}
          onSubmit={handleSearchSubmit}
          className="order-3 flex w-full gap-2 sm:order-none sm:flex-1 sm:max-w-2xl"
        >
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={searchText}
              onFocus={() => setIsSearchHistoryOpen(true)}
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

            {isSearchHistoryOpen && searchHistory.length > 0 ? (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                <div className="border-b border-stone-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                  Búsquedas recientes
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchHistory.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 border-b border-stone-100 last:border-b-0"
                    >
                      <button
                        type="button"
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          handleHistorySearch(item)
                        }
                        className="min-w-0 flex-1 truncate px-4 py-3 text-left text-sm text-stone-700 transition hover:bg-orange-50 hover:text-orange-700"
                        title={item}
                      >
                        {item}
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          removeSearchFromHistory(item)
                        }
                        className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-red-600"
                        aria-label={`Eliminar busqueda ${item}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
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
