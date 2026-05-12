export default function CartSidebar() {
  return (
    <div
      className="
        sticky
        top-4
        rounded-2xl
        bg-white
        border
        border-stone-200
        p-5
      "
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-stone-900">
          Mi carrito
        </h2>

        <p className="text-sm text-stone-500">
          3 productos agregados
        </p>
      </div>

      {/* ITEMS */}
      <div className="space-y-4">
        <div className="rounded-xl bg-stone-100 p-3">
          Cemento Portland x50kg
        </div>

        <div className="rounded-xl bg-stone-100 p-3">
          Ladrillo común
        </div>

        <div className="rounded-xl bg-stone-100 p-3">
          Pintura Látex
        </div>
      </div>

      {/* TOTAL */}
      <div className="mt-6 border-t border-stone-200 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-stone-600">Total</span>

          <span className="text-xl font-bold text-orange-500">
            $51.200
          </span>
        </div>

        <button
          className="
            w-full
            rounded-xl
            bg-orange-500
            px-4
            py-3
            font-medium
            text-white
            transition
            hover:opacity-90
          "
        >
          Ir al checkout
        </button>
      </div>
    </div>
  );
}