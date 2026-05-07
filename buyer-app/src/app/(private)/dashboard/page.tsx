import { UserButton } from "@clerk/nextjs";

//  # Rutas con autenticación
export default function StoresPage() {
  return (
    <main className="p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          dashboard
        </h1>

        <UserButton />
      </div>

      <p className="mt-6">
        Ruta privada funcionando correctamente.
      </p>
    </main>
  );
}