export type DeliveryTrackingStatus = "ON_THE_WAY";

export interface DeliveryTracking {
  orderId: string;
  status: DeliveryTrackingStatus;
  estimatedArrival: string;
  curierName: string;
}
