'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  charcoal: '#1E1E1E',
  muted:    '#7A7468',
  gold:     '#B8975A',
  goldLight:'#D4B878',
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
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Por favor, selecciona una talla antes de añadir a la bolsa.');
      return;
    }

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

  return (
    <div style={{ background: S.ivory, minHeight: '100vh', fontFamily: 'Inter, sans-serif', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      
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
          background-color: ${S.offWhite};
          border: 1px solid ${S.nude};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
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

      {/* NAVBAR SUPER SIMPLE PARA VOLVER */}
      <nav style={{ padding: '16px 5%', background: S.offWhite, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${S.nude}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', fontWeight: 600, color: S.obsidian, textDecoration: 'none', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
          AMORA <span style={{ fontSize: '0.75rem', fontWeight: 400, letterSpacing: '0.15em', color: S.gold }}>JEWELRY</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={openCart} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>🛒</span>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: S.obsidian, color: S.offWhite, borderRadius: '50%', width: 18, height: 18, fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </button>
          
          <Link href="/" style={{ color: S.charcoal, textDecoration: 'none', fontSize: '0.82rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', borderBottom: `1px solid ${S.nudeDark}`, paddingBottom: 2 }}>
            ← Volver
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
                    border: activeImage === img ? `2px solid ${S.gold}` : `1px solid ${S.nude}`,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    background: S.offWhite
                  }}
                >
                  <Image src={img} alt={`Vista ${idx + 1}`} fill style={{ objectFit: 'contain', padding: '4px' }} />
                </div>
              ))}
            </div>
          )}

          {/* Imagen Principal Contenida */}
          <div className="pdetail-main-img-box">
            <Image 
              src={activeImage} 
              alt={product.title} 
              fill 
              style={{ objectFit: 'contain', padding: '16px' }} 
              priority 
            />
          </div>
        </div>

        {/* Lado Derecho: Detalles e información */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <p style={{ fontFamily: 'Cinzel, serif', color: S.gold, letterSpacing: '2px', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
            {product.category}
          </p>
          
          <h1 className="pdetail-title" style={{ fontSize: '1.8rem', color: S.obsidian, fontWeight: 400, marginBottom: '14px', lineHeight: 1.25, fontFamily: 'Cormorant Garamond, serif' }}>
            {product.title}
          </h1>
          
          <div className="pdetail-price" style={{ fontSize: '1.4rem', color: S.obsidian, fontWeight: 500, marginBottom: '20px', fontFamily: 'Cinzel, serif' }}>
            ${product.sale_price?.toLocaleString('es-CL')} <span style={{ fontSize: '0.75rem', color: S.muted, fontWeight: 400 }}>CLP</span>
          </div>

          <div style={{ width: '40px', height: '2px', backgroundColor: S.gold, marginBottom: '24px' }} />

          {/* Descripción con formato preservado */}
          <div style={{ color: S.charcoal, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '32px', whiteSpace: 'pre-wrap', background: S.offWhite, padding: '20px', borderRadius: '10px', border: `1px solid ${S.nude}` }}>
            {product.description}
          </div>

          {/* Selector de Tallas */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: S.obsidian, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tallas Disponibles:</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '8px 16px',
                      background: selectedSize === size ? S.obsidian : S.offWhite,
                      color: selectedSize === size ? S.offWhite : S.obsidian,
                      border: `1px solid ${selectedSize === size ? S.obsidian : S.nudeDark}`,
                      cursor: 'pointer',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: selectedSize === size ? 600 : 400,
                      transition: 'all 0.2s ease',
                      boxShadow: selectedSize === size ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón Añadir a la Bolsa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="pdetail-add-btn"
              onClick={handleAddToCart}
              style={{
                padding: '16px 24px',
                backgroundColor: S.obsidian,
                color: S.offWhite,
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '2px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                boxShadow: '0 4px 16px rgba(16,16,16,0.15)'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = S.charcoal}
              onMouseOut={e => e.currentTarget.style.backgroundColor = S.obsidian}
            >
              AÑADIR A LA BOLSA
            </button>

            <a
              href={`https://wa.me/56951555556?text=${encodeURIComponent(
                `Hola Amora Jewelry, me gustaría pedir el producto "${product.title}"${
                  selectedSize ? ` (Talla: ${selectedSize})` : ''
                } - $${product.sale_price?.toLocaleString('es-CL')}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 24px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '1.5px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37,211,102,0.25)'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>💬</span> PEDIR VÍA WHATSAPP
            </a>
          </div>
          
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: S.muted, background: 'rgba(184,151,90,0.06)', padding: '16px', borderRadius: '8px', border: `1px solid rgba(184,151,90,0.2)` }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✨ <strong>Envío asegurado</strong> a todo Chile</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>💎 <strong>Joyería hipoalergénica</strong> libre de níquel</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🎁 <strong>Empaque premium</strong> ideal para regalo incluido</p>
          </div>
        </div>

      </main>
    </div>
  );
}
