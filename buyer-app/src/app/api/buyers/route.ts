import { createBuyerController, getMeController } from "@/server/controllers/buyer.controller";

export async function POST(req: Request) {
  return createBuyerController(req);
}

export async function GET() {
    return getMeController();
}