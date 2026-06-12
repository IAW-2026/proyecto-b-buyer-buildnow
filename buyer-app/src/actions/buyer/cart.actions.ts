"use server";

import {
  addProductToCart,
  clearBuyerCart,
  decreaseProductQuantity,
  getCartItemsWithProductDetails,
  setProductQuantity,
} from "@/server/services/buyer.service";
import {
  ForbiddenError,
  requireBuyer,
  UnauthorizedError,
} from "@/lib/auth/requireBuyer";
import type { ActionResponse } from "@/types/action-response";

export async function addToCartAction(
  productId: string
): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();

    await addProductToCart(userId, productId);

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError
    ) {
      return {
        success: false,
        error: error.message,
      };
    }

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
      error: "Ocurrió un error al agregar el producto",
    };
  }
}

export async function decreaseCartItemAction(
  productId: string
): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();

    await decreaseProductQuantity(userId, productId);

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError
    ) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(error);

    if (
      error instanceof Error &&
      error.message === "CART_ITEM_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "El producto no existe en el carrito",
      };
    }

    return {
      success: false,
      error: "Ocurrió un error al actualizar el carrito",
    };
  }
}

export async function setCartItemQuantityAction(
  productId: string,
  quantity: number
): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();

    await setProductQuantity(userId, productId, quantity);

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError
    ) {
      return {
        success: false,
        error: error.message,
      };
    }

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

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_STOCK"
    ) {
      return {
        success: false,
        error: "No hay stock suficiente para esa cantidad",
      };
    }

    return {
      success: false,
      error: "OcurriÃ³ un error al actualizar el carrito",
    };
  }
}

export async function fetchCartItemsAction() {
  try {
    const { userId } = await requireBuyer();
    const cartItems =
      await getCartItemsWithProductDetails(userId);

    return {
      success: true,
      data: cartItems,
    };
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError
    ) {
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }

    console.error("Error fetching cart items:", error);

    return {
      success: false,
      error: "Ocurrió un error al obtener el carrito",
      data: [],
    };
  }
}

export async function clearCartAction(): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();
    await clearBuyerCart(userId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error clearing cart:", error);

    return {
      success: false,
      error: "Ocurrió un error al limpiar el carrito",
    };
  }
}
