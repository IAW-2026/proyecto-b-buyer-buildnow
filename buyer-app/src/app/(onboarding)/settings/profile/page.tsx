import { redirect } from "next/navigation";

import ProfileForm from "@/components/forms/profile-form";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { findCurrentBuyer } from "@/server/services/buyer.service";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user.userId) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  const buyer = await findCurrentBuyer(user.userId);

  if (buyer) {
    redirect("/dashboard");
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
