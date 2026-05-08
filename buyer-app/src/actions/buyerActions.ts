"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { registerBuyer } from "@/server/services/buyer.service";

export async function createBuyerAction(
  formData: FormData
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const name =
    formData.get("name")?.toString() || "";

  const phone =
    formData.get("phone")?.toString() || "";

  const email =
    user.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error("Email not found");
  }

  await registerBuyer({
    clerkId: userId,
    name,
    phone,
    email,
  });

  redirect("/dashboard");
}