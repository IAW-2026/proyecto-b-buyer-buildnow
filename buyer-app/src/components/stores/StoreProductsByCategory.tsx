"use client";

import ProductCard from "@/components/products/ProductCard";
import { useCart } from "@/context/CartContext";

import type {
  Category,
  Product,
} from "@/server/integrations/seller/seller.types";

type CategoryProducts = {
  category: Category;
  products: Product[];
};

type Props = {
  categories: CategoryProducts[];
};

export default function StoreProductsByCategory({
  categories,
}: Props) {
  const {
    addItem,
    decreaseItem,
    getProductQuantity,
  } = useCart();

  const handleAdd = async (productId: string) => {
    await addItem(productId);
  };

  const handleDecrease = async (productId: string) => {
    await decreaseItem(productId);
  };

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
              Productos por categoría
            </p>

            <h1 className="mt-1 text-2xl font-bold text-stone-800">
              No se encontraron productos
            </h1>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-center">
          <p className="text-stone-500">
            Esta tienda no tiene productos disponibles en el catálogo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map(({ category, products }) => (
        <section
          key={category.id}
          className="rounded-2xl bg-white border border-stone-200 p-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
                Categoría
              </p>

              <h2 className="mt-1 text-2xl font-bold text-stone-800">
                {category.name}
              </h2>
            </div>

            <div className="rounded-xl bg-stone-100 px-4 py-2 text-sm text-stone-600">
              {products.length} producto{products.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                storeId={product.storeId}
                price={product.price}
                weight={product.weight}
                available={product.available}
                quantity={getProductQuantity(product.id)}
                onAdd={handleAdd}
                onDecrease={handleDecrease}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
