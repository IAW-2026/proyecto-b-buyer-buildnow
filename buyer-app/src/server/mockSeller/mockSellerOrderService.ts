import "server-only";

import sellerAppMock from "./sellerApp.json";
import { orderMapper } from "./orderMapper";
import { orderRepository } from "./orderRepository";
import type {
  BuyerOrderDto,
  CreateOrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from "./orderTypes";

type MockProduct = {
  id: string;
  name: string;
  price: number;
  weight: number;
};

type MockStore = {
  id: string;
  name: string;
};

type SellerAppMock = {
  stores: MockStore[];
  products: MockProduct[];
};

const sellerApp = sellerAppMock as SellerAppMock;

function getMockProductDetails(productId: string) {
  const product = sellerApp.products.find(
    (item) => item.id === productId
  );

  if (!product) {
    throw new Error(`Producto no encontrado: ${productId}`);
  }

  return product;
}

function getMockStoreName(storeId: string) {
  const store = sellerApp.stores.find(
    (item) => item.id === storeId
  );

  return store?.name || `Tienda ${storeId}`;
}

function getProductNames(
  productIds: string[]
): Map<string, string> {
  return new Map(
    productIds.map((productId) => {
      const product = getMockProductDetails(productId);

      return [product.id, product.name] as const;
    })
  );
}

export const mockSellerOrderService = {
  async createOrder(
    dto: CreateOrderDto
  ): Promise<OrderResponseDto> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error(
        "La orden debe contener al menos 1 producto"
      );
    }

    const productDetailsMap = new Map<string, string>();
    let totalAmount = 0;
    let totalWeight = 0;

    const orderItems = dto.items.map((item) => {
      const product = getMockProductDetails(item.productId);
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      totalWeight += product.weight * item.quantity;
      productDetailsMap.set(product.id, product.name);

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const order = await orderRepository.createOrder(
      dto.buyerId,
      dto.storeId,
      dto.deliveryAddress,
      orderItems,
      totalAmount,
      totalWeight
    );

    return orderMapper.toOrderResponseDto(
      order,
      getMockStoreName(dto.storeId),
      productDetailsMap
    );
  },

  async getOrderById(
    orderId: string
  ): Promise<OrderResponseDto> {
    const order =
      await orderRepository.getOrderById(orderId);

    if (!order) {
      throw new Error(`Orden no encontrada: ${orderId}`);
    }

    return orderMapper.toOrderResponseDto(
      order,
      getMockStoreName(order.storeId),
      getProductNames(
        order.items.map((item) => item.productId)
      )
    );
  },

  async getBuyerOrders(
    buyerId: string
  ): Promise<BuyerOrderDto[]> {
    const orders =
      await orderRepository.getBuyerOrders(buyerId);

    return orders.map((order) =>
      orderMapper.toBuyerOrderDto(
        order,
        getMockStoreName(order.storeId)
      )
    );
  },

  async updateOrderStatus(
    dto: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    const validStatuses = [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "READY",
      "ON_THE_WAY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(dto.status)) {
      throw new Error(`Estado invalido: ${dto.status}`);
    }

    const order =
      await orderRepository.updateOrderStatus(
        dto.orderId,
        dto.status
      );

    return orderMapper.toOrderResponseDto(
      order,
      getMockStoreName(order.storeId),
      getProductNames(
        order.items.map((item) => item.productId)
      )
    );
  },
};
