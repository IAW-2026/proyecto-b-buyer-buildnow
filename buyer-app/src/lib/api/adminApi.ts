import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/requireBuyer";
import { requireSuperAdmin } from "@/lib/auth/requireSuperAdmin";

export async function withSuperAdminApi(
  handler: () => Promise<Response>
) {
  try {
    await requireSuperAdmin();
    return await handler();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    console.error("Superadmin API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export function getPagination(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1
  );
  const limit = Math.min(
    100,
    Math.max(
      1,
      Number.parseInt(searchParams.get("limit") ?? "25", 10) ||
        25
    )
  );

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
