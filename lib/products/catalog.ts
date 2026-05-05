import { demoProducts } from "@/lib/products/demo-data";
import { resolveProductImageUrl } from "@/lib/products/image-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ProductCardModel = {
  id: string;
  title: string;
  comuna: string;
  averageScore: number;
  minPricePerUnit: number;
  minQuantityLabel: string;
  imageUrl: string;
};

type CatalogFilters = {
  q?: string;
  categoryId?: string;
  comuna?: string;
  minRating?: number;
};

type ProductRow = {
  id: string;
  title: string;
  comuna: string;
  seller_id: string;
  category_id: string;
};

type TierRow = {
  product_id: string;
  min_quantity: number;
  price_per_unit: number;
};

type ImageRow = {
  product_id: string;
  storage_path: string;
  sort_order: number;
};

type RatingSummaryRow = {
  user_id: string;
  average_score: number;
};

function formatMinQuantityLabel(minQuantity: number) {
  if (minQuantity <= 0) {
    return "";
  }

  return `desde ${minQuantity}${minQuantity === 1 ? "kg" : "kg"}`;
}

function toCardModel(
  product: { id: string; title: string; comuna: string; sellerId: string },
  tiers: TierRow[],
  ratingsMap: Map<string, number>,
  imagesMap: Map<string, string>,
): ProductCardModel {
  const productTiers = tiers.filter((tier) => tier.product_id === product.id);
  const cheapestTier = productTiers.reduce<TierRow | null>((cheapest, current) => {
    if (!cheapest || current.price_per_unit < cheapest.price_per_unit) {
      return current;
    }
    return cheapest;
  }, null);

  return {
    id: product.id,
    title: product.title,
    comuna: product.comuna,
    averageScore: Number((ratingsMap.get(product.sellerId) ?? 0).toFixed(1)),
    minPricePerUnit: cheapestTier?.price_per_unit ?? 0,
    minQuantityLabel: cheapestTier ? formatMinQuantityLabel(cheapestTier.min_quantity) : "",
    imageUrl: imagesMap.get(product.id) ?? "",
  };
}

function applyFallbackFilters(filters: CatalogFilters): ProductCardModel[] {
  const query = (filters.q ?? "").toLowerCase();

  return demoProducts
    .filter((product) => {
      if (filters.categoryId && product.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.comuna && product.comuna !== filters.comuna) {
        return false;
      }

      if (filters.minRating && product.sellerAverageScore < filters.minRating) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
      );
    })
    .map((product) => {
      const cheapestTier = product.priceTiers.reduce((cheapest, current) =>
        current.pricePerUnit < cheapest.pricePerUnit ? current : cheapest,
      );

      return {
        id: product.id,
        title: product.title,
        comuna: product.comuna,
        averageScore: product.sellerAverageScore,
        minPricePerUnit: cheapestTier.pricePerUnit,
        minQuantityLabel: formatMinQuantityLabel(cheapestTier.minQuantity),
        imageUrl: product.images[0] ?? "",
      };
    });
}

