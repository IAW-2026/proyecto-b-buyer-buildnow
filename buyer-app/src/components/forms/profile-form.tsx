"use client";

import { createBuyerAction } from '@/actions/buyerActions';

export default function ProfileForm() {
  return (
    <form
      action={createBuyerAction}
      className="
        space-y-6
        bg-white
        p-6
        rounded-2xl
        shadow-sm
        border
        border-stone-200
      "
    >
      <div>
        <label className="block mb-2 font-medium text-stone-800">
          Nombre
        </label>

        <input
          name="name"
          type="text"
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
        <label className="block mb-2 font-medium text-stone-800">
          Teléfono
        </label>

        <input
          name="phone"
          type="text"
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

      <button
        type="submit"
        className="
          bg-[var(--color-brand-accent)]
          hover:opacity-90
          text-white
          px-6
          py-3
          rounded-xl
          font-medium
          transition
        "
      >
        Guardar perfil
      </button>
    </form>
  );
}