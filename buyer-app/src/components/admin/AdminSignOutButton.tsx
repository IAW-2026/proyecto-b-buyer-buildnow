"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function AdminSignOutButton() {
  return (
    <SignOutButton redirectUrl="/login">
      <button
        type="button"
        className="rounded-lg border border-[#F8C58D] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#A76E04]"
      >
        Cerrar sesion
      </button>
    </SignOutButton>
  );
}
