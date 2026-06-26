import { redirect } from "next/navigation";

import ProfileForm from "@/components/forms/profile-form";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  BuyerDisabledError,
  BuyerNotFoundError,
  ForbiddenError,
  requireBuyer,
} from "@/lib/auth/requireBuyer";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user.userId) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  try {
    await requireBuyer();
    redirect("/dashboard");
  } catch (error) {
    if (
      error instanceof BuyerNotFoundError ||
      error instanceof ForbiddenError
    ) {
      // A buyer record is created by the onboarding form below.
    } else if (error instanceof BuyerDisabledError) {
      redirect("/account-disabled");
    } else {
      throw error;
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-6">
        Mi perfil
      </h1>

      <ProfileForm />
    </div>
  );
}
