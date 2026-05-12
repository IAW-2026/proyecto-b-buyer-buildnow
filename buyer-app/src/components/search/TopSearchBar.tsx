interface TopSearchBarProps {
  showCartButton?: boolean;
  onCartClick?: () => void;
}

export default function TopSearchBar({ showCartButton = false, onCartClick }: TopSearchBarProps) {
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
          placeholder="Buscar productos o comercios..."
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
          className="
            h-10
            w-10
            rounded-full
            bg-stone-200
          "
        />

        <div className="hidden md:block">
          <p className="text-sm font-medium text-stone-800">
            Hola, Juan
          </p>

          <p className="text-xs text-stone-500">
            Mi cuenta
          </p>
        </div>
      </div>
    </header>
  );
}