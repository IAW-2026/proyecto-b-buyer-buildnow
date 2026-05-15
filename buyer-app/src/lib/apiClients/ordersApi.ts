import { Order, OrderItem } from "@/type/order";
import mockData from "@/mockData/sellerApp.json";

export const ordersApi = {
  /**
   * Get all orders for a buyer (MOCK DATA)
   * @param buyerId - The buyer's ID
   * @returns List of orders
   */
  getOrdersByBuyer: async (buyerId: string): Promise<Order[]> => {
    try {
      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      // Filter orders by buyerId from mock data
      let orders = mockData.orders
        .filter((order) => order.buyerId === buyerId)
        .map(
          (order) =>
            ({
              ...order,
              status: order.status as Order["status"],
            }) as Order
        );

      // If no orders found for this buyerId, return all mock orders for demo purposes
      if (orders.length === 0) {
        orders = mockData.orders.map(
          (order) =>
            ({
              ...order,
              status: order.status as Order["status"],
            }) as Order
        );
      }

      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  /**
   * Create a new order (MOCK DATA)
   * @param orderData - Order creation data
   * @returns The created order
   */
  createOrder: async (
    buyerId: string,
    storeId: string,
    deliveryAddress: string,
    items: OrderItem[]
  ): Promise<Order | null> => {
    try {
      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      const newOrder: Order = {
        id: `order_${Date.now()}`,
        buyerId,
        storeId,
        totalAmount: Math.random() * 100000,
        status: "PENDING_PAYMENT",
        deliveryAddress,
        items,
        createdAt: new Date().toISOString(),
      };

      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      return null;
    }
  },

  /**
   * Get a specific order by ID (MOCK DATA)
   * @param orderId - The order's ID
   * @returns The order details
   */
  getOrderById: async (
    orderId: string
  ): Promise<Order | null> => {
    try {
      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      const order = mockData.orders.find(
        (o) => o.id === orderId
      );

      if (!order) {
        return null;
      }

      return {
        ...order,
        status: order.status as Order["status"],
      } as Order;
    } catch (error) {
      console.error(
        `Error fetching order ${orderId}:`,
        error
      );
      return null;
    }
  },
};
