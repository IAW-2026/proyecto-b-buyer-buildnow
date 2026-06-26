import "server-only";

import { apiClient } from "../baseClient";
import { PAYMENT_API_URL } from "./payment.config";
import type { CreatePaymentDto, PaymentResponseDto } from "./payment.types";

export async function createPayment(
  data: CreatePaymentDto
): Promise<PaymentResponseDto> {
console.log("REQUEST BODY:", data);
  return apiClient("/api/payments", {
    method: "POST",
    serviceUrl: PAYMENT_API_URL,
    body: JSON.stringify(data),
  });
}

export async function getPayment(
  orderId: string
): Promise<PaymentResponseDto> {
  return apiClient(`/api/payments?orderId=${orderId}`, {
    method: "GET",
    serviceUrl: PAYMENT_API_URL,
  });
}
