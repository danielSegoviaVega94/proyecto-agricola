import Link from "next/link";

import type { ProductCardModel } from "@/lib/products/catalog";

type ProductCardProps = {
  product: ProductCardModel;
};

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("es-CL").format(product.minPricePerUnit);

  return (
    <Link
      href={`/producto/${product.id}`}
      aria-label={product.title}
      className="overflow-hidden rounded-2xl border border-[#f0eee8] bg-white"
    >
      <div className="aspect-square bg-gradient-to-br from-[#e8f5ee] to-[#fafaf7]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold leading-5 text-[#0f0f0f]">{product.title}</h3>
        <p className="mt-1 text-xs text-[#8a8a8a]">
          {product.averageScore.toFixed(1)} · {product.comuna}
        </p>
        <p className="mt-1 text-base font-bold text-[#115e2c]">
          ${formattedPrice}{" "}
          <span className="text-xs font-medium text-[#8a8a8a]">
            /kg {product.minQuantityLabel}
          </span>
        </p>
      </div>
    </Link>
  );
}
