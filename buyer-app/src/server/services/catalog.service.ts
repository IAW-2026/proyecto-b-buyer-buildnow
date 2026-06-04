import "server-only";

import {
  getCategories,
  getProduct,
  getProducts,
  getProductsByCategory,
  getStoreProducts,
  getStores,
  type Category,
  type Product,
  type ProductsSearchResponse,
  type Store,
} from "@/server/integrations/seller";
import {
  createCart,
  findBuyerByClerkId,
  getCartByBuyerId,
  getCartItems,
} from "../repositories/buyer.repository";

export async function getAllStores(): Promise<Store[]> {
  return getStores();
}

export async function getStoresPage(params: {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<Store[]> {
  return getStores(params);
}

export async function getStoresPageResponse(params: {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  const { search = "", pageNumber = 1 } = params;
  const pageSize = Math.max(1, params.pageSize ?? 4);
  const normalizedSearch = search
    .trim()
    .toLocaleLowerCase();
  const allStores = await getStores();
  const filteredStores = allStores.filter((store) =>
    normalizedSearch
      ? store.name
          .toLocaleLowerCase()
          .includes(normalizedSearch)
      : true
  );
  const total = filteredStores.length;
  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );
  const safePage = Math.min(
    Math.max(1, pageNumber),
    totalPages
  );
  const data = await getStores({
    search,
    pageNumber: safePage,
    pageSize,
  });

  return {
    total,
    page: safePage,
    pageSize,
    totalPages,
    data,
  };
}

export async function getCatalogCategories(): Promise<
  Category[]
> {
  return getCategories();
}

export async function getStoreProductsService(
  storeId: string
): Promise<Product[]> {
  return getStoreProducts(storeId);
}

export async function getAvailableStoreProductsService(
  storeId: string
): Promise<Product[]> {
  const products = await getStoreProducts(storeId);

  return products.filter(
    (product) => product.available && product.stock > 0
  );
}

export async function getProductDetails(
  productId: string
): Promise<Product> {
  return getProduct(productId);
}

export async function getProductsByCategoryService(
  categoryId: string
): Promise<Product[]> {
  return getProductsByCategory(categoryId);
}

export async function searchProductsService(params: {
  categoryId?: string;
  search: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ProductsSearchResponse> {
  return getProducts(params);
}

async function getOrCreateCart(clerkId: string) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  return (
    (await getCartByBuyerId(buyer.id)) ??
    (await createCart(buyer.id))
  );
}

export async function getStoreProductsWithCartQuantity(
  clerkId: string,
  storeId: string
) {
  const products = await getStoreProducts(storeId);
  const cart = await getOrCreateCart(clerkId);
  const cartItems = await getCartItems(cart.id);

  return products.map((product) => {
    const cartItem = cartItems.find(
      (item) => item.productId === product.id
    );

    return {
      ...product,
      quantity: cartItem?.quantity ?? 0,
    };
  });
}
