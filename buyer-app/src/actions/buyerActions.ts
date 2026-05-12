"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { findCurrentBuyer, registerBuyer, } from "@/server/services/buyer.service";

export async function createBuyerAction( formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingBuyer = await findCurrentBuyer(userId);

  if (existingBuyer) {
    redirect("/dashboard");
  }

  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const name = formData.get("name")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const street = formData.get("street") as string;
  const city = formData.get("city") as string;
  const notes = formData.get("notes") as string;
  const email = user.emailAddresses?.[0]?.emailAddress;


  if (!email) {
    throw new Error("Email not found");
  }

  await registerBuyer({
    clerkId: userId,
    name,
    phone,
    email,

    address: {
      street,
      city,
      notes,
    },
  });

  redirect("/dashboard");
}