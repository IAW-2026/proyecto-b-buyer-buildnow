/**
 * DTOs y tipos para órdenes en Seller Mock
 * Define la interfaz pública que expone sellerApi
 */

// ========================
// Request DTOs
// ========================

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
  status:
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "READY"
    | "ON_THE_WAY"
    | "DELIVERED"
    | "CANCELLED";
}

// ========================
// Response DTOs
// ========================

export interface OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderResponseDto {
  id: string;
  buyerId: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  totalWeight: number;
  status:
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "READY"
    | "ON_THE_WAY"
    | "DELIVERED"
    | "CANCELLED";
  deliveryAddress: string;
  items: OrderItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BuyerOrderDto {
  id: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  status:
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "READY"
    | "ON_THE_WAY"
    | "DELIVERED"
    | "CANCELLED";
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}
