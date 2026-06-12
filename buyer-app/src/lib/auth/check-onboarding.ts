import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { findCurrentBuyer } from "@/server/services/buyer.service";

export async function checkOnboarding() {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const buyer = await findCurrentBuyer(userId);

  if (!buyer) {
    redirect("/settings/profile?onboarding=true");
  }

}
