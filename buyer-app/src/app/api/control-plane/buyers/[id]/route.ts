import { NextResponse } from "next/server";

import { withSuperAdminApi } from "@/lib/api/adminApi";
import { getControlPlaneBuyerById } from "@/server/services/admin.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSuperAdminApi(async () => {
    const { id } = await params;
    const buyer = await getControlPlaneBuyerById(id);

    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(buyer);
  });
}
