import { NextResponse } from "next/server";

import {
  ForbiddenError,
  requireBuyer,
  UnauthorizedError,
} from "@/lib/auth/requireBuyer";
import { checkInMemoryRateLimit } from "@/lib/rate-limit/inMemoryRateLimit";
import { recommendStoreProducts } from "@/server/services/ai-recommendation.service";
import type { AiRecommendationRequest } from "@/types/ai-recommendation";

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function authErrorResponse(error: unknown) {
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

  return null;
}

export async function POST(req: Request) {
  try {
    const { userId } = await requireBuyer();

    const rateLimit = checkInMemoryRateLimit({
      key: `ai-recommend-products:${userId}`,
      limit: RATE_LIMIT,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          error:
            "Alcanzaste el limite de consultas del asistente. Intenta de nuevo en unos minutos.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetAt),
          },
        }
      );
    }

    const body =
      (await req.json()) as Partial<AiRecommendationRequest>;
    const message = body.message?.trim() ?? "";
    const storeId = body.storeId?.trim() ?? "";

    if (!message) {
      return NextResponse.json(
        { error: "El mensaje es requerido." },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error:
            "El mensaje no puede superar los 500 caracteres.",
        },
        { status: 400 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { error: "La tienda es requerida." },
        { status: 400 }
      );
    }

    const recommendation =
      await recommendStoreProducts(message, storeId);

    return NextResponse.json(recommendation);
  } catch (error) {
    const response = authErrorResponse(error);

    if (response) {
      return response;
    }

    if (
      error instanceof Error &&
      error.message === "GEMINI_API_KEY_MISSING"
    ) {
      return NextResponse.json(
        {
          error:
            "El asistente no esta configurado. Falta GEMINI_API_KEY.",
        },
        { status: 503 }
      );
    }

    console.error("AI recommendation error:", error);

    return NextResponse.json(
      {
        error:
          "No pudimos generar recomendaciones en este momento.",
      },
      { status: 500 }
    );
  }
}
