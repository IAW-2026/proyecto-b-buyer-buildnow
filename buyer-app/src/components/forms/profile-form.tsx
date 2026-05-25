"use client";

import { createBuyerAction } from "@/actions/buyerActions";
import CityAutocompleteInput from "@/components/addresses/CityAutocompleteInput";
import { useState } from "react";

export default function ProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCreateBuyer = async (
    formData: FormData
  ) => {
    setError(null);

    const result = await createBuyerAction(formData);

    if (!result.success) {
      setError(
        result.error ||
          "No se pudo guardar el perfil"
      );
      return;
    }

    setIsRedirecting(true);

    setTimeout(() => {
      window.location.replace("/dashboard");
    }, 1200);
  };

  return (
    <form
      action={handleCreateBuyer}
      className="
        space-y-6
        bg-white
        p-6
        rounded-2xl
        shadow-sm
        border
        border-[#A76E04]
      "
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isRedirecting && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Perfil creado. Redirigiendo al dashboard...
        </div>
      )}

      <div>
        <label className="block mb-2 font-medium text-[#823A00]">
          Nombre
        </label>

        <input
          name="name"
          type="text"
          required
          className="
            w-full
            rounded-xl
            border
            border-stone-300
            px-4
            py-3
            outline-none
            transition
            focus:border-[var(--color-brand-accent)]
          "
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-[#823A00]">
          Teléfono
        </label>

        <input
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          pattern="[0-9]{8,15}"
          title="Ingresá entre 8 y 15 números, sin espacios ni guiones."
          className="
            w-full
            rounded-xl
            border
            border-stone-300
            px-4
            py-3
            outline-none
            transition
            focus:border-[var(--color-brand-accent)]
          "
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-[#823A00]">
          Calle
        </label>

        <input
          name="street"
          type="text"
          required
          className="
            w-full
            rounded-xl
            border
            border-stone-300
            px-4
            py-3
            outline-none
            transition
            focus:border-[var(--color-brand-accent)]
          "
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-[#823A00]">
          Ciudad
        </label>

        <CityAutocompleteInput
          name="city"
          required
          className="
            w-full
            rounded-xl
            border
            border-stone-300
            px-4
            py-3
            outline-none
            transition
            focus:border-[var(--color-brand-accent)]
          "
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-[#823A00]">
          Notas
        </label>

        <textarea
          name="notes"
          rows={3}
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-stone-300
            px-4
            py-3
            outline-none
            transition
            focus:border-[var(--color-brand-accent)]
          "
        />
      </div>

      <button
        type="submit"
        disabled={isRedirecting}
        className="
          bg-[var(--color-brand-accent)]
          hover:opacity-90
          text-white
          px-6
          py-3
          rounded-xl
          font-medium
          transition
          disabled:opacity-60
        "
      >
        {isRedirecting ? "Redirigiendo..." : "Guardar perfil"}
      </button>
    </form>
  );
}
