"use client";

import { useState } from "react";
import CityAutocompleteInput from "./CityAutocompleteInput";

interface Address {
  id: string;
  street: string;
  city: string;
  notes: string | null;
}

interface AddressFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialAddress?: Address;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function AddressForm({
  onSubmit,
  initialAddress,
  isLoading,
  onCancel,
}: AddressFormProps) {
  const [formData, setFormData] = useState({
    street: initialAddress?.street || "",
    city: initialAddress?.city || "",
    notes: initialAddress?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append("street", formData.street);
    formDataObj.append("city", formData.city);
    if (formData.notes) {
      formDataObj.append("notes", formData.notes);
    }

    await onSubmit(formDataObj);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#A76E04] rounded-xl p-6 space-y-4"
    >
      <h3 className="font-semibold text-[#823A00]">
        {initialAddress ? "Editar dirección" : "Agregar nueva dirección"}
      </h3>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Calle
        </label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-stone-300 px-4 py-2 outline-none transition focus:border-[#ED6F00] focus:bg-white"
          placeholder="Ej: Calle Principal 123"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Ciudad
        </label>
        <CityAutocompleteInput
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-stone-300 px-4 py-2 outline-none transition focus:border-[#ED6F00] focus:bg-white"
          placeholder="Ej: Buenos Aires"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Notas (opcional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full rounded-lg border border-stone-300 px-4 py-2 outline-none transition focus:border-[#ED6F00] focus:bg-white resize-none"
          placeholder="Ej: Apartamento 4B, dejar en portería"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-[#FFF4E8] transition"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-[#ED6F00] text-white hover:bg-[#A76E04] transition disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : initialAddress ? "Actualizar" : "Agregar"}
        </button>
      </div>
    </form>
  );
}
