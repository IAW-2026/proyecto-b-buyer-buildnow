"use client";

import Link from "next/link";
import type { OrderResponseDto } from "@/server/mockSeller";
import type { DeliveryTracking } from "@/server/integrations/delivery/delivery.types";

const statusSteps = [
  {
    key: "PENDING_PAYMENT",
    label: "Pedido recibido",
  },
  {
    key: "CONFIRMED",
    label: "Confirmado",
  },
  {
    key: "READY",
    label: "Listo",
  },
  {
    key: "ON_THE_WAY",
    label: "En camino",
  },
  {
    key: "DELIVERED",
    label: "Entregado",
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

const statusMessages: Record<string, string> = {
  PENDING_PAYMENT:
    "Tu pedido fue recibido. Esperamos la confirmación del pago.",
  CONFIRMED:
    "Tu pedido fue confirmado y está siendo preparado.",
  READY:
    "Tu pedido está listo y será despachado próximamente.",
  ON_THE_WAY:
    "Tu pedido está en camino hacia tu dirección.",
  DELIVERED:
    "Tu pedido fue entregado.",
};

interface OrderTrackingClientProps {
  order: OrderResponseDto;
  deliveryTracking: DeliveryTracking | null;
  productDetailsById: Record<
    string,
    {
      name: string;
      weight: number;
    }
  >;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

function formatDate(value: string | Date) {
  const date = getArgentinaDateParts(value);

  return `${date.day}/${date.month}/${date.year}`;
}

function formatDateTime(value: string | Date) {
  const date = getArgentinaDateParts(value);

  return `${date.day}/${date.month}/${date.year}, ${date.hour}:${date.minute}`;
}

function formatWeight(value: number) {
  return `${Number(value.toFixed(2))} g`;
}

function getArgentinaDateParts(value: string | Date) {
  const date = new Date(value);
  const argentinaOffsetMs = 3 * 60 * 60 * 1000;
  const argentinaDate = new Date(
    date.getTime() - argentinaOffsetMs
  );
  const pad = (part: number) =>
    String(part).padStart(2, "0");

  return {
    day: pad(argentinaDate.getUTCDate()),
    month: pad(argentinaDate.getUTCMonth() + 1),
    year: String(argentinaDate.getUTCFullYear()),
    hour: pad(argentinaDate.getUTCHours()),
    minute: pad(argentinaDate.getUTCMinutes()),
  };
}

function getStepDate(
  order: OrderResponseDto,
  stepIndex: number,
  currentStepIndex: number
) {
  if (stepIndex > currentStepIndex) {
    return "-";
  }

  const createdAt = new Date(order.createdAt);
  const date = new Date(
    createdAt.getTime() + stepIndex * 24 * 60 * 60 * 1000
  );

  return formatDate(date);
}

export default function OrderTrackingClient({
  order,
  deliveryTracking,
  productDetailsById,
}: OrderTrackingClientProps) {
  const currentStepIndex =
    statusIndex[order.status] ?? -1;
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-[#FFF4E8] p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-2 inline-block text-sm text-[#ED6F00] hover:text-[#823A00]"
            >
              Volver al dashboard
            </Link>

            <h1 className="text-3xl font-bold text-[#823A00]">
              Seguimiento del pedido
            </h1>

            <p className="mt-2 text-stone-500">
              Pedido #{order.id.slice(0, 12)}...
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-2xl font-bold text-[#ED6F00]">
              {formatMoney(order.totalAmount)}
            </p>

            <p className="text-sm text-stone-500">
              Realizado: {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {!isCancelled ? (
          <div className="mb-8 rounded-2xl border border-[#823A00] bg-white p-8 shadow-[0_8px_24px_rgba(130,58,0,0.08)]">
            <h2 className="mb-8 text-lg font-semibold text-[#823A00]">
              Estado del pedido
            </h2>

            <div className="relative">
              <div className="relative z-10 grid grid-cols-5 gap-2">
                {statusSteps.map((step, index) => (
                  <div
                    key={step.key}
                    className="flex min-w-0 flex-col items-center text-center"
                  >
                    <div
                      className={
                        index <= currentStepIndex
                          ? "flex h-12 w-12 items-center justify-center rounded-full bg-[#ED6F00] text-sm font-bold text-white"
                          : "flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 text-sm font-bold text-stone-400"
                      }
                    >
                      {index + 1}
                    </div>

                    <p
                      className={
                        index <= currentStepIndex
                          ? "mt-2 min-h-8 text-xs font-medium text-stone-900"
                          : "mt-2 min-h-8 text-xs font-medium text-stone-400"
                      }
                    >
                      {step.label}
                    </p>

                    <p className="mt-1 min-h-5 text-xs text-stone-400">
                      {getStepDate(
                        order,
                        index,
                        currentStepIndex
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="absolute left-0 right-0 top-6 h-1 bg-stone-200">
                <div
                  className="h-full bg-[#ED6F00] transition-all"
                  style={{
                    width: `${
                      currentStepIndex >= 0
                        ? (currentStepIndex /
                            (statusSteps.length - 1)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-[#A76E04] bg-[#FFF4E8] p-4">
              <p className="text-sm text-[#823A00]">
                {statusMessages[order.status] ?? ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-8">
            <h2 className="mb-2 text-lg font-semibold text-red-900">
              Pedido cancelado
            </h2>
            <p className="text-red-700">
              Este pedido fue cancelado.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-[#823A00] bg-white p-6 shadow-[0_8px_24px_rgba(130,58,0,0.08)]">
            <h3 className="mb-4 text-lg font-semibold text-[#823A00]">
              Detalles del pedido
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-stone-600">
                  ID del pedido:
                </span>
                <span className="font-medium text-stone-900">
                  {order.id.slice(0, 16)}...
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-stone-600">
                  Tienda:
                </span>
                <span className="font-medium text-stone-900">
                  {order.storeName ||
                    `Tienda ${order.storeId.slice(0, 8)}`}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-stone-600">
                  Items:
                </span>
                <span className="font-medium text-stone-900">
                  {order.items?.length ?? 0}
                </span>
              </div>

              <div className="border-t border-[#A76E04] pt-4">
                <div className="max-h-48 space-y-3 overflow-y-auto pr-2">
                  {order.items.map((item) => {
                    const productDetail =
                      productDetailsById[item.productId];
                    const productName =
                      productDetail?.name ?? item.productName;
                    const unitWeight =
                      productDetail?.weight ?? 0;
                    const itemWeight =
                      unitWeight * item.quantity;
                    const itemTotal =
                      item.price * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#F8C58D] bg-[#FFF4E8] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#823A00]">
                              {productName}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              Cantidad: {item.quantity} · Peso:{" "}
                              {formatWeight(itemWeight)}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-bold text-[#ED6F00]">
                            {formatMoney(itemTotal)}
                          </p>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-stone-600">
                          <span>
                            Precio unitario:{" "}
                            <strong className="font-semibold text-stone-900">
                              {formatMoney(item.price)}
                            </strong>
                          </span>
                          <span className="text-right">
                            Peso unitario:{" "}
                            <strong className="font-semibold text-stone-900">
                              {unitWeight
                                ? formatWeight(unitWeight)
                                : "No disponible"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="my-2 border-[#A76E04]" />

              <div className="flex justify-between gap-4 text-sm">
                <span className="font-semibold text-[#823A00]">
                  Peso total:
                </span>
                <span className="font-semibold text-stone-900">
                  {formatWeight(order.totalWeight)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="font-semibold text-[#823A00]">
                  Precio total:
                </span>
                <span className="text-base font-bold text-[#ED6F00]">
                  {formatMoney(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#823A00] bg-white p-6 shadow-[0_8px_24px_rgba(130,58,0,0.08)]">
            <h3 className="mb-4 text-lg font-semibold text-[#823A00]">
              Información de entrega
            </h3>

            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm text-stone-600">
                  Dirección de entrega
                </p>
                <p className="text-sm font-medium text-stone-900">
                  {order.deliveryAddress}
                </p>
              </div>

              <div className="border-t border-[#A76E04] pt-4">
                <p className="mb-2 text-sm text-stone-600">
                  Repartidor
                </p>
                <p className="text-sm font-medium text-stone-900">
                  {deliveryTracking?.curierName ??
                    "Se asignará cuando el pedido salga a ruta"}
                </p>
              </div>

              {deliveryTracking ? (
                <div className="border-t border-[#A76E04] pt-4">
                  <p className="mb-1 text-sm text-stone-600">
                    Llegada estimada
                  </p>
                  <p className="text-sm font-medium text-stone-900">
                    {formatDateTime(
                      deliveryTracking.estimatedArrival
                    )}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
