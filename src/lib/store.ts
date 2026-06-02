import prisma from "./prisma";
import type {
  Product,
  Category,
  Brand,
  HeroSlide,
  Review,
  User,
  Order,
  Address,
} from "./types";
import { OrderStatus, PaymentStatus } from "../generated/prisma/enums";

// ── Status mapping ────────────────────────────────────────────────────────────

const STATUS_TO_ENUM: Record<string, OrderStatus> = {
  pending: OrderStatus.PENDING,
  confirmed: OrderStatus.CONFIRMED,
  preparing: OrderStatus.PREPARING,
  shipped: OrderStatus.SHIPPED,
  delivered: OrderStatus.DELIVERED,
  cancelled: OrderStatus.CANCELLED,
};

const ENUM_TO_STATUS: Record<OrderStatus, Order["status"]> = {
  [OrderStatus.PENDING]: "pending",
  [OrderStatus.CONFIRMED]: "confirmed",
  [OrderStatus.PREPARING]: "preparing",
  [OrderStatus.SHIPPED]: "shipped",
  [OrderStatus.DELIVERED]: "delivered",
  [OrderStatus.CANCELLED]: "cancelled",
};

const PAYMENT_TO_ENUM: Record<string, PaymentStatus> = {
  unpaid: PaymentStatus.UNPAID,
  paid: PaymentStatus.PAID,
  failed: PaymentStatus.FAILED,
  refunded: PaymentStatus.REFUNDED,
};

const ENUM_TO_PAYMENT: Record<PaymentStatus, Order["paymentStatus"]> = {
  [PaymentStatus.UNPAID]: "unpaid",
  [PaymentStatus.PAID]: "paid",
  [PaymentStatus.FAILED]: "failed",
  [PaymentStatus.REFUNDED]: "refunded",
};

// ── Converters ────────────────────────────────────────────────────────────────

function dbProductToProduct(p: {
  id: number;
  name: string;
  description: string;
  originalPrice: number;
  currentPrice: number;
  image: string;
  badge: string | null;
  isRefurbished: boolean;
  category: string;
  brand: string;
  slug: string;
  sku: string | null;
  condition: string | null;
  guarantee: string | null;
  inStock: boolean;
  stockQuantity: number;
  specs: string[];
  images: string[];
  descriptionSections: unknown;
  characteristics: unknown;
  productReviews: unknown;
  metaTitle?: string | null;
  metaDescription?: string | null;
}): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    originalPrice: p.originalPrice,
    currentPrice: p.currentPrice,
    image: p.image,
    badge: p.badge ?? undefined,
    isRefurbished: p.isRefurbished,
    category: p.category,
    brand: p.brand,
    slug: p.slug,
    sku: p.sku ?? undefined,
    condition: p.condition ?? undefined,
    guarantee: p.guarantee ?? undefined,
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    specs: p.specs,
    images: p.images,
    descriptionSections: (p.descriptionSections as Product["descriptionSections"]) ?? undefined,
    characteristics: (p.characteristics as Product["characteristics"]) ?? undefined,
    productReviews: (p.productReviews as Product["productReviews"]) ?? undefined,
    metaTitle: p.metaTitle ?? undefined,
    metaDescription: p.metaDescription ?? undefined,
  };
}

function dbOrderToOrder(o: {
  id: string;
  orderNumber: string | null;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paidAt: Date | null;
  notes: string | null;
  trackingNumber: string | null;
  promoCode: string | null;
  promoDiscount: number;
  addressStreet: string;
  addressCity: string;
  addressPostalCode: string;
  addressCountry: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
  }[];
}): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber ?? undefined,
    userId: o.userId,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone ?? undefined,
    items: o.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: o.subtotal,
    total: o.total,
    status: ENUM_TO_STATUS[o.status],
    address: {
      street: o.addressStreet,
      city: o.addressCity,
      postalCode: o.addressPostalCode,
      country: o.addressCountry,
    },
    paymentMethod: o.paymentMethod,
    paymentStatus: ENUM_TO_PAYMENT[o.paymentStatus],
    paidAt: o.paidAt ? o.paidAt.toISOString() : undefined,
    notes: o.notes ?? undefined,
    trackingNumber: o.trackingNumber ?? undefined,
    promoCode: o.promoCode ?? undefined,
    promoDiscount: o.promoDiscount,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

