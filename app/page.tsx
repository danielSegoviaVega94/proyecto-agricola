import Link from "next/link";

export default function Home() {
  const categories = ["Todas", "Verduras", "Frutas", "Hierbas", "Hortalizas", "Legumbres"];
  const products = [
    { title: "Tomate orgánico Vicuña", price: "$1.300", detail: "/kg desde 30kg", rating: "4.9", comuna: "Vicuña" },
    { title: "Lechuga hidropónica", price: "$800", detail: "/unidad", rating: "4.7", comuna: "La Serena" },
    { title: "Uva de mesa Elqui", price: "$2.200", detail: "/kg", rating: "5.0", comuna: "Paihuano" },
    { title: "Zapallo italiano", price: "$700", detail: "/kg desde 10kg", rating: "4.6", comuna: "Ovalle" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white pb-24 shadow-sm">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#f0eee8] bg-white px-4">
          <div className="text-xl font-bold tracking-tight text-[#115e2c]">Tierra</div>
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-medium text-[#115e2c] hover:bg-[#e8f5ee]"
          >
            Iniciar sesión
          </Link>
        </header>

        <section className="bg-gradient-to-b from-[#e8f5ee] to-[#fafaf7] px-4 pb-4 pt-6">
          <h1 className="text-[2rem] leading-[1.1] font-bold tracking-tight text-[#0f0f0f]">
            Del campo
            <br />a tu cocina.
          </h1>
          <p className="mt-2 text-base text-[#4a4a4a]">
            Compra directo a los agricultores de la Región de Coquimbo. Sin intermediarios.
          </p>
          <div className="mt-5 flex h-13 items-center gap-2 rounded-xl bg-[#f0eee8] px-4">
            <span aria-hidden className="text-[#8a8a8a]">
              ⌕
            </span>
            <input
              type="search"
              placeholder="Buscar tomate, lechuga, frutas..."
              className="w-full border-0 bg-transparent text-base outline-none placeholder:text-[#8a8a8a]"
            />
          </div>
        </section>

        <section className="px-4 pt-4">
          <h2 className="text-lg font-semibold tracking-tight text-[#0f0f0f]">Categorías</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                  category === "Todas"
                    ? "border-[#16803c] bg-[#16803c] text-white"
                    : "border-[#e8e6e0] bg-white text-[#0f0f0f]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 pt-6">
          <h2 className="text-lg font-semibold tracking-tight text-[#0f0f0f]">Cerca de ti</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {products.map((product) => (
              <article key={product.title} className="overflow-hidden rounded-2xl border border-[#f0eee8] bg-white">
                <div className="aspect-square bg-gradient-to-br from-[#e8f5ee] to-[#fafaf7]" />
                <div className="p-3">
                  <h3 className="text-sm font-semibold leading-5 text-[#0f0f0f]">{product.title}</h3>
                  <p className="mt-1 text-xs text-[#8a8a8a]">
                    {product.rating} · {product.comuna}
                  </p>
                  <p className="mt-1 text-base font-bold text-[#115e2c]">
                    {product.price} <span className="text-xs font-medium text-[#8a8a8a]">{product.detail}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pt-6">
          <div className="rounded-2xl bg-[#e8f5ee] p-4">
            <h3 className="text-base font-semibold text-[#115e2c]">¿Vendes lo que cosechas?</h3>
            <p className="mt-1 text-sm text-[#4a4a4a]">
              Publica gratis y recibe pedidos directo de compradores.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#16803c] px-4 text-base font-semibold text-white hover:bg-[#115e2c]"
            >
              Empezar a vender
            </Link>
          </div>
        </section>

        <nav className="fixed bottom-0 left-0 right-0 mx-auto flex h-16 w-full max-w-[420px] border-t border-[#f0eee8] bg-white">
          <Link href="/" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-[#16803c]">
            Inicio
          </Link>
          <Link href="/productos" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-[#8a8a8a]">
            Buscar
          </Link>
          <Link href="/chat" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-[#8a8a8a]">
            Chat
          </Link>
          <Link href="/perfil" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-[#8a8a8a]">
            Yo
          </Link>
        </nav>
      </main>
    </div>
  );
}
