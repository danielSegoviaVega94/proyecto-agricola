import { dismissReport, suspendUser } from "@/app/admin/actions";
import { getAdminReports } from "@/lib/admin/data";

function formatDate(timestamp: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default async function AdminReportsPage() {
  const reports = await getAdminReports();

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold text-[#0f0f0f]">Reportes pendientes</h2>
        <p className="mt-1 text-sm text-[#6a6a6a]">
          Revisa la conversación reportada y decide si corresponde suspender al usuario o descartar el caso.
        </p>
      </header>

      {reports.length === 0 ? (
        <article className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-[#4a4a4a]">No hay reportes pendientes.</p>
        </article>
      ) : (
        reports.map((report) => (
          <article key={report.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8a8a8a]">
                  {formatDate(report.createdAt)}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[#0f0f0f]">
                  {report.reporterName} reporta a {report.reportedName}
                </h3>
                <p className="mt-2 text-sm text-[#4a4a4a]">{report.reason}</p>
              </div>

              <div className="flex gap-2">
                {report.reportedUserId ? (
                  <form
                    action={async () => {
                      "use server";
                      await suspendUser({
                        userId: report.reportedUserId!,
                        reportId: report.id,
                      });
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Suspender
                    </button>
                  </form>
                ) : null}

                <form
                  action={async () => {
                    "use server";
                    await dismissReport(report.id);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-[#e8e6e0] px-4 py-2 text-sm font-medium text-[#4a4a4a]"
                  >
                    Descartar
                  </button>
                </form>
              </div>
            </div>

            {report.messages.length > 0 ? (
              <div className="mt-4 rounded-2xl bg-[#fafaf7] p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8a8a8a]">
                  Conversación reportada
                </p>
                <div className="space-y-2">
                  {report.messages.map((message) => (
                    <div key={message.id} className="rounded-2xl border border-[#ece8de] bg-white px-3 py-2">
                      <p className="text-sm text-[#0f0f0f]">{message.content}</p>
                      <p className="mt-1 text-[11px] text-[#8a8a8a]">{formatDate(message.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ))
      )}
    </section>
  );
}
