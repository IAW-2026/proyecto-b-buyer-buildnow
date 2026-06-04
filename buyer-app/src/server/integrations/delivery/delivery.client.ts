import "server-only";

import { apiClient } from "@/server/integrations/baseClient";
import type { DeliveryTracking } from "./delivery.types";

const DELIVERY_API_URL =
  process.env.DELIVERY_API_URL ??
  process.env.NEXT_PUBLIC_DELIVERY_API_URL;

const MOCK_COURIERS = [
  "Marcos Pereyra",
  "Laura Sosa",
  "Daniel Ruiz",
  "Camila Torres",
];

function getMockCourier(orderId: string) {
  const index =
    orderId.split("").reduce((sum, char) => {
      return sum + char.charCodeAt(0);
    }, 0) % MOCK_COURIERS.length;

  return MOCK_COURIERS[index];
}

export async function getOrderTracking(
  orderId: string
): Promise<DeliveryTracking[]> {
  if (DELIVERY_API_URL) {
    return apiClient(
      `/api/orders/${encodeURIComponent(orderId)}/tracking`,
      {
        method: "GET",
        serviceUrl: DELIVERY_API_URL,
      }
    ) as Promise<DeliveryTracking[]>;
  }

  return [
    {
      orderId,
      status: "ON_THE_WAY",
      estimatedArrival: new Date(
        Date.now() + 45 * 60 * 1000
      ).toISOString(),
      curierName: getMockCourier(orderId),
    },
  ];
}
