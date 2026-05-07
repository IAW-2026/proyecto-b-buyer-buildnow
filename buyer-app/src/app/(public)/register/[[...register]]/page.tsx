import { SignUp } from "@clerk/nextjs";

//  # Rutas sin autenticación
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp />
    </main>
  );
}