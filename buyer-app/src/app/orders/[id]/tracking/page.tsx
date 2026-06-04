import { notFound } from "next/navigation";

import OrderTrackingClient from "@/components/orders/OrderTrackingClient";
import { requireBuyer } from "@/lib/auth/requireBuyer";
import { getBuyerOrderTrackingService } from "@/server/services/order.service";

interface OrderTrackingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderTrackingPage({
  params,
}: OrderTrackingPageProps) {
  const { id } = await params;
  let trackingData: Awaited<
    ReturnType<typeof getBuyerOrderTrackingService>
  > = null;

  try {
    const { userId } = await requireBuyer();
    trackingData = await getBuyerOrderTrackingService(
      userId,
      id
    );
  } catch (error) {
    console.error(
      "Error loading order tracking:",
      error
    );
    notFound();
  }

  if (!trackingData) {
    notFound();
  }

  return (
    <OrderTrackingClient
      order={trackingData.order}
      deliveryTracking={trackingData.deliveryTracking}
      productDetailsById={trackingData.productDetailsById}
    />
  );
}
