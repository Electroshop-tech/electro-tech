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

// ── Auth / User ───────────────────────────────────────────────────────────────

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
  createdAt: string;
}

export interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}
