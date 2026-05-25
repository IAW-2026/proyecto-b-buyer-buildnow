import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getAdminAddresses } from "@/server/services/admin.service";

export default async function AdminAddressesPage() {
  const addresses = await getAdminAddresses();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Direcciones"
        description="Direcciones registradas por compradores."
      />

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {addresses.length === 0 ? (
          <p className="p-6 text-sm text-stone-600">
            No hay direcciones registradas.
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
                    Calle
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Ciudad
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Notas
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {addresses.map((address) => (
                  <tr key={address.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/buyers/${address.buyer.id}`}
                        className="font-medium text-stone-950 hover:text-[#823A00]"
                      >
                        {address.buyer.name ||
                          address.buyer.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {address.street}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {address.city}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {address.notes || "Sin notas"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/addresses/${address.id}`}
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
