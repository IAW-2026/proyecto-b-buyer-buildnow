import "server-only";

import type {
  GeminiProductInput,
  GeminiRecommendationResult,
} from "./gemini.types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function buildPrompt(
  message: string,
  products: GeminiProductInput[]
) {
  return `
Sos un asistente de materiales de construccion para una Buyer App.

Necesidad del comprador:
"${message}"

Productos disponibles de la tienda actual:
${JSON.stringify(products, null, 2)}

Reglas:
- Responde siempre en espanol.
- Recomenda solamente productos incluidos en la lista enviada.
- No inventes productos ni ids.
- No prometas cantidades exactas ni asesoramiento tecnico definitivo.
- Aclara brevemente que las cantidades deben verificarse segun la obra.
- Mantene la respuesta breve y util.
- Devuelve exclusivamente JSON valido con esta forma:
{
  "message": "texto breve",
  "recommendedProducts": [
    {
      "productId": "id existente",
      "reason": "motivo breve"
    }
  ]
}
`.trim();
}

function parseJsonResponse(
  text: string
): GeminiRecommendationResult {
  const trimmed = text.trim();
  const jsonText =
    trimmed.startsWith("```")
      ? trimmed
          .replace(/^```(?:json)?/i, "")
          .replace(/```$/i, "")
          .trim()
      : trimmed;

  const parsed = JSON.parse(jsonText) as Partial<GeminiRecommendationResult>;

  return {
    message:
      typeof parsed.message === "string"
        ? parsed.message
        : "Estas recomendaciones pueden ayudarte a elegir productos disponibles.",
    recommendedProducts: Array.isArray(parsed.recommendedProducts)
      ? parsed.recommendedProducts
          .filter(
            (item) =>
              item &&
              typeof item.productId === "string" &&
              typeof item.reason === "string"
          )
          .map((item) => ({
            productId: item.productId,
            reason: item.reason,
          }))
      : [],
  };
}

const MAX_RETRIES = 3;
const RETRYABLE_STATUS_CODES = new Set([429, 503]);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiApi(
  prompt: string
): Promise<GeminiResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const backoff = 1000 * Math.pow(2, attempt - 1);
      console.log(
        `Gemini retry ${attempt}/${MAX_RETRIES} after ${backoff}ms...`
      );
      await delay(backoff);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY!)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 700,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (response.ok) {
      return (await response.json()) as GeminiResponse;
    }

    const errorBody = await response.text();
    console.error(
      `Gemini API error ${response.status} (attempt ${attempt + 1}):`,
      errorBody
    );

    lastError = new Error(
      `GEMINI_REQUEST_FAILED (${response.status}): ${errorBody}`
    );

    if (!RETRYABLE_STATUS_CODES.has(response.status)) {
      throw lastError;
    }
  }

  throw lastError ?? new Error("GEMINI_REQUEST_FAILED");
}

export async function generateMaterialRecommendations(
  message: string,
  products: GeminiProductInput[]
): Promise<GeminiRecommendationResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const prompt = buildPrompt(message, products);
  const data = await callGeminiApi(prompt);

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? "";

  if (!text) {
    throw new Error("GEMINI_EMPTY_RESPONSE");
  }

  return parseJsonResponse(text);
}
