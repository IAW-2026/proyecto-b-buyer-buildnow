export type GeminiProductInput = {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  stock: number;
};

export type GeminiRecommendation = {
  productId: string;
  reason: string;
};

export type GeminiRecommendationResult = {
  message: string;
  recommendedProducts: GeminiRecommendation[];
};
