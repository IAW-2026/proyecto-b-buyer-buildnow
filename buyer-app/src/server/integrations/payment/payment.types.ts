export type PaymentStatus = "APPROVED" | "REJECTED" | "PENDING";

export interface CreatePaymentDto {
  orderId: string;
  totalAmount: number;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  // urlReturn?: string; // Disabled for now
}

export interface PaymentResponseDto {
  success: boolean;
  data?: {
    payment?: Record<string, unknown>;
    initPoint?: string;
  };
  // Fallbacks for older structure if needed
  id?: string;
  orderId?: string;
  status?: PaymentStatus;
  createdAt?: string;
  checkoutUrl?: string;
  redirectUrl?: string;
  url?: string;
}
