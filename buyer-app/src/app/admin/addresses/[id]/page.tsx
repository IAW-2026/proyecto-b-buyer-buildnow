import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteAdminAddressAction,
  updateAdminAddressAction,
} from "@/actions/adminActions";
import { getAdminAddressById } from "@/server/services/admin.service";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminAddressDetailPage({
  params,
}: Props) {
  const { id } = await params;
  const address = await getAdminAddressById(id);

  if (!address) {
    notFound();
  }

  const updateAddress = updateAdminAddressAction.bind(
    null,
    address.id
  );
  const deleteAddress = deleteAdminAddressAction.bind(
    null,
    address.id
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/addresses"
        className="text-sm font-medium text-[#ED6F00] hover:underline"
      >
        Volver a direcciones
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-[#823A00]">
          Dirección
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Comprador:{" "}
          <Link
            href={`/admin/buyers/${address.buyer.id}`}
            className="font-medium text-[#ED6F00] hover:underline"
          >
            {address.buyer.name || address.buyer.email}
          </Link>
        </p>
      </div>

      <section className="rounded-xl border border-[#A76E04] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#823A00]">
          Editar dirección
        </h3>
        <form
          action={updateAddress}
          className="mt-4 grid gap-4"
        >
          <label className="text-sm font-medium text-[#823A00]">
            Calle
            <input
              name="street"
              required
              defaultValue={address.street}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-[#ED6F00]"
            />
          </label>
          <label className="text-sm font-medium text-[#823A00]">
            Ciudad
            <input
              name="city"
              required
              defaultValue={address.city}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-[#ED6F00]"
            />
          </label>
          <label className="text-sm font-medium text-[#823A00]">
            Notas
            <textarea
              name="notes"
              rows={3}
              defaultValue={address.notes ?? ""}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-[#ED6F00]"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-[#ED6F00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04]"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-red-700">
          Eliminar dirección
        </h3>
        <p className="mt-2 text-sm text-stone-600">
          Esta acción elimina solo la dirección seleccionada.
        </p>
        <form action={deleteAddress} className="mt-4">
          <button
            type="submit"
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            Eliminar dirección
          </button>
        </form>
      </section>
    </div>
  );
}
