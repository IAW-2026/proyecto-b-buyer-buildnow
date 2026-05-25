"use client";

import { useState } from "react";

import { useCart } from "@/context/CartContext";
import type {
  AiRecommendationResponse,
  RecommendedProduct,
} from "@/types/ai-recommendation";

type Props = {
  storeId: string;
};

const MAX_MESSAGE_LENGTH = 500;

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

export default function AiMaterialAssistant({
  storeId,
}: Props) {
  const { addItem } = useCart();
  const [message, setMessage] = useState("");
  const [result, setResult] =
    useState<AiRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addingProductId, setAddingProductId] =
    useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Contame que necesitás construir o comprar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setResult(null);

    try {
      const response = await fetch(
        "/api/ai/recommend-products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
            storeId,
          }),
        }
      );

      const data = (await response.json()) as
        | AiRecommendationResponse
        | { error?: string };

      if (!response.ok) {
        setError(
          "error" in data && data.error
            ? data.error
            : "No pudimos generar recomendaciones."
        );
        return;
      }

      setResult(data as AiRecommendationResponse);
    } catch (requestError) {
      console.error(requestError);
      setError(
        "No pudimos contactar al asistente. Intentá nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (
    product: RecommendedProduct
  ) => {
    setAddingProductId(product.productId);
    setError(null);
    setSuccessMessage(null);

    try {
      const addResult = await addItem(product.productId);

      if (!addResult.success) {
        setError(
          addResult.error ||
            "No pudimos agregar el producto al carrito."
        );
        return;
      }

      setSuccessMessage(
        `${product.name} agregado al carrito.`
      );
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-[#A76E04] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-stone-900">
          Asistente de materiales
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Contame qué necesitás construir o comprar y te recomiendo productos disponibles.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-3"
      >
        <textarea
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value.slice(0, MAX_MESSAGE_LENGTH)
            )
          }
          rows={4}
          placeholder="Ej: Necesito hacer una pared de ladrillos de 3 metros por 2 metros"
          className="w-full resize-none rounded-xl border border-stone-300 bg-[#FFF4E8] px-4 py-3 text-sm outline-none transition focus:border-[#ED6F00] focus:bg-white"
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-stone-400">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-[#ED6F00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#A76E04] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Recomendando..."
              : "Recomendar productos"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4">
          <p className="rounded-xl bg-[#FFF4E8] px-4 py-3 text-sm text-[#823A00]">
            {result.message}
          </p>

          {result.recommendedProducts.length > 0 ? (
            <div className="space-y-3">
              {result.recommendedProducts.map((product) => (
                <article
                  key={product.productId}
                  className="rounded-xl border border-stone-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-stone-900">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-stone-600">
                        {product.reason}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-[#ED6F00]">
                      {formatMoney(product.price)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddProduct(product)}
                    disabled={
                      addingProductId === product.productId
                    }
                    className="mt-3 w-full rounded-xl bg-[#ED6F00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingProductId === product.productId
                      ? "Agregando..."
                      : "Agregar al carrito"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#A76E04] bg-[#FFF4E8] px-4 py-3 text-sm text-stone-600">
              No encontré productos disponibles para esa necesidad en esta tienda.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
