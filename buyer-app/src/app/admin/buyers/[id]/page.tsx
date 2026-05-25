import Link from "next/link";
import { notFound } from "next/navigation";
import { updateAdminBuyerAction } from "@/actions/adminActions";
import { getAdminBuyerById } from "@/server/services/admin.service";

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

export default async function AdminBuyerDetailPage({
  params,
}: Props) {
  const { id } = await params;
  const buyer = await getAdminBuyerById(id);

  if (!buyer) {
    notFound();
  }

  const cartTotal =
    buyer.cart?.items.reduce(
      (sum, item) =>
        sum + item.quantity * Number(item.price),
      0
    ) ?? 0;

  const updateBuyer = updateAdminBuyerAction.bind(
    null,
    buyer.id
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/buyers"
        className="text-sm font-medium text-[#ED6F00] hover:underline"
      >
        Volver a compradores
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-[#823A00]">
          {buyer.name || "Comprador sin nombre"}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          {buyer.email}
        </p>
      </div>

      <section className="rounded-xl border border-[#A76E04] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#823A00]">
          Editar datos básicos
        </h3>
        <form
          action={updateBuyer}
          className="mt-4 grid gap-4 md:grid-cols-2"
        >
          <label className="text-sm font-medium text-[#823A00]">
            Nombre
            <input
              name="name"
              required
              defaultValue={buyer.name ?? ""}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-[#ED6F00]"
            />
          </label>
          <label className="text-sm font-medium text-[#823A00]">
            Teléfono
            <input
              name="phone"
              required
              inputMode="numeric"
              pattern="[0-9]{8,15}"
              defaultValue={buyer.phone ?? ""}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-[#ED6F00]"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-[#ED6F00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04]"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#A76E04] bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Direcciones
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {buyer.addresses.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#A76E04] bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Items en carrito
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {buyer.cart?.items.length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-[#A76E04] bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Total estimado
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#823A00]">
            {formatMoney(cartTotal)}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-[#A76E04] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-[#823A00]">
          Direcciones
        </h3>
        {buyer.addresses.length === 0 ? (
          <p className="mt-4 text-sm text-stone-600">
            Este comprador no tiene direcciones.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {buyer.addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-lg border border-[#F8C58D] p-4"
              >
                <p className="font-medium text-[#823A00]">
                  {address.street}
                </p>
                <p className="text-sm text-stone-600">
                  {address.city}
                </p>
                {address.notes ? (
                  <p className="mt-1 text-sm text-stone-500">
                    {address.notes}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
