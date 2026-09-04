import { z } from 'zod';

// ─── Shipping Profiles ──────────────────────────────────────────────────
export const SHIPPING_PROFILES = [
  { id: 'shipping_standard', label: 'Envío Estándar Nacional', days: '5-7 días hábiles' },
  { id: 'shipping_express',  label: 'Envío Express Priority',    days: '1-2 días hábiles' },
  { id: 'shipping_free',     label: 'Envío Gratis (joyería pequeña)', days: '7-10 días hábiles' },
] as const;

export const PRODUCT_CATEGORIES = ['Anillos', 'Cadenas', 'Pendientes', 'Pulseras', 'Aros'] as const;

export type ShippingProfileId = typeof SHIPPING_PROFILES[number]['id'];
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// ─── Zod Schema ─────────────────────────────────────────────────────────
export const productSchema = z
  .object({
    // ── Required fields ──
    title: z
      .string({ error: 'El título es obligatorio' })
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(120, 'Máximo 120 caracteres'),

    description: z
      .string()
      .max(2000, 'La descripción no puede superar los 2000 caracteres')
      .optional()
      .default(''),

    category: z.enum(PRODUCT_CATEGORIES, {
      error: 'Selecciona una categoría',
    }),

    // ── Pricing ──
    salePrice: z
      .number({ error: 'El precio de venta es obligatorio' })
      .positive('El precio debe ser mayor a $0'),

    costPrice: z
      .number()
      .nonnegative('El costo no puede ser negativo')
      .optional(),

    // ── Inventory ──
    sku: z
      .string()
      .max(50, 'SKU demasiado largo')
      .optional()
      .default(''),

    isUnlimitedStock: z.boolean().default(true),

    stockQuantity: z
      .number()
      .int('El stock debe ser un número entero')
      .nonnegative('El stock no puede ser negativo')
      .optional(),

    // ── Shipping ──
    shippingProfileId: z
      .enum(
        SHIPPING_PROFILES.map(p => p.id) as [ShippingProfileId, ...ShippingProfileId[]],
        { error: 'Selecciona un perfil de envío' }
      )
      .default('shipping_standard'),

    weight: z
      .number()
      .nonnegative('El peso no puede ser negativo')
      .optional(),

    dimensions: z
      .string()
      .max(50)
      .optional()
      .default(''),

    // ── Status ──
    status: z.enum(['draft', 'active']).default('active'),

    // ── Sizes ──
    sizes: z.array(z.string()).optional().default([]),
  })

  // ── Conditional stock validation ──
  .superRefine((data, ctx) => {
    if (!data.isUnlimitedStock && (data.stockQuantity === undefined || data.stockQuantity === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La cantidad de stock es obligatoria cuando el stock es específico',
        path: ['stockQuantity'],
      });
    }
  });

// ─── Types ──────────────────────────────────────────────────────────────
export type ProductFormData = z.input<typeof productSchema>;

/** Payload sent to the server (after image upload resolves) */
export interface CreateProductPayload extends Omit<ProductFormData, 'isUnlimitedStock' | 'stockQuantity'> {
  imageUrl: string | null;
  stock: number | null; // null = unlimited, positive int = specific
}
