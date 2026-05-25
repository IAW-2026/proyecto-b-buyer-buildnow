import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getAdminCarts } from "@/server/services/admin.service";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

export default async function AdminCartsPage() {
  const carts = await getAdminCarts();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Carritos"
        description="Carritos activos con totales estimados desde CART_ITEM."
      />

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {carts.length === 0 ? (
          <p className="p-6 text-sm text-stone-600">
            No hay carritos activos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Comprador
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Items
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Total estimado
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Creado
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {carts.map((cart) => {
                  const total = cart.items.reduce(
                    (sum, item) =>
                      sum +
                      item.quantity * Number(item.price),
                    0
                  );
                  const quantity = cart.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );

                  return (
                    <tr key={cart.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/buyers/${cart.buyer.id}`}
                          className="font-medium text-stone-950 hover:text-[#823A00]"
                        >
                          {cart.buyer.name ||
                            cart.buyer.email}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {quantity}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {formatMoney(total)}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {cart.createdAt.toLocaleDateString(
                          "es-AR"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/carts/${cart.id}`}
                          className="font-medium text-[#ED6F00] hover:underline"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