function dbUserToUser(u: {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressPostalCode: string | null;
  addressCountry: string | null;
  createdAt: Date;
}): User {
  const address: Address | undefined =
    u.addressStreet && u.addressCity
      ? {
          street: u.addressStreet,
          city: u.addressCity,
          postalCode: u.addressPostalCode ?? "",
          country: u.addressCountry ?? "Maroc",
        }
      : undefined;
  return {
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone ?? undefined,
    avatar: u.avatar ?? undefined,
    address,
    createdAt: u.createdAt.toISOString(),
  };
}

// ── Page View Tracking ────────────────────────────────────────────────────────

export interface PageView {
  id: string;
  url: string;
  referrer: string;
  ua: string;
  sessionId: string;
  timestamp: string;
}

export async function appendPageView(pv: PageView): Promise<void> {
  await prisma.pageView.create({
    data: {
      id: pv.id,
      url: pv.url,
      referrer: pv.referrer,
      ua: pv.ua,
      sessionId: pv.sessionId,
      timestamp: new Date(pv.timestamp),
    },
  });
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function getNewsletterSubscribers(): Promise<{ email: string; subscribedAt: string }[]> {
  const subs = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });
  return subs.map((s) => ({ email: s.email, subscribedAt: s.subscribedAt.toISOString() }));
}

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; alreadyExists: boolean }> {
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) return { ok: false, alreadyExists: true };
  await prisma.newsletterSubscriber.create({
    data: { email: email.toLowerCase() },
  });
  return { ok: true, alreadyExists: false };
}

export async function removeNewsletterSubscriber(email: string): Promise<boolean> {
  try {
    await prisma.newsletterSubscriber.delete({
      where: { email: email.toLowerCase() },
    });
    return true;
  } catch {
    return false;
  }
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      originalPrice: true,
      currentPrice: true,
      image: true,
      badge: true,
      isRefurbished: true,
      category: true,
      brand: true,
      slug: true,
      sku: true,
      condition: true,
      guarantee: true,
      inStock: true,
      stockQuantity: true,
      specs: true,
      images: true,
      descriptionSections: true,
      characteristics: true,
      productReviews: true,
      metaTitle: true,
      metaDescription: true,
    },
  });
  return products.map(dbProductToProduct);
}

/** Lightweight product list — only fields needed for cards */
export async function getProductCards(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      description: false,
      originalPrice: true,
      currentPrice: true,
      image: true,
      badge: true,
      isRefurbished: true,
      category: true,
      brand: true,
      slug: true,
      sku: true,
      condition: true,
      guarantee: true,
      inStock: true,
      stockQuantity: true,
      specs: false,
      images: false,
      descriptionSections: false,
      characteristics: false,
      productReviews: true,
    },
  });
  return products.map((p) => dbProductToProduct({
    ...p,
    description: "",
    specs: [],
    images: [],
    descriptionSections: null,
    characteristics: null,
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const p = await prisma.product.findUnique({ where: { slug } });
  return p ? dbProductToProduct(p) : undefined;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const p = await prisma.product.findUnique({ where: { id } });
  return p ? dbProductToProduct(p) : undefined;
}

export async function createProduct(data: Omit<Product, "id">): Promise<Product> {
  const p = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      originalPrice: data.originalPrice,
      currentPrice: data.currentPrice,
      image: data.image,
      badge: data.badge ?? null,
      isRefurbished: data.isRefurbished ?? false,
      category: data.category,
      brand: data.brand,
      slug: data.slug,
      sku: data.sku ?? null,
      condition: data.condition ?? null,
      guarantee: data.guarantee ?? null,
      inStock: data.inStock ?? true,
      stockQuantity: data.stockQuantity ?? 0,
      specs: data.specs ?? [],
      images: data.images ?? [],
      descriptionSections: (data.descriptionSections as unknown as undefined) ?? undefined,
      characteristics: (data.characteristics as unknown as undefined) ?? undefined,
      productReviews: (data.productReviews as unknown as undefined) ?? undefined,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    },
  });
  return dbProductToProduct(p);
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
  try {
    const p = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
        ...(data.currentPrice !== undefined && { currentPrice: data.currentPrice }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.badge !== undefined && { badge: data.badge ?? null }),
        ...(data.isRefurbished !== undefined && { isRefurbished: data.isRefurbished }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.sku !== undefined && { sku: data.sku ?? null }),
        ...(data.condition !== undefined && { condition: data.condition ?? null }),
        ...(data.guarantee !== undefined && { guarantee: data.guarantee ?? null }),
        ...(data.inStock !== undefined && { inStock: data.inStock }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        ...(data.specs !== undefined && { specs: data.specs }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.descriptionSections !== undefined && { descriptionSections: data.descriptionSections as unknown as undefined }),
        ...(data.characteristics !== undefined && { characteristics: data.characteristics as unknown as undefined }),
        ...(data.productReviews !== undefined && { productReviews: data.productReviews as unknown as undefined }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle ?? null }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription ?? null }),
      },
    });
    return dbProductToProduct(p);
  } catch {
    return null;
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const cats = await prisma.category.findMany({ orderBy: { id: "asc" } });
  return cats.map(dbCategoryToData);
}

