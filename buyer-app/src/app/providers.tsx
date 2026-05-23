"use client";

import { CartProvider } from "@/context/CartContext";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldUseCart =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/register");

  if (!shouldUseCart) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
