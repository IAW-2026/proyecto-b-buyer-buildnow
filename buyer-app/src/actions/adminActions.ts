"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  getOptionalFormValue,
  getRequiredFormValue,
  validatePhone,
} from "@/lib/validation/buyerValidation";
import {
  removeAdminAddress,
  saveAdminAddress,
  saveAdminBuyer,
} from "@/server/services/admin.service";

export async function updateAdminBuyerAction(
  buyerId: string,
  formData: FormData
) {
  await requireAdmin();

  const name = getRequiredFormValue(
    formData,
    "name",
    "El nombre"
  );
  if (!name.success) {
    throw new Error(name.error);
  }

  const phoneValue = getRequiredFormValue(
    formData,
    "phone",
    "El telefono"
  );
  if (!phoneValue.success) {
    throw new Error(phoneValue.error);
  }

  const phone = validatePhone(phoneValue.data);
  if (!phone.success) {
    throw new Error(phone.error);
  }

  await saveAdminBuyer(buyerId, {
    name: name.data,
    phone: phone.data,
  });

  revalidatePath("/admin/buyers");
  revalidatePath(`/admin/buyers/${buyerId}`);
}

export async function updateAdminAddressAction(
  addressId: string,
  formData: FormData
) {
  await requireAdmin();

  const street = getRequiredFormValue(
    formData,
    "street",
    "La calle"
  );
  if (!street.success) {
    throw new Error(street.error);
  }

  const city = getRequiredFormValue(
    formData,
    "city",
    "La ciudad"
  );
  if (!city.success) {
    throw new Error(city.error);
  }

  await saveAdminAddress(addressId, {
    street: street.data,
    city: city.data,
    notes: getOptionalFormValue(formData, "notes"),
  });

  revalidatePath("/admin/addresses");
  revalidatePath(`/admin/addresses/${addressId}`);
}

export async function deleteAdminAddressAction(
  addressId: string
) {
  await requireAdmin();

  await removeAdminAddress(addressId);

  revalidatePath("/admin/addresses");
  redirect("/admin/addresses");
}
