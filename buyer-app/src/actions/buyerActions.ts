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
  updateBuyerProfile,
  addAddress,
  editAddress,
  removeAddress,
  getCurrentBuyer,
  clearBuyerCart,
} from "@/server/services/buyer.service";

import { ActionResponse } from "@/type/action-response";
import * as sellerApi from "@/lib/apiClients/sellerApi";
import type { BuyerOrderDto, OrderResponseDto } from "@/lib/mockSeller";

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

// ==============================
// PROFILE MANAGEMENT
// ==============================

export async function getCurrentBuyerAction(): Promise<
  ActionResponse<Awaited<ReturnType<typeof getCurrentBuyer>>>
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

    const buyer = await getCurrentBuyer(userId);

    return {
      success: true,
      data: buyer,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    return {
      success: false,
      error: "Ocurrió un error al obtener los datos",
    };
  }
}

export async function updateBuyerProfileAction(
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

    const name = formData.get("name")?.toString();
    const phone = formData.get("phone")?.toString();

    const data: { name?: string; phone?: string } = {};

    if (name) data.name = name;
    if (phone) data.phone = phone;

    await updateBuyerProfile(userId, data);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    return {
      success: false,
      error:
        "Ocurrió un error al actualizar el perfil",
    };
  }
}

// ==============================
// ADDRESS MANAGEMENT
// ==============================

export async function addAddressAction(
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

    const street =
      formData.get("street")?.toString() || "";
    const city = formData.get("city")?.toString() || "";
    const notes = formData.get("notes")?.toString();

    if (!street || !city) {
      return {
        success: false,
        error: "La calle y la ciudad son requeridas",
      };
    }

    await addAddress(userId, {
      street,
      city,
      notes,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    return {
      success: false,
      error:
        "Ocurrió un error al agregar la dirección",
    };
  }
}

export async function editAddressAction(
  addressId: string,
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

    const street = formData.get("street")?.toString();
    const city = formData.get("city")?.toString();
    const notes = formData.get("notes")?.toString();

    const data: {
      street?: string;
      city?: string;
      notes?: string;
    } = {};

    if (street) data.street = street;
    if (city) data.city = city;
    if (notes) data.notes = notes;

    await editAddress(userId, addressId, data);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    if (
      error instanceof Error &&
      error.message === "ADDRESS_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Dirección no encontrada",
      };
    }

    return {
      success: false,
      error:
        "Ocurrió un error al editar la dirección",
    };
  }
}

export async function removeAddressAction(
  addressId: string
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

    await removeAddress(userId, addressId);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    if (
      error instanceof Error &&
      error.message === "ADDRESS_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Dirección no encontrada",
      };
    }

    return {
      success: false,
      error:
        "Ocurrió un error al eliminar la dirección",
    };
  }
}

// ==============================
// ORDERS
// ==============================

export async function fetchBuyerOrdersAction(): Promise<
  ActionResponse<BuyerOrderDto[]>
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
        data: [],
      };
    }

    const buyer = await findCurrentBuyer(userId);

    if (!buyer) {
      return {
        success: false,
        error: "Comprador no encontrado",
        data: [],
      };
    }

    const orders = await sellerApi.getBuyerOrders(
      buyer.id
    );

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Error fetching buyer orders:", error);

    return {
      success: false,
      error: "Ocurrió un error al obtener los pedidos",
      data: [],
    };
  }
}

/**
 * Crea una nueva orden
 * Flujo: buyer autenticado → servicio Prisma → retorna DTO
 */
export async function createOrderAction(
  storeId: string,
  deliveryAddress: string,
  items: Array<{ productId: string; quantity: number }>
): Promise<ActionResponse<OrderResponseDto>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

    const buyer = await findCurrentBuyer(userId);

    if (!buyer) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    const order = await sellerApi.createOrder({
      buyerId: buyer.id,
      storeId,
      deliveryAddress,
      items,
    });

    if (!order) {
      return {
        success: false,
        error: "No se pudo crear la orden",
      };
    }

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Error creating order:", error);

    return {
      success: false,
      error: "Ocurrió un error al crear la orden",
    };
  }
}

/**
 * Limpia el carrito del comprador autenticado
 */
export async function clearCartAction(): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

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

/**
 * Procesa el checkout:
 * 1. Obtiene los items del carrito
 * 2. Agrupa por tienda (cada tienda = una orden)
 * 3. Crea una orden para cada tienda usando direccion de entrega
 * 4. Limpia el carrito
 * 5. Retorna la primera orden (para redireccion)
 */
export async function checkoutAction(
  deliveryAddress: string
): Promise<ActionResponse<{ orderId: string; orders: OrderResponseDto[] }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

    const buyer = await findCurrentBuyer(userId);

    if (!buyer) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    // Obtener items del carrito
    const cartItems = await getCartItemsWithProductDetails(userId);

    if (cartItems.length === 0) {
      return {
        success: false,
        error: "El carrito está vacío",
      };
    }

    // Agrupar items por storeId
    const itemsByStore: Record<
      string,
      Array<{ productId: string; quantity: number; price: number }>
    > = {};

    for (const item of cartItems) {
      if (!itemsByStore[item.storeId]) {
        itemsByStore[item.storeId] = [];
      }

      itemsByStore[item.storeId].push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Crear una orden por cada tienda
    const createdOrders: OrderResponseDto[] = [];

    for (const [storeId, items] of Object.entries(
      itemsByStore
    )) {
      const order = await sellerApi.createOrder({
        buyerId: buyer.id,
        storeId,
        deliveryAddress,
        items,
      });

      if (order) {
        createdOrders.push(order);
      }
    }

    if (createdOrders.length === 0) {
      return {
        success: false,
        error: "No se pudieron crear las órdenes",
      };
    }

    // Limpiar carrito
    await clearBuyerCart(userId);

    return {
      success: true,
      data: {
        orderId: createdOrders[0].id,
        orders: createdOrders,
      },
    };
  } catch (error) {
    console.error("Error in checkout:", error);

    return {
      success: false,
      error: "Ocurrió un error al procesar el checkout",
    };
  }
}