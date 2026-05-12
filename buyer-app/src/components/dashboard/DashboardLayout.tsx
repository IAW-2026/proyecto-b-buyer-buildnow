"use client";

import { useState } from "react";
import CategorySidebar from "@/components/categories/CategorySidebar";
import TopSearchBar from "@/components/search/TopSearchBar";
import StoreQuickViewList from "@/components/stores/StoreQuickViewList";
import CartSidebar from "@/components/cart/CartSidebar";

export default function DashboardLayout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <main className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-[1600px] p-4">
        <TopSearchBar
          showCartButton={true}
          onCartClick={() => setCartOpen(true)}
        />

        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* CATEGORIES */}
          <aside className="col-span-12 lg:col-span-2">
            <CategorySidebar />
          </aside>

          {/* STORES */}
          <section className="col-span-12 lg:col-span-7">
            <StoreQuickViewList />
          </section>

          {/* CART */}
          <aside className="col-span-12 xl:col-span-3">
            <div className="hidden xl:block">
              <CartSidebar />
            </div>
          </aside>
        </div>
      </div>

      {/* CART MODAL */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-w-md w-full mx-4">
            <button
              onClick={() => setCartOpen(false)}
              className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center"
            >
              ✕
            </button>
            <CartSidebar />
          </div>
        </div>
      )}
    </main>
  );
}