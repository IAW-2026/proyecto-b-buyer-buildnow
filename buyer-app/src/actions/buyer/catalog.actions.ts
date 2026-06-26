"use server";

import {
  getAllStores,
  getCatalogCategories,
  getProductDetails,
  getProductsByCategoryService,
  getStoreProductsService,
  getStoreProductsWithCartQuantity,
  getStoresPage,
  getStoresPageResponse,
  searchProductsService,
} from "@/server/services/catalog.service";
import { requireBuyer } from "@/lib/auth/requireBuyer";

export async function fetchStoresAction(params?: {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  try {
    if (params) {
      return await getStoresPage(params);
    }

    return await getAllStores();
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw new Error("FAILED_TO_FETCH_STORES");
  }
}

export async function fetchStoresPageAction(params: {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  try {
    return await getStoresPageResponse(params);
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw new Error("FAILED_TO_FETCH_STORES");
  }
}

export async function fetchCategoriesAction() {
  try {
    return await getCatalogCategories();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("FAILED_TO_FETCH_CATEGORIES");
  }
}

export async function fetchStoreProductsAction(
  storeId: string
) {
  try {
    return await getStoreProductsService(storeId);
  } catch (error) {
    console.error(
      `Error fetching products for store ${storeId}:`,
      error
    );
    throw new Error("FAILED_TO_FETCH_STORE_PRODUCTS");
  }
}

export async function fetchStoreProductsWithCartQuantityAction(
  storeId: string
) {
  try {
    const { userId } = await requireBuyer();

    return await getStoreProductsWithCartQuantity(
      userId,
      storeId
    );
  } catch (error) {
    console.error(
      `Error fetching products for store ${storeId}:`,
      error
    );
    throw new Error("FAILED_TO_FETCH_STORE_PRODUCTS");
  }
}

export async function fetchProductDetailsAction(
  productId: string
) {
  try {
    return await getProductDetails(productId);
  } catch (error) {
    console.error(
      `Error fetching product ${productId}:`,
      error
    );
    throw new Error("FAILED_TO_FETCH_PRODUCT_DETAILS");
  }
}

export async function fetchProductsByCategoryAction(
  categoryId: string
) {
  try {
    return await getProductsByCategoryService(categoryId);
  } catch (error) {
    console.error(
      `Error fetching products for category ${categoryId}:`,
      error
    );
    throw new Error(
      "FAILED_TO_FETCH_PRODUCTS_BY_CATEGORY"
    );
  }
}

export async function fetchCategoryProductsAction(
  categoryId: string,
  params?: {
    pageNumber?: number;
    pageSize?: number;
  }
) {
  try {
    await requireBuyer();
    return await searchProductsService({
      categoryId,
      search: "",
      pageNumber: params?.pageNumber,
      pageSize: params?.pageSize,
    });
  } catch (error) {
    console.error(
      `Error fetching products for category ${categoryId}:`,
      error
    );
    throw new Error(
      "FAILED_TO_FETCH_PRODUCTS_BY_CATEGORY"
    );
  }
}

export async function searchProductsAction(params: {
  search: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  try {
    await requireBuyer();

    return await searchProductsService(params);
  } catch (error) {
    console.error(
      `Error searching products for "${params.search}":`,
      error
    );
    throw new Error("FAILED_TO_SEARCH_PRODUCTS");
  }
}
