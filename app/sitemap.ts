import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://novaperformance.cl';

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/catalogo',
    '/nosotros',
    '/contacto',
    '/marco-regulatorio',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Routes (Products)
  try {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, updated_at')
      .eq('status', 'active');

    const productRoutes = (products || []).map((product) => ({
      url: `${baseUrl}/producto/${product.id}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return staticRoutes;
  }
}
