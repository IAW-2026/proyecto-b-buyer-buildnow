export const SELLER_API_URL =
  process.env.NEXT_PUBLIC_SELLER_API_URL ?? "";

export const useSellerMock = !SELLER_API_URL;
