import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';
import ProductDetailClient from '@/app/components/ProductDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('title, description, image_url, category, sku, sale_price')
    .eq('id', params.id)
    .single();

  if (!product) {
    return { title: 'Producto no encontrado | NOVA Performance®' };
  }

  const title = `${product.title} | NOVA Performance®`;
  const description = product.description
    ? product.description.slice(0, 160).replace(/\n/g, ' ')
    : `${product.title} — Compuesto de investigación de alta pureza. Disponible en Chile. Envío discreto a todo el país.`;
  const url = `https://novaperformance.cl/product/${params.id}`;

  return {
    title,
    description,
    keywords: [
      product.title,
      product.sku || '',
      product.category || '',
      'péptidos chile',
      'NOVA Performance',
      'péptidos de investigación',
      'péptidos alta pureza',
      'compuesto liofilizado',
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'NOVA Performance® | Peptidos Novita',
      locale: 'es_CL',
      type: 'website',
      images: product.image_url
        ? [{ url: product.image_url, width: 800, height: 800, alt: product.title }]
        : [{ url: 'https://novaperformance.cl/og-image.png', width: 1200, height: 630, alt: 'NOVA Performance® Péptidos Chile' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image_url ? [product.image_url] : ['/og-image.png'],
    },
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

  // ── Disponibilidad según stock ────────────────────────────────────────
  const availability =
    product.stock === null || product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  // ── Google Product Schema JSON-LD (completo para Rich Results) ────────
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || '',
    image: [
      product.image_url,
      ...(product.images || []),
    ].filter(Boolean),
    sku: product.sku || String(product.id),
    mpn: product.sku || String(product.id),
    brand: {
      '@type': 'Brand',
      name: 'NOVA Performance®',
    },
    category: product.category || 'Péptidos de Investigación',
    url: `https://novaperformance.cl/product/${product.id}`,
    offers: {
      '@type': 'Offer',
      url: `https://novaperformance.cl/product/${product.id}`,
      priceCurrency: 'CLP',
      price: product.sale_price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'NOVA Performance® | Peptidos Novita',
        url: 'https://novaperformance.cl',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: 'CLP',
          minValue: 0,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CL',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CL',
        returnPolicyCategory:
          'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