function dbCategoryToData(c: { id: number; name: string; slug: string; icon: string; metaTitle: string | null; metaDescription: string | null }): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    metaTitle: c.metaTitle ?? undefined,
    metaDescription: c.metaDescription ?? undefined,
  };
}

export async function createCategory(data: Omit<Category, "id">): Promise<Category> {
  const c = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      icon: data.icon,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    },
  });
  return dbCategoryToData(c);
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
  try {
    const c = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle ?? null }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription ?? null }),
      },
    });
    return dbCategoryToData(c);
  } catch {
    return null;
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
  try {
    await prisma.category.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── Brands ────────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<Brand[]> {
  return prisma.brand.findMany({ orderBy: { id: "asc" } });
}

export async function createBrand(data: Omit<Brand, "id">): Promise<Brand> {
  return prisma.brand.create({ data });
}

export async function updateBrand(id: number, data: Partial<Brand>): Promise<Brand | null> {
  try {
    return await prisma.brand.update({ where: { id }, data });
  } catch {
    return null;
  }
}

export async function deleteBrand(id: number): Promise<boolean> {
  try {
    await prisma.brand.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── Hero Slides ───────────────────────────────────────────────────────────────

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return prisma.heroSlide.findMany({ orderBy: { id: "asc" } });
}

export async function createHeroSlide(data: Omit<HeroSlide, "id">): Promise<HeroSlide> {
  return prisma.heroSlide.create({ data });
}

export async function updateHeroSlide(id: number, data: Partial<HeroSlide>): Promise<HeroSlide | null> {
  try {
    return await prisma.heroSlide.update({ where: { id }, data });
  } catch {
    return null;
  }
}

export async function deleteHeroSlide(id: number): Promise<boolean> {
  try {
    await prisma.heroSlide.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviews(): Promise<Review[]> {
  return prisma.review.findMany({ orderBy: { id: "asc" } });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return users.map(dbUserToUser);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const u = await prisma.user.findUnique({ where: { id } });
  return u ? dbUserToUser(u) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return u ? dbUserToUser(u) : undefined;
}

export async function createUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
  const u = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? null,
      avatar: data.avatar ?? null,
      addressStreet: data.address?.street ?? null,
      addressCity: data.address?.city ?? null,
      addressPostalCode: data.address?.postalCode ?? null,
      addressCountry: data.address?.country ?? null,
    },
  });
  return dbUserToUser(u);
}

export async function updateUser(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> {
  try {
    const u = await prisma.user.update({
      where: { id },
      data: {
        ...(data.email !== undefined && { email: data.email.toLowerCase() }),
        ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.avatar !== undefined && { avatar: data.avatar ?? null }),
        ...(data.address !== undefined && {
          addressStreet: data.address?.street ?? null,
          addressCity: data.address?.city ?? null,
          addressPostalCode: data.address?.postalCode ?? null,
          addressCountry: data.address?.country ?? null,
        }),
      },
    });
    return dbUserToUser(u);
  } catch {
    return null;
  }
}

// ── Orders ────────────────────────────────────────────────────────────────────

// Friendly, human-readable tracking number: "MA" + 9 digits.
function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-7); // 7 digits from the timestamp
  const rnd = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `MA${ts}${rnd}`;
}

