"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchBuyerOrdersAction } from "@/actions/buyerActions";
import type { BuyerOrderDto } from "@/server/mockSeller";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  PENDING_PAYMENT: {
    label: "Pendiente de pago",
    color: "bg-yellow-100 text-yellow-800",
    icon: "⏳",
  },
  CONFIRMED: {
    label: "Confirmado",
    color: "bg-blue-100 text-blue-800",
    icon: "✅",
  },
  READY: {
    label: "Listo para retirar",
    color: "bg-purple-100 text-purple-800",
    icon: "📦",
  },
  ON_THE_WAY: {
    label: "En camino",
    color: "bg-purple-100 text-purple-800",
    icon: "🚚",
  },
  DELIVERED: {
    label: "Entregado",
    color: "bg-green-100 text-green-800",
    icon: "✓",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800",
    icon: "❌",
  },
};

interface OrdersDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrdersDropdown({
  isOpen,
  onClose,
}: OrdersDropdownProps) {
  const [orders, setOrders] = useState<BuyerOrderDto[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const loadOrders = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response =
          await fetchBuyerOrdersAction();

        if (
          response.success &&
          response.data &&
          Array.isArray(response.data)
        ) {
          setOrders(response.data);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isOpen]);

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}/tracking`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-40
        bg-black
        bg-opacity-50
      "
      onClick={onClose}
    >
      <div
        className="
          absolute
          right-4
          top-20
          w-96
          max-h-96
          bg-white
          border
          border-stone-200
          rounded-xl
          shadow-xl
          overflow-hidden
          flex
          flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-orange-50 px-4 py-3 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900">
            📦 Mis Pedidos
          </h3>

          <p className="text-xs text-stone-500">
            Haz clic en un pedido para ver el
            seguimiento
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div
                  className="
                    inline-block
                    h-8
                    w-8
                    animate-spin
                    rounded-full
                    border-4
                    border-stone-300
                    border-t-orange-500
                  "
                />

                <p className="mt-2 text-sm text-stone-500">
                  Cargando pedidos...
                </p>
              </div>
            </div>
          )}

          {!isLoading && hasError && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-sm text-red-600">
                  ⚠️ Error al cargar los
                  pedidos
                </p>
              </div>
            </div>
          )}

          {!isLoading &&
            !hasError &&
            orders.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-sm text-stone-500">
                    No tienes pedidos aún
                  </p>
                </div>
              </div>
            )}

          {!isLoading &&
            !hasError &&
            orders.length > 0 &&
            orders.map((order) => {
              const status =
                statusConfig[order.status];

              return (
                <div
                  key={order.id}
                  onClick={() =>
                    handleOrderClick(order.id)
                  }
                  className="
                    px-4
                    py-3
                    border-b
                    border-stone-100
                    hover:bg-orange-50
                    cursor-pointer
                    transition
                    last:border-b-0
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-stone-900 text-sm">
                          {order.storeName}
                        </span>

                        <span
                          className={`
                            text-xs
                            px-2
                            py-1
                            rounded-full
                            font-medium
                            ${status.color}
                          `}
                        >
                          {status.icon}{" "}
                          {status.label}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 mb-1">
                        ID:{" "}
                        {order.id.slice(0, 8)}
                        ...
                      </p>

                      <p className="text-sm font-medium text-orange-600">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-stone-400">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString("es-AR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* FOOTER */}
        {!isLoading &&
          !hasError &&
          orders.length > 0 && (
            <div className="border-t border-stone-200 px-4 py-2 bg-stone-50">
              <button
                onClick={onClose}
                className="
                  w-full
                  text-sm
                  text-stone-600
                  hover:text-stone-900
                  font-medium
                  transition
                "
              >
                Cerrar
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
