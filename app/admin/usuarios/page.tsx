import { reactivateUser, suspendUser } from "@/app/admin/actions";
import { getAdminUsers } from "@/lib/admin/data";

type AdminUsersPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const users = await getAdminUsers(params.q);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold text-[#0f0f0f]">Usuarios</h2>
        <p className="mt-1 text-sm text-[#6a6a6a]">Busca perfiles y administra suspensiones.</p>
      </header>

      <form className="rounded-3xl bg-white p-4 shadow-sm">
        <input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Buscar por nombre, negocio o comuna"
          className="h-11 w-full rounded-xl border border-[#e8e6e0] px-4 text-sm"
        />
      </form>

      <div className="space-y-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#0f0f0f]">{user.fullName}</h3>
                {user.businessName ? <p className="text-sm text-[#4a4a4a]">{user.businessName}</p> : null}
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8a8a8a]">
                  {user.role} {user.comuna ? `· ${user.comuna}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.isSuspended ? "bg-[#fff1f1] text-[#b91c1c]" : "bg-[#e8f5ee] text-[#115e2c]"
                  }`}
                >
                  {user.isSuspended ? "Suspendido" : "Activo"}
                </span>

                {user.isSuspended ? (
                  <form
                    action={async () => {
                      "use server";
                      await reactivateUser(user.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-[#e8e6e0] px-4 py-2 text-sm font-medium text-[#4a4a4a]"
                    >
                      Reactivar
                    </button>
                  </form>
                ) : (
                  <form
                    action={async () => {
                      "use server";
                      await suspendUser({ userId: user.id });
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Suspender
                    </button>
                  </form>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
