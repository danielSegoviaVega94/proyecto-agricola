import { createServerSupabaseClient } from "@/lib/supabase/server";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
};

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  children: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,parent_id,sort_order");

  if (error || !data) {
    return [];
  }

  const rows = [...(data as CategoryRow[])].sort((a, b) => a.sort_order - b.sort_order);
  const parentRows = rows.filter((row) => row.parent_id === null);

  return parentRows.map((parent) => ({
    id: parent.id,
    name: parent.name,
    slug: parent.slug,
    children: rows
      .filter((row) => row.parent_id === parent.id)
      .map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
      })),
  }));
}
