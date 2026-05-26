"use server";

import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import {
  findCurrentBuyer,
  deleteBuyerAccount,
  getCurrentBuyer,
  registerBuyer,
  updateBuyerProfile,
} from "@/server/services/buyer.service";
import { assignBuyerRole } from "@/lib/auth/assignBuyerRole";
import { requireBuyer } from "@/lib/auth/requireBuyer";
import {
  getOptionalFormValue,
  getRequiredFormValue,
  validatePhone,
} from "@/lib/validation/buyerValidation";
import type { ActionResponse } from "@/types/action-response";

function getPrimaryEmailFromClerkUser(
  user: Awaited<ReturnType<typeof currentUser>>
) {
  if (!user) return null;

  const primaryEmail = user.emailAddresses.find(
    (emailAddress) =>
      emailAddress.id === user.primaryEmailAddressId
  )?.emailAddress;

  return (
    primaryEmail ??
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function createBuyerAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Debes iniciar sesión",
      };
    }

    const existingBuyer = await findCurrentBuyer(userId);

    if (existingBuyer) {
      return {
        success: true,
      };
    }

    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        error: "Usuario no encontrado",
      };
    }

    const nameResult = getRequiredFormValue(
      formData,
      "name",
      "El nombre"
    );

    if (!nameResult.success) {
      return {
        success: false,
        error: nameResult.error,
      };
    }

    const phoneResult = getRequiredFormValue(
      formData,
      "phone",
      "El telefono"
    );

    if (!phoneResult.success) {
      return {
        success: false,
        error: phoneResult.error,
      };
    }

    const validPhone = validatePhone(phoneResult.data);

    if (!validPhone.success) {
      return {
        success: false,
        error: validPhone.error,
      };
    }

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

    const email = getPrimaryEmailFromClerkUser(user);

    if (!email) {
      return {
        success: false,
        error: "Email no encontrado",
      };
    }

    await registerBuyer({
      clerkId: userId,
      name: nameResult.data,
      phone: validPhone.data,
      email,
      address: {
        street: streetResult.data,
        city: cityResult.data,
        notes: getOptionalFormValue(formData, "notes"),
      },
    });

    await assignBuyerRole(userId);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "BUYER_ALREADY_EXISTS"
    ) {
      return {
        success: false,
        error: "El comprador ya existe",
      };
    }

    return {
      success: false,
      error: "Ocurrió un error al registrar el comprador",
    };
  }
}

export async function getCurrentBuyerAction(): Promise<
  ActionResponse<Awaited<ReturnType<typeof getCurrentBuyer>>>
> {
  try {
    const { userId } = await requireBuyer();
    const buyer = await getCurrentBuyer(userId);

    return {
      success: true,
      data: buyer,
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
      error: "Ocurrió un error al obtener los datos",
    };
  }
}

export async function updateBuyerProfileAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();

    const nameResult = getRequiredFormValue(
      formData,
      "name",
      "El nombre"
    );

    if (!nameResult.success) {
      return {
        success: false,
        error: nameResult.error,
      };
    }

    const phoneResult = getRequiredFormValue(
      formData,
      "phone",
      "El telefono"
    );

    if (!phoneResult.success) {
      return {
        success: false,
        error: phoneResult.error,
      };
    }

    const validPhone = validatePhone(phoneResult.data);

    if (!validPhone.success) {
      return {
        success: false,
        error: validPhone.error,
      };
    }

    await updateBuyerProfile(userId, {
      name: nameResult.data,
      phone: validPhone.data,
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
      error: "Ocurrió un error al actualizar el perfil",
    };
  }
}

export async function deleteBuyerAccountAction(): Promise<ActionResponse> {
  try {
    const { userId } = await requireBuyer();

    await deleteBuyerAccount(userId);

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
      error: "Ocurrió un error al eliminar la cuenta",
    };
  }
}
