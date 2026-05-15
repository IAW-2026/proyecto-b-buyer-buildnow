import { ordersApi } from "@/lib/apiClients/ordersApi";
import { notFound } from "next/navigation";
import OrderTrackingClient from "@/components/orders/OrderTrackingClient";

interface OrderTrackingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderTrackingPage({
  params,
}: OrderTrackingPageProps) {
  const { id } = await params;

  try {
    const order = await ordersApi.getOrderById(id);

    if (!order) {
      notFound();
    }

    return <OrderTrackingClient order={order} />;
  } catch (error) {
    console.error(
      "Error loading order tracking:",
      error
    );
    notFound();
  }
}
