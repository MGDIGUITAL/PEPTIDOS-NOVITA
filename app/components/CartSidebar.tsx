'use client';
import { useCart } from './CartContext';
import Image from 'next/image';
import Link from 'next/link';

const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  charcoal: '#1E1E1E',
  muted:    '#7A7468',
  gold:     '#B8975A',
};

export default function CartSidebar() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
          zIndex: 9999, transition: 'opacity 0.3s'
        }}
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 400,
        background: S.offWhite, zIndex: 10000, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', transform: 'translateX(0)',
        transition: 'transform 0.3s ease-in-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: `1px solid ${S.nude}`, display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center', background: S.ivory
        }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: S.obsidian, margin: 0, fontWeight: 400 }}>
            Tu Carrito
          </h2>
          <button 
            onClick={closeCart}
            style={{
              background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', 
              color: S.muted, padding: 0, lineHeight: 1
            }}
          >×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: S.muted, marginTop: 40, fontFamily: 'Inter, sans-serif' }}>
              Tu carrito está vacío.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 80, height: 80, background: S.ivory, position: 'relative', flexShrink: 0, border: `1px solid ${S.nude}` }}>
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.6rem', color: S.nudeDark }}>Sin Imagen</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: S.obsidian, fontWeight: 400, fontFamily: 'Inter, sans-serif', paddingRight: 8 }}>
                        {item.title} {item.size && <span style={{ color: S.muted, fontSize: '0.8rem', marginLeft: '6px' }}>(Talla: {item.size})</span>}
                      </h4>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div style={{ color: S.muted, fontSize: '0.85rem', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                      ${item.price.toLocaleString('es-CL')}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', gap: 12 }}>
                      <div style={{ display: 'flex', border: `1px solid ${S.nude}`, borderRadius: 0, overflow: 'hidden' }}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ background: S.ivory, border: 'none', width: 28, height: 28, cursor: 'pointer', color: S.obsidian }}
                        >-</button>
                        <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: S.obsidian, background: '#fff' }}>
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ background: S.ivory, border: 'none', width: 28, height: 28, cursor: 'pointer', color: S.obsidian }}
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
          <div style={{ padding: '24px', borderTop: `1px solid ${S.nude}`, background: S.ivory }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', color: S.obsidian, textTransform: 'uppercase' }}>Subtotal</span>
              <span style={{ fontSize: '1.2rem', color: S.obsidian, fontWeight: 400 }} suppressHydrationWarning>
                ${cartTotal.toLocaleString('es-CL')}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: S.muted, marginBottom: 20 }}>
              Los impuestos y gastos de envío se calcularán en el checkout.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/checkout" onClick={closeCart} style={{
                width: '100%', padding: '16px', background: S.obsidian, color: S.offWhite, 
                border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'background 0.3s',
                display: 'block', textAlign: 'center', textDecoration: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.background = S.charcoal}
              onMouseLeave={e => e.currentTarget.style.background = S.obsidian}
              >
                Ir a Pagar (Web)
              </Link>

              {(() => {
                const messageText = `Hola Peptidos Novita, quisiera realizar el siguiente pedido por WhatsApp:\n\n` +
                  cart.map(item => `• ${item.title}${item.size ? ` (Talla: ${item.size})` : ''} - Cantidad: ${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-CL')}`).join('\n') +
                  `\n\nTotal: $${cartTotal.toLocaleString('es-CL')}\n\nQuedo atento a la confirmación para el envío.`;
                const whatsappUrl = `https://wa.me/56951555556?text=${encodeURIComponent(messageText)}`;

                return (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeCart}
                    style={{
                      width: '100%', padding: '14px', background: '#25D366', color: '#FFFFFF',
                      border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.78rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'opacity 0.3s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(37,211,102,0.2)'
                    }}
                  >
                    <span>💬</span> Pedir por WhatsApp
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
