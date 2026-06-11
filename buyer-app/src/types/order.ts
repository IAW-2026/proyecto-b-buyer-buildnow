export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "READY"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED";

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  buyerId: string;
  storeId: string;
  deliveryAddress: string;
  items: CreateOrderItemDto[];
}

export interface UpdateOrderStatusDto {
  orderId: string;
  status: OrderStatus;
}

export interface OrderItemResponseDto {
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderResponseDto {
  orderId: string;
  id: string; // Added 'id' field to match the expected structure from the server response
  buyerId: string;
  storeId: string;
  storeName: string;
  precioTotal: number;
  pesoTotal: number;
  estadoDelPedido: OrderStatus;
  deliveryAddress: string;
  itemsOrders: OrderItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BuyerOrderDto {
  orderId: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}
