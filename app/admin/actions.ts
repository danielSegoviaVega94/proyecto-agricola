"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin/require-admin-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminActionResult = {
  status: "success" | "error";
  message: string;
};

export async function suspendUser(input: {
  userId: string;
  reportId?: string;
}): Promise<AdminActionResult> {
  if (!input.userId) {
    return {
      status: "error",
      message: "No encontramos el usuario a suspender.",
    };
  }

  const admin = await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const { error: userError } = await supabase
    .from("users")
    .update({ is_suspended: true })
    .eq("id", input.userId);

  if (userError) {
    return {
      status: "error",
      message: "No fue posible suspender al usuario.",
    };
  }

  if (input.reportId) {
    const { error: reportError } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        resolved_by: admin.id,
      })
      .eq("id", input.reportId);

    if (reportError) {
      return {
        status: "error",
        message: "No fue posible resolver el reporte asociado.",
      };
    }
  }

  revalidatePath("/admin/reportes");
  revalidatePath("/admin/usuarios");

  return {
    status: "success",
    message: "Usuario suspendido correctamente.",
  };
}

export async function reactivateUser(userId: string): Promise<AdminActionResult> {
  if (!userId) {
    return {
      status: "error",
      message: "No encontramos el usuario a reactivar.",
    };
  }

  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("users")
    .update({ is_suspended: false })
    .eq("id", userId);

  if (error) {
    return {
      status: "error",
      message: "No fue posible reactivar al usuario.",
    };
  }

  revalidatePath("/admin/usuarios");

  return {
    status: "success",
    message: "Usuario reactivado correctamente.",
  };
}

export async function dismissReport(reportId: string): Promise<AdminActionResult> {
  if (!reportId) {
    return {
      status: "error",
      message: "No encontramos el reporte a descartar.",
    };
  }

  const admin = await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("reports")
    .update({
      status: "dismissed",
      resolved_by: admin.id,
    })
    .eq("id", reportId);

  if (error) {
    return {
      status: "error",
      message: "No fue posible descartar el reporte.",
    };
  }

  revalidatePath("/admin/reportes");

  return {
    status: "success",
    message: "Reporte descartado correctamente.",
  };
}
