"use client";

import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";

import type { PublishProductFormValues } from "@/app/publicar/publish-product-form";

type ProductImageUploaderProps = {
  control: Control<PublishProductFormValues>;
  register: UseFormRegister<PublishProductFormValues>;
};

export function ProductImageUploader({ control, register }: ProductImageUploaderProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "imagePaths",
  });

  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-[#0f0f0f]">Imágenes del producto</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`products/<product_id>/${index + 1}.jpg`}
            {...register(`imagePaths.${index}.path`)}
            className="h-10 w-full rounded-lg border border-[#e8e6e0] px-3 text-sm"
          />
          <button type="button" onClick={() => remove(index)} className="text-xs font-medium text-[#b91c1c]">
            Quitar
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ path: "" })}
        className="h-10 rounded-lg border border-[#e8e6e0] px-3 text-sm font-medium text-[#0f0f0f]"
      >
        Agregar ruta de imagen
      </button>
    </section>
  );
}
