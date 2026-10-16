import Link from "next/link";

import { MainNavTop } from "@/components/layout/main-nav";
import { ProductCard } from "@/components/products/product-card";
import { getCatalogProducts } from "@/lib/products/catalog";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CatalogPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    comuna?: string;
    min_rating?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const categoryId = params.category?.trim();
  const comuna = params.comuna?.trim();
  const minRating = params.min_rating ? Number(params.min_rating) : undefined;

  const supabase = await createServerSupabaseClient();
  const [{ data: userData }, products] = await Promise.all([
    supabase.auth.getUser(),
    getCatalogProducts({
      q,
      categoryId,
      comuna,
      minRating: Number.isFinite(minRating) ? minRating : undefined,
    }),
  ]);

  const isAuthenticated = Boolean(userData.user);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <MainNavTop currentPath="/productos" isAuthenticated={isAuthenticated} />
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-20 pt-4 md:max-w-3xl md:px-6 lg:max-w-6xl lg:px-8">
        <header className="mb-4 flex items-center justify-between">
          <Link href="/" className="rounded-lg px-2 py-1 text-sm text-[#4a4a4a] hover:bg-[#f0eee8]">
            Volver
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-[#0f0f0f]">Productos</h1>
          <span className="w-12" />
        </header>

        <form className="space-y-3">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar producto..."
            className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base"
          />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <input
              type="text"
              name="comuna"
              defaultValue={comuna}
              placeholder="Comuna"
              className="h-10 rounded-lg border border-[#e8e6e0] px-3 text-sm"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              name="min_rating"
              defaultValue={params.min_rating}
              placeholder="Rating mín."
              className="h-10 rounded-lg border border-[#e8e6e0] px-3 text-sm"
            />
            {categoryId ? <input type="hidden" name="category" value={categoryId} /> : null}
            <button
              type="submit"
              className="h-10 rounded-lg bg-[#16803c] px-4 text-sm font-semibold text-white md:col-span-1"
            >
              Aplicar filtros
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-[#8a8a8a]">{products.length} resultados</p>

        {products.length === 0 ? (
          <section className="mt-3 rounded-2xl border border-dashed border-[#e8e6e0] bg-[#fafaf7] px-4 py-10 text-center">
            <p className="text-base font-semibold text-[#0f0f0f]">No se encontraron productos</p>
            <p className="mt-2 text-sm text-[#4a4a4a]">
              Ajusta los filtros o vuelve más tarde. Aún estamos sumando agricultores en tu zona.
            </p>
          </section>
        ) : (
          <section className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
