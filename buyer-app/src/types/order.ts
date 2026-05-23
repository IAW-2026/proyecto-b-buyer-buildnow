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
  status:
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "READY"
    | "ON_THE_WAY"
    | "DELIVERED"
    | "CANCELLED";
  deliveryAddress: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus = Order["status"];
