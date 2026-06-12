import "server-only";

import { apiClient } from "@/server/integrations/baseClient";
import sellerAppMock from "@/server/mockSeller/sellerApp.json";
import { SELLER_API_URL, useSellerMock } from "./seller.config";
import type {
  Category,
  Product,
  ProductsSearchResponse,
  Store,
  StoresSearchResponse,
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
): StoresSearchResponse {
  const safePageSize = Math.max(1, pageSize);
  const total = stores.length;
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
    data: stores.slice(start, start + safePageSize),
  };
}

export async function getStoresPage(
  params: StoresQuery = {}
): Promise<StoresSearchResponse> {
  const {
    search = "",
    pageNumber = 1,
    pageSize = 4,
  } = params;

  if (useSellerMock) {
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

  query.set("search", search.trim());
  query.set("pageNumber", String(pageNumber));
  query.set("pageSize", String(pageSize));

  return apiClient(`/api/stores?${query.toString()}`, {
    method: "GET",
    serviceUrl: SELLER_API_URL,
  }) as Promise<StoresSearchResponse>;
}

export async function getStores(): Promise<Store[]> {
  const firstPage = await getStoresPage({
    pageNumber: 1,
    pageSize: 100,
  });

  if (firstPage.totalPages <= 1) {
    return firstPage.data;
  }

  const remainingPages = await Promise.all(
    Array.from(
      { length: firstPage.totalPages - 1 },
      (_, index) =>
        getStoresPage({
          pageNumber: index + 2,
          pageSize: firstPage.pageSize,
        })
    )
  );

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((page) => page.data),
  ];
}

export async function getStoreProducts(
  storeId: string
) {
  if (useSellerMock) {
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
  if (useSellerMock) {
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
  if (useSellerMock) {
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

  console.log("aaaaa")
  const response = await apiClient(
    `/api/products/${encodeURIComponent(productId)}`,
    {
      method: "GET",
      serviceUrl: SELLER_API_URL,
    }
  );
  
  const product: Product = response.data ?? response;

  console.log("Product details response:", product);
  return product;
}

export async function getProduct(
  productId: string
) {
  return getProductDetails(productId);
}

export async function getProductsByCategory(
  categoryId: string
) {
  if (useSellerMock) {
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

  if (useSellerMock) {
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
