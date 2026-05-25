import { notFound } from "next/navigation";
import OrderTrackingClient from "@/components/orders/OrderTrackingClient";
import { requireBuyer } from "@/lib/auth/requireBuyer";
import { getCurrentBuyer } from "@/server/services/buyer.service";
import * as sellerApi from "@/server/integrations/seller/seller.client";
import { getOrderTracking } from "@/server/integrations/delivery/delivery.client";

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
  let deliveryTracking: Awaited<
    ReturnType<typeof getOrderTracking>
  > = [];
  let productDetailsById: Record<
    string,
    {
      name: string;
      weight: number;
    }
  > = {};

  try {
    const { userId } = await requireBuyer();
    const buyer = await getCurrentBuyer(userId);
    order = await sellerApi.getOrderById(id);

    if (!order || order.buyerId !== buyer.id) {
      notFound();
    }

    const productDetails = await Promise.all(
      order.items.map(async (item) => {
        const product = await sellerApi.getProductDetails(
          item.productId
        );

        return [
          item.productId,
          {
            name: product.name,
            weight: product.weight,
          },
        ] as const;
      })
    );

    productDetailsById = Object.fromEntries(productDetails);

    if (order.status === "ON_THE_WAY") {
      deliveryTracking = await getOrderTracking(order.id);
    }
  } catch (error) {
    console.error(
      "Error loading order tracking:",
      error
    );
    notFound();
  }

  return (
    <OrderTrackingClient
      order={order}
      deliveryTracking={deliveryTracking[0] ?? null}
      productDetailsById={productDetailsById}
    />
  );
}
