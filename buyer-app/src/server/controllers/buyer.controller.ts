import {
  findCurrentBuyer,
  getCurrentBuyer,
  registerBuyer,
} from "../services/buyer.service";
import { NextResponse } from "next/server";
import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { assignBuyerRole } from "@/lib/auth/assignBuyerRole";
import {
  ForbiddenError,
  requireBuyer,
  UnauthorizedError,
} from "@/lib/auth/requireBuyer";
import { validatePhone } from "@/lib/validation/buyerValidation";

function authErrorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  return null;
}


export async function getMeController() {
  try {
    const { userId } = await requireBuyer();

    const buyer = await getCurrentBuyer(userId);

    return NextResponse.json(buyer, {
      status: 200,
    });
  } catch (error) {
    const response = authErrorResponse(error);

    if (response) {
      return response;
    }

    console.error(error);

    return NextResponse.json(
      {
        message: "Buyer not found",
      },
      {
        status: 404,
      }
    );
  }
}

export async function createBuyerController(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    const existingBuyer =
      await findCurrentBuyer(userId);

    if (existingBuyer) {
      return NextResponse.json(existingBuyer, {
        status: 200,
      });
    }

    const body = await req.json();
    const email =
      user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { message: "Email no encontrado" },
        { status: 400 }
      );
    }

    const name = body.name?.toString().trim() ?? "";
    const phone = body.phone?.toString().trim() ?? "";
    const street =
      body.address?.street?.toString().trim() ??
      body.street?.toString().trim() ??
      "";
    const city =
      body.address?.city?.toString().trim() ??
      body.city?.toString().trim() ??
      "";
    const notes =
      body.address?.notes?.toString().trim() ??
      body.notes?.toString().trim() ??
      undefined;

    if (!name) {
      return NextResponse.json(
        { message: "El nombre es requerido." },
        { status: 400 }
      );
    }

    const validPhone = validatePhone(phone);

    if (!validPhone.success) {
      return NextResponse.json(
        { message: validPhone.error },
        { status: 400 }
      );
    }

    if (!street || !city) {
      return NextResponse.json(
        { message: "La calle y la ciudad son requeridas." },
        { status: 400 }
      );
    }

    const buyer = await registerBuyer({
      clerkId: userId,
      name,
      phone: validPhone.data,
      email,
      address: {
        street,
        city,
        notes,
      },
    });

    await assignBuyerRole(userId);

    return NextResponse.json(buyer, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal error",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
