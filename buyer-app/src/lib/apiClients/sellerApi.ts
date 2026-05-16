import { apiClient } from "./baseClient";
import sellerAppMock from "../../mockData/sellerApp.json";
import {
  orderService,
  setSellerApiDependencies,
  type CreateOrderDto,
  type UpdateOrderStatusDto,
  type OrderResponseDto,
  type BuyerOrderDto,
} from "@/lib/mockSeller";

export const SELLER_API_URL =
  process.env.NEXT_PUBLIC_SELLER_API_URL!;

export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  status: "OPEN" | "CLOSE";
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  img: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  price: number;
  stock: number;
  weight: number;
  available: boolean;
}

type SellerAppMock = {
  stores: Store[];
  categories: Category[];
  products: Product[];
  productsByStore: Record<string, string[]>;
  productsByCategory: Record<string, string[]>;
};

const sellerApp = sellerAppMock as SellerAppMock;
const useMock = !SELLER_API_URL;

// ================================
// Helper Functions
// ================================

function resolveStoreProducts(storeId: string) {
  const productIds =
    sellerApp.productsByStore[storeId] ?? [];

  return productIds
    .map((id) =>
      sellerApp.products.find(
        (product) => product.id === id
      )
    )
    .filter(
      (product): product is Product =>
        Boolean(product)
    );
}

function resolveProductsByCategory(categoryId: string) {
  const productIds =
    sellerApp.productsByCategory[categoryId] ?? [];

  return productIds
    .map((id) =>
      sellerApp.products.find(
        (product) => product.id === id
      )
    )
    .filter(
      (product): product is Product =>
        Boolean(product)
    );
}

// Inicializar dependencias del orderService
setSellerApiDependencies({
  getProductDetails,
  getStores,
});

// ================================
// CATALOG - Mock from sellerApp.json
// ================================

export async function getStores() {
  if (useMock) {
    return sellerApp.stores;
  }

  return apiClient("/api/stores", {
    method: "GET",
    serviceUrl: SELLER_API_URL,
  }) as Promise<Store[]>;
}

export async function getStoreProducts(
  storeId: string
) {
  if (useMock) {
    return resolveStoreProducts(storeId);
  }

  return apiClient(
    `/api/stores/${encodeURIComponent(storeId)}/products`,
    {
      method: "GET",
      serviceUrl: SELLER_API_URL,
    }
  ) as Promise<Product[]>;
}

export async function getCategories() {
  if (useMock) {
    return sellerApp.categories;
  }

  return apiClient("/api/categories", {
    method: "GET",
    serviceUrl: SELLER_API_URL,
  }) as Promise<Category[]>;
}

export async function getProductDetails(
  productId: string
) {
  if (useMock) {
    const product = sellerApp.products.find(
      (item) => item.id === productId
    );

    if (!product) {
      throw new Error(
        `Product not found: ${productId}`
      );
    }

    return product;
  }

  return apiClient(
    `/api/products/${encodeURIComponent(productId)}`,
    {
      method: "GET",
      serviceUrl: SELLER_API_URL,
    }
  ) as Promise<Product>;
}

// Mantener compatibilidad con nombres antiguos
export async function getProduct(
  productId: string
) {
  return getProductDetails(productId);
}

export async function getProductsByCategory(
  categoryId: string
) {
  if (useMock) {
    return resolveProductsByCategory(categoryId);
  }

  return apiClient(
    `/api/products?categoryId=${encodeURIComponent(categoryId)}`,
    {
      method: "GET",
      serviceUrl: SELLER_API_URL,
    }
  ) as Promise<Product[]>;
}

// ================================
// ORDERS - Prisma Mock + Logic
// ================================

/**
 * Crea una nueva orden
 * Persiste en Prisma con productos del mock catalog
 */
export async function createOrder(
  dto: CreateOrderDto
): Promise<OrderResponseDto> {
  if (!useMock) {
    // En el futuro: llamar a API real
    return apiClient("/api/orders", {
      method: "POST",
      serviceUrl: SELLER_API_URL,
      body: JSON.stringify(dto),
    }) as Promise<OrderResponseDto>;
  }

  return orderService.createMockSellerOrder(dto);
}

/**
 * Obtiene una orden por ID
 */
export async function getOrderById(
  orderId: string
): Promise<OrderResponseDto> {
  if (!useMock) {
    // En el futuro: llamar a API real
    return apiClient(`/api/orders/${orderId}`, {
      method: "GET",
      serviceUrl: SELLER_API_URL,
    }) as Promise<OrderResponseDto>;
  }

  return orderService.getOrderById(orderId);
}

/**
 * Obtiene todas las órdenes de un comprador
 */
export async function getBuyerOrders(
  buyerId: string
): Promise<BuyerOrderDto[]> {
  if (!useMock) {
    // En el futuro: llamar a API real
    return apiClient("/api/orders", {
      method: "POST",
      serviceUrl: SELLER_API_URL,
      body: JSON.stringify({ buyerId }),
    }) as Promise<BuyerOrderDto[]>;
  }

  return orderService.getMockBuyerOrders(buyerId);
}

/**
 * Actualiza el estado de una orden
 * Útil para testing y visualización de tracking
 */
export async function updateOrderStatus(
  dto: UpdateOrderStatusDto
): Promise<OrderResponseDto> {
  if (!useMock) {
    // En el futuro: llamar a API real
    return apiClient(
      `/api/orders/${dto.orderId}/status`,
      {
        method: "PATCH",
        serviceUrl: SELLER_API_URL,
        body: JSON.stringify({ status: dto.status }),
      }
    ) as Promise<OrderResponseDto>;
  }

  return orderService.updateMockSellerOrderStatus(dto);
}
