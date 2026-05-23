"use server";

import {
  addAddress,
  editAddress,
  removeAddress,
} from "@/server/services/buyer.service";
import { requireBuyer } from "@/lib/auth/requireBuyer";
import {
  getOptionalFormValue,
  getRequiredFormValue,
} from "@/lib/validation/buyerValidation";
import type { ActionResponse } from "@/types/action-response";

export async function addAddressAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();

    const streetResult = getRequiredFormValue(
      formData,
      "street",
      "La calle"
    );

    if (!streetResult.success) {
      return {
        success: false,
        error: streetResult.error,
      };
    }

    const cityResult = getRequiredFormValue(
      formData,
      "city",
      "La ciudad"
    );

    if (!cityResult.success) {
      return {
        success: false,
        error: cityResult.error,
      };
    }

    await addAddress(userId, {
      street: streetResult.data,
      city: cityResult.data,
      notes: getOptionalFormValue(formData, "notes"),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    return {
      success: false,
      error: "Ocurrió un error al agregar la dirección",
    };
  }
}

export async function editAddressAction(
  addressId: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();

    const streetResult = getRequiredFormValue(
      formData,
      "street",
      "La calle"
    );

    if (!streetResult.success) {
      return {
        success: false,
        error: streetResult.error,
      };
    }

    const cityResult = getRequiredFormValue(
      formData,
      "city",
      "La ciudad"
    );

    if (!cityResult.success) {
      return {
        success: false,
        error: cityResult.error,
      };
    }

    await editAddress(userId, addressId, {
      street: streetResult.data,
      city: cityResult.data,
      notes: getOptionalFormValue(formData, "notes"),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    if (
      error instanceof Error &&
      error.message === "ADDRESS_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Dirección no encontrada",
      };
    }

    return {
      success: false,
      error: "Ocurrió un error al editar la dirección",
    };
  }
}

export async function removeAddressAction(
  addressId: string
): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();
    await removeAddress(userId, addressId);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Comprador no encontrado",
      };
    }

    if (
      error instanceof Error &&
      error.message === "ADDRESS_NOT_FOUND"
    ) {
      return {
        success: false,
        error: "Dirección no encontrada",
      };
    }

    return {
      success: false,
      error: "Ocurrió un error al eliminar la dirección",
    };
  }
}
