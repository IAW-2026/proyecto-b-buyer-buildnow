import { BuyerStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  getPagination,
  withSuperAdminApi,
} from "@/lib/api/adminApi";
import { getControlPlaneBuyers } from "@/server/services/admin.service";

export async function GET(request: Request) {
  return withSuperAdminApi(async () => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (
      status &&
      status !== BuyerStatus.ACTIVE &&
      status !== BuyerStatus.DISABLED
    ) {
      return NextResponse.json(
        { error: "Status must be ACTIVE or DISABLED" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      await getControlPlaneBuyers({
        ...getPagination(request),
        filters: {
          status: status ? (status as BuyerStatus) : undefined,
          search: searchParams.get("search") ?? undefined,
        },
      })
    );
  });
}
