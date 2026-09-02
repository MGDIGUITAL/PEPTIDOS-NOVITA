import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';
import StorefrontClient from './components/StorefrontClient';

export const metadata: Metadata = {
  title: 'Amora Jewelry | Joyería Premium en Chile',
  description: 'Descubre nuestra colección exclusiva de anillos, cadenas, pulseras y aros. Joyería artesanal con diseño atemporal y pago seguro.',
  keywords: 'joyería, anillos, cadenas, pulseras, oro, plata, joyería premium, chile',
};

// Ensure the page always fetches fresh active products
export const dynamic = 'force-dynamic';

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
