export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  status: "OPEN" | "CLOSE";
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  img: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  price: number;
  stock: number;
  weight: number;
  available: boolean;
}

export interface ProductsSearchResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: Product[];
}

export type StoresQuery = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};
