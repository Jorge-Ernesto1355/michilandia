export type ProductCategory = "Collares" | "Ropita y Lazos" | "Juguetes" | "Hogar" | "Transportadoras";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  priceCents: number;
  originalPriceCents?: number;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  image: string;
  featured?: boolean;
  popularity: number;
};
