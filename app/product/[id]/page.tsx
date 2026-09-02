import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';
import ProductDetailClient from '@/app/components/ProductDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('title, description')
    .eq('id', params.id)
    .single();

  if (!product) {
    return { title: 'Producto no encontrado | Amora Jewelry' };
  }

  return {
    title: `${product.title} | Amora Jewelry`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
