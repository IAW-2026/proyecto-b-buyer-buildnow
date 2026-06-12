import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
      <AdminPageHeader
        title="Reporte de carritos activos"
        description="Métricas calculadas solo con CART y CART_ITEM."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="brand-card rounded-xl p-5">
          <p className="text-sm text-stone-600">
            Total de carritos
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {report.totalCarts}
          </p>
        </div>
        <div className="brand-card rounded-xl p-5">
          <p className="text-sm text-stone-600">
            Total estimado acumulado
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {formatMoney(report.totalEstimated)}
          </p>
        </div>
        <div className="brand-card rounded-xl p-5">
          <p className="text-sm text-stone-600">
            Promedio de items por carrito
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {report.averageItemsPerCart.toFixed(2)}
          </p>
        </div>
      </section>

      <section className="brand-card overflow-hidden rounded-xl">
        <div className="border-b border-orange-200 px-6 py-4">
          <h3 className="font-semibold text-[#823A00]">
            Top productId más agregados
          </h3>
        </div>
        {report.topProducts.length === 0 ? (
          <p className="p-6 text-sm text-stone-600">
            No hay items en carritos.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FFF4E8] text-[#823A00]">
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
                  <td className="px-4 py-3 font-medium text-[#823A00]">
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
