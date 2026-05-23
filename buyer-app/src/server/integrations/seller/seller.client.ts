import "server-only";

import { apiClient } from "@/lib/apiClients/baseClient";
import sellerAppMock from "@/mockData/sellerApp.json";
import {
  orderService,
  setSellerApiDependencies,
  type CreateOrderDto,
  type UpdateOrderStatusDto,
  type OrderResponseDto,
  type BuyerOrderDto,
} from "@/server/mockSeller";
import type {
  Category,
  Product,
  ProductsSearchResponse,
  Store,
  StoresQuery,
} from "./seller.types";

export const SELLER_API_URL =
  process.env.NEXT_PUBLIC_SELLER_API_URL!;

export type {
  Category,
  Product,
  ProductsSearchResponse,
  Store,
  StoresQuery,
} from "./seller.types";

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

function getPaginatedProducts(
  products: Product[],
  pageNumber: number,
  pageSize: number
): ProductsSearchResponse {
  const safePageSize = Math.max(1, pageSize);
  const total = products.length;
  const totalPages = Math.max(
    1,
    Math.ceil(total / safePageSize)
  );
  const safePageNumber = Math.min(
    Math.max(1, pageNumber),
    totalPages
  );
  const start = (safePageNumber - 1) * safePageSize;

  return {
    total,
    page: safePageNumber,
    pageSize: safePageSize,
    totalPages,
    data: products.slice(start, start + safePageSize),
  };
}

function getPaginatedStores(
  stores: Store[],
  pageNumber: number,
  pageSize: number
) {
  const safePageSize = Math.max(1, pageSize);
  const safePageNumber = Math.max(1, pageNumber);
  const start = (safePageNumber - 1) * safePageSize;

  return stores.slice(start, start + safePageSize);
}

// Inicializar dependencias del orderService
setSellerApiDependencies({
  getProductDetails,
  getStores,
});

// ================================
// CATALOG - Mock from sellerApp.json
// ================================

export async function getStores(
  params?: StoresQuery
) {
  if (useMock) {
    if (!params) {
      return sellerApp.stores;
    }

    const {
      search = "",
      pageNumber = 1,
      pageSize = 4,
    } = params;

    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase();

    const filteredStores = sellerApp.stores.filter((store) =>
      normalizedSearch
        ? store.name
            .toLocaleLowerCase()
            .includes(normalizedSearch)
        : true
    );

    return getPaginatedStores(
      filteredStores,
      pageNumber,
      pageSize
    );
  }

  const query = new URLSearchParams();

  query.set("search", params?.search?.trim() ?? "");
  query.set(
    "pageNumber",
    String(params?.pageNumber ?? 1)
  );
  query.set("pageSize", String(params?.pageSize ?? 4));

  return apiClient(`/api/stores?${query.toString()}`, {
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

export async function getProducts(params: {
  categoryId?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ProductsSearchResponse> {
  const {
    categoryId,
    search = "",
    pageNumber = 1,
    pageSize = 9,
  } = params;

  if (useMock) {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase();

    const products = sellerApp.products
      .filter((product) =>
        categoryId
          ? product.categoryId === categoryId
          : true
      )
      .filter((product) =>
        normalizedSearch
          ? product.name
              .toLocaleLowerCase()
              .includes(normalizedSearch)
          : true
      )
      .sort((left, right) => {
        const availability =
          Number(!left.available) -
          Number(!right.available);

        if (availability !== 0) {
          return availability;
        }

        return left.name.localeCompare(right.name);
      });

    return getPaginatedProducts(
      products,
      pageNumber,
      pageSize
    );
  }

  const query = new URLSearchParams();

  if (categoryId) {
    query.set("categoryId", categoryId);
  }

  if (search.trim()) {
    query.set("search", search.trim());
  }

  query.set("pageNumber", String(pageNumber));
  query.set("pageSize", String(pageSize));

  return apiClient(`/api/products?${query.toString()}`, {
    method: "GET",
    serviceUrl: SELLER_API_URL,
  }) as Promise<ProductsSearchResponse>;
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
