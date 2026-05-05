import Link from "next/link";

import { requireAdminUser } from "@/lib/admin/require-admin-user";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminUser();

  return (
    <div className="min-h-screen bg-[#f5f2ea]">
      <main className="mx-auto min-h-screen w-full max-w-[960px] px-4 py-6">
        <header className="mb-6 rounded-3xl bg-[#173322] px-5 py-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#c8dfd0]">Panel admin</p>
              <h1 className="mt-1 text-2xl font-semibold">Moderación de Tierra</h1>
            </div>
            <nav className="flex gap-2">
              <Link href="/admin" className="rounded-full bg-[#254a33] px-4 py-2 text-sm font-medium">
                Resumen
              </Link>
              <Link href="/admin/reportes" className="rounded-full bg-[#254a33] px-4 py-2 text-sm font-medium">
                Reportes
              </Link>
              <Link href="/admin/usuarios" className="rounded-full bg-[#254a33] px-4 py-2 text-sm font-medium">
                Usuarios
              </Link>
            </nav>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
