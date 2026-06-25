import "server-only";

import { getAvailableStoreProductsService } from "@/server/services/catalog.service";
import { generateMaterialRecommendations } from "@/server/integrations/gemini/gemini.client";
import type { AiRecommendationResponse } from "@/types/ai-recommendation";

const MAX_PRODUCTS_FOR_AI = 80;

export async function recommendStoreProducts(
  message: string,
  storeId: string
): Promise<AiRecommendationResponse> {
  const availableProducts =
    await getAvailableStoreProductsService(storeId);

  if (availableProducts.length === 0) {
    return {
      message:
        "No encontre productos disponibles en esta tienda para recomendar.",
      recommendedProducts: [],
    };
  }

  const productsForAi = availableProducts
    .slice(0, MAX_PRODUCTS_FOR_AI)
    .map((product) => ({
      id: product.id,
      name: product.name,
      categoryName: product.categoryName,
      price: product.price,
      stock: product.stock,
    }));

  const aiResult = await generateMaterialRecommendations(
    message,
    productsForAi
  );

  const productsById = new Map(
    availableProducts.map((product) => [
      product.id,
      product,
    ])
  );

  const recommendedProducts = aiResult.recommendedProducts
    .map((recommendation) => {
      const product = productsById.get(
        recommendation.productId
      );

      if (!product) {
        return null;
      }

      return {
        productId: product.id,
        name: product.name,
        reason: recommendation.reason,
        price: product.price,
      };
    })
    .filter(
      (
        product
      ): product is {
        productId: string;
        name: string;
        reason: string;
        price: number;
      } => Boolean(product)
    )
    .slice(0, 6);

  return {
    message: aiResult.message,
    recommendedProducts,
  };
}
