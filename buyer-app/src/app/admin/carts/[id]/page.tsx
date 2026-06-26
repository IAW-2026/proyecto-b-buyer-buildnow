import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCartById } from "@/server/services/admin.service";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

export default async function AdminCartDetailPage({
  params,
}: Props) {
  const { id } = await params;
  const cart = await getAdminCartById(id);

  if (!cart) {
    notFound();
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.price),
    0
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/carts"
        className="text-sm font-medium text-[#ED6F00] hover:underline"
      >
        Volver a carritos
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-[#823A00]">
          Carrito
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Comprador:{" "}
          <Link
            href={`/admin/buyers/${cart.buyer.id}`}
            className="font-medium text-[#ED6F00] hover:underline"
          >
            {cart.buyer.name || cart.buyer.email}
          </Link>
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="brand-card rounded-xl p-5">
          <p className="text-sm text-stone-600">
            Items distintos
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {cart.items.length}
          </p>
        </div>
        <div className="brand-card rounded-xl p-5">
          <p className="text-sm text-stone-600">
            Unidades
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {cart.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            )}
          </p>
        </div>
        <div className="brand-card rounded-xl p-5">
          <p className="text-sm text-stone-600">
            Total estimado
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {formatMoney(total)}
          </p>
        </div>
      </section>

      <section className="brand-card overflow-hidden rounded-xl">
        {cart.items.length === 0 ? (
          <p className="p-6 text-sm text-stone-600">
            Este carrito no tiene items.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF4E8] text-[#823A00]">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    ProductId
                  </th>
                  <th className="px-4 py-3 font-medium">
                    StoreId
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Precio
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {cart.items.map((item) => {
                  const subtotal =
                    item.quantity * Number(item.price);

                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-[#823A00]">
                        {item.productId}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {item.storeId}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {formatMoney(Number(item.price))}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {formatMoney(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
