import { NextResponse } from "next/server";

import { withSuperAdminApi } from "@/lib/api/adminApi";
import { getRecentBuyerActivity } from "@/server/services/admin.service";

export async function GET() {
  return withSuperAdminApi(async () =>
    NextResponse.json(await getRecentBuyerActivity())
  );
}
