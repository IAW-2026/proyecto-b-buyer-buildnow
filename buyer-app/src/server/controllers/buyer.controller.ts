import { getCurrentBuyer, registerBuyer, } from "../services/buyer.service";
import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { auth } from "@clerk/nextjs/server";


export async function getMeController() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const buyer = await getCurrentBuyer(userId);

    return NextResponse.json(buyer, {
      status: 200,
    });
  } catch (error) {
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
    const body = await req.json();

    const buyer = await registerBuyer(body);

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
