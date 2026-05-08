import ProfileForm from "@/components/forms/profile-form";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-6">
        Mi perfil
      </h1>

      <ProfileForm />
    </div>
  );
}