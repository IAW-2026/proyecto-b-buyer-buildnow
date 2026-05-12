import { apiClient } from "./baseClient";
import sellerAppMock from "../../mockData/sellerApp.json";

export const SELLER_API_URL = process.env.NEXT_PUBLIC_SELLER_API_URL!;

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

function resolveStoreProducts(storeId: string) {
  const productIds = sellerApp.productsByStore[storeId] ?? [];

  return productIds
    .map((id) => sellerApp.products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}

function resolveProductsByCategory(categoryId: string) {
  const productIds = sellerApp.productsByCategory[categoryId] ?? [];

  return productIds
    .map((id) => sellerApp.products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}

export async function getStores() {
  if (useMock) {
    return sellerApp.stores;
  }

  return apiClient("/api/stores", {
    method: "GET",
    serviceUrl: SELLER_API_URL,
  }) as Promise<Store[]>;
}

export async function getStoreProducts(storeId: string) {
  if (useMock) {
    return resolveStoreProducts(storeId);
  }

  return apiClient(`/api/stores/${encodeURIComponent(storeId)}/products`, {
    method: "GET",
    serviceUrl: SELLER_API_URL,
  }) as Promise<Product[]>;
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

export async function getProduct(productId: string) {
  if (useMock) {
    const product = sellerApp.products.find((item) => item.id === productId);

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    return product;
  }

  return apiClient(`/api/products/${encodeURIComponent(productId)}`, {
    method: "GET",
    serviceUrl: SELLER_API_URL,
  }) as Promise<Product>;
}

export async function getProductsByCategory(categoryId: string) {
  if (useMock) {
    return resolveProductsByCategory(categoryId);
  }

  return apiClient(`/api/products?categoryId=${encodeURIComponent(categoryId)}`, {
    method: "GET",
    serviceUrl: SELLER_API_URL,
  }) as Promise<Product[]>;
}
