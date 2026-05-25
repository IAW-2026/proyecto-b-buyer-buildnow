"use client";

export type ProductSort = "default" | "price_asc" | "price_desc";

type Props = {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
};

export default function ProductSortControl({
  value,
  onChange,
}: Props) {
  return (
    <label className="flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-sm text-stone-700">
      <span className="font-medium">Ordenar por</span>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value as ProductSort)
        }
        className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm outline-none transition focus:border-orange-500"
      >
        <option value="default">Relevancia</option>
        <option value="price_asc">Menor precio</option>
        <option value="price_desc">Mayor precio</option>
      </select>
    </label>
  );
}

export function sortProducts<T extends { price: number }>(
  products: T[],
  sort: ProductSort
) {
  if (sort === "price_asc") {
    return [...products].sort(
      (left, right) => left.price - right.price
    );
  }

  if (sort === "price_desc") {
    return [...products].sort(
      (left, right) => right.price - left.price
    );
  }

  return products;
}