export async function getOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(dbOrderToOrder);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(dbOrderToOrder);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const o = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: { items: true },
  });
  return o ? dbOrderToOrder(o) : undefined;
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "updatedAt" | "paymentStatus"> & {
    paymentStatus?: Order["paymentStatus"];
  }
): Promise<Order> {
  const o = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone ?? null,
      subtotal: data.subtotal,
      total: data.total,
      status: STATUS_TO_ENUM[data.status] ?? OrderStatus.PENDING,
      paymentMethod: data.paymentMethod,
      paymentStatus: PAYMENT_TO_ENUM[data.paymentStatus ?? "unpaid"] ?? PaymentStatus.UNPAID,
      notes: data.notes ?? null,
      trackingNumber: null,
      promoCode: data.promoCode ?? null,
      promoDiscount: data.promoDiscount ?? 0,
      addressStreet: data.address.street,
      addressCity: data.address.city,
      addressPostalCode: data.address.postalCode,
      addressCountry: data.address.country,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });
  return dbOrderToOrder(o);
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  try {
    const o = await prisma.order.update({
      where: { id },
      data: { status: STATUS_TO_ENUM[status] ?? OrderStatus.PENDING },
      include: { items: true },
    });
    return dbOrderToOrder(o);
  } catch {
    return null;
  }
}

// Generic partial order update (status / tracking / notes / payment status).
export async function updateOrder(
  id: string,
  data: {
    status?: Order["status"];
    trackingNumber?: string | null;
    notes?: string | null;
    paymentStatus?: Order["paymentStatus"];
  }
): Promise<Order | null> {
  try {
    const patch: {
      status?: OrderStatus;
      trackingNumber?: string | null;
      notes?: string | null;
      paymentStatus?: PaymentStatus;
      paidAt?: Date | null;
    } = {};
    if (data.status !== undefined) patch.status = STATUS_TO_ENUM[data.status] ?? OrderStatus.PENDING;
    if (data.trackingNumber !== undefined) patch.trackingNumber = data.trackingNumber || null;
    if (data.notes !== undefined) patch.notes = data.notes || null;
    if (data.paymentStatus !== undefined) {
      patch.paymentStatus = PAYMENT_TO_ENUM[data.paymentStatus] ?? PaymentStatus.UNPAID;
      patch.paidAt = data.paymentStatus === "paid" ? new Date() : null;
    }
    const o = await prisma.order.update({
      where: { id },
      data: patch,
      include: { items: true },
    });
    return dbOrderToOrder(o);
  } catch {
    return null;
  }
}

// Update only the payment status (used by the payment webhook).
export async function updateOrderPaymentStatus(
  id: string,
  paymentStatus: Order["paymentStatus"]
): Promise<Order | null> {
  try {
    const o = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: PAYMENT_TO_ENUM[paymentStatus] ?? PaymentStatus.UNPAID,
        paidAt: paymentStatus === "paid" ? new Date() : null,
      },
      include: { items: true },
    });
    return dbOrderToOrder(o);
  } catch {
    return null;
  }
}

// ── Order analytics ──────────────────────────────────────────────────────

export interface BestSeller {
  productId: number;
  productName: string;
  productImage: string;
  unitsSold: number;
  revenue: number;
}

// Aggregate order items to find best-selling products. Cancelled orders excluded.
export async function getBestSellers(limit = 8): Promise<BestSeller[]> {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: { not: OrderStatus.CANCELLED } } },
    select: {
      productId: true,
      productName: true,
      productImage: true,
      quantity: true,
      price: true,
    },
  });
  const map = new Map<number, BestSeller>();
  for (const it of items) {
    const cur = map.get(it.productId) ?? {
      productId: it.productId,
      productName: it.productName,
      productImage: it.productImage,
      unitsSold: 0,
      revenue: 0,
    };
    cur.unitsSold += it.quantity;
    cur.revenue += it.price * it.quantity;
    map.set(it.productId, cur);
  }
  return Array.from(map.values())
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);
}

export interface LowStockProduct {
  id: number;
  name: string;
  slug: string;
  image: string;
  stockQuantity: number;
  inStock: boolean;
}

// Products at or below the low-stock threshold (still listed as in stock).
export async function getLowStockProducts(threshold = 5): Promise<LowStockProduct[]> {
  const products = await prisma.product.findMany({
    where: { stockQuantity: { lte: threshold } },
    select: { id: true, name: true, slug: true, image: true, stockQuantity: true, inStock: true },
    orderBy: { stockQuantity: "asc" },
  });
  return products;
}

// ── Abandoned carts ─────────────────────────────────────────────────────

