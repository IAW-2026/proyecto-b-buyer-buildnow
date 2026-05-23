/**
 * Barrel export para mockSeller
 */

export { orderMapper } from "@/server/mockSeller/orderMapper";
export { orderRepository } from "@/server/mockSeller/orderRepository";
export {
  orderService,
  setSellerApiDependencies,
} from "@/server/mockSeller/orderService";
export type {
  CreateOrderDto,
  CreateOrderItemDto,
  UpdateOrderStatusDto,
  OrderResponseDto,
  BuyerOrderDto,
  OrderItemResponseDto,
} from "@/server/mockSeller/orderTypes";
