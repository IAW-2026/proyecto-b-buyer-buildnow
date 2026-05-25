"use client";

interface Address {
  id: string;
  street: string;
  city: string;
  notes: string | null;
}

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  isDeleting?: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  isDeleting,
}: AddressCardProps) {
  return (
    <div className="bg-white border border-[#A76E04] rounded-xl p-4 hover:border-[#823A00] transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-[#823A00] mb-2">
            📍 {address.street}
          </h3>
          <p className="text-sm text-stone-600 mb-2">
            {address.city}
          </p>
          {address.notes && (
            <p className="text-xs text-stone-500 italic">
              {address.notes}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => onDelete(address.id)}
            disabled={isDeleting}
            className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
          >
            {isDeleting ? "..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