export interface AbandonedCartItem {
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

export interface AbandonedCartData {
  id: string;
  sessionId: string;
  userId?: string;
  email?: string;
  customerName?: string;
  phone?: string;
  items: AbandonedCartItem[];
  subtotal: number;
  itemCount: number;
  recovered: boolean;
  reminded: boolean;
  createdAt: string;
  updatedAt: string;
}

// Upsert a cart snapshot keyed by anonymous session id.
export async function upsertAbandonedCart(input: {
  sessionId: string;
  userId?: string | null;
  email?: string | null;
  customerName?: string | null;
  phone?: string | null;
  items: AbandonedCartItem[];
  subtotal: number;
}): Promise<void> {
  const itemCount = input.items.reduce((s, i) => s + i.quantity, 0);
  const base = {
    userId: input.userId ?? null,
    email: input.email ?? null,
    customerName: input.customerName ?? null,
    phone: input.phone ?? null,
    items: input.items as unknown as object,
    subtotal: input.subtotal,
    itemCount,
  };
  await prisma.abandonedCart.upsert({
    where: { sessionId: input.sessionId },
    create: { sessionId: input.sessionId, recovered: false, ...base },
    update: { ...base, recovered: false },
  });
}

// Mark a cart as recovered (called when its session completes an order).
export async function markCartRecovered(sessionId: string): Promise<void> {
  try {
    await prisma.abandonedCart.update({
      where: { sessionId },
      data: { recovered: true },
    });
  } catch {
    /* no cart for this session — ignore */
  }
}

export async function getAbandonedCarts(limit = 50): Promise<AbandonedCartData[]> {
  const carts = await prisma.abandonedCart.findMany({
    where: { recovered: false, itemCount: { gt: 0 } },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return carts.map((c) => ({
    id: c.id,
    sessionId: c.sessionId,
    userId: c.userId ?? undefined,
    email: c.email ?? undefined,
    customerName: c.customerName ?? undefined,
    phone: c.phone ?? undefined,
    items: (c.items as unknown as AbandonedCartItem[]) ?? [],
    subtotal: c.subtotal,
    itemCount: c.itemCount,
    recovered: c.recovered,
    reminded: c.reminded,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

// ── Read DB (for analytics/stats — returns raw counts) ────────────────────────

export async function getDBStats() {
  const [
    products,
    categories,
    brands,
    heroSlides,
    orders,
    subscribers,
    users,
  ] = await Promise.all([
    prisma.product.findMany(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.heroSlide.count(),
    prisma.order.findMany({ select: { status: true, total: true } }),
    prisma.newsletterSubscriber.count(),
    prisma.user.count(),
  ]);

  return {
    products: products.length,
    categories,
    brands,
    heroSlides,
    inStock: products.filter((p) => p.inStock).length,
    outOfStock: products.filter((p) => !p.inStock).length,
    orders: orders.length,
    pendingOrders: orders.filter((o) => o.status === OrderStatus.PENDING).length,
    revenue: orders.reduce((s, o) => s + o.total, 0),
    subscribers,
    users,
  };
}

export async function getPageViews() {
  return prisma.pageView.findMany({
    orderBy: { timestamp: "desc" },
    take: 50000,
  });
}

// ── Promos ─────────────────────────────────────────────────────────────────────

export interface PromoData {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  active: boolean;
  expires: string;
}

export async function getPromos(): Promise<PromoData[]> {
  const promos = await prisma.promo.findMany({ orderBy: { createdAt: "desc" } });
  return promos.map((p) => ({
    id: p.id,
    code: p.code,
    type: p.type as "percent" | "fixed",
    value: p.value,
    minOrder: p.minOrder,
    uses: p.uses,
    maxUses: p.maxUses,
    active: p.active,
    expires: p.expires.toISOString().split("T")[0],
  }));
}

export async function createPromo(data: Omit<PromoData, "id" | "uses">): Promise<PromoData> {
  const p = await prisma.promo.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrder: data.minOrder,
      maxUses: data.maxUses,
      active: data.active,
      expires: new Date(data.expires),
    },
  });
  return { id: p.id, code: p.code, type: p.type as "percent" | "fixed", value: p.value, minOrder: p.minOrder, uses: p.uses, maxUses: p.maxUses, active: p.active, expires: p.expires.toISOString().split("T")[0] };
}

export async function updatePromo(id: number, data: Partial<PromoData>): Promise<PromoData | null> {
  try {
    const p = await prisma.promo.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code.toUpperCase() }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.minOrder !== undefined && { minOrder: data.minOrder }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.uses !== undefined && { uses: data.uses }),
        ...(data.expires !== undefined && { expires: new Date(data.expires) }),
      },
    });
    return { id: p.id, code: p.code, type: p.type as "percent" | "fixed", value: p.value, minOrder: p.minOrder, uses: p.uses, maxUses: p.maxUses, active: p.active, expires: p.expires.toISOString().split("T")[0] };
  } catch {
    return null;
  }
}

