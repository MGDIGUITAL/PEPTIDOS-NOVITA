'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const S = {
  black:    '#000000',
  surface:  '#0A0A0A',
  border:   '#222222',
  ivory:    '#E6E2D3',
  white:    '#FFFFFF',
  muted:    '#888888',
};

export default function ProductDetailClient({ product }: { product: any }) {
  const { addToCart, openCart, cartCount } = useCart();
  const [activeImage, setActiveImage] = useState(product.image_url);

  // Imágenes disponibles para la galería
  const galleryImages: string[] = [product.image_url];
  if (product.reference_image_url && product.reference_image_url !== product.image_url) {
    galleryImages.push(product.reference_image_url);
  }

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.sale_price,
        image_url: product.image_url,
      },
      1,
      selectedSize || undefined
    );
  };

  const formattedPrice = product.sale_price
    ? Math.round(product.sale_price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : '0';

  return (
    <div style={{ background: S.black, color: S.white, minHeight: '100vh', fontFamily: 'Inter, sans-serif', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      
      {/* Dynamic Styles for Mobile Responsiveness */}
      <style>{`
        .pdetail-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          maxWidth: 1200px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          align-items: start;
        }

        .pdetail-gallery {
          display: flex;
          gap: 16px;
          width: 100%;
          min-width: 0;
        }

        .pdetail-thumbs {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-shrink: 0;
        }

        .pdetail-main-img-box {
          position: relative;
          width: 100%;
          min-width: 0;
          aspect-ratio: 1 / 1;
          background-color: #050505;
          border: 1px solid ${S.border};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.8);
        }

        @media (max-width: 868px) {
          .pdetail-container {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            padding: 20px 16px 60px !important;
          }

          .pdetail-gallery {
            flex-direction: column-reverse !important;
            gap: 12px !important;
          }

          .pdetail-thumbs {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding-bottom: 4px;
          }

          .pdetail-thumb-item {
            width: 64px !important;
            height: 64px !important;
            border-radius: 8px !important;
          }

          .pdetail-main-img-box {
            aspect-ratio: 1 / 1 !important;
            border-radius: 12px !important;
          }

          .pdetail-title {
            font-size: 1.4rem !important;
          }

          .pdetail-price {
            font-size: 1.3rem !important;
          }

          .pdetail-add-btn {
            max-width: 100% !important;
            padding: 16px 0 !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ padding: '16px 5%', background: S.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${S.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo-nova-white.png" alt="NOVA Performance" width={180} height={40} style={{ objectFit: 'contain' }} priority />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={openCart} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', color: S.white }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: S.ivory, color: S.black, borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </button>
          
          <Link href="/" style={{ color: S.ivory, textDecoration: 'none', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.08em', borderBottom: `1px solid ${S.border}`, paddingBottom: 2 }}>
            ← Volver al Catálogo
          </Link>
        </div>
      </nav>

      {/* DETALLE DEL PRODUCTO */}
      <main className="pdetail-container">
        
        {/* Lado Izquierdo: Galería de imágenes */}
        <div className="pdetail-gallery">
          
          {/* Thumbnails (solo si hay más de 1 imagen) */}
          {galleryImages.length > 1 && (
            <div className="pdetail-thumbs">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx}
                  className="pdetail-thumb-item"
                  onClick={() => setActiveImage(img)}
                  style={{ 
                    position: 'relative', width: '70px', height: '70px', cursor: 'pointer',
                    borderRadius: '8px', overflow: 'hidden',
                    border: activeImage === img ? `2px solid ${S.ivory}` : `1px solid ${S.border}`,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    background: '#050505'
                  }}
                >
                  <Image src={img} alt={`Vista ${idx + 1}`} fill style={{ objectFit: 'contain', padding: '4px' }} />
                </div>
              ))}
            </div>
          )}

          {/* Imagen Principal Contenida */}
          <div className="pdetail-main-img-box">
            {activeImage ? (
              <Image 
                src={activeImage} 
                alt={product.title} 
                fill 
                style={{ objectFit: 'contain', padding: '16px' }} 
                priority 
              />
            ) : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:S.muted, fontFamily:'Outfit,sans-serif' }}>
                Péptido NOVA Performance
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Detalles e información */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', color: S.ivory, letterSpacing: '2px', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
            {product.category || 'PÉPTIDO DE INVESTIGACIÓN'}
          </p>
          
          <h1 className="pdetail-title font-display" style={{ fontSize: '2.2rem', color: S.white, fontWeight: 800, marginBottom: '14px', lineHeight: 1.2, textTransform: 'uppercase' }}>
            {product.title}
          </h1>
          
          <div className="pdetail-price font-display" style={{ fontSize: '1.6rem', color: S.ivory, fontWeight: 800, marginBottom: '20px' }} suppressHydrationWarning>
            ${formattedPrice} <span style={{ fontSize: '0.75rem', color: S.muted, fontWeight: 400 }}>CLP</span>
          </div>

          <div style={{ width: '40px', height: '2px', backgroundColor: S.ivory, marginBottom: '24px' }} />

          {/* Descripción */}
          <div style={{ color: '#CCCCCC', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '32px', whiteSpace: 'pre-wrap', background: S.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${S.border}` }}>
            {product.description || 'Compuesto químico producido bajo estrictos estándares analíticos HPLC (>99% pureza) destinado exclusivamente a investigación científica (Research Use Only).'}
          </div>

          {/* Selector de Tallas / Variaciones si aplican */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: S.ivory, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit,sans-serif' }}>Formulaciones:</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '8px 16px',
                      background: selectedSize === size ? S.white : S.surface,
                      color: selectedSize === size ? S.black : S.white,
                      border: `1px solid ${selectedSize === size ? S.white : S.border}`,
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '0.82rem',
                      fontFamily: 'Outfit,sans-serif',
                      fontWeight: selectedSize === size ? 800 : 400,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="pdetail-add-btn"
              onClick={handleAddToCart}
              style={{
                padding: '18px 24px',
                backgroundColor: S.white,
                color: S.black,
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.14em',
                fontSize: '0.85rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = S.ivory; e.currentTarget.style.boxShadow = '0 0 20px rgba(230,226,211,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = S.white; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
              <span>AÑADIR AL CARRITO</span>
            </button>

            <a
              href={`https://wa.me/56951555556?text=${encodeURIComponent(
                `Hola NOVA Performance, quisiera consultar por el compuesto de investigación "${product.title}" - $${formattedPrice}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '16px 24px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.12em',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                textDecoration: 'none',
              }}
            >
              <span>💬</span> CONSULTAR TÉCNICAMENTE POR WHATSAPP
            </a>
          </div>
          
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: S.muted, background: S.surface, padding: '16px 20px', borderRadius: '6px', border: `1px solid ${S.border}` }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>🔬 <strong>Pureza Analítica Certificada</strong> &gt;99% HPLC por lote</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>📦 <strong>Empaque Neutro y Discreto</strong> a todo Chile</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>📋 <strong>Research Use Only (RUO)</strong> Compuesto de investigación</p>
          </div>

          {/* Aviso Legal & Marco Regulatorio */}
          <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(230, 226, 211, 0.22)', borderRadius: '6px', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ color: '#E6E2D3', fontSize: '0.85rem' }}>⚠️</span>
              <span style={{ fontSize: '0.7rem', color: S.ivory, fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Aviso Legal · Investigación Científica
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#AAAAAA', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
              Productos para investigación científica únicamente. No destinados a consumo humano. Acceso restringido a investigadores y profesionales mayores de 18 años. No son medicamentos ni cosméticos sujetos a registro sanitario ISP.{' '}
              <Link href="/marco-regulatorio" target="_blank" style={{ color: S.white, textDecoration: 'underline', fontWeight: 700 }}>
                Aviso Legal
              </Link>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
