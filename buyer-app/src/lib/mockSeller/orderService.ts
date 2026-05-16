/**
 * Servicio para lógica de negocio de órdenes
 * Responsabilidad: validaciones, cálculos, coordinación
 */

import { orderRepository } from "./orderRepository";
import { orderMapper } from "./orderMapper";
import type {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderResponseDto,
  BuyerOrderDto,
} from "./orderTypes";

// Importar funciones de sellerApi para obtener productos y tiendas
// Se inyectarán como parámetros para evitar ciclos de importación
interface SellerApiDeps {
  getProductDetails: (productId: string) => Promise<any>;
  getStores: () => Promise<Array<{ id: string; name: string }>>;
}

let sellerApiDeps: SellerApiDeps;

/**
 * Registra las dependencias de sellerApi
 * Se llama desde sellerApi.ts para evitar ciclos
 */
export function setSellerApiDependencies(deps: SellerApiDeps) {
  sellerApiDeps = deps;
}

export const orderService = {
  /**
   * Crea una nueva orden con validaciones y cálculos
   */
  async createMockSellerOrder(
    dto: CreateOrderDto
  ): Promise<OrderResponseDto> {
    if (!sellerApiDeps) {
      throw new Error("orderService: sellerApiDeps not initialized");
    }

    // Validar que hay items
    if (!dto.items || dto.items.length === 0) {
      throw new Error(
        "La orden debe contener al menos 1 producto"
      );
    }

    // Obtener todos los productos necesarios
    const productDetailsMap = new Map();
    let totalAmount = 0;
    let totalWeight = 0;

    const orderItems = [];

    for (const item of dto.items) {
      const product =
        await sellerApiDeps.getProductDetails(
          item.productId
        );

      if (!product) {
        throw new Error(
          `Producto no encontrado: ${item.productId}`
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      totalWeight += product.weight * item.quantity;

      productDetailsMap.set(product.id, product.name);

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Crear orden en Prisma
    const order = await orderRepository.createOrder(
      dto.buyerId,
      dto.storeId,
      dto.deliveryAddress,
      orderItems,
      totalAmount,
      totalWeight
    );

    // Obtener info de la tienda
    const stores = await sellerApiDeps.getStores();
    const store = stores.find((s) => s.id === dto.storeId);
    const storeName = store?.name || `Tienda ${dto.storeId}`;

    // Mapear a DTO de respuesta
    return orderMapper.toOrderResponseDto(
      order,
      storeName,
      productDetailsMap
    );
  },

  /**
   * Obtiene una orden por ID con todos sus datos
   */
  async getOrderById(
    orderId: string
  ): Promise<OrderResponseDto> {
    if (!sellerApiDeps) {
      throw new Error("orderService: sellerApiDeps not initialized");
    }

    const order =
      await orderRepository.getOrderById(orderId);

    if (!order) {
      throw new Error(`Orden no encontrada: ${orderId}`);
    }

    // Obtener nombres de productos
    const productDetailsMap = new Map();
    for (const item of order.items) {
      const product =
        await sellerApiDeps.getProductDetails(
          item.productId
        );
      if (product) {
        productDetailsMap.set(product.id, product.name);
      }
    }

    // Obtener info de la tienda
    const stores = await sellerApiDeps.getStores();
    const store = stores.find((s) => s.id === order.storeId);
    const storeName = store?.name || `Tienda ${order.storeId}`;

    return orderMapper.toOrderResponseDto(
      order,
      storeName,
      productDetailsMap
    );
  },

  /**
   * Obtiene todas las órdenes de un comprador
   */
  async getMockBuyerOrders(
    buyerId: string
  ): Promise<BuyerOrderDto[]> {
    if (!sellerApiDeps) {
      throw new Error("orderService: sellerApiDeps not initialized");
    }

    const orders =
      await orderRepository.getBuyerOrders(buyerId);

    const stores = await sellerApiDeps.getStores();

    return orders.map((order) => {
      const store = stores.find((s) => s.id === order.storeId);
      const storeName = store?.name || `Tienda ${order.storeId}`;

      return orderMapper.toBuyerOrderDto(order, storeName);
    });
  },

  /**
   * Actualiza el estado de una orden (para testing/tracking)
   */
  async updateMockSellerOrderStatus(
    dto: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    if (!sellerApiDeps) {
      throw new Error("orderService: sellerApiDeps not initialized");
    }

    // Validar estado válido
    const validStatuses = [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "READY",
      "ON_THE_WAY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(dto.status)) {
      throw new Error(`Estado inválido: ${dto.status}`);
    }

    const order =
      await orderRepository.updateOrderStatus(
        dto.orderId,
        dto.status
      );

    // Obtener nombres de productos
    const productDetailsMap = new Map();
    for (const item of order.items) {
      const product =
        await sellerApiDeps.getProductDetails(
          item.productId
        );
      if (product) {
        productDetailsMap.set(product.id, product.name);
      }
    }

    // Obtener info de la tienda
    const stores = await sellerApiDeps.getStores();
    const store = stores.find((s) => s.id === order.storeId);
    const storeName = store?.name || `Tienda ${order.storeId}`;

    return orderMapper.toOrderResponseDto(
      order,
      storeName,
      productDetailsMap
    );
  },
};
