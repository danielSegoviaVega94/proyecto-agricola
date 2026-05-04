import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SupabaseSmokePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Supabase smoke</h1>
      <p>{user ? "Usuario autenticado." : "Sin sesión activa."}</p>
    </main>
  );
}
