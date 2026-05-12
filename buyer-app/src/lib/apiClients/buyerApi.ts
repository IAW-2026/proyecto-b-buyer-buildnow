//TODO: DECREPTED O REWORK DE ENDPOINTS QUE CONSUME A ENDPOINTS QUE PROVEE

import { apiClient } from "./baseClient";

const BUYER_API_URL = process.env.NEXT_PUBLIC_BUYER_API_URL!;

export interface CreateBuyerDto {
  name: string;
  phone: string;
}

export async function getCurrentBuyer() {
  return apiClient("/api/buyers/me", {
    method: "GET",
    serviceUrl: BUYER_API_URL,
  });
}

export async function createBuyer(
  data: CreateBuyerDto,
) {
  return apiClient("/api/buyers", {
    method: "POST",
    serviceUrl: BUYER_API_URL,
    body: JSON.stringify(data),
  });
}