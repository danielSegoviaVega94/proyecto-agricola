"use client";

import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import type { PublishProductFormValues } from "@/app/publicar/publish-product-form";

type PriceTierEditorProps = {
  control: Control<PublishProductFormValues>;
  register: UseFormRegister<PublishProductFormValues>;
  errors: FieldErrors<PublishProductFormValues>;
};

export function PriceTierEditor({ control, register, errors }: PriceTierEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "priceTiers",
  });

  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-[#0f0f0f]">Tramos de precio</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-xl border border-[#e8e6e0] p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-[#4a4a4a]">Cantidad mínima</label>
              <input
                type="number"
                step="1"
                min="0"
                {...register(`priceTiers.${index}.minQuantity`, { valueAsNumber: true })}
                className="h-10 w-full rounded-lg border border-[#e8e6e0] px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#4a4a4a]">Precio por unidad</label>
              <input
                type="number"
                step="1"
                min="1"
                {...register(`priceTiers.${index}.pricePerUnit`, { valueAsNumber: true })}
                className="h-10 w-full rounded-lg border border-[#e8e6e0] px-3 text-sm"
              />
            </div>
          </div>
          {fields.length > 1 ? (
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-2 text-xs font-medium text-[#b91c1c]"
            >
              Eliminar tramo
            </button>
          ) : null}
        </div>
      ))}
      {errors.priceTiers?.message ? <p className="text-sm text-[#b91c1c]">{errors.priceTiers.message}</p> : null}
      <button
        type="button"
        onClick={() => append({ minQuantity: 0, pricePerUnit: 1 })}
        className="h-10 rounded-lg border border-[#e8e6e0] px-3 text-sm font-medium text-[#0f0f0f]"
      >
        Agregar tramo
      </button>
    </section>
  );
}
