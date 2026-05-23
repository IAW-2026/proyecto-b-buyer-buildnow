import Link from "next/link";
import { notFound } from "next/navigation";

import CartSidebar from "@/components/cart/CartSidebar";
import StoreHeader from "@/components/stores/StoreHeader";
import StoreProductsByCategory from "@/components/stores/StoreProductsByCategory";
import {
  getAllStores,
  getCatalogCategories,
  getStoreProductsService,
} from "@/server/services/catalog.service";
import type {
  Category,
  Product,
} from "@/server/integrations/seller/seller.types";

type CategoryGroup = {
  category: Category;
  products: Product[];
};

async function getStoreData(storeId: string) {
  const [stores, categories, storeProducts] =
    await Promise.all([
      getAllStores(),
      getCatalogCategories(),
      getStoreProductsService(storeId),
    ]);

  const store = stores.find((item) => item.id === storeId);

  if (!store) {
    return null;
  }

  const categoriesById = new Map(
    categories.map((category) => [
      category.id,
      category,
    ])
  );

  const productsByCategory = new Map<
    string,
    Product[]
  >();

  for (const product of storeProducts) {
    const current =
      productsByCategory.get(product.categoryId) ?? [];
    current.push(product);
    productsByCategory.set(
      product.categoryId,
      current
    );
  }

  const groupedCategories: CategoryGroup[] =
    Array.from(productsByCategory.entries())
      .map(([categoryId, products]) => {
        const category =
          categoriesById.get(categoryId) ?? {
            id: categoryId,
            name: products[0]?.categoryName ??
              "Sin categoría",
          };

        const sortedProducts = [...products].sort(
          (a, b) =>
            Number(!a.available) -
            Number(!b.available)
        );

        return {
          category,
          products: sortedProducts,
        };
      })
      .sort((left, right) =>
        left.category.name.localeCompare(
          right.category.name
        )
      );

  return {
    store,
    categories: groupedCategories,
    productCount: storeProducts.length,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const data = await getStoreData(storeId);

  if (!data) {
    notFound();
  }

  return (
    <main className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-300 hover:bg-orange-50"
        >
          ← Volver al dashboard
        </Link>

        <div className="text-sm text-stone-500">
          {data.store.name}
        </div>
      </div>

      <StoreHeader
        store={data.store}
        productCount={data.productCount}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <StoreProductsByCategory
            categories={data.categories}
          />
        </div>

        <div className="hidden xl:block">
          <CartSidebar />
        </div>
      </div>

      <div className="xl:hidden">
        <CartSidebar />
      </div>
    </main>
  );
}
