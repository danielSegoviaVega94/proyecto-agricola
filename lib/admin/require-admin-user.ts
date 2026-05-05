import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  role: "admin";
  fullName: string | null;
};

export async function requireAdminUser(): Promise<AdminUser> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "admin") {
    redirect("/");
  }

  return {
    id: profile.id,
    role: "admin",
    fullName: profile.full_name,
  };
}
