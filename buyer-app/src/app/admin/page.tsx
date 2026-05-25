import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import {
  getAdminCartReport,
  getAdminSummary,
} from "@/server/services/admin.service";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

export default async function AdminPage() {
  const [summary, report] = await Promise.all([
    getAdminSummary(),
    getAdminCartReport(),
  ]);

  const cards = [
    {
      label: "Compradores",
      value: summary.totalBuyers,
      href: "/admin/buyers",
    },
    {
      label: "Direcciones",
      value: summary.totalAddresses,
      href: "/admin/addresses",
    },
    {
      label: "Carritos",
      value: summary.totalCarts,
      href: "/admin/carts",
    },
    {
      label: "Items en carritos",
      value: summary.totalCartItems,
      href: "/admin/reports",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Resumen general"
        description="Datos propios de compradores, direcciones y carritos."
      />

      <section className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <AdminStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            href={card.href}
          />
        ))}
      </section>

      <section className="rounded-xl border border-[#A76E04] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#823A00]">
              Reporte de carritos activos
            </h2>
            <p className="text-sm text-stone-600">
              Basado únicamente en CART y CART_ITEM.
            </p>
          </div>
          <Link
            href="/admin/reports"
            className="text-sm font-medium text-[#ED6F00] hover:underline"
          >
            Ver reporte completo
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-[#FFF4E8] p-4">
            <p className="text-sm text-stone-600">
              Total estimado
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#823A00]">
              {formatMoney(report.totalEstimated)}
            </p>
          </div>
          <div className="rounded-lg bg-[#FFF4E8] p-4">
            <p className="text-sm text-stone-600">
              Promedio de items
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#823A00]">
              {report.averageItemsPerCart.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-[#FFF4E8] p-4">
            <p className="text-sm text-stone-600">
              Producto más agregado
            </p>
            <p className="mt-2 text-lg font-semibold text-[#823A00]">
              {report.topProducts[0]?.productId ?? "Sin datos"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
