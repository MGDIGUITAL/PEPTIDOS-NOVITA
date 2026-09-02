import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { productSchema } from '@/lib/schemas/product';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s timeout for image processing

// Helper to upload image to Supabase Storage
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

// POST: Create new product
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

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

    // Validate with Zod
    const parsed = productSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json({ success: false, message: firstError.message }, { status: 400 });
    }

    const validated = parsed.data;

    // Upload main image
    let imageUrl = '';
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadProductImage(imageFile);
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || 'Error al cargar la imagen principal' }, { status: 500 });
      }
    }

    // Upload reference image
    let referenceImageUrl = '';
    const referenceImageFile = formData.get('referenceImage') as File | null;
    if (referenceImageFile && referenceImageFile.size > 0) {
      try {
        referenceImageUrl = await uploadProductImage(referenceImageFile);
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || 'Error al cargar la imagen de referencia' }, { status: 500 });
      }
    }

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

    if (imageUrl) dbPayload.image_url = imageUrl;
    if (referenceImageUrl) dbPayload.reference_image_url = referenceImageUrl;

    const { data, error: dbError } = await supabaseAdmin
      .from('products')
      .insert(dbPayload)
      .select('id')
      .single();

    if (dbError) {
      console.error('[POST /api/admin/products] DB Error:', dbError);
      return NextResponse.json({ success: false, message: `Fallo al guardar en la base de datos: ${dbError.message}` }, { status: 500 });
    }

    revalidatePath('/admin/productos');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: validated.status === 'draft' ? 'Borrador guardado correctamente' : 'Producto creado exitosamente',
      productId: data?.id,
    });
  } catch (err: any) {
    console.error('[POST /api/admin/products] Error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error interno al crear el producto' }, { status: 500 });
  }
}

// PUT: Update existing product
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const productId = Number(formData.get('productId'));

    if (!productId) {
      return NextResponse.json({ success: false, message: 'ID de producto no proporcionado' }, { status: 400 });
    }

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

    const parsed = productSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json({ success: false, message: firstError.message }, { status: 400 });
    }

    const validated = parsed.data;

    let imageUrl = '';
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadProductImage(imageFile);
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || 'Error al cargar la imagen principal' }, { status: 500 });
      }
    }

    let referenceImageUrl = '';
    const referenceImageFile = formData.get('referenceImage') as File | null;
    if (referenceImageFile && referenceImageFile.size > 0) {
      try {
        referenceImageUrl = await uploadProductImage(referenceImageFile);
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || 'Error al cargar la imagen de referencia' }, { status: 500 });
      }
    }

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
      updated_at:          new Date().toISOString(),
    };

    if (imageUrl) dbPayload.image_url = imageUrl;
    if (referenceImageUrl) dbPayload.reference_image_url = referenceImageUrl;

    const { error: dbError } = await supabaseAdmin
      .from('products')
      .update(dbPayload)
      .eq('id', productId);

    if (dbError) {
      console.error('[PUT /api/admin/products] DB Error:', dbError);
      return NextResponse.json({ success: false, message: `Fallo al actualizar en la base de datos: ${dbError.message}` }, { status: 500 });
    }

    revalidatePath('/admin/productos');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado correctamente',
    });
  } catch (err: any) {
    console.error('[PUT /api/admin/products] Error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error interno al actualizar el producto' }, { status: 500 });
  }
}
