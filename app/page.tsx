import Link from "next/link";

import { MainNavBottom, MainNavTop } from "@/components/layout/main-nav";
import { ProductCard } from "@/components/products/product-card";
import { getCategoryTree } from "@/lib/categories/get-category-tree";
import { getLatestCatalogProducts } from "@/lib/products/catalog";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const [{ data: userData }, products, categoryTree] = await Promise.all([
    supabase.auth.getUser(),
    getLatestCatalogProducts(4),
    getCategoryTree(),
  ]);

  const isAuthenticated = Boolean(userData.user);
  const rootCategories = categoryTree.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <MainNavTop currentPath="/" isAuthenticated={isAuthenticated} />
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white pb-24 shadow-sm md:max-w-3xl md:pb-10 md:shadow-none lg:max-w-6xl">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#f0eee8] bg-white px-4 md:hidden">
          <div className="text-xl font-bold tracking-tight text-[#115e2c]">Tierra</div>
          {isAuthenticated ? (
            <Link
              href="/perfil"
              className="rounded-xl px-3 py-2 text-sm font-medium text-[#115e2c] hover:bg-[#e8f5ee]"
            >
              Mi perfil
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-[#115e2c] hover:bg-[#e8f5ee]"
            >
              Iniciar sesión
            </Link>
          )}
        </header>

        <section className="bg-gradient-to-b from-[#e8f5ee] to-[#fafaf7] px-4 pb-4 pt-6 md:rounded-2xl md:px-8 md:pb-8 md:pt-10 lg:px-12">
          <h1 className="text-[2rem] leading-[1.1] font-bold tracking-tight text-[#0f0f0f] md:text-5xl lg:text-6xl">
            Del campo
            <br />a tu cocina.
          </h1>
          <p className="mt-2 text-base text-[#4a4a4a] md:max-w-2xl md:text-lg">
            Compra directo a los agricultores de la Región de Coquimbo. Sin intermediarios.
          </p>
          <form
            action="/productos"
            method="get"
            className="mt-5 flex h-13 items-center gap-2 rounded-xl bg-white px-4 md:max-w-xl md:bg-[#f0eee8]"
          >
            <span aria-hidden className="text-[#8a8a8a]">
              ⌕
            </span>
            <input
              type="search"
              name="q"
              placeholder="Buscar tomate, lechuga, frutas..."
              className="h-12 w-full border-0 bg-transparent text-base outline-none placeholder:text-[#8a8a8a]"
            />
            <button
              type="submit"
              className="hidden h-9 rounded-lg bg-[#16803c] px-4 text-sm font-semibold text-white md:inline-flex md:items-center"
            >
              Buscar
            </button>
          </form>
        </section>

        <section className="px-4 pt-4 md:px-8 lg:px-12">
          <h2 className="text-lg font-semibold tracking-tight text-[#0f0f0f] md:text-xl">Categorías</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/productos"
              className="shrink-0 rounded-full border border-[#16803c] bg-[#16803c] px-4 py-2 text-sm font-medium text-white"
            >
              Todas
            </Link>
            {rootCategories.map((category) => (
              <Link
                key={category.id}
                href={`/productos?category=${category.id}`}
                className="shrink-0 rounded-full border border-[#e8e6e0] bg-white px-4 py-2 text-sm font-medium text-[#0f0f0f] hover:bg-[#f0eee8]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 pt-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-[#0f0f0f] md:text-xl">Cerca de ti</h2>
            <Link href="/productos" className="text-sm font-medium text-[#16803c] hover:underline">
              Ver todos
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-[#e8e6e0] bg-[#fafaf7] px-4 py-10 text-center text-sm text-[#4a4a4a]">
              Aún no hay publicaciones. Vuelve pronto o sé el primero en publicar.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <section className="px-4 pt-6 md:px-8 md:pt-10 lg:px-12">
          <div className="rounded-2xl bg-[#e8f5ee] p-4 md:flex md:items-center md:justify-between md:p-8">
            <div>
              <h3 className="text-base font-semibold text-[#115e2c] md:text-2xl">
                ¿Vendes lo que cosechas?
              </h3>
              <p className="mt-1 text-sm text-[#4a4a4a] md:text-base">
                Publica gratis y recibe pedidos directo de compradores.
              </p>
            </div>
            <Link
              href={isAuthenticated ? "/publicar" : "/login?next=/publicar"}
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#16803c] px-4 text-base font-semibold text-white hover:bg-[#115e2c] md:mt-0 md:w-auto md:px-8"
            >
              Empezar a vender
            </Link>
          </div>
        </section>

        <MainNavBottom currentPath="/" isAuthenticated={isAuthenticated} />
      </main>
    </div>
  );
}
