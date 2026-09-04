'use client';
export const dynamic = 'force-dynamic';
import { useCart } from '../components/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { REGIONS } from '@/lib/shippingRates';
import { PICKUP_POINTS } from '@/lib/pickupPoints';
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
  gold:     '#C4BFA9',
  accent:   '#3B82F6',
};

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const router = useRouter();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'retiro'>('domicilio');
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('');

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientRut, setClientRut] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientLastname, setClientLastname] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const selectedRegion = REGIONS.find(r => r.id === selectedRegionId);
  const baseShippingCost = selectedRegion ? selectedRegion.shippingCost : 0;
  const shippingCost = 0; // Envío gratuito o calculado al procesar

  // Coupon integration states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      discountAmount = Math.round((cartTotal * Number(appliedCoupon.discount_value)) / 100);
    } else {
      discountAmount = Math.min(Number(appliedCoupon.discount_value), cartTotal);
    }
  }

  const finalTotal = Math.max(0, cartTotal - discountAmount) + shippingCost;

  // Filtrar comunas y puntos de retiro
  const availableComunas = Array.from(new Set(
    PICKUP_POINTS.filter(p => selectedRegion && p.region.includes(selectedRegion.name.split(' ')[0]))
                 .map(p => p.comuna)
  ));
  
  const availablePoints = PICKUP_POINTS.filter(p => p.comuna === selectedComuna);

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!clientEmail.trim()) {
      setCouponError('Debes ingresar tu correo electrónico antes de aplicar un cupón.');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.toUpperCase().trim(),
          email: clientEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setCouponError(data.error || 'Código de cupón inválido.');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError('Error conectando con el servidor.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleSubmit = async () => {
    if (!clientEmail || !clientName || !clientRut) {
      alert('Por favor completa los campos obligatorios (Nombre, RUT, Correo).');
      return;
    }
    if (deliveryMethod === 'domicilio' && (!selectedRegionId || !selectedComuna || !clientAddress)) {
      alert('Por favor completa tu dirección de despacho.');
      return;
    }
    if (deliveryMethod === 'retiro' && (!selectedRegionId || !selectedComuna || !selectedPickupPoint)) {
      alert('Por favor selecciona un punto de retiro.');
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
        delivery_method: deliveryMethod,
        shipping_region: selectedRegion?.name || '',
        shipping_comuna: selectedComuna,
        shipping_address: deliveryMethod === 'domicilio' ? clientAddress : null,
        pickup_point_name: deliveryMethod === 'retiro' ? selectedPickupPoint : null,
        pickup_point_address: deliveryMethod === 'retiro' ? PICKUP_POINTS.find(p => p.name === selectedPickupPoint)?.address || null : null,
        subtotal: cartTotal,
        shipping_cost: shippingCost,
        total: finalTotal,
        status: 'Pendiente',
        applied_coupon: appliedCoupon ? appliedCoupon.code : null,
        discount_amount: discountAmount
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
        <Link href="/carrito" style={{ fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif', color: S.ivory, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}>
          ← Volver al carrito
        </Link>
      </header>

      <div className="checkout-layout">
        {/* LADO IZQUIERDO: FORMULARIO */}
        <section className="checkout-left">
          <h2 style={{ ...sectionTitleStyle, marginTop: 0 }}>1. Información de Contacto</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Correo Electrónico *</label>
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="tu@correo.com" className="input-field" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>RUT *</label>
              <input type="text" value={clientRut} onChange={e => setClientRut(e.target.value)} placeholder="12.345.678-9" className="input-field" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Teléfono de Contacto</label>
            <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+56 9 1234 5678" className="input-field" style={inputStyle} />
          </div>

          <h2 style={sectionTitleStyle}>2. Método de Entrega</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: '24px' }}>
            <button 
              type="button"
              onClick={() => setDeliveryMethod('domicilio')}
              style={{
                flex: 1, padding: '16px', borderRadius: 8,
                border: `1px solid ${deliveryMethod === 'domicilio' ? S.ivory : S.border}`,
                background: deliveryMethod === 'domicilio' ? '#1c1c1c' : '#121212',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: deliveryMethod === 'domicilio' ? S.white : S.muted,
                fontWeight: deliveryMethod === 'domicilio' ? 600 : 400,
                fontSize: '0.88rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
              <span>🏠</span> Despacho a Domicilio
            </button>
            <button 
              type="button"
              onClick={() => { setDeliveryMethod('retiro'); setSelectedComuna(''); setSelectedPickupPoint(''); }}
              style={{
                flex: 1, padding: '16px', borderRadius: 8,
                border: `1px solid ${deliveryMethod === 'retiro' ? S.ivory : S.border}`,
                background: deliveryMethod === 'retiro' ? '#1c1c1c' : '#121212',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: deliveryMethod === 'retiro' ? S.white : S.muted,
                fontWeight: deliveryMethod === 'retiro' ? 600 : 400,
                fontSize: '0.88rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
              <span>🏪</span> Punto Blue Express
            </button>
          </div>

          {deliveryMethod === 'domicilio' ? (
            <>
              <h2 style={sectionTitleStyle}>3. Dirección de Despacho</h2>
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
                <label style={labelStyle}>Dirección Completa *</label>
                <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Calle, número, departamento o dpto..." className="input-field" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Región *</label>
                  <select 
                    value={selectedRegionId}
                    onChange={e => setSelectedRegionId(e.target.value)}
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
            </>
          ) : (
            <>
              <h2 style={sectionTitleStyle}>3. Selección de Punto de Retiro</h2>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Región *</label>
                  <select 
                    value={selectedRegionId}
                    onChange={e => { setSelectedRegionId(e.target.value); setSelectedComuna(''); setSelectedPickupPoint(''); }}
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
                  <label style={labelStyle}>Comuna *</label>
                  <select 
                    value={selectedComuna}
                    onChange={e => { setSelectedComuna(e.target.value); setSelectedPickupPoint(''); }}
                    className="input-field" 
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    disabled={!selectedRegionId || availableComunas.length === 0}
                  >
                    <option value="">Selecciona comuna</option>
                    {availableComunas.map(comuna => (
                      <option key={comuna} value={comuna}>{comuna}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedComuna && availablePoints.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>Puntos Blue Express Disponibles</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {availablePoints.map(point => (
                      <label 
                        key={point.name}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', borderRadius: 8,
                          border: `1px solid ${selectedPickupPoint === point.name ? S.ivory : S.border}`,
                          background: selectedPickupPoint === point.name ? '#1c1c1c' : '#141414',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name="pickupPoint" 
                          value={point.name}
                          checked={selectedPickupPoint === point.name}
                          onChange={e => setSelectedPickupPoint(e.target.value)}
                          style={{ marginTop: 4, accentColor: S.white }}
                        />
                        <div>
                          <div style={{ color: S.white, fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
                            {point.name}
                          </div>
                          <div style={{ color: S.muted, fontSize: '0.8rem', marginBottom: 4 }}>
                            {point.address}
                          </div>
                          <div style={{ color: S.ivory, fontSize: '0.75rem', fontWeight: 500 }}>
                            🕒 {point.hours}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <h2 style={sectionTitleStyle}>4. Pasarela de Pago Oficial</h2>
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

            {/* Sección de Cupones */}
            <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="text" 
                  placeholder="CÓDIGO DE CUPÓN" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  style={{
                    flex: 1, padding: '12px 14px', border: `1px solid ${S.border}`, 
                    background: '#141414', color: S.white, fontSize: '0.85rem', outline: 'none', borderRadius: 6,
                    fontFamily: 'Outfit, sans-serif', letterSpacing: '0.08em'
                  }} 
                />
                {appliedCoupon ? (
                  <button 
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: S.border, color: S.white, border: 'none', borderRadius: 6,
                      padding: '12px 16px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700
                    }}
                  >
                    Quitar
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    style={{
                      background: S.white, color: S.black, border: 'none', borderRadius: 6,
                      padding: '12px 18px', cursor: (isApplyingCoupon || !couponCode) ? 'not-allowed' : 'pointer', 
                      fontSize: '0.8rem', fontWeight: 800, opacity: (isApplyingCoupon || !couponCode) ? 0.6 : 1,
                      textTransform: 'uppercase'
                    }}
                  >
                    {isApplyingCoupon ? '...' : 'Aplicar'}
                  </button>
                )}
              </div>
              {couponError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '8px 0 0 0' }}>{couponError}</p>}
              {appliedCoupon && (
                <p style={{ color: '#4CAF50', fontSize: '0.8rem', margin: '8px 0 0 0', fontWeight: 600 }}>
                  ✓ Cupón {appliedCoupon.code} aplicado ({appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}%` : `$${Number(appliedCoupon.discount_value).toLocaleString('es-CL')}`} desc.)
                </p>
              )}
            </div>

            <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: S.muted, fontSize: '0.88rem' }}>Subtotal</span>
                <span style={{ color: S.white, fontSize: '0.92rem' }}>${cartTotal.toLocaleString('es-CL')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#4CAF50' }}>
                  <span style={{ fontSize: '0.88rem' }}>Descuento ({appliedCoupon?.code})</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>-${discountAmount.toLocaleString('es-CL')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ color: S.muted, fontSize: '0.88rem' }}>Despacho Priority</span>
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
            
            <div style={{ marginTop: 32, padding: '16px', background: '#141414', border: `1px solid ${S.border}`, borderRadius: 8, textAlign: 'center' }}>
               <div style={{ fontSize: '0.78rem', color: S.ivory, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                 🔒 Compra 100% Segura y Discreta
               </div>
               <div style={{ fontSize: '0.75rem', color: S.muted, lineHeight: 1.5 }}>
                 Envío en embalaje térmico neutro sin marcas exteriores. Transacción asegurada por Flow / Webpay Plus.
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
