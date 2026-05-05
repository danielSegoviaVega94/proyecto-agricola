"use client";

import { useActionState, useState } from "react";

import {
  initialSubmitReportState,
  type SubmitReportState,
} from "@/app/chat/actions";

type ReportButtonProps = {
  action: (
    state: SubmitReportState,
    formData: FormData,
  ) => Promise<SubmitReportState>;
  conversationId: string;
  counterpartName: string;
};

export function ReportButton({
  action,
  conversationId,
  counterpartName,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialSubmitReportState);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#f2d5d5] bg-[#fff5f5] px-4 text-sm font-semibold text-[#b91c1c]"
      >
        Reportar usuario
      </button>

      {isOpen ? (
        <form action={formAction} className="mt-3 rounded-2xl border border-[#f2d5d5] bg-[#fffafa] p-4">
          <input type="hidden" name="conversationId" value={conversationId} />
          <h2 className="text-sm font-semibold text-[#0f0f0f]">Reportar a {counterpartName}</h2>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Describe el motivo para que el equipo pueda revisarlo.
          </p>
          <textarea
            name="reason"
            rows={4}
            required
            minLength={5}
            placeholder="Ejemplo: lenguaje ofensivo, intento de estafa, incumplimiento reiterado..."
            className="mt-3 w-full rounded-xl border border-[#e8e6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#b91c1c]"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#b91c1c] px-4 text-sm font-semibold text-white disabled:opacity-70"
            >
              Enviar reporte
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#e8e6e0] px-4 text-sm font-medium text-[#4a4a4a]"
            >
              Cancelar
            </button>
          </div>
          {state.message ? (
            <p
              className={`mt-2 text-xs ${
                state.status === "error" ? "text-[#b91c1c]" : "text-[#115e2c]"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
