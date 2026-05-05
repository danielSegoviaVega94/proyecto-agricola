"use server";

import { revalidatePath } from "next/cache";

import type { CreateProductState } from "@/app/publicar/state";
import { createProductSchema } from "@/lib/products/product-schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function parseCreateProductFormData(formData: FormData) {
  const tierMinValues = formData.getAll("tier_min_quantity");
  const tierPriceValues = formData.getAll("tier_price_per_unit");

  const priceTiers = tierMinValues.map((minQuantity, index) => ({
    minQuantity: Number(minQuantity),
    pricePerUnit: Number(tierPriceValues[index] ?? NaN),
  }));

  const imagePaths = formData
    .getAll("image_path")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? "").trim(),
    measureUnit: String(formData.get("measureUnit") ?? "").trim(),
    stock: Number(formData.get("stock") ?? NaN),
    comuna: String(formData.get("comuna") ?? "").trim(),
    priceTiers,
    imagePaths,
  };
}

export async function createProduct(
  _prevState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: "Debes iniciar sesión para publicar.",
      redirectTo: null,
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, is_suspended")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_suspended) {
    return {
      status: "error",
      message: "Tu cuenta está suspendida y no puede publicar nuevos productos.",
      redirectTo: null,
    };
  }

  const parsed = createProductSchema.safeParse(parseCreateProductFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Datos inválidos para la publicación.",
      redirectTo: null,
    };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      seller_id: user.id,
      category_id: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      measure_unit: parsed.data.measureUnit,
      stock: parsed.data.stock,
      comuna: parsed.data.comuna,
      status: "active",
    })
    .select("id")
    .single();

  if (productError || !product) {
    return {
      status: "error",
      message: "No fue posible crear la publicación.",
      redirectTo: null,
    };
  }

  const { error: tiersError } = await supabase.from("price_tiers").insert(
    parsed.data.priceTiers.map((tier) => ({
      product_id: product.id,
      min_quantity: tier.minQuantity,
      price_per_unit: tier.pricePerUnit,
    })),
  );

  if (tiersError) {
    return {
      status: "error",
      message: "No fue posible guardar los tramos de precio.",
      redirectTo: null,
    };
  }

  if (parsed.data.imagePaths.length > 0) {
    const { error: imagesError } = await supabase.from("product_images").insert(
      parsed.data.imagePaths.map((path, index) => ({
        product_id: product.id,
        storage_path: path,
        sort_order: index,
      })),
    );

    if (imagesError) {
      return {
        status: "error",
        message: "No fue posible guardar las imágenes.",
        redirectTo: null,
      };
    }
  }

  const redirectTo = `/perfil/${user.id}`;
  revalidatePath(redirectTo);

  return {
    status: "success",
    message: "Publicación creada correctamente.",
    redirectTo,
  };
}
