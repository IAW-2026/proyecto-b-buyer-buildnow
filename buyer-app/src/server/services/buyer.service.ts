import { serializeDecimal } from "@/lib/utils/serializeDecimal";

import {
  createBuyer,
  decrementCartItem,
  findBuyerByClerkId,
  getCartItem,
  deleteCartItem,
  createCartItem,
  incrementCartItem,
  getCartByBuyerId,
  createCart,
  getCartItems,
  getCartItemsDetailed,
  findCartItemFromDifferentStore,
  updateBuyer,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressesByBuyerId,
} from "../repositories/buyer.repository";

import {
  getStores,
  getStoreProducts,
  getCategories,
  getProduct,
  getProductsByCategory,
  type Store,
  type Product,
  type Category,
} from "@/lib/apiClients/sellerApi";

// ==============================
// BUYER
// ==============================

export async function registerBuyer(data: {
  clerkId: string;
  name: string;
  email: string;
  phone?: string;

  address: {
    street: string;
    city: string;
    notes?: string;
  };
}) {
  const existingBuyer = await findBuyerByClerkId(
    data.clerkId
  );

  if (existingBuyer) {
    throw new Error("BUYER_ALREADY_EXISTS");
  }

  return createBuyer(data);
}

export async function findCurrentBuyer(
  clerkId: string
) {
  return findBuyerByClerkId(clerkId);
}

export async function getCurrentBuyer(
  clerkId: string
) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  return buyer;
}

// ==============================
// CATALOG
// ==============================

export async function getAllStores(): Promise<
  Store[]
> {
  return getStores();
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

// ==============================
// CART
// ==============================

async function getOrCreateCart(clerkId: string) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  const existingCart = await getCartByBuyerId(
    buyer.id
  );

  if (existingCart) {
    return existingCart;
  }

  return createCart(buyer.id);
}

export async function addProductToCart(
  clerkId: string,
  productId: string
) {
  const cart = await getOrCreateCart(clerkId);

  const existingItem = await getCartItem(
    cart.id,
    productId
  );

  if (existingItem) {
    return serializeDecimal(
      await incrementCartItem(existingItem.id)
    );
  }

  const product = await getProduct(productId);

  const sameStore = await checkSameStore(
    cart.id,
    product.storeId
  );

  if (!sameStore) {
    throw new Error("DIFFERENT_STORE_CART");
  }

  const newCartItem = await createCartItem({
    cartId: cart.id,
    productId: product.id,
    storeId: product.storeId,
    quantity: 1,
    price: product.price,
  });

  return serializeDecimal(newCartItem);
}

export async function checkSameStore(
  cartId: string,
  storeId: string
) {
  const differentStoreItem =
    await findCartItemFromDifferentStore(
      cartId,
      storeId
    );

  return !differentStoreItem;
}

export async function decreaseProductQuantity(
  clerkId: string,
  productId: string
) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  const cart =
    (await getCartByBuyerId(buyer.id)) ??
    (await createCart(buyer.id));

  const existingItem = await getCartItem(
    cart.id,
    productId
  );

  if (!existingItem) {
    throw new Error("CART_ITEM_NOT_FOUND");
  }

  if (existingItem.quantity <= 1) {
    return serializeDecimal(
      await deleteCartItem(existingItem.id)
    );
  }

  return serializeDecimal(
    await decrementCartItem(existingItem.id)
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

// ==============================
// CART DETAILS
// ==============================

export async function getCartItemsWithProductDetails(
  clerkId: string
) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  const cart =
    (await getCartByBuyerId(buyer.id)) ??
    (await createCart(buyer.id));

  const cartItems = await getCartItemsDetailed(
    cart.id
  );

  const itemsWithDetails = await Promise.all(
    cartItems.map(async (item) => {
      try {
        const product = await getProduct(
          item.productId
        );

        return {
          cartItemId: item.id,
          productId: item.productId,
          storeId: item.storeId,
          quantity: item.quantity,
          price: item.price,
          product,
        };
      } catch (error) {
        console.error(
          `Failed to fetch product ${item.productId}:`,
          error
        );

        return null;
      }
    })
  );

  const filtered = itemsWithDetails.filter(
    (item): item is Exclude<typeof item, null> =>
      item !== null
  );

  return serializeDecimal(filtered);
}

// ==============================
// PROFILE MANAGEMENT
// ==============================

export async function updateBuyerProfile(
  clerkId: string,
  data: {
    name?: string;
    phone?: string;
  }
) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  return updateBuyer(buyer.id, data);
}

// ==============================
// ADDRESS MANAGEMENT
// ==============================

export async function addAddress(
  clerkId: string,
  data: {
    street: string;
    city: string;
    notes?: string;
  }
) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  return createAddress({
    buyerId: buyer.id,
    ...data,
  });
}

export async function editAddress(
  clerkId: string,
  addressId: string,
  data: {
    street?: string;
    city?: string;
    notes?: string;
  }
) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  const address = await getAddressesByBuyerId(buyer.id);
  const addressExists = address.some(
    (addr) => addr.id === addressId
  );

  if (!addressExists) {
    throw new Error("ADDRESS_NOT_FOUND");
  }

  return updateAddress(addressId, data);
}

export async function removeAddress(
  clerkId: string,
  addressId: string
) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  const address = await getAddressesByBuyerId(buyer.id);
  const addressExists = address.some(
    (addr) => addr.id === addressId
  );

  if (!addressExists) {
    throw new Error("ADDRESS_NOT_FOUND");
  }

  await deleteAddress(addressId);

  return { success: true };
}