export async function deletePromo(id: number): Promise<boolean> {
  try {
    await prisma.promo.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function validatePromoCode(code: string, subtotal: number): Promise<{ ok: boolean; code?: string; label?: string; discount?: number; error?: string }> {
  const promo = await prisma.promo.findUnique({ where: { code: code.toUpperCase() } });
  if (!promo) return { ok: false, error: "Code promo invalide" };
  if (!promo.active) return { ok: false, error: "Ce code promo n'est plus actif" };
  if (new Date() > promo.expires) return { ok: false, error: "Ce code promo a expiré" };
  if (promo.uses >= promo.maxUses) return { ok: false, error: "Ce code promo a atteint sa limite d'utilisation" };
  if (subtotal < promo.minOrder) return { ok: false, error: `Commande minimum de ${promo.minOrder}€ requise` };

  const discount = promo.type === "percent"
    ? Math.round((subtotal * promo.value) / 100)
    : Math.min(promo.value, subtotal);
  const label = promo.type === "percent" ? `-${promo.value}%` : `-${promo.value}€`;

  return { ok: true, code: promo.code, label, discount };
}

export async function incrementPromoUses(code: string): Promise<void> {
  await prisma.promo.update({ where: { code: code.toUpperCase() }, data: { uses: { increment: 1 } } }).catch(() => {});
}

// ── Site Settings ─────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<Record<string, string>> {
  const settings = await prisma.siteSetting.findMany();
  const result: Record<string, string> = {};
  for (const s of settings) result[s.key] = s.value;
  return result;
}

export async function saveSiteSettings(data: Record<string, string>): Promise<void> {
  const ops = Object.entries(data).map(([key, value]) =>
    prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } })
  );
  await Promise.all(ops);
}

// ── Admin Activity Log ────────────────────────────────────────────────────────

export async function addAdminLog(action: string, detail: string): Promise<void> {
  await prisma.adminLog.create({ data: { action, detail } });
}

export async function getAdminLogs(limit = 50): Promise<{ id: number; action: string; detail: string; createdAt: string }[]> {
  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return logs.map(l => ({ id: l.id, action: l.action, detail: l.detail, createdAt: l.createdAt.toISOString() }));
}

// ── Delivery Zones ────────────────────────────────────────────────────────────

export interface DeliveryZoneData {
  id: number;
  name: string;
  cities: string[];
  fee: number;
  active: boolean;
}

export async function getDeliveryZones(): Promise<DeliveryZoneData[]> {
  return prisma.deliveryZone.findMany({ orderBy: { id: "asc" } });
}

export async function createDeliveryZone(data: Omit<DeliveryZoneData, "id">): Promise<DeliveryZoneData> {
  return prisma.deliveryZone.create({ data });
}

export async function updateDeliveryZone(id: number, data: Partial<DeliveryZoneData>): Promise<DeliveryZoneData | null> {
  try {
    return await prisma.deliveryZone.update({ where: { id }, data });
  } catch {
    return null;
  }
}

export async function deleteDeliveryZone(id: number): Promise<boolean> {
  try {
    await prisma.deliveryZone.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getDeliveryFeeForCity(city: string): Promise<number | null> {
  const zones = await prisma.deliveryZone.findMany({ where: { active: true } });
  const normalized = city.toLowerCase().trim();
  for (const zone of zones) {
    if (zone.cities.some(c => c.toLowerCase().trim() === normalized)) {
      return zone.fee;
    }
  }
  return null;
}

// ── Returns / Refunds ─────────────────────────────────────────────────────────

export interface ReturnData {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  reason: string;
  comment: string | null;
  status: string;
  refundAmount: number;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

function dbReturnToData(r: {
  id: string; orderId: string; customerName: string; customerEmail: string;
  customerPhone: string | null; reason: string; comment: string | null; status: string;
  refundAmount: number; adminNote: string | null; createdAt: Date; updatedAt: Date;
}): ReturnData {
  return {
    id: r.id,
    orderId: r.orderId,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerPhone: r.customerPhone,
    reason: r.reason,
    comment: r.comment,
    status: r.status,
    refundAmount: r.refundAmount,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getReturns(): Promise<ReturnData[]> {
  const rows = await prisma.return.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(dbReturnToData);
}

export async function createReturn(data: {
  orderId: string; customerName: string; customerEmail: string; customerPhone?: string | null;
  reason: string; comment?: string | null;
}): Promise<ReturnData> {
  const r = await prisma.return.create({
    data: {
      orderId: data.orderId.trim(),
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim(),
      customerPhone: data.customerPhone ?? null,
      reason: data.reason,
      comment: data.comment ?? null,
    },
  });
  return dbReturnToData(r);
}

export async function updateReturn(id: string, data: Partial<{ status: string; refundAmount: number; adminNote: string }>): Promise<ReturnData | null> {
  try {
    const r = await prisma.return.update({ where: { id }, data });
    return dbReturnToData(r);
  } catch {
    return null;
  }
}

export async function deleteReturn(id: string): Promise<boolean> {
  try {
    await prisma.return.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── Back-in-stock notifications ───────────────────────────────────────────────

export interface StockNotificationData {
  id: number;
  productId: number;
  email: string;
  notified: boolean;
  createdAt: string;
}

export async function subscribeStockNotification(productId: number, email: string): Promise<{ ok: boolean; alreadyExists: boolean }> {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.stockNotification.findUnique({
    where: { productId_email: { productId, email: normalized } },
  });
  if (existing) return { ok: true, alreadyExists: true };
  await prisma.stockNotification.create({ data: { productId, email: normalized } });
  return { ok: true, alreadyExists: false };
}

export async function getStockNotifications(productId?: number): Promise<StockNotificationData[]> {
  const rows = await prisma.stockNotification.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(n => ({ id: n.id, productId: n.productId, email: n.email, notified: n.notified, createdAt: n.createdAt.toISOString() }));
}

export async function getPendingStockNotifications(productId: number): Promise<StockNotificationData[]> {
  const rows = await prisma.stockNotification.findMany({
    where: { productId, notified: false },
  });
  return rows.map(n => ({ id: n.id, productId: n.productId, email: n.email, notified: n.notified, createdAt: n.createdAt.toISOString() }));
}

export async function markStockNotificationsSent(productId: number): Promise<void> {
  await prisma.stockNotification.updateMany({
    where: { productId, notified: false },
    data: { notified: true },
  });
}

export async function countStockNotifications(): Promise<{ productId: number; count: number }[]> {
  const grouped = await prisma.stockNotification.groupBy({
    by: ["productId"],
    where: { notified: false },
    _count: { _all: true },
  });
  return grouped.map(g => ({ productId: g.productId, count: g._count._all }));
}

// ── Admin / Staff accounts ────────────────────────────────────────────────────

export interface AdminUserData {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

function dbAdminToData(u: {
  id: string; email: string; name: string; role: string; active: boolean;
  lastLogin: Date | null; createdAt: Date;
}): AdminUserData {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function getAdminUsers(): Promise<AdminUserData[]> {
  const rows = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(dbAdminToData);
}

export async function getAdminUserByEmail(email: string): Promise<{ id: string; email: string; name: string; role: string; active: boolean; passwordHash: string } | null> {
  const u = await prisma.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!u) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, passwordHash: u.passwordHash };
}

export async function createAdminUser(data: { email: string; name: string; role: string; passwordHash: string }): Promise<AdminUserData> {
  const u = await prisma.adminUser.create({
    data: {
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      role: data.role,
      passwordHash: data.passwordHash,
    },
  });
  return dbAdminToData(u);
}

export async function updateAdminUser(id: string, data: Partial<{ name: string; role: string; active: boolean; passwordHash: string }>): Promise<AdminUserData | null> {
  try {
    const u = await prisma.adminUser.update({ where: { id }, data });
    return dbAdminToData(u);
  } catch {
    return null;
  }
}

export async function setAdminUserLastLogin(id: string): Promise<void> {
  await prisma.adminUser.update({ where: { id }, data: { lastLogin: new Date() } }).catch(() => {});
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  try {
    await prisma.adminUser.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
