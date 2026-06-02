import { z } from "zod";

// ── Shared primitives ─────────────────────────────────────────────────────────

export const addressSchema = z
  .object({
    street: z.string().trim().min(1, "Rue requise").max(200),
    city: z.string().trim().min(1, "Ville requise").max(100),
    postalCode: z.string().trim().max(20).optional(),
    zip: z.string().trim().max(20).optional(),
    wilaya: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
  })
  .transform((a) => ({
    street: a.street,
    city: a.city,
    postalCode: a.postalCode ?? a.zip ?? "",
    country: a.country ?? "Maroc",
  }));

export const orderItemSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
    productName: z.string().trim().max(300).optional(),
    name: z.string().trim().max(300).optional(),
    productImage: z.string().trim().max(1000).optional(),
    image: z.string().trim().max(1000).optional(),
    quantity: z.coerce.number().int().positive().max(999),
    price: z.coerce.number().nonnegative(),
  })
  .transform((i) => ({
    productId: i.productId,
    productName: i.productName ?? i.name ?? "Produit",
    productImage: i.productImage ?? i.image ?? "",
    quantity: i.quantity,
    price: i.price,
  }));

// ── Order creation ────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Panier vide."),
  address: addressSchema,
  paymentMethod: z.string().trim().max(50).optional().default("cash_on_delivery"),
  notes: z.string().trim().max(2000).optional(),
  promoCode: z.string().trim().max(60).optional(),
  sessionId: z.string().trim().max(100).optional(),
  customer: z
    .object({
      firstName: z.string().trim().min(1).max(100),
      lastName: z.string().trim().min(1).max(100),
      email: z.string().trim().email().or(z.literal("")).optional().default(""),
      phone: z.string().trim().min(6).max(30),
    })
    .optional(),
});

// ── Contact form ──────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(120),
  email: z.string().trim().email("Email invalide").max(200),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(1, "Sujet requis").max(200),
  message: z.string().trim().min(1, "Message requis").max(5000),
});

// ── Newsletter ────────────────────────────────────────────────────────────────

export const newsletterSchema = z.object({
  email: z.string().trim().email("Email invalide").max(200),
});

// ── Cart tracking (abandoned cart) ────────────────────────────────────────────

export const cartTrackSchema = z.object({
  sessionId: z.string().trim().min(6).max(100),
  email: z.string().trim().email().max(200).optional(),
  customerName: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(30).optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        productName: z.string().trim().min(1).max(300),
        productImage: z.string().trim().max(1000).optional(),
        quantity: z.coerce.number().int().positive().max(999),
        price: z.coerce.number().nonnegative(),
      })
    )
    .max(100),
});

// ── Payment webhook ───────────────────────────────────────────────────────────

export const paymentWebhookSchema = z.object({
  orderId: z.string().trim().min(1).max(60),
  status: z.enum(["unpaid", "paid", "failed", "refunded"]),
  provider: z.string().trim().max(50).optional(),
  reference: z.string().trim().max(200).optional(),
});

// ── Helper ────────────────────────────────────────────────────────────────────

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validate an unknown payload against a Zod schema, returning a flat
 * French error message on failure (first issue) for consistent API responses.
 */
export function validate<T>(schema: z.ZodType<T>, payload: unknown): ValidationResult<T> {
  const result = schema.safeParse(payload);
  if (result.success) return { success: true, data: result.data };
  const first = result.error.issues[0];
  const path = first?.path?.length ? `${first.path.join(".")} : ` : "";
  return { success: false, error: `${path}${first?.message ?? "Données invalides."}` };
}
