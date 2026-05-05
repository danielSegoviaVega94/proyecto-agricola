"use client";

import { useActionState } from "react";

import type { SubmitRatingState } from "@/app/chat/state";
import { initialSubmitRatingState } from "@/app/chat/state";

type RatingFormProps = {
  action: (
    state: SubmitRatingState,
    formData: FormData,
  ) => Promise<SubmitRatingState>;
  conversationId: string;
  counterpartName: string;
};

export function RatingForm({ action, conversationId, counterpartName }: RatingFormProps) {
  const [state, formAction, pending] = useActionState(action, initialSubmitRatingState);

  return (
    <form action={formAction} className="rounded-2xl border border-[#e8e6e0] bg-[#fafaf7] p-4">
      <input type="hidden" name="conversationId" value={conversationId} />

      <h2 className="text-sm font-semibold text-[#0f0f0f]">Valora este trato</h2>
      <p className="mt-1 text-xs text-[#8a8a8a]">Tu experiencia con {counterpartName}.</p>

      <fieldset className="mt-3">
        <legend className="mb-2 text-xs font-medium text-[#4a4a4a]">Puntaje</legend>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;

            return (
              <label
                key={`score-${value}`}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#e8e6e0] bg-white text-sm font-semibold text-[#0f0f0f]"
              >
                <input type="radio" name="score" value={value} className="sr-only" required />
                {value}
              </label>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="rating-comment" className="mt-3 block text-xs font-medium text-[#4a4a4a]">
        Comentario opcional
      </label>
      <textarea
        id="rating-comment"
        name="comment"
        rows={3}
        className="mt-2 w-full rounded-xl border border-[#e8e6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#16803c]"
        placeholder="Cómo fue el trato, puntualidad, comunicación..."
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#16803c] px-4 text-sm font-semibold text-white disabled:opacity-70"
      >
        Enviar valoración
      </button>

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
  );
}
