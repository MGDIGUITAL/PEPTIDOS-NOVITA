'use client';
import { useCart } from './CartContext';
import Image from 'next/image';
import Link from 'next/link';

const S = {
  black:    '#000000',
  surface:  '#0A0A0A',
  border:   '#222222',
  ivory:    '#E6E2D3',
  white:    '#FFFFFF',
  muted:    '#888888',
};

function formatCLP(amount: number) {
  return '$' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function CartSidebar() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', 
          backdropFilter: 'blur(6px)', zIndex: 9999, transition: 'opacity 0.3s'
        }}
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420,
        background: S.black, borderLeft: `1px solid ${S.border}`, zIndex: 10000, boxShadow: '-8px 0 32px rgba(0,0,0,0.9)',
        display: 'flex', flexDirection: 'column', transform: 'translateX(0)',
        transition: 'transform 0.3s ease-in-out', color: S.white
      }}>
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: `1px solid ${S.border}`, display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center', background: S.surface
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>🛒</span>
            <h2 className="font-display" style={{ fontSize: '1.1rem', color: S.ivory, margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tu Carrito
            </h2>
          </div>
          <button 
            onClick={closeCart}
            style={{
              background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', 
              color: S.muted, padding: 4, lineHeight: 1
            }}
            onMouseEnter={e => (e.currentTarget.style.color = S.white)}
            onMouseLeave={e => (e.currentTarget.style.color = S.muted)}
          >×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: S.muted, marginTop: 60, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>
              Tu carrito está vacío.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 16, background: S.surface, border: `1px solid ${S.border}`, padding: '16px', borderRadius: '6px' }}>
                  <div style={{ width: 72, height: 72, background: '#050505', position: 'relative', flexShrink: 0, border: `1px solid ${S.border}`, borderRadius: '4px', overflow: 'hidden' }}>
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'contain', padding: 4 }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.55rem', color: S.muted }}>NOVA</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', color: S.white, fontWeight: 700, fontFamily: 'Outfit, sans-serif', paddingRight: 8 }}>
                        {item.title} {item.size && <span style={{ color: S.muted, fontSize: '0.75rem', marginLeft: '4px' }}>({item.size})</span>}
                      </h4>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                        title="Eliminar"
                        onMouseEnter={e => (e.currentTarget.style.color = '#FF4D4D')}
                        onMouseLeave={e => (e.currentTarget.style.color = S.muted)}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="font-display" style={{ color: S.ivory, fontSize: '0.9rem', marginTop: 4, fontWeight: 800 }} suppressHydrationWarning>
                      {formatCLP(item.price)}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', gap: 12 }}>
                      <div style={{ display: 'flex', border: `1px solid ${S.border}`, borderRadius: 4, overflow: 'hidden' }}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ background: S.surface, border: 'none', width: 26, height: 26, cursor: 'pointer', color: S.white, fontWeight: 700 }}
                        >-</button>
                        <div style={{ width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: S.white, background: S.black, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ background: S.surface, border: 'none', width: 26, height: 26, cursor: 'pointer', color: S.white, fontWeight: 700 }}
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '24px', borderTop: `1px solid ${S.border}`, background: S.surface }}>
            
            {/* ── BANNER DE DESPACHO GRATIS ── */}
            {(() => {
              const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
              const isFreeShipping = totalItems >= 2;
              return (
                <div style={{
                  padding: '10px 14px', borderRadius: 6, marginBottom: 16,
                  background: isFreeShipping ? 'rgba(34, 197, 94, 0.12)' : 'rgba(230, 226, 211, 0.1)',
                  border: `1px solid ${isFreeShipping ? 'rgba(34, 197, 94, 0.4)' : 'rgba(230, 226, 211, 0.3)'}`,
                  color: isFreeShipping ? '#22c55e' : S.ivory,
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center'
                }}>
                  {isFreeShipping 
                    ? '🎉 ¡DESPACHO GRATIS APLICADO (2+ PRODUCTOS)!' 
                    : '🚚 ¡LLEVA 1 PRODUCTO MÁS Y TÚ DESPACHO SERÁ 100% GRATIS!'}
                </div>
              );
            })()}

            {/* ── RECOMENDACIÓN DE AGUA BACTERIOSTÁTICA ── */}
            {(() => {
              const hasAgua = cart.some(item => (item.title || '').toLowerCase().includes('agua') || item.productId === '9');
              const { addToCart } = useCart();
              return (
                <div style={{ background: '#141414', border: `1px solid ${hasAgua ? 'rgba(34, 197, 94, 0.4)' : S.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1rem' }}>💧</span>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: S.ivory, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
                      RECOMENDACIÓN IMPORTANTE
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.76rem', color: S.muted, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                    Para disolver y reconstituir adecuadamente tus péptidos para su consumo, es indispensable contar con <strong>Agua Bacteriostática 3ml</strong>.
                  </p>
                  {hasAgua ? (
                    <div style={{ color: '#22c55e', fontSize: '0.76rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
                      <span>✓</span> Agua Bacteriostática incluida en tu carrito
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart({
                        id: 9,
                        title: 'Agua Bacteriostática 3ml — Solvente para Reconstitución de Péptidos',
                        price: 7990,
                        category: 'Accesorios'
                      }, 1, '3ml')}
                      style={{
                        width: '100%', padding: '10px 14px', background: S.ivory, color: S.black,
                        border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.74rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800,
                        transition: 'all 0.2s'
                      }}
                    >
                      + Añadir Agua Bacteriostática ($7.990)
                    </button>
                  )}
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Subtotal</span>
              <span className="font-display" style={{ fontSize: '1.4rem', color: S.ivory, fontWeight: 800 }} suppressHydrationWarning>
                {formatCLP(cartTotal)}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: S.muted, marginBottom: 20, lineHeight: 1.5 }}>
              Despacho discreto con rotulación neutra a todo Chile.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/checkout" onClick={closeCart} style={{
                width: '100%', padding: '16px', background: S.white, color: S.black, 
                border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem',
                letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, transition: 'all 0.3s',
                display: 'block', textAlign: 'center', textDecoration: 'none', borderRadius: 4
              }}
              onMouseEnter={e => { e.currentTarget.style.background = S.ivory; e.currentTarget.style.boxShadow = '0 0 16px rgba(230,226,211,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = S.white; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Ir a Pagar
              </Link>

              {(() => {
                const messageText = `Hola NOVA Performance, quisiera realizar la siguiente orden por WhatsApp:\n\n` +
                  cart.map(item => `• ${item.title}${item.size ? ` (${item.size})` : ''} - Cantidad: ${item.quantity} - ${formatCLP(item.price * item.quantity)}`).join('\n') +
                  `\n\nTotal: ${formatCLP(cartTotal)}\n\nQuedo atento a las instrucciones para la transferencia/envío.`;
                const whatsappUrl = `https://wa.me/56951555556?text=${encodeURIComponent(messageText)}`;

                return (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeCart}
                    style={{
                      width: '100%', padding: '14px', background: '#25D366', color: '#FFFFFF',
                      border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800, transition: 'all 0.3s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none',
                      borderRadius: 4
                    }}
                  >
                    <span>💬</span> Ordenar Vía WhatsApp
                  </a>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
