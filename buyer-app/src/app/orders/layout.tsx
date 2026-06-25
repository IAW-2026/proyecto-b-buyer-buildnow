import TopSearchBar from "@/components/search/TopSearchBar";
import { requireBuyer } from "@/lib/auth/requireBuyer";

export default async function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireBuyer();

  return (
    <div className="min-h-screen bg-[#FFF4E8]">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#FFF4E8] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <TopSearchBar showSearch={false} />
        </div>
      </div>

      {/* CONTENT */}
      <main>{children}</main>
    </div>
  );
}
