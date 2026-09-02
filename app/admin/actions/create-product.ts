'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { productSchema, type ProductFormData, type CreateProductPayload } from '@/lib/schemas/product';
import { revalidatePath } from 'next/cache';

// ─── Response type ──────────────────────────────────────────────────────
interface ActionResult {
  success: boolean;
  message: string;
  productId?: number;
}

// ─── Upload image to Supabase Storage ───────────────────────────────────
async function uploadProductImage(file: File): Promise<string> {
  const bucket = 'product-images';
  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `products/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/png',
    });

  if (uploadError) {
    throw new Error(`Error al cargar la imagen: ${uploadError.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return urlData.publicUrl;
}

// ─── Create Product Server Action ───────────────────────────────────────
export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    // 1. Extract and parse form fields
    const rawData: Record<string, unknown> = {
      title:            formData.get('title') as string,
      description:      formData.get('description') as string || '',
      category:         formData.get('category') as string,
      salePrice:        Number(formData.get('salePrice')),
      costPrice:        formData.get('costPrice') ? Number(formData.get('costPrice')) : undefined,
      sku:              formData.get('sku') as string || '',
      isUnlimitedStock: formData.get('isUnlimitedStock') === 'true',
      stockQuantity:    formData.get('stockQuantity') ? Number(formData.get('stockQuantity')) : undefined,
      shippingProfileId: formData.get('shippingProfileId') as string || 'shipping_standard',
      weight:           formData.get('weight') ? Number(formData.get('weight')) : undefined,
      dimensions:       formData.get('dimensions') as string || '',
      status:           formData.get('status') as string || 'active',
      sizes:            formData.get('sizes') ? JSON.parse(formData.get('sizes') as string) : [],
    };

    // 2. Validate with Zod
    const parsed = productSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, message: firstError.message };
    }

    const validated = parsed.data;

    // 3. Upload images (if provided)
    let imageUrl = '';
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadProductImage(imageFile);
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'Error al cargar la imagen principal',
        };
      }
    }

    let referenceImageUrl = '';
    const referenceImageFile = formData.get('referenceImage') as File | null;
    if (referenceImageFile && referenceImageFile.size > 0) {
      try {
        referenceImageUrl = await uploadProductImage(referenceImageFile);
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'Error al cargar la imagen de referencia',
        };
      }
    }

    // 4. Build database payload
    const stock = validated.isUnlimitedStock ? null : (validated.stockQuantity ?? 0);

    const dbPayload: any = {
      title:               validated.title,
      description:         validated.description,
      category:            validated.category,
      sale_price:          validated.salePrice,
      cost_price:          validated.costPrice ?? null,
      sku:                 validated.sku || null,
      stock:               stock,
      shipping_profile_id: validated.shippingProfileId,
      weight:              validated.weight ?? null,
      dimensions:          validated.dimensions || null,
      status:              validated.status,
      sizes:               validated.sizes.length > 0 ? validated.sizes : null,
      created_at:          new Date().toISOString(),
    };

    if (imageUrl) {
      dbPayload.image_url = imageUrl;
    }
    if (referenceImageUrl) {
      dbPayload.reference_image_url = referenceImageUrl;
    }

    // 5. Insert into Supabase
    const { data, error: dbError } = await supabaseAdmin
      .from('products')
      .insert(dbPayload)
      .select('id')
      .single();

    if (dbError) {
      console.error('[createProduct] DB Error:', dbError);
      return { success: false, message: `Fallo al guardar en la base de datos: ${dbError.message}` };
    }

    revalidatePath('/admin/productos');
    revalidatePath('/');

    return {
      success: true,
      message: validated.status === 'draft'
        ? 'Borrador guardado correctamente'
        : 'Producto creado exitosamente',
      productId: data?.id,
    };
  } catch (err) {
    console.error('[createProduct] Unexpected error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Error inesperado al crear el producto',
    };
  }
}
