import { redirect } from "next/navigation";

import { createProduct } from "@/app/publicar/actions";
import { PublishProductForm } from "@/app/publicar/publish-product-form";
import { initialCreateProductState } from "@/app/publicar/state";
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

  const { data: profile } = await supabase
    .from("users")
    .select("is_suspended")
    .eq("id", user.id)
    .maybeSingle();

  const categories = await getCategoryTree();

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-10 pt-6">
        {profile?.is_suspended ? (
          <div className="mb-4 rounded-2xl border border-[#f2d5d5] bg-[#fff5f5] px-4 py-3 text-sm text-[#b91c1c]">
            Tu cuenta está suspendida. No puedes crear nuevas publicaciones hasta que el equipo revise tu caso.
          </div>
        ) : null}
        <PublishProductForm categories={categories} initialState={initialCreateProductState} action={createProduct} />
      </main>
    </div>
  );
}
