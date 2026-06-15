import "server-only";

import { apiClient } from "@/server/integrations/baseClient";
import type { DeliveryTracking } from "./delivery.types";

const DELIVERY_API_URL = process.env.NEXT_PUBLIC_DELIVERY_API_URL;

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

function stripDiacritics(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDeliveryQuoteAddress(
  address?: string
): string {
  const defaultStreet = "Brown 500";
  const defaultCity = "Bahia Blanca";
  const defaultProvince = "Buenos Aires";
  const defaultCountry = "Argentina";
  const fallbackAddress = `${defaultStreet}, ${defaultCity}, ${defaultProvince}, ${defaultCountry}`;

  if (!address?.trim()) {
    return fallbackAddress;
  }

  const normalized = address
    .trim()
    .split(",")
    .map((segment) => stripDiacritics(segment.trim()))
    .filter(Boolean);

  const [rawStreet, rawCity, rawProvince, rawCountry] = normalized;

  const street = rawStreet || defaultStreet;
  const city = rawCity || defaultCity;
  const province = rawProvince || defaultProvince;
  const country = rawCountry || defaultCountry;

  return [street, city, province, country].join(", ");
}

export type DeliveryQuoteResponse = {
  quote: {
    price: number;
    currency: string;
    estimatedTime: number;
  };
};

export async function getDeliveryQuote(
  storeAddress: string,
  deliveryAddress: string,
  orderId: string
): Promise<DeliveryQuoteResponse> {
  if (DELIVERY_API_URL) {
    const normalizedStoreAddress = normalizeDeliveryQuoteAddress(
      storeAddress
    );
    const normalizedDeliveryAddress = normalizeDeliveryQuoteAddress(
      deliveryAddress
    );

    console.log("Requesting delivery quote with params:", {
      storeAddress: normalizedStoreAddress,
      deliveryAddress: normalizedDeliveryAddress,
      orderId,
    });

    const params = new URLSearchParams({
      storeAddress: normalizedStoreAddress,
      deliveryAddress: normalizedDeliveryAddress,
      orderId,
    });

    console.log("delivery quote request URL:", `${DELIVERY_API_URL}/api/delivery/quote?${params.toString()}`);

    const response = (await apiClient(
      `/api/delivery/quote?${params.toString()}`,
      {
        method: "GET",
        serviceUrl: DELIVERY_API_URL,
      }
    )) as {
      amount?: number;
      currency?: string;
      durationMinutes?: number;
      quote?: {
        price?: number;
        currency?: string;
        estimatedTime?: number;
      };
    } | null;

    const price =
      typeof response?.amount === "number"
        ? response.amount
        : typeof response?.quote?.price === "number"
        ? response.quote.price
        : 0;

    const currency =
      typeof response?.currency === "string"
        ? response.currency
        : typeof response?.quote?.currency === "string"
        ? response.quote.currency
        : "ARS";

    const estimatedTime =
      typeof response?.durationMinutes === "number"
        ? response.durationMinutes
        : typeof response?.quote?.estimatedTime === "number"
        ? response.quote.estimatedTime
        : 0;

    return {
      quote: {
        price,
        currency,
        estimatedTime,
      },
    };
  }

  return {
    quote: {
      price: 1500,
      currency: "ARS",
      estimatedTime: 35,
    },
  };
}

