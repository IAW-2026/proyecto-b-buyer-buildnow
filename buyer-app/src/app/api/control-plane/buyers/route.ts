import { NextResponse } from "next/server";

import {
  getPagination,
  withSuperAdminApi,
} from "@/lib/api/adminApi";
import { getControlPlaneBuyers } from "@/server/services/admin.service";

export async function GET(request: Request) {
  return withSuperAdminApi(async () =>
    NextResponse.json(
      await getControlPlaneBuyers(getPagination(request))
    )
  );
}
