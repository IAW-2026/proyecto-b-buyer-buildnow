import { SignIn } from "@clerk/nextjs";

//  # Rutas sin autenticación
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignIn forceRedirectUrl="/" />
    </main>
  );
}
