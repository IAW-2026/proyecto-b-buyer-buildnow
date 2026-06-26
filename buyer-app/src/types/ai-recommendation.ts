export type AiRecommendationRequest = {
  message: string;
  storeId: string;
};

export type RecommendedProduct = {
  productId: string;
  name: string;
  reason: string;
  price: number;
};

export type AiRecommendationResponse = {
  message: string;
  recommendedProducts: RecommendedProduct[];
};
