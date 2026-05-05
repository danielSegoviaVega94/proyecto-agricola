import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductDetail } from "@/lib/products/catalog";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  const fromTier = product.priceTiers.reduce(
    (cheapest, current) => (current.pricePerUnit < cheapest.pricePerUnit ? current : cheapest),
    product.priceTiers[0] ?? { minQuantity: 0, pricePerUnit: 0 },
  );
  const basePrice = new Intl.NumberFormat("es-CL").format(fromTier.pricePerUnit);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-24 pt-4">
        <header className="mb-3 flex items-center justify-between">
          <Link href="/productos" className="rounded-lg px-2 py-1 text-sm text-[#4a4a4a] hover:bg-[#f0eee8]">
            Volver
          </Link>
          <p className="text-base font-semibold text-[#0f0f0f]">Producto</p>
          <span className="w-12" />
        </header>

        <div className="space-y-2">
          <div className="aspect-square overflow-hidden rounded-2xl bg-[#e8f5ee]">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <p className="text-xs font-medium text-[#16803c]">{product.categoryLabel}</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#0f0f0f]">{product.title}</h1>
          <p className="text-sm text-[#8a8a8a]">
            {product.sellerAverageScore.toFixed(1)} · {product.comuna} · {product.stock}
            {product.measureUnit} disponibles
          </p>
        </div>

        <section className="mt-5 space-y-2">
          <h2 className="text-lg font-semibold text-[#0f0f0f]">Precio por volumen</h2>
          <div className="rounded-xl border border-[#e8e6e0]">
            {product.priceTiers.map((tier) => (
              <div key={`${tier.minQuantity}-${tier.pricePerUnit}`} className="flex items-center justify-between border-b border-[#f0eee8] px-3 py-2 last:border-b-0">
                <span className="text-sm text-[#4a4a4a]">
                  {tier.minQuantity === 0 ? "Desde 0" : `Desde ${tier.minQuantity}`} {product.measureUnit}
                </span>
                <span className="text-sm font-semibold text-[#115e2c]">
                  ${new Intl.NumberFormat("es-CL").format(tier.pricePerUnit)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h2 className="text-lg font-semibold text-[#0f0f0f]">Descripción</h2>
          <p className="mt-2 text-sm text-[#4a4a4a]">{product.description}</p>
        </section>

        <section className="mt-5 rounded-xl border border-[#e8e6e0] p-3">
          <h2 className="text-sm font-semibold text-[#0f0f0f]">Vendedor</h2>
          <p className="mt-1 text-sm text-[#4a4a4a]">{product.sellerName}</p>
          {product.sellerBusinessName ? <p className="text-xs text-[#8a8a8a]">{product.sellerBusinessName}</p> : null}
          <Link href={`/perfil/${product.sellerId}`} className="mt-2 inline-block text-sm font-medium text-[#16803c] underline">
            Ver perfil
          </Link>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 mx-auto flex h-16 w-full max-w-[420px] items-center justify-between border-t border-[#f0eee8] bg-white px-4">
        <div>
          <p className="text-[11px] text-[#8a8a8a]">desde</p>
          <p className="text-lg font-bold text-[#115e2c]">${basePrice}/kg</p>
        </div>
        <Link
          href="/chat"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#16803c] px-6 text-sm font-semibold text-white"
        >
          Contactar
        </Link>
      </div>
    </div>
  );
}
