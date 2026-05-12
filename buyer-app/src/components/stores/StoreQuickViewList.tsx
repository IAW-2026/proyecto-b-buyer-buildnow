"use client";

import { useEffect, useState } from "react";
import StoreQuickViewRow from "./StoreQuickViewRow";
import { fetchStoresAction } from "@/actions/buyerActions";
import type { Store } from "@/lib/apiClients/sellerApi";

export default function StoreQuickViewList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await fetchStoresAction();
        setStores(data);
      } catch (error) {
        console.error("Failed to load stores:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  if (loading) {
    return <div className="text-stone-400">Cargando tiendas...</div>;
  }

  return (
    <div className="space-y-4">
      {stores.map((store) => (
        <StoreQuickViewRow
          key={store.id}
          storeId={store.id}
          name={store.name}
          status={store.status}
        />
      ))}
    </div>
  );
}
