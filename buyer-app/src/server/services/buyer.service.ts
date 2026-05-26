import { serializeDecimal } from "@/lib/utils/serializeDecimal";

import {
  createBuyer,
  decrementCartItem,
  findBuyerByEmail,
  findBuyerByClerkId,
  getCartItem,
  deleteCartItem,
  createCartItem,
  incrementCartItem,
  getCartByBuyerId,
  createCart,
  getCartItemsDetailed,
  findCartItemFromDifferentStore,
  updateBuyer,
  updateBuyerIdentity,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressesByBuyerId,
  clearCartByBuyerId,
  deleteBuyerCascade,
} from "../repositories/buyer.repository";
import { getProductDetails } from "@/server/services/catalog.service";

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
    return existingBuyer;
  }

  const existingBuyerByEmail = await findBuyerByEmail(
    data.email
  );

  if (existingBuyerByEmail) {
    const updatedBuyer = await updateBuyerIdentity(
      existingBuyerByEmail.id,
      {
        clerkId: data.clerkId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      }
    );

    if (updatedBuyer.addresses.length === 0) {
      await createAddress({
        buyerId: updatedBuyer.id,
        ...data.address,
      });
    }

    return findBuyerByClerkId(data.clerkId);
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

  const product = await getProductDetails(productId);

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
        const product = await getProductDetails(
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

/**
 * Limpia todos los items del carrito del comprador
 */
export async function clearBuyerCart(clerkId: string) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  return clearCartByBuyerId(buyer.id);
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

export async function deleteBuyerAccount(clerkId: string) {
  const buyer = await findBuyerByClerkId(clerkId);

  if (!buyer) {
    throw new Error("BUYER_NOT_FOUND");
  }

  await deleteBuyerCascade(buyer.id);

  return { success: true };
}
