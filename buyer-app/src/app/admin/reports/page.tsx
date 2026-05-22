import { getAdminCartReport } from "@/server/services/admin.service";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

export default async function AdminReportsPage() {
  const report = await getAdminCartReport();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-950">
          Reporte de carritos activos
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Métricas calculadas solo con CART y CART_ITEM.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Total de carritos
          </p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">
            {report.totalCarts}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Total estimado acumulado
          </p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">
            {formatMoney(report.totalEstimated)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Promedio de items por carrito
          </p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">
            {report.averageItemsPerCart.toFixed(2)}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-6 py-4">
          <h3 className="font-semibold text-stone-950">
            Top productId más agregados
          </h3>
        </div>
        {report.topProducts.length === 0 ? (
          <p className="p-6 text-sm text-stone-600">
            No hay items en carritos.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-4 py-3 font-medium">
                  ProductId
                </th>
                <th className="px-4 py-3 font-medium">
                  Cantidad agregada
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {report.topProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="px-4 py-3 font-medium text-stone-950">
                    {product.productId}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {product.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
