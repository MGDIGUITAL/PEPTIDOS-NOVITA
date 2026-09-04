'use client';
export const dynamic = 'force-dynamic';
import { useCart } from '../components/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { REGIONS } from '@/lib/shippingRates';
import { REGION_COMUNAS } from '@/lib/chileData';

const S = {
  black:    '#000000',
  surface:  '#0A0A0A',
  card:     '#121212',
  cardHover:'#1A1A1A',
  border:   '#222222',
  borderLight: '#333333',
  ivory:    '#E6E2D3',
  ivoryDark:'#C4BFA9',
  offWhite: '#EEEEEE',
  white:    '#FFFFFF',
  muted:    '#888888',
  accent:   '#3B82F6',
};

function formatRut(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  const fmt  = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${fmt}-${dv}`;
}

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const router = useRouter();
  
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientRut, setClientRut] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientLastname, setClientLastname] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Auto-cargar datos si el cliente inició sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        const u = session.user;
        if (u.email) setClientEmail(u.email);
        
        const meta = u.user_metadata || {};
        const fullName = (meta.full_name as string) || '';
        if (fullName) {
          const parts = fullName.trim().split(' ');
          setClientName(parts[0] || '');
          setClientLastname(parts.slice(1).join(' ') || '');
        }

        if (meta.rut) setClientRut(formatRut(meta.rut));
        if (meta.phone) setClientPhone(meta.phone);
        if (meta.address) setClientAddress(meta.address);
        if (meta.region_id) setSelectedRegionId(meta.region_id);
        if (meta.comuna) setSelectedComuna(meta.comuna);
      }
    });
  }, []);

  const selectedRegion = REGIONS.find(r => r.id === selectedRegionId);
  const shippingCost = 0; // Despacho a domicilio priority incluido

  const finalTotal = cartTotal + shippingCost;

  // Styling helpers
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', marginBottom: '16px',
    border: `1px solid ${S.border}`, background: '#141414',
    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: S.white,
    borderRadius: 6, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontSize: '0.72rem',
    fontFamily: 'Outfit, sans-serif', color: S.ivory, fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: S.white,
    marginBottom: '20px', fontWeight: 700, marginTop: '32px', letterSpacing: '0.05em',
    textTransform: 'uppercase'
  };

  const handleSubmit = async () => {
    if (!clientEmail || !clientName || !clientRut) {
      alert('Por favor completa los campos obligatorios (Nombre, RUT, Correo).');
      return;
    }
    if (!selectedRegionId || !selectedComuna || !clientAddress) {
      alert('Por favor completa tu dirección de despacho a domicilio.');
      return;
    }
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        client_name: `${clientName} ${clientLastname}`.trim(),
        client_rut: clientRut,
        client_email: clientEmail,
        client_phone: clientPhone,
        delivery_method: 'domicilio',
        shipping_region: selectedRegion?.name || '',
        shipping_comuna: selectedComuna,
        shipping_address: clientAddress,
        subtotal: cartTotal,
        shipping_cost: shippingCost,
        total: finalTotal,
        status: 'Pendiente'
      };

      const itemsPayload = cart.map(item => ({
        product_id: Number(item.productId || item.id),
        product_title: item.title,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null
      }));

      // Crear orden via API route segura
      const createOrderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderPayload, itemsPayload })
      });

      const createOrderData = await createOrderRes.json();
      if (!createOrderRes.ok) throw new Error(createOrderData.error || 'Error creando orden');

      const orderData = createOrderData.order;

      // Si el cliente está logeado, actualizar sus metadatos de perfil en segundo plano para recordar su dirección y datos
      if (isLoggedIn) {
        supabase.auth.updateUser({
          data: {
            full_name: `${clientName} ${clientLastname}`.trim(),
            phone: clientPhone,
            rut: clientRut,
            address: clientAddress,
            region_id: selectedRegionId,
            comuna: selectedComuna,
          }
        }).catch(err => console.error('Error actualizando metadatos de perfil:', err));
      }

      // ─── INTEGRACIÓN FLOW ──────────────────────────────────────────
      try {
        const flowRes = await fetch('/api/checkout/create-flow-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.id,
            amount: finalTotal,
            email: clientEmail
          })
        });

        const flowData = await flowRes.json();
        if (!flowRes.ok) throw new Error(flowData.error || 'Error creando pago');

        // Redirigir al cliente a Flow
        window.location.href = flowData.redirectUrl;
      } catch (err: any) {
        console.error('Error con Flow:', err);
        alert(`La orden se creó pero falló la conexión con Webpay: ${err.message}`);
        setIsSubmitting(false);
      }
    } catch (e: any) {
      console.error(e);
      alert('Hubo un error guardando la orden: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', background: S.black, color: S.white }}>
      <style>{`
        .checkout-layout { display: flex; flex: 1; flex-direction: row; }
        .checkout-left { flex: 1.1; padding: 48px 8%; background: ${S.surface}; border-right: 1px solid ${S.border}; }
        .checkout-right { flex: 0.9; padding: 48px 8%; background: ${S.card}; }
        .input-field:focus { border-color: ${S.ivory} !important; outline: none; background: #1c1c1c !important; }
        select.input-field option { background: #141414; color: #ffffff; }
        
        @media (max-width: 900px) {
          .checkout-layout { flex-direction: column-reverse; }
          .checkout-left, .checkout-right { padding: 36px 6%; border-right: none; }
          .checkout-right { border-bottom: 1px solid ${S.border}; }
        }
      `}</style>

      {/* Header Estética NOVA Performance */}
      <header style={{ padding: '20px 5%', borderBottom: `1px solid ${S.border}`, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/">
          <Image src="/logo-nova-white.png" alt="NOVA Performance" width={180} height={40} style={{ objectFit: 'contain' }} priority />
        </Link>
        <Link href="/?cart=open" style={{ fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif', color: S.ivory, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}>
          ← Volver al carrito
        </Link>
      </header>

      <div className="checkout-layout">
        {/* LADO IZQUIERDO: FORMULARIO */}
        <section className="checkout-left">
          <h2 style={{ ...sectionTitleStyle, marginTop: 0 }}>1. Información de Contacto</h2>
          {isLoggedIn && (
            <div style={{ padding: '16px 20px', background: S.surface, border: `1px solid ${S.border}`, borderLeft: `3px solid ${S.ivory}`, borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(230, 226, 211, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span style={{ fontSize: '0.8rem', color: S.white, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                Sesión activa como <strong style={{ color: S.ivory, fontWeight: 600 }}>{clientEmail}</strong>. Tus datos han sido cargados de forma segura.
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Correo Electrónico *</label>
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="tu@correo.com" className="input-field" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>RUT *</label>
              <input type="text" value={clientRut} onChange={e => setClientRut(formatRut(e.target.value))} placeholder="12.345.678-9" maxLength={12} className="input-field" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Teléfono de Contacto *</label>
            <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+56 9 1234 5678" className="input-field" style={inputStyle} />
          </div>

          <h2 style={sectionTitleStyle}>2. Dirección de Despacho a Domicilio</h2>
          <div style={{ padding: '16px 20px', background: '#141414', border: `1px solid ${S.border}`, borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.2rem' }}>🏠</span>
            <div>
              <div style={{ fontSize: '0.85rem', color: S.white, fontWeight: 700 }}>Despacho a Domicilio por el equipo de logística de NOVA Performance®</div>
              <div style={{ fontSize: '0.78rem', color: S.muted }}>Empaque térmico neutro y discreto garantizado a todo Chile.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Nombre *</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Tu nombre" className="input-field" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Apellidos</label>
              <input type="text" value={clientLastname} onChange={e => setClientLastname(e.target.value)} placeholder="Tus apellidos" className="input-field" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Dirección Completa (Calle, Número, Depto) *</label>
            <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Ej: Av. Las Condes 1234, Depto 502" className="input-field" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Región *</label>
              <select 
                value={selectedRegionId}
                onChange={e => { setSelectedRegionId(e.target.value); setSelectedComuna(''); }}
                className="input-field" 
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Selecciona tu región</option>
                {REGIONS.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Ciudad / Comuna *</label>
              <select 
                value={selectedComuna}
                onChange={e => setSelectedComuna(e.target.value)}
                className="input-field" 
                style={{ ...inputStyle, cursor: 'pointer' }}
                disabled={!selectedRegionId}
              >
                <option value="">Selecciona comuna</option>
                {selectedRegionId && REGION_COMUNAS[selectedRegionId]?.map(comuna => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </select>
            </div>
          </div>

          <h2 style={sectionTitleStyle}>3. Pasarela de Pago Oficial</h2>
          <div style={{ padding: '24px', border: `1px solid ${S.border}`, background: '#141414', borderRadius: 8, marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="radio" id="flow" name="payment" defaultChecked style={{ accentColor: S.white, transform: 'scale(1.2)' }} />
              <label htmlFor="flow" style={{ fontSize: '1rem', color: S.white, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                Webpay Plus / Flow Chile
              </label>
            </div>
            <p style={{ margin: '12px 0 0 28px', fontSize: '0.85rem', color: S.muted, lineHeight: 1.6 }}>
              Procesamiento 100% encriptado. Acepta Tarjetas de Crédito, Débito, Redcompra y Mach.
            </p>
          </div>

          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '18px', background: isSubmitting ? '#444444' : S.white, color: S.black, 
              border: 'none', borderRadius: 8, cursor: isSubmitting ? 'wait' : 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
              letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Conectando con Flow Webpay...' : 'Pagar Ahora con Webpay / Flow'}
          </button>
        </section>

        {/* LADO DERECHO: RESUMEN DE ORDEN */}
        <section className="checkout-right">
          <div style={{ position: 'sticky', top: 40 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: S.white, marginBottom: '28px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Resumen del Pedido
            </h2>

            {cart.length === 0 ? (
              <div style={{ color: S.muted, fontFamily: 'Inter, sans-serif' }}>
                Tu carrito está vacío. <Link href="/" style={{ color: S.white, textDecoration: 'underline' }}>Volver al catálogo</Link>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 16, borderBottom: `1px solid ${S.border}` }}>
                    <div style={{ width: 60, height: 60, background: '#181818', position: 'relative', flexShrink: 0, border: `1px solid ${S.border}`, borderRadius: 6, overflow: 'hidden' }}>
                      {item.image_url && (
                        <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'cover' }} />
                      )}
                      <span style={{ 
                        position: 'absolute', top: 4, right: 4, background: S.white, color: S.black, 
                        width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700
                      }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', color: S.white, fontWeight: 600 }}>{item.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: S.muted }}>Pureza analítica &gt;99%</span>
                    </div>
                    <div style={{ fontSize: '0.92rem', color: S.ivory, fontWeight: 700 }}>
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: S.muted, fontSize: '0.88rem' }}>Subtotal</span>
                <span style={{ color: S.white, fontSize: '0.92rem' }}>${cartTotal.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ color: S.muted, fontSize: '0.88rem' }}>Despacho a Domicilio</span>
                <span style={{ color: '#4CAF50', fontSize: '0.88rem', fontWeight: 600 }}>
                  INCLUIDO
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${S.border}`, paddingTop: 20, alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', color: S.white, textTransform: 'uppercase', fontWeight: 700 }}>Total Final</span>
                <span style={{ fontSize: '1.5rem', color: S.white, fontWeight: 800 }}>
                  <span style={{ fontSize: '0.75rem', color: S.muted, marginRight: 6 }}>CLP</span>
                  ${finalTotal.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: 24, padding: '16px', background: '#141414', border: `1px solid ${S.border}`, borderRadius: 8, textAlign: 'center' }}>
               <div style={{ fontSize: '0.78rem', color: S.ivory, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                 🔒 Compra 100% Segura y Discreta
               </div>
               <div style={{ fontSize: '0.75rem', color: S.muted, lineHeight: 1.5 }}>
                 Envío a domicilio en embalaje térmico neutro sin marcas exteriores. Transacción asegurada por Flow / Webpay Plus.
               </div>
            </div>

            {/* ── AVISO LEGAL Y MARCO REGULATORIO (ESTILO NOVA PERFORMANCE®) ── */}
            <div style={{ marginTop: 14, padding: '16px 18px', background: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(230, 226, 211, 0.22)', borderRadius: 8, backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
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
        </section>
      </div>
    </div>
  );
}
