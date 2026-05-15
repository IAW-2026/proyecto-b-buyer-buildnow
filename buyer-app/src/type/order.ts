export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  storeId: string;
  storeName?: string;
  totalAmount: number;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  deliveryAddress: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus = Order["status"];
