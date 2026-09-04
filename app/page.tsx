import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';
import StorefrontClient from './components/StorefrontClient';

export const metadata: Metadata = {
  title: 'Peptidos Novita | NOVA Performance®',
  description: 'Descubre nuestra línea exclusiva de péptidos de alta pureza y vanguardia biotecnológica. Envíos discretos y seguros a todo Chile.',
  keywords: 'peptidos, nova performance, biotecnología, peptidos chile, bienestar, alta pureza',
};

// Ensure the page always fetches fresh active products
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StorefrontPage() {
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products for storefront:', error);
  }

  return (
    <StorefrontClient products={products || []} />
  );
}
