import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getAdminBuyers } from "@/server/services/admin.service";

export default async function AdminBuyersPage() {
  const buyers = await getAdminBuyers();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Compradores"
        description="Listado de usuarios dados de alta como buyers."
      />

      <div className="overflow-hidden rounded-xl border border-[#A76E04] bg-white shadow-sm">
        {buyers.length === 0 ? (
          <p className="p-6 text-sm text-stone-600">
            No hay compradores registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF4E8] text-[#823A00]">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Nombre
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Email
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Direcciones
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Carrito
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {buyers.map((buyer) => (
                  <tr key={buyer.id}>
                    <td className="px-4 py-3 text-[#823A00]">
                      {buyer.name || "Sin nombre"}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {buyer.email}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {buyer.phone || "Sin teléfono"}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {buyer._count.addresses}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {buyer.cart
                        ? `${buyer.cart._count.items} items`
                        : "Sin carrito"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/buyers/${buyer.id}`}
                        className="font-medium text-[#ED6F00] hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
