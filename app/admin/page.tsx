import Link from "next/link";

import { getAdminReports, getAdminUsers } from "@/lib/admin/data";

export default async function AdminDashboardPage() {
  const [reports, users] = await Promise.all([getAdminReports(), getAdminUsers()]);
  const suspendedUsers = users.filter((user) => user.isSuspended).length;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm text-[#8a8a8a]">Reportes pendientes</p>
        <p className="mt-2 text-3xl font-semibold text-[#0f0f0f]">{reports.length}</p>
        <Link href="/admin/reportes" className="mt-4 inline-block text-sm font-medium text-[#115e2c] underline">
          Revisar reportes
        </Link>
      </article>

      <article className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm text-[#8a8a8a]">Usuarios suspendidos</p>
        <p className="mt-2 text-3xl font-semibold text-[#0f0f0f]">{suspendedUsers}</p>
        <Link href="/admin/usuarios" className="mt-4 inline-block text-sm font-medium text-[#115e2c] underline">
          Gestionar usuarios
        </Link>
      </article>

      <article className="rounded-3xl bg-[#e8f5ee] p-5 shadow-sm">
        <p className="text-sm text-[#115e2c]">Prioridad operativa</p>
        <p className="mt-2 text-lg font-semibold text-[#0f0f0f]">
          Resolver reportes y suspender cuentas cuando corresponda.
        </p>
      </article>
    </section>
  );
}
