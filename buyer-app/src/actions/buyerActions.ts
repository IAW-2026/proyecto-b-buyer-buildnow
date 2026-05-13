"use server";

import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";

import { redirect } from "next/navigation";

import {
  findCurrentBuyer,
  registerBuyer,
  getAllStores,
  getCatalogCategories,
  getStoreProductsService,
  getProductDetails,
  getProductsByCategoryService,
  addProductToCart,
  decreaseProductQuantity,
  getStoreProductsWithCartQuantity,
  getCartItemsWithProductDetails,
} from "@/server/services/buyer.service";

import { ActionResponse } from "@/type/action-response";

// ==============================
// BUYER
// ==============================

export async function createBuyerAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

    const existingBuyer =
      await findCurrentBuyer(userId);

    if (existingBuyer) {
      redirect("/dashboard");
    }

    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        error: "Usuario no encontrado",
      };
    }

    const name =
      formData.get("name")?.toString() || "";

    const phone =
      formData.get("phone")?.toString() || "";

    const street = formData.get(
      "street"
    ) as string;

    const city = formData.get("city") as string;

    const notes = formData.get("notes") as string;

    const email =
      user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return {
        success: false,
        error: "Email no encontrado",
      };
    }

    await registerBuyer({
      clerkId: userId,
      name,
      phone,
      email,

      address: {
        street,
        city,
        notes,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_ALREADY_EXISTS"
    ) {
      return {
        success: false,
        error: "El comprador ya existe",
      };
    }

    return {
      success: false,
      error:
        "Ocurrió un error al registrar el comprador",
    };
  }
}

// ==============================
// CATALOG
// ==============================

export async function fetchStoresAction() {
  try {
    return await getAllStores();
  } catch (error) {
    console.error(
      "Error fetching stores:",
      error
    );

    throw new Error("FAILED_TO_FETCH_STORES");
  }
}

export async function fetchCategoriesAction() {
  try {
    return await getCatalogCategories();
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error
    );

    throw new Error(
      "FAILED_TO_FETCH_CATEGORIES"
    );
  }
}

export async function fetchStoreProductsAction(
  storeId: string
) {
  try {
    return await getStoreProductsService(
      storeId
    );
  } catch (error) {
    console.error(
      `Error fetching products for store ${storeId}:`,
      error
    );

    throw new Error(
      "FAILED_TO_FETCH_STORE_PRODUCTS"
    );
  }
}

export async function fetchStoreProductsWithCartQuantityAction(
  storeId: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

    return await getStoreProductsWithCartQuantity(
      userId,
      storeId
    );
  } catch (error) {
    console.error(
      `Error fetching products for store ${storeId}:`,
      error
    );

    throw new Error(
      "FAILED_TO_FETCH_STORE_PRODUCTS"
    );
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

    throw new Error(
      "FAILED_TO_FETCH_PRODUCT_DETAILS"
    );
  }
}

export async function fetchProductsByCategoryAction(
  categoryId: string
) {
  try {
    return await getProductsByCategoryService(
      categoryId
    );
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

// ==============================
// CART
// ==============================

export async function addToCartAction(
  productId: string
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

    await addProductToCart(userId, productId);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "DIFFERENT_STORE_CART"
    ) {
      return {
        success: false,
        error:
          "No puedes agregar productos de distintas tiendas",
      };
    }

    return {
      success: false,
      error:
        "Ocurrió un error al agregar el producto",
    };
  }
}

export async function decreaseCartItemAction(
  productId: string
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

    await decreaseProductQuantity(
      userId,
      productId
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "CART_ITEM_NOT_FOUND"
    ) {
      return {
        success: false,
        error:
          "El producto no existe en el carrito",
      };
    }

    return {
      success: false,
      error:
        "Ocurrió un error al actualizar el carrito",
    };
  }
}

// ==============================
// CART DETAILS
// ==============================

export async function fetchCartItemsAction() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
        data: [],
      };
    }

    const cartItems =
      await getCartItemsWithProductDetails(
        userId
      );

    return {
      success: true,
      data: cartItems,
    };
  } catch (error) {
    console.error("Error fetching cart items:", error);

    return {
      success: false,
      error:
        "Ocurrió un error al obtener el carrito",
      data: [],
    };
  }
}

// ==============================
// CATEGORY PRODUCTS
// ==============================
export async function fetchCategoryProductsAction(
  categoryId: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

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