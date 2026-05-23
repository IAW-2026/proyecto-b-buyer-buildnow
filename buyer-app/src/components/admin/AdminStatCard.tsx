import Link from "next/link";

type Props = {
  label: string;
  value: string | number;
  href?: string;
};

export default function AdminStatCard({
  label,
  value,
  href,
}: Props) {
  const content = (
    <>
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-3 text-3xl font-bold text-stone-950">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-orange-300"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      {content}
    </div>
  );
}