export async function getCatalogProducts(filters: CatalogFilters): Promise<ProductCardModel[]> {
  const supabase = await createServerSupabaseClient();

  let productsQuery = supabase
    .from("products")
    .select("id,title,comuna,seller_id,category_id")
    .eq("status", "active");

  if (filters.categoryId) {
    productsQuery = productsQuery.eq("category_id", filters.categoryId);
  }

  if (filters.comuna) {
    productsQuery = productsQuery.eq("comuna", filters.comuna);
  }

  if (filters.q) {
    productsQuery = productsQuery.textSearch("search_vector", filters.q, {
      config: "spanish",
      type: "plain",
    });
  }

  const { data: productsData, error: productsError } = await productsQuery;

  if (productsError || !productsData || productsData.length === 0) {
    return applyFallbackFilters(filters);
  }

  const products = (productsData as ProductRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    comuna: row.comuna,
    sellerId: row.seller_id,
  }));

  const productIds = products.map((product) => product.id);
  const sellerIds = [...new Set(products.map((product) => product.sellerId))];

  const [{ data: tiersData }, { data: ratingsData }, { data: imagesData }] = await Promise.all([
    supabase
      .from("price_tiers")
      .select("product_id,min_quantity,price_per_unit")
      .in("product_id", productIds),
    supabase.from("user_ratings_summary").select("user_id,average_score").in("user_id", sellerIds),
    supabase
      .from("product_images")
      .select("product_id,storage_path,sort_order")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true }),
  ]);

  const tiers = (tiersData as TierRow[] | null) ?? [];
  const ratingsMap = new Map(
    ((ratingsData as RatingSummaryRow[] | null) ?? []).map((rating) => [
      rating.user_id,
      Number(rating.average_score ?? 0),
    ]),
  );
  const imagesMap = new Map<string, string>();
  for (const image of ((imagesData as ImageRow[] | null) ?? [])) {
    if (!imagesMap.has(image.product_id)) {
      imagesMap.set(image.product_id, resolveProductImageUrl(image.storage_path));
    }
  }

  const models = products.map((product) => toCardModel(product, tiers, ratingsMap, imagesMap));

  const minRating = filters.minRating;
  if (typeof minRating === "number") {
    return models.filter((model) => model.averageScore >= minRating);
  }

  return models;
}

export type ProductDetailModel = {
  id: string;
  title: string;
  description: string;
  comuna: string;
  stock: number;
  measureUnit: string;
  sellerId: string;
  sellerName: string;
  sellerBusinessName?: string;
  sellerAverageScore: number;
  categoryLabel: string;
  priceTiers: Array<{ minQuantity: number; pricePerUnit: number }>;
  images: string[];
};

export async function getProductDetail(productId: string): Promise<ProductDetailModel | null> {
  const fallback = demoProducts.find((product) => product.id === productId);
  if (fallback) {
    return {
      id: fallback.id,
      title: fallback.title,
      description: fallback.description,
      comuna: fallback.comuna,
      stock: fallback.stock,
      measureUnit: fallback.measureUnit,
      sellerId: fallback.sellerId,
      sellerName: fallback.sellerName,
      sellerBusinessName: fallback.sellerBusinessName,
      sellerAverageScore: fallback.sellerAverageScore,
      categoryLabel: fallback.categoryLabel,
      priceTiers: fallback.priceTiers,
      images: fallback.images,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,title,description,comuna,stock,measure_unit,seller_id,category_id")
    .eq("id", productId)
    .eq("status", "active")
    .maybeSingle();

  if (productError || !product) {
    return null;
  }

  const [tiersResponse, imagesResponse, sellerResponse, ratingResponse, categoryResponse] = await Promise.all([
    supabase
      .from("price_tiers")
      .select("min_quantity,price_per_unit")
      .eq("product_id", product.id)
      .order("min_quantity", { ascending: true }),
    supabase
      .from("product_images")
      .select("storage_path,sort_order")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("users")
      .select("id,full_name,business_name")
      .eq("id", product.seller_id)
      .maybeSingle(),
    supabase
      .from("user_ratings_summary")
      .select("average_score")
      .eq("user_id", product.seller_id)
      .maybeSingle(),
    supabase.from("categories").select("name").eq("id", product.category_id).maybeSingle(),
  ]);

  return {
    id: product.id,
    title: product.title,
    description: product.description ?? "",
    comuna: product.comuna,
    stock: Number(product.stock),
    measureUnit: product.measure_unit,
    sellerId: product.seller_id,
    sellerName: sellerResponse.data?.full_name ?? "Vendedor",
    sellerBusinessName: sellerResponse.data?.business_name ?? undefined,
    sellerAverageScore: Number(ratingResponse.data?.average_score ?? 0),
    categoryLabel: categoryResponse.data?.name ?? "Categoría",
    priceTiers:
      tiersResponse.data?.map((tier) => ({
        minQuantity: Number(tier.min_quantity),
        pricePerUnit: Number(tier.price_per_unit),
      })) ?? [],
    images: imagesResponse.data?.map((image) => resolveProductImageUrl(image.storage_path)) ?? [],
  };
}
