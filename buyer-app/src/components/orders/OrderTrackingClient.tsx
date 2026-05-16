"use client";

import Link from "next/link";
import type { OrderResponseDto } from "@/lib/mockSeller";

const statusSteps = [
  {
    key: "PENDING_PAYMENT",
    label: "Pedido recibido",
    icon: "📦",
  },
  {
    key: "CONFIRMED",
    label: "Confirmado",
    icon: "✅",
  },
  {
    key: "READY",
    label: "Listo",
    icon: "📦",
  },
  {
    key: "ON_THE_WAY",
    label: "En camino",
    icon: "🚚",
  },
  {
    key: "DELIVERED",
    label: "Entregado",
    icon: "📍",
  },
];

const statusIndex: Record<string, number> = {
  PENDING_PAYMENT: 0,
  CONFIRMED: 1,
  READY: 2,
  ON_THE_WAY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

interface OrderTrackingClientProps {
  order: OrderResponseDto;
}

export default function OrderTrackingClient({
  order,
}: OrderTrackingClientProps) {
  const currentStepIndex =
    statusIndex[order.status] ?? -1;
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-orange-600 hover:text-orange-700 mb-2 inline-block"
            >
              ← Volver a pedidos
            </Link>

            <h1 className="text-3xl font-bold text-stone-900">
              Seguimiento del pedido
            </h1>

            <p className="text-stone-500 mt-2">
              Pedido #{order.id.slice(0, 12)}...
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">
              ${order.totalAmount.toFixed(2)}
            </p>

            <p className="text-sm text-stone-500">
              Realizado:{" "}
              {new Date(order.createdAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* STATUS TIMELINE */}
        {!isCancelled ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-8">
            <h2 className="text-lg font-semibold text-stone-900 mb-8">
              Estado del pedido
            </h2>

            <div className="relative">
              {/* STEPS */}
              <div className="flex justify-between relative z-10">
                {statusSteps.map((step, index) => (
                  <div
                    key={step.key}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`
                        h-12
                        w-12
                        rounded-full
                        flex
                        items-center
                        justify-center
                        text-2xl
                        font-bold
                        transition
                        ${
                          index <= currentStepIndex
                            ? "bg-orange-500 text-white"
                            : "bg-stone-200 text-stone-400"
                        }
                      `}
                    >
                      {step.icon}
                    </div>

                    <p
                      className={`
                        text-xs
                        font-medium
                        text-center
                        mt-2
                        max-w-20
                        ${
                          index <= currentStepIndex
                            ? "text-stone-900"
                            : "text-stone-400"
                        }
                      `}
                    >
                      {step.label}
                    </p>

                    <p className="text-xs text-stone-400 mt-1">
                      {index === 0 &&
                        new Date(
                          order.createdAt
                        ).toLocaleDateString("es-AR")}
                      {index === 1 &&
                        order.status !== "PENDING_PAYMENT"
                        ? new Date(
                            new Date(
                              order.createdAt
                            ).getTime() +
                              1 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString("es-AR")
                        : "-"}
                      {index === 2 &&
                        order.status === "READY"
                          ? new Date(
                              new Date(
                                order.createdAt
                              ).getTime() +
                                2 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString("es-AR")
                          : order.status === "ON_THE_WAY" ||
                            order.status === "DELIVERED"
                          ? new Date(
                              new Date(
                                order.createdAt
                              ).getTime() +
                                2 * 24 * 60 * 60 * 1000
                              )
                              .toLocaleDateString("es-AR")
                          : "-"}
                      {index === 3 &&
                        (order.status === "ON_THE_WAY" ||
                          order.status ===
                            "DELIVERED")
                          ? new Date(
                              new Date(
                                order.createdAt
                              ).getTime() +
                                3 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString("es-AR")
                          : "-"}
                    </p>
                  </div>
                ))}
              </div>

              {/* CONNECTING LINE */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-stone-200 -z-10">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{
                    width: `${
                      currentStepIndex >= 0
                        ? (currentStepIndex / (statusSteps.length - 1)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* MESSAGE */}
            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900">
                {order.status === "PENDING_PAYMENT"
                  ? "Tu pedido ha sido recibido. Esperamos tu confirmación de pago."
                  : order.status === "CONFIRMED"
                  ? "Tu pedido ha sido confirmado. Se está preparando para envío."
                  : order.status === "READY"
                  ? "Tu pedido está listo. Próximamente será enviado."
                  : order.status === "ON_THE_WAY"
                  ? "Tu pedido está en camino. Nuestro repartidor tiene tu pedido y está en ruta hacia tu dirección."
                  : order.status === "DELIVERED"
                  ? "¡Tu pedido ha sido entregado! Esperamos que disfrutes tu compra."
                  : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              ❌ Pedido Cancelado
            </h2>

            <p className="text-red-700">
              Este pedido ha sido cancelado. Si tienes dudas, por favor contacta a nuestro equipo de soporte.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ORDER DETAILS */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">
              Detalles del pedido
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">
                  ID del pedido:
                </span>

                <span className="font-medium text-stone-900">
                  {order.id.slice(0, 16)}...
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-stone-600">
                  Tienda:
                </span>

                <span className="font-medium text-stone-900">
                  {order.storeName ||
                    `Tienda ${order.storeId.slice(0, 8)}`}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-stone-600">
                  Items:
                </span>

                <span className="font-medium text-stone-900">
                  {order.items?.length ?? 0}
                </span>
              </div>

              <hr className="border-stone-200 my-2" />

              <div className="flex justify-between text-sm">
                <span className="text-stone-600">
                  Subtotal:
                </span>

                <span className="font-medium text-stone-900">
                  ${(order.totalAmount * 0.85).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-stone-600">
                  Envío:
                </span>

                <span className="font-medium text-stone-900">
                  Gratis
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-stone-600">
                  Total:
                </span>

                <span className="font-bold text-orange-600 text-base">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* DELIVERY INFO */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">
              Información de entrega
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-stone-600 mb-1">
                  Dirección de entrega
                </p>

                <p className="text-sm font-medium text-stone-900">
                  {order.deliveryAddress}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200">
                <p className="text-sm text-stone-600 mb-2">
                  Repartidor
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    👤
                  </div>

                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      Por confirmar
                    </p>

                    <p className="text-xs text-stone-500">
                      Se te notificará cuando salga a ruta
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200">
                <p className="text-sm text-stone-600 mb-2">
                  Contacto
                </p>

                <p className="text-sm font-medium text-stone-900">
                  📞 +54 (0) 291 1234
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SUPPORT BUTTON */}
        <div className="mt-8 flex justify-center">
          <button
            className="
              px-6
              py-3
              border
              border-orange-500
              text-orange-600
              font-medium
              rounded-lg
              hover:bg-orange-50
              transition
            "
          >
            ☎️ Contactar a soporte
          </button>
        </div>
      </div>
    </div>
  );
}
