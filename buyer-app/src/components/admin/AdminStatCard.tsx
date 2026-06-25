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
      <p className="mt-3 text-3xl font-bold text-[#823A00]">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="brand-card brand-card-hover rounded-xl p-5 hover:-translate-y-0.5"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="brand-card rounded-xl p-5">
      {content}
    </div>
  );
}
