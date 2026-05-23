"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopSearchBar from "@/components/search/TopSearchBar";
import {
  getCurrentBuyerAction,
  updateBuyerProfileAction,
  addAddressAction,
  editAddressAction,
  removeAddressAction,
} from "@/actions/buyerActions";
import AddressCard from "@/components/addresses/AddressCard";
import AddressForm from "@/components/addresses/AddressForm";

interface Buyer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  addresses: Array<{
    id: string;
    street: string;
    city: string;
    notes: string | null;
  }>;
}

export default function MePage() {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] =
    useState(false);
  const [editingAddress, setEditingAddress] = useState<
    Buyer["addresses"][0] | null
  >(null);
  const [isDeletingAddress, setIsDeletingAddress] =
    useState(false);
  const [addressToDelete, setAddressToDelete] = useState<
    Buyer["addresses"][0] | null
  >(null);
  const [formError, setFormError] = useState<string | null>(
    null
  );

  // Fetch buyer data
  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        const response =
          await getCurrentBuyerAction();

        if (response.success && response.data) {
          setBuyer(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyer();
  }, []);

  const handleUpdateProfile = async (
    formData: FormData
  ) => {
    try {
      setFormError(null);
      const response =
        await updateBuyerProfileAction(formData);

      if (response.success) {
        const updatedBuyer =
          await getCurrentBuyerAction();

        if (
          updatedBuyer.success &&
          updatedBuyer.data
        ) {
          setBuyer(updatedBuyer.data);
          setIsEditing(false);
        }
      } else {
        setFormError(
          response.error ||
          "Error al actualizar el perfil"
        );
      }
    } catch (error) {
      console.error(error);
      setFormError("Error al actualizar el perfil");
    }
  };

  const handleAddAddress = async (
    formData: FormData
  ) => {
    try {
      setFormError(null);
      const response =
        await addAddressAction(formData);

      if (response.success) {
        const updatedBuyer =
          await getCurrentBuyerAction();

        if (
          updatedBuyer.success &&
          updatedBuyer.data
        ) {
          setBuyer(updatedBuyer.data);
          setIsAddingAddress(false);
        }
      } else {
        setFormError(
          response.error ||
          "Error al agregar la dirección"
        );
      }
    } catch (error) {
      console.error(error);
      setFormError("Error al agregar la dirección");
    }
  };

  const handleEditAddress = async (
    formData: FormData
  ) => {
    if (!editingAddress) return;

    try {
      setFormError(null);
      const response =
        await editAddressAction(
          editingAddress.id,
          formData
        );

      if (response.success) {
        const updatedBuyer =
          await getCurrentBuyerAction();

        if (
          updatedBuyer.success &&
          updatedBuyer.data
        ) {
          setBuyer(updatedBuyer.data);
          setEditingAddress(null);
        }
      } else {
        setFormError(
          response.error ||
          "Error al editar la dirección"
        );
      }
    } catch (error) {
      console.error(error);
      setFormError("Error al editar la dirección");
    }
  };

  const handleDeleteAddress = (
    addressId: string
  ) => {
    const address = buyer?.addresses.find(
      (item) => item.id === addressId
    );

    if (address) {
      setFormError(null);
      setAddressToDelete(address);
      return;
    }

  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsDeletingAddress(true);

    try {
      const response = await removeAddressAction(
        addressToDelete.id
      );

      if (response.success) {
        const updatedBuyer =
          await getCurrentBuyerAction();

        if (
          updatedBuyer.success &&
          updatedBuyer.data
        ) {
          setBuyer(updatedBuyer.data);
        }

        setAddressToDelete(null);
      } else {
        setFormError(
          response.error ||
          "Error al eliminar la dirección"
        );
      }
    } catch (error) {
      console.error(error);
      setFormError("Error al eliminar la dirección");
    } finally {
      setIsDeletingAddress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <TopSearchBar showSearch={false} />
        <div className="flex items-center justify-center py-20">
          <p className="text-stone-600">
            Cargando datos...
          </p>
        </div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="min-h-screen bg-stone-50">
        <TopSearchBar showSearch={false} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-stone-600">
            Error al cargar los datos
          </p>
          <Link
            href="/dashboard"
            className="text-orange-600 hover:underline"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <TopSearchBar showSearch={false} />

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {/* PROFILE SECTION */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900">
              Mi perfil
            </h2>
            <button
              onClick={() =>
                setIsEditing(!isEditing)
              }
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:opacity-90 transition"
            >
              {isEditing
                ? "Cancelar"
                : "Editar"}
            </button>
          </div>

          {isEditing ? (
            <form
              action={handleUpdateProfile}
              className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={buyer.name || ""}
                  required
                  className="w-full rounded-lg border border-stone-300 px-4 py-2 outline-none transition focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={buyer.phone || ""}
                  required
                  inputMode="numeric"
                  pattern="[0-9]{8,15}"
                  title="Ingresá entre 8 y 15 números, sin espacios ni guiones."
                  className="w-full rounded-lg border border-stone-300 px-4 py-2 outline-none transition focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={buyer.email}
                  disabled
                  className="w-full rounded-lg border border-stone-300 px-4 py-2 outline-none bg-stone-100 text-stone-600"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-orange-500 text-white hover:opacity-90 transition"
              >
                Guardar cambios
              </button>
            </form>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-sm text-stone-600 mb-1">
                  Nombre
                </p>
                <p className="text-lg font-medium text-stone-900">
                  {buyer.name || "No especificado"}
                </p>
              </div>

              <div>
                <p className="text-sm text-stone-600 mb-1">
                  Email
                </p>
                <p className="text-lg font-medium text-stone-900">
                  {buyer.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-stone-600 mb-1">
                  Teléfono
                </p>
                <p className="text-lg font-medium text-stone-900">
                  {buyer.phone || "No especificado"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ADDRESSES SECTION */}
        <section id="addresses">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              Mis direcciones
            </h2>
            <p className="text-sm text-stone-600">
              {buyer.addresses.length === 0
                ? "No tienes direcciones agregadas"
                : `Tienes ${buyer.addresses.length} dirección${buyer.addresses.length !== 1 ? "es" : ""}`}
            </p>
          </div>

          {/* ADD ADDRESS FORM - Always visible */}
          {isAddingAddress && (
            <div className="mb-6">
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={() =>
                  setIsAddingAddress(false)
                }
              />
            </div>
          )}

          {/* EDIT ADDRESS FORM */}
          {editingAddress && (
            <div className="mb-6">
              <AddressForm
                initialAddress={editingAddress}
                onSubmit={handleEditAddress}
                onCancel={() =>
                  setEditingAddress(null)
                }
              />
            </div>
          )}

          {/* ADDRESSES LIST */}
          {buyer.addresses.length > 0 ? (
            <>
              <div className="space-y-4 mb-6">
                {buyer.addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={() =>
                      setEditingAddress(address)
                    }
                    onDelete={handleDeleteAddress}
                    isDeleting={isDeletingAddress}
                  />
                ))}
              </div>

              {!isAddingAddress && !editingAddress && (
                <button
                  onClick={() => {
                    setIsAddingAddress(true);
                    setEditingAddress(null);
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-stone-300 text-stone-700 rounded-xl hover:border-orange-500 hover:text-orange-600 transition font-medium"
                >
                  + Agregar nueva dirección
                </button>
              )}
            </>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
              <p className="text-stone-600 mb-4">
                No tienes direcciones agregadas
              </p>
              {!isAddingAddress && (
                <button
                  onClick={() =>
                    setIsAddingAddress(true)
                  }
                  className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:opacity-90 transition font-medium"
                >
                  Agregar primera dirección
                </button>
              )}
            </div>
          )}
        </section>

        {/* BACK TO DASHBOARD */}
        <div className="flex justify-center pt-6">
          <Link
            href="/dashboard"
            className="text-stone-600 hover:text-orange-600 transition"
          >
            ← Volver al dashboard
          </Link>
        </div>
      </div>

      {addressToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-950">
              Eliminar dirección
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              ¿Estás seguro de que querés eliminar esta dirección?
            </p>
            <div className="mt-4 rounded-xl bg-stone-50 p-4 text-sm text-stone-700">
              <p className="font-medium text-stone-950">
                {addressToDelete.street}
              </p>
              <p>{addressToDelete.city}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={isDeletingAddress}
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAddress}
                disabled={isDeletingAddress}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingAddress
                  ? "Eliminando..."
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
