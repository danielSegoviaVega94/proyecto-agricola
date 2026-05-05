export type DemoProduct = {
  id: string;
  title: string;
  description: string;
  comuna: string;
  categoryId: string;
  categoryLabel: string;
  sellerId: string;
  sellerName: string;
  sellerBusinessName?: string;
  sellerAverageScore: number;
  stock: number;
  measureUnit: "kg" | "unit" | "box" | "bag" | "liter";
  priceTiers: Array<{ minQuantity: number; pricePerUnit: number }>;
  images: string[];
};

export const demoProducts: DemoProduct[] = [
  {
    id: "demo-tomate-don-luis",
    title: "Tomate orgánico Don Luis",
    description:
      "Tomate recién cosechado en Vicuña. Coordinamos retiro o punto de entrega en La Serena por chat.",
    comuna: "Vicuña",
    categoryId: "20000000-0000-0000-0000-000000000001",
    categoryLabel: "Verduras · Tomate",
    sellerId: "demo-seller-1",
    sellerName: "Don Luis Vargas",
    sellerBusinessName: "Huerto Don Luis",
    sellerAverageScore: 5,
    stock: 200,
    measureUnit: "kg",
    priceTiers: [
      { minQuantity: 0, pricePerUnit: 2000 },
      { minQuantity: 10, pricePerUnit: 1500 },
      { minQuantity: 30, pricePerUnit: 1300 },
    ],
    images: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=1200&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: "demo-lechuga-la-serena",
    title: "Lechuga hidropónica",
    description: "Lechuga fresca de invernadero, ideal para restaurantes y ferias.",
    comuna: "La Serena",
    categoryId: "20000000-0000-0000-0000-000000000002",
    categoryLabel: "Verduras · Lechuga",
    sellerId: "demo-seller-2",
    sellerName: "María González",
    sellerAverageScore: 4.7,
    stock: 120,
    measureUnit: "unit",
    priceTiers: [
      { minQuantity: 0, pricePerUnit: 900 },
      { minQuantity: 20, pricePerUnit: 800 },
    ],
    images: [
      "https://images.unsplash.com/photo-1557844352-761f2565b576?w=1200&q=80&auto=format&fit=crop",
    ],
  },
];
