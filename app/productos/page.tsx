import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { getCatalogProducts } from "@/lib/products/catalog";

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

  const products = await getCatalogProducts({
    q,
    categoryId,
    comuna,
    minRating: Number.isFinite(minRating) ? minRating : undefined,
  });

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-20 pt-4">
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
          <div className="grid grid-cols-2 gap-2">
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
          </div>
          {categoryId ? <input type="hidden" name="category" value={categoryId} /> : null}
          <button type="submit" className="h-10 rounded-lg bg-[#16803c] px-4 text-sm font-semibold text-white">
            Aplicar filtros
          </button>
        </form>

        <p className="mt-4 text-sm text-[#8a8a8a]">{products.length} resultados</p>

        <section className="mt-3 grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </main>
    </div>
  );
}
