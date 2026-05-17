export interface DescriptionSection {
  title: string;
  body: string;
  image: string;
  imageRight?: boolean; // true = image on right, false/omit = image on left
}

export interface Characteristic {
  label: string;
  value: string;
}

export interface ProductReview {
  id: number;
  author: string;
  rating: number; // 1-5
  date: string;
  content: string;
  verified?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  originalPrice: number;
  currentPrice: number;
  image: string;
  badge?: string;
  isRefurbished?: boolean;
  category: string;
  brand: string;
  slug: string;
  // Extended fields
  sku?: string;
  condition?: string;
  guarantee?: string;
  specs?: string[];
  images?: string[];
  inStock?: boolean;
  descriptionSections?: DescriptionSection[];
  characteristics?: Characteristic[];
  productReviews?: ProductReview[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Review {
  id: number;
  author: string;
  role: string;
  content: string;
  rating: number;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  discount: string;
  price: string;
  href: string;
  bgColor: string;
  accentColor: string;
}
