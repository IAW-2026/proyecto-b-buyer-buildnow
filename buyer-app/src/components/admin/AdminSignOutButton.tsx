"use client";

import { useClerk } from "@clerk/nextjs";

export default function AdminSignOutButton() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/login" })}
      className="rounded-lg border border-[#F8C58D] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04]"
    >
      Cerrar sesión
    </button>
  );
}
