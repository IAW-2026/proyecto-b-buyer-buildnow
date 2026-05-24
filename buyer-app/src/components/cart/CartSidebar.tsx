"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CartItemCard from "@/components/cart/CartItemCard";
import { useCart } from "@/context/CartContext";
import { checkoutAction } from "@/actions/buyerActions";

export default function CartSidebar() {
  const router = useRouter();
  const {
    items: cartItems,
    loading,
    error: errorMessage,
    addItem,
    decreaseItem,
    refetch,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ==============================
  // CALCULATIONS
  // ==============================

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalWeight = cartItems.reduce(
    (sum, item) =>
      sum + item.product.weight * item.quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formattedTotalPrice = `$${totalPrice.toFixed(2)}`;

  const formattedTotalWeight = `${totalWeight} g`;

  // ==============================
  // HANDLERS
  // ==============================

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setCheckoutError("El carrito está vacío");
      return;
    }

    // TODO: obtener dirección de entrega (por ahora usar la primera dirección del buyer)
    // Por ahora usamos una dirección placeholder
    const deliveryAddress = "Dirección de entrega";

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const result = await checkoutAction(deliveryAddress);

      if (!result.success) {
        setCheckoutError(result.error || "Error al procesar el checkout");
        return;
      }

      if (!result.data) {
        setCheckoutError("Error al procesar el checkout: datos no recibidos");
        return;
      }

      // Refetch cart to clear it in UI
      await refetch();

      // Redirigir a la página de tracking de la primera orden
      router.push(`/orders/${result.data.orderId}/tracking`);
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError("Ocurrió un error al procesar el checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ==============================
  // RENDER
  // ==============================

  if (loading) {
    return (
      <div
        className="
          rounded-2xl
          bg-white
          border
          border-stone-200
          p-5
        "
      >
        <div className="space-y-3">
          <div className="h-6 rounded bg-stone-200" />

          <div className="h-4 rounded bg-stone-200" />

          <div className="mt-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg bg-stone-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = cartItems.length === 0;

  return (
    <div
      className="
        rounded-2xl
        bg-white
        border
        border-stone-200
        p-5
        space-y-4
      "
    >
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-stone-900">
          Mi carrito
        </h2>

        <p className="text-sm text-stone-500">
          {totalItems} {totalItems === 1 ? "producto" : "productos"} agregados
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div
          className="
            rounded-lg
            bg-red-50
            p-3
            text-sm
            text-red-600
            border
            border-red-200
          "
        >
          {errorMessage}
        </div>
      )}
      {/* CHECKOUT ERROR MESSAGE */}
      {checkoutError && (
        <div
          className="
            rounded-lg
            bg-red-50
            p-3
            text-sm
            text-red-600
            border
            border-red-200
          "
        >
          {checkoutError}
        </div>
      )}
      {/* EMPTY STATE */}
      {isEmpty ? (
        <div className="py-8 text-center">
          <p className="text-stone-500">
            Tu carrito está vacío
          </p>
        </div>
      ) : (
        <>
          {/* ITEMS */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.cartItemId}
                cartItemId={item.cartItemId}
                productId={item.productId}
                img={item.product.img}
                name={item.product.name}
                price={item.price}
                weight={item.product.weight}
                quantity={item.quantity}
                onAdd={addItem}
                onDecrease={decreaseItem}
              />
            ))}
          </div>

          {/* TOTALS */}
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">
                Peso total
              </span>

              <span className="text-sm font-medium text-stone-900">
                {formattedTotalWeight}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-600">Total</span>

              <span className="text-2xl font-bold text-orange-500">
                {formattedTotalPrice}
              </span>
            </div>

            {/* CHECKOUT BUTTON */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
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
                hover:bg-orange-600
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {isCheckingOut ? "Procesando..." : "Ir al checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
