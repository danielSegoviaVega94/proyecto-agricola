import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PerfilIndexPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/perfil");
  }

  redirect(`/perfil/${user.id}`);
}
