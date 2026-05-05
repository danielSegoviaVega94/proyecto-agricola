import { getSupabaseUrl } from "@/lib/supabase/config";

export function resolveProductImageUrl(path: string) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  return `${getSupabaseUrl()}/storage/v1/object/public/products/${normalizedPath}`;
}
