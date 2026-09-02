'use server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(productId: number) {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('[deleteProduct] DB Error:', error);
      return { success: false, message: `Fallo al eliminar: ${error.message}` };
    }

    revalidatePath('/admin/productos');
    revalidatePath('/');

    return { success: true, message: 'Producto eliminado correctamente' };
  } catch (err) {
    console.error('[deleteProduct] Unexpected error:', err);
    return { success: false, message: 'Error inesperado al eliminar el producto' };
  }
}
