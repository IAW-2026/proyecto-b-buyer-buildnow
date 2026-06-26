type Props = {
  title: string;
  description?: string;
};

export default function AdminPageHeader({
  title,
  description,
}: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#823A00]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-stone-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
