"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import type { CategoryTreeNode } from "@/lib/categories/get-category-tree";
import { createProductSchema } from "@/lib/products/product-schema";
import type { CreateProductState } from "@/app/publicar/state";
import { CategoryPicker } from "@/components/category-picker";
import { PriceTierEditor } from "@/components/products/price-tier-editor";
import { ProductImageUploader } from "@/components/products/product-image-uploader";

const publishProductFormSchema = createProductSchema.extend({
  imagePaths: z.array(z.object({ path: z.string().min(1) })),
});

export type PublishProductFormValues = z.infer<typeof publishProductFormSchema>;

type PublishProductFormProps = {
  categories: CategoryTreeNode[];
  initialState: CreateProductState;
  action: (state: CreateProductState, formData: FormData) => Promise<CreateProductState>;
};

export function PublishProductForm({ categories, initialState, action }: PublishProductFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PublishProductFormValues>({
    resolver: zodResolver(publishProductFormSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      measureUnit: "kg",
      stock: 0,
      comuna: "",
      priceTiers: [{ minQuantity: 0, pricePerUnit: 1 }],
      imagePaths: [],
    },
  });

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("categoryId", values.categoryId);
    formData.set("measureUnit", values.measureUnit);
    formData.set("stock", String(values.stock));
    formData.set("comuna", values.comuna);

    values.priceTiers.forEach((tier) => {
      formData.append("tier_min_quantity", String(tier.minQuantity));
      formData.append("tier_price_per_unit", String(tier.pricePerUnit));
    });

    values.imagePaths.forEach((imagePath) => {
      if (imagePath.path.trim()) {
        formData.append("image_path", imagePath.path.trim());
      }
    });

    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-[#0f0f0f]">Publicar producto</h1>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Título
        </label>
        <input id="title" type="text" {...register("title")} className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Descripción
        </label>
        <textarea id="description" {...register("description")} className="min-h-24 w-full rounded-xl border border-[#e8e6e0] px-4 py-3 text-base" />
      </div>

      <CategoryPicker categories={categories} name="categoryId" selectProps={register("categoryId")} />

      <div>
        <label htmlFor="measureUnit" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Unidad de medida
        </label>
        <select id="measureUnit" {...register("measureUnit")} className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base">
          <option value="kg">kg</option>
          <option value="unit">unidad</option>
          <option value="box">caja</option>
          <option value="bag">saco</option>
          <option value="liter">litro</option>
        </select>
      </div>

      <div>
        <label htmlFor="stock" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Stock
        </label>
        <input id="stock" type="number" min="0" step="1" {...register("stock", { valueAsNumber: true })} className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base" />
      </div>

      <div>
        <label htmlFor="comuna" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Comuna
        </label>
        <input id="comuna" type="text" {...register("comuna")} className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base" />
      </div>

      <PriceTierEditor control={control} register={register} errors={errors} />
      <ProductImageUploader control={control} register={register} />

      <button type="submit" disabled={isPending} className="h-12 w-full rounded-xl bg-[#16803c] text-base font-semibold text-white disabled:opacity-70">
        Guardar publicación
      </button>

      {state.message ? <p className={`text-sm ${state.status === "error" ? "text-[#b91c1c]" : "text-[#115e2c]"}`}>{state.message}</p> : null}
    </form>
  );
}
