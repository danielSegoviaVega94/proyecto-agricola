import { redirect } from "next/navigation";

import { createProduct, initialCreateProductState } from "@/app/publicar/actions";
import { PublishProductForm } from "@/app/publicar/publish-product-form";
import { getCategoryTree } from "@/lib/categories/get-category-tree";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PublishPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categories = await getCategoryTree();

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-10 pt-6">
        <PublishProductForm categories={categories} initialState={initialCreateProductState} action={createProduct} />
      </main>
    </div>
  );
}
