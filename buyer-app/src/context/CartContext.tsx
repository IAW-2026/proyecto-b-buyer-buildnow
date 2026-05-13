"use client";

import {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

import {
  fetchCartItemsAction,
  addToCartAction,
  decreaseCartItemAction,
} from "@/actions/buyerActions";

type CartItem = {
  cartItemId: string;
  productId: string;
  storeId: string;
  quantity: number;
  price: number;
  product: {
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
  };
};

type ActionResult = {
  success: boolean;
  error?: string;
};

type CartState = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
};

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string };

const initialState: CartState = {
  items: [],
  loading: true,
  error: null,
};

function cartReducer(
  state: CartState,
  action: CartAction
): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ITEMS":
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null,
      };

    case "SET_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) =>
          item.productId ===
          action.payload.productId
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId ===
            action.payload.productId
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          action.payload,
        ],
      };
    }

    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.cartItemId ===
          action.payload.cartItemId
            ? action.payload
            : item
        ),
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            item.productId !==
            action.payload
        ),
      };

    default:
      return state;
  }
}

interface CartContextType
  extends CartState {
  addItem: (
    productId: string
  ) => Promise<ActionResult>;

  decreaseItem: (
    productId: string
  ) => Promise<ActionResult>;

  refetch: () => Promise<void>;

  getProductQuantity: (
    productId: string
  ) => number;
}

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState
  );

  // ==============================
  // ERROR HANDLING
  // ==============================

  const dispatchError = useCallback(
    (message: string) => {
      dispatch({
        type: "SET_ERROR",
        payload: message,
      });

      setTimeout(() => {
        dispatch({
          type: "SET_ERROR",
          payload: null,
        });
      }, 5000);
    },
    []
  );

  // ==============================
  // FETCH CART
  // ==============================

  const refetch = useCallback(async () => {
    dispatch({
      type: "SET_LOADING",
      payload: true,
    });

    try {
      const result =
        await fetchCartItemsAction();

      if (
        result.success &&
        result.data
      ) {
        dispatch({
          type: "SET_ITEMS",
          payload: result.data,
        });

        return;
      }

      dispatchError(
        result.error ||
          "Error al cargar el carrito"
      );
    } catch (error) {
      console.error(error);

      dispatchError(
        "Error al cargar el carrito"
      );
    }
  }, [dispatchError]);

  // ==============================
  // INITIAL FETCH
  // ==============================

  useEffect(() => {
    const load = async () => {
      await refetch();
    };

    load();
  }, [refetch]);

  // ==============================
  // ACTIONS
  // ==============================

  const addItem = useCallback(
    async (
      productId: string
    ): Promise<ActionResult> => {
      try {
        const result =
          await addToCartAction(productId);

        if (!result.success) {
          const errorMessage =
            result.error ||
            "Error al agregar producto";

          dispatchError(errorMessage);

          return {
            success: false,
            error: errorMessage,
          };
        }

        await refetch();

        return {
          success: true,
        };
      } catch (error) {
        console.error(error);

        const errorMessage =
          "Error al agregar producto";

        dispatchError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [refetch, dispatchError]
  );

  const decreaseItem = useCallback(
    async (
      productId: string
    ): Promise<ActionResult> => {
      try {
        const result =
          await decreaseCartItemAction(
            productId
          );

        if (!result.success) {
          const errorMessage =
            result.error ||
            "Error al actualizar carrito";

          dispatchError(errorMessage);

          return {
            success: false,
            error: errorMessage,
          };
        }

        await refetch();

        return {
          success: true,
        };
      } catch (error) {
        console.error(error);

        const errorMessage =
          "Error al actualizar carrito";

        dispatchError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [refetch, dispatchError]
  );

  // ==============================
  // HELPERS
  // ==============================

  const getProductQuantity = useCallback(
    (productId: string): number => {
      const item = state.items.find(
        (item) =>
          item.productId === productId
      );

      return item?.quantity ?? 0;
    },
    [state.items]
  );

  const value: CartContextType = {
    ...state,
    addItem,
    decreaseItem,
    refetch,
    getProductQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error(
      "useCart debe usarse dentro de CartProvider"
    );
  }

  return context;
}