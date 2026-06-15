"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  prepareCheckoutAction,
  initiatePaymentAction,
  fetchStoresAction,
  getCurrentBuyerAction,
} from "@/actions/buyerActions";
import CartItemCard from "@/components/cart/CartItemCard";
import { useCart } from "@/context/CartContext";

type DeliveryAddress = {
  id: string;
  street: string;
  city: string;
  notes: string | null;
};

export default function CartSidebar() {
  const router = useRouter();
  const {
    items: cartItems,
    loading,
    error: errorMessage,
    addItem,
    decreaseItem,
    clearCart,
    cartStoreId,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [storeName, setStoreName] = useState("");

  const [step, setStep] = useState<"cart" | "checkout_summary">("cart");
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<{
    orderId: string;
    subtotal: number;
    shippingCost: number;
    serviceFee: number;
    total: number;
  } | null>(null);
  const checkoutErrorTimeoutRef = useRef<number | null>(null);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  useEffect(() => {
    const loadAddresses = async () => {
      const result = await getCurrentBuyerAction();
      const buyerAddresses = result.data?.addresses ?? [];

      setAddresses(buyerAddresses);
      setSelectedAddressId((current) =>
        buyerAddresses.some((address) => address.id === current)
          ? current
          : buyerAddresses[0]?.id ?? ""
      );
    };

    void loadAddresses();
  }, []);

  useEffect(() => {
    const loadStoreName = async () => {
      if (!cartStoreId) {
        setStoreName("");
        return;
      }

      try {
        const stores = await fetchStoresAction();
        setStoreName(
          stores.find((store) => store.id === cartStoreId)?.name ??
            "Tienda"
        );
      } catch (error) {
        console.error("Error al obtener la tienda del carrito:", error);
        setStoreName("Tienda");
      }
    };

    void loadStoreName();
  }, [cartStoreId]);

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalWeight = cartItems.reduce(
    (sum, item) => sum + item.product.weight * item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formattedTotalPrice = `$${totalPrice.toFixed(2)}`;
  const formattedTotalWeight = `${totalWeight.toFixed(2)} g`;
  const isEmpty = cartItems.length === 0;

  const clearCheckoutErrorTimeout = () => {
    if (checkoutErrorTimeoutRef.current) {
      window.clearTimeout(checkoutErrorTimeoutRef.current);
      checkoutErrorTimeoutRef.current = null;
    }
  };

  const setCheckoutErrorWithTimeout = (message: string | null) => {
    setCheckoutError(message);

    clearCheckoutErrorTimeout();

    if (message) {
      checkoutErrorTimeoutRef.current = window.setTimeout(() => {
        setCheckoutError(null);
        checkoutErrorTimeoutRef.current = null;
      }, 5000);
    }
  };

  const handleCheckout = async () => {
    if (isEmpty) {
      setCheckoutErrorWithTimeout("El carrito está vacío");
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId
    );

    if (!selectedAddress) {
      setCheckoutErrorWithTimeout(
        "Debes agregar y seleccionar una dirección de entrega."
      );
      return;
    }

    setIsCheckingOut(true);
    setCheckoutErrorWithTimeout(null);

    try {
      const deliveryAddress = `${selectedAddress.street}, ${selectedAddress.city}`;
      const result = await prepareCheckoutAction(deliveryAddress);

      if (!result.success) {
        setCheckoutErrorWithTimeout(result.error || "Error al procesar el checkout");
        return;
      }

      if (!result.data) {
        setCheckoutErrorWithTimeout("Error al procesar el checkout: datos no recibidos");
        return;
      }

      setCheckoutSummary(result.data);
      setStep("checkout_summary");
    } catch (error) {
      setCheckoutErrorWithTimeout("Ocurrió un error al procesar el checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePay = async () => {
    if (!checkoutSummary) return;

    setIsPaying(true);
    setCheckoutErrorWithTimeout(null);

    try {
      const result = await initiatePaymentAction(
        checkoutSummary.orderId,
        checkoutSummary.shippingCost,
        checkoutSummary.serviceFee
      );

      if (!result.success) {
        setCheckoutErrorWithTimeout(result.error || "Error al iniciar el pago");
        return;
      }

      if (!result.data) {
        setCheckoutErrorWithTimeout("Error al iniciar el pago: datos no recibidos");
        return;
      }

      // Clear the cart on frontend
      await clearCart();

      const payment = result.data.payment;
      const redirectUrl =
        payment?.data?.initPoint ||
        payment?.checkoutUrl ||
        payment?.redirectUrl ||
        payment?.url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        router.push(`/orders/${checkoutSummary.orderId}/tracking`);
      }
    } catch (error) {
      setCheckoutErrorWithTimeout("Ocurrió un error al procesar el pago");
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (checkoutErrorTimeoutRef.current) {
        window.clearTimeout(checkoutErrorTimeoutRef.current);
      }
    };
  }, []);

  const handleClearCart = async () => {
    setIsClearing(true);
    setCheckoutErrorWithTimeout(null);

    const result = await clearCart();

    if (!result.success) {
      setCheckoutErrorWithTimeout(result.error || "Error al vaciar el carrito");
    }

    setIsClearing(false);
  };

  if (loading) {
    return (
      <div className="brand-card p-5">
        <div className="space-y-3">
          <div className="h-6 rounded bg-stone-200" />
          <div className="h-4 rounded bg-stone-200" />
          <div className="mt-6 space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-lg bg-stone-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "checkout_summary" && checkoutSummary) {
    return (
      <div className="brand-card space-y-4 bg-[#fffdf9] p-5">
        <h2 className="text-xl font-bold text-[#823A00]">
          Resumen de tu pedido
        </h2>

        <div className="space-y-3 border-t border-orange-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">Subtotal</span>
            <span className="text-sm font-medium text-stone-900">
              {formatMoney(checkoutSummary.subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">Tarifa de servicio</span>
            <span className="text-sm font-medium text-stone-900">
              {formatMoney(checkoutSummary.serviceFee)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">Costo de envío</span>
            <span className="text-sm font-medium text-stone-900">
              {formatMoney(checkoutSummary.shippingCost)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-orange-200 pt-2">
            <span className="text-[#823A00] font-semibold">Total a pagar</span>
            <span className="text-2xl font-bold text-[#ED6F00]">
              {formatMoney(checkoutSummary.total)}
            </span>
          </div>

          {checkoutError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {checkoutError}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handlePay}
            disabled={isPaying}
            className="brand-button-primary w-full px-4 py-3"
          >
            {isPaying ? "Procesando pago..." : "Ir a Pagar"}
          </button>

          <button
            type="button"
            onClick={() => setStep("cart")}
            disabled={isPaying}
            className="brand-button-soft w-full px-4 py-3 text-stone-600"
          >
            Volver al carrito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-card space-y-4 bg-[#fffdf9] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#823A00]">
            Mi carrito
          </h2>

          {cartStoreId ? (
            <p className="truncate text-sm font-medium text-stone-700">
              {storeName || "Cargando tienda..."}
            </p>
          ) : null}

          <p className="text-sm text-[#A76E04]">
            {totalItems} {totalItems === 1 ? "producto" : "productos"} agregados
          </p>
        </div>

        {!isEmpty ? (
          <button
            type="button"
            onClick={handleClearCart}
            disabled={isClearing}
            className="brand-button-soft shrink-0 px-3 py-2 text-xs"
          >
            {isClearing ? "Vaciando..." : "Vaciar carrito"}
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {checkoutError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {checkoutError}
        </div>
      ) : null}

      {isEmpty ? (
        <div className="py-8 text-center">
          <p className="text-stone-500">Tu carrito está vacío</p>
        </div>
      ) : (
        <>
          <div className="max-h-96 space-y-3 overflow-y-auto">
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

          <div className="space-y-3 border-t border-orange-200 pt-4">
            <div className="space-y-2">
              <label
                htmlFor="delivery-address"
                className="block text-sm font-medium text-stone-700"
              >
                Dirección de entrega
              </label>

              {addresses.length > 0 ? (
                <select
                  id="delivery-address"
                  value={selectedAddressId}
                  onChange={(event) =>
                    setSelectedAddressId(event.target.value)
                  }
                  className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-orange-500"
                >
                  {addresses.map((address, index) => (
                    <option key={address.id} value={address.id}>
                      {index === 0 ? "Principal: " : ""}
                      {address.street}, {address.city}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="brand-panel p-3 text-sm">
                  No tienes direcciones asociadas.{" "}
                  <Link
                    href="/me"
                    className="font-semibold underline underline-offset-2"
                  >
                    Agrega una desde tu perfil
                  </Link>
                  .
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">Peso total</span>
              <span className="text-sm font-medium text-stone-900">
                {formattedTotalWeight}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#823A00]">Subtotal</span>
              <span className="text-2xl font-bold text-[#ED6F00]">
                {formattedTotalPrice}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut || addresses.length === 0}
              className="brand-button-primary w-full px-4 py-3"
            >
              {isCheckingOut ? "Procesando..." : "Ir al checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
