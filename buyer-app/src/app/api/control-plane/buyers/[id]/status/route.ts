import { NextResponse } from "next/server";
import { BuyerStatus } from "@prisma/client";

import { withSuperAdminApi } from "@/lib/api/adminApi";
import { setAdminBuyerStatus } from "@/server/services/admin.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSuperAdminApi(async () => {
    let body: { status?: unknown };

    try {
      body = (await request.json()) as { status?: unknown };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (
      body.status !== BuyerStatus.ACTIVE &&
      body.status !== BuyerStatus.DISABLED
    ) {
      return NextResponse.json(
        { error: "Status must be ACTIVE or DISABLED" },
        { status: 400 }
      );
    }

    const { id } = await params;
    await setAdminBuyerStatus(id, body.status);

    return NextResponse.json({ success: true });
  });
}
