import { notFound } from "next/navigation";
import OrderTrackingClient from "@/components/orders/OrderTrackingClient";
import { requireBuyer } from "@/lib/auth/requireBuyer";
import { getCurrentBuyer } from "@/server/services/buyer.service";
import * as sellerApi from "@/lib/apiClients/sellerApi";

interface OrderTrackingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderTrackingPage({
  params,
}: OrderTrackingPageProps) {
  const { id } = await params;
  let order: Awaited<
    ReturnType<typeof sellerApi.getOrderById>
  > | null = null;

  try {
    const { userId } = await requireBuyer();
    const buyer = await getCurrentBuyer(userId);
    order = await sellerApi.getOrderById(id);

    if (!order || order.buyerId !== buyer.id) {
      notFound();
    }
  } catch (error) {
    console.error(
      "Error loading order tracking:",
      error
    );
    notFound();
  }

  return <OrderTrackingClient order={order} />;
}
