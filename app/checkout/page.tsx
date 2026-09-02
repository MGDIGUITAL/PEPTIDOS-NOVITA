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
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  charcoal: '#1E1E1E',
  muted:    '#7A7468',
  gold:     '#B8975A',
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
  // Añadimos un recargo estimado para despacho a domicilio (aprox 25% extra) por ir puerta a puerta desde Santiago
  const homeDeliverySurcharge = deliveryMethod === 'domicilio' && selectedRegion ? Math.ceil((baseShippingCost * 0.25) / 100) * 100 : 0;
  const shippingCost = 0; // baseShippingCost + homeDeliverySurcharge; // TEMPORAL PARA PRUEBAS

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

  // Basic styles for form elements
  const inputStyle = {
    width: '100%', padding: '14px', marginBottom: '16px',
    border: `1px solid ${S.nudeDark}`, background: 'transparent',
    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: S.obsidian,
    outline: 'none', transition: 'border-color 0.3s'
  };

  const labelStyle = {
    display: 'block', marginBottom: '6px', fontSize: '0.8rem',
    fontFamily: 'Inter, sans-serif', color: S.muted, fontWeight: 500
  };

  const sectionTitleStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: S.obsidian,
    marginBottom: '24px', fontWeight: 400, marginTop: '32px'
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!clientEmail.trim()) {
      setCouponError('Debes ingresar tu correo electrónico en la sección de contacto antes de aplicar un cupón.');
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
        product_id: Number(item.productId || item.id), // Fallback
        product_title: item.title,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null
      }));

      // Crear orden via API route segura (bypassa RLS)
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
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <style>{`
        .checkout-layout { display: flex; flex: 1; flex-direction: row; }
        .checkout-left { flex: 1.1; padding: 56px 8%; background: #ffffff; }
        .checkout-right { flex: 0.9; padding: 56px 8%; background: ${S.ivory}; border-left: 1px solid ${S.nude}; }
        .input-field:focus { border-color: ${S.obsidian} !important; }
        
        @media (max-width: 900px) {
          .checkout-layout { flex-direction: column-reverse; }
          .checkout-left, .checkout-right { padding: 40px 5%; border-left: none; }
          .checkout-right { border-bottom: 1px solid ${S.nude}; }
        }
      `}</style>

      {/* Header Simplificado (solo logo para volver al inicio) */}
      <header style={{ padding: '24px 5%', borderBottom: `1px solid ${S.nude}`, background: '#ffffff', display: 'flex', justifyContent: 'center' }}>
        <Link href="/">
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={180} height={42} style={{ objectFit: 'contain' }} priority />
        </Link>
      </header>

      <div className="checkout-layout">
        {/* LADO IZQUIERDO: FORMULARIO */}
        <section className="checkout-left">
          <h2 style={{ ...sectionTitleStyle, marginTop: 0 }}>Información de Contacto</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Correo Electrónico *</label>
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="ejemplo@correo.com" className="input-field" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>RUT *</label>
              <input type="text" value={clientRut} onChange={e => setClientRut(e.target.value)} placeholder="12.345.678-9" className="input-field" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+56 9 1234 5678" className="input-field" style={inputStyle} />
          </div>

          <h2 style={sectionTitleStyle}>Método de Entrega</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: '24px' }}>
            <button 
              onClick={() => setDeliveryMethod('domicilio')}
              style={{
                flex: 1, padding: '16px', border: `1px solid ${deliveryMethod === 'domicilio' ? S.obsidian : S.nudeDark}`,
                background: deliveryMethod === 'domicilio' ? S.offWhite : 'transparent',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: S.obsidian, fontWeight: deliveryMethod === 'domicilio' ? 600 : 400,
                transition: 'all 0.3s'
              }}>
              🏠 Despacho a Domicilio
            </button>
            <button 
              onClick={() => { setDeliveryMethod('retiro'); setSelectedComuna(''); setSelectedPickupPoint(''); }}
              style={{
                flex: 1, padding: '16px', border: `1px solid ${deliveryMethod === 'retiro' ? S.obsidian : S.nudeDark}`,
                background: deliveryMethod === 'retiro' ? S.offWhite : 'transparent',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: S.obsidian, fontWeight: deliveryMethod === 'retiro' ? 600 : 400,
                transition: 'all 0.3s'
              }}>
              🏪 Retiro en Punto Blue Express
            </button>
          </div>

          {deliveryMethod === 'domicilio' ? (
            <>
              <h2 style={sectionTitleStyle}>Dirección de Despacho</h2>
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
                <label style={labelStyle}>Dirección *</label>
                <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Calle, número, depto..." className="input-field" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Región</label>
                  <select 
                    value={selectedRegionId}
                    onChange={e => setSelectedRegionId(e.target.value)}
                    className="input-field" 
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', borderRadius: 0 }}
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
                  <label style={labelStyle}>Ciudad / Comuna</label>
                  <select 
                    value={selectedComuna}
                    onChange={e => setSelectedComuna(e.target.value)}
                    className="input-field" 
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', borderRadius: 0 }}
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
              <h2 style={sectionTitleStyle}>Selecciona tu Punto de Retiro</h2>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Región</label>
                  <select 
                    value={selectedRegionId}
                    onChange={e => { setSelectedRegionId(e.target.value); setSelectedComuna(''); setSelectedPickupPoint(''); }}
                    className="input-field" 
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', borderRadius: 0 }}
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
                  <label style={labelStyle}>Comuna</label>
                  <select 
                    value={selectedComuna}
                    onChange={e => { setSelectedComuna(e.target.value); setSelectedPickupPoint(''); }}
                    className="input-field" 
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', borderRadius: 0 }}
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
                          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px',
                          border: `1px solid ${selectedPickupPoint === point.name ? S.obsidian : S.nudeDark}`,
                          background: selectedPickupPoint === point.name ? S.offWhite : 'transparent',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name="pickupPoint" 
                          value={point.name}
                          checked={selectedPickupPoint === point.name}
                          onChange={e => setSelectedPickupPoint(e.target.value)}
                          style={{ marginTop: 4, accentColor: S.obsidian }}
                        />
                        <div>
                          <div style={{ color: S.obsidian, fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
                            {point.name}
                          </div>
                          <div style={{ color: S.muted, fontSize: '0.8rem', marginBottom: 4 }}>
                            {point.address}
                          </div>
                          <div style={{ color: S.gold, fontSize: '0.75rem', fontWeight: 500 }}>
                            🕒 {point.hours}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {selectedRegionId && availableComunas.length === 0 && (
                <div style={{ marginTop: 16, padding: '16px', background: '#fff3cd', color: '#856404', fontSize: '0.85rem' }}>
                  No tenemos puntos de retiro de muestra cargados para esta región todavía. Por favor, selecciona Despacho a Domicilio o prueba con Metropolitana, Valparaíso o Coquimbo.
                </div>
              )}
            </>
          )}

          <h2 style={sectionTitleStyle}>Método de Pago</h2>
          <div style={{ padding: '24px', border: `1px solid ${S.nudeDark}`, background: S.offWhite, marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="radio" id="flow" name="payment" defaultChecked style={{ accentColor: S.obsidian, transform: 'scale(1.2)' }} />
              <label htmlFor="flow" style={{ fontSize: '1rem', color: S.obsidian, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                Webpay Plus / Flow
              </label>
            </div>
            <p style={{ margin: '12px 0 0 28px', fontSize: '0.85rem', color: S.muted }}>
              Paga de forma segura con tarjetas de crédito o débito a través de Flow.
            </p>
          </div>

          <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: '100%', padding: '18px', background: isSubmitting ? S.muted : S.obsidian, color: S.offWhite, 
            border: 'none', cursor: isSubmitting ? 'wait' : 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
            letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'background 0.3s'
          }}
          onMouseEnter={e => !isSubmitting && (e.currentTarget.style.background = S.charcoal)}
          onMouseLeave={e => !isSubmitting && (e.currentTarget.style.background = S.obsidian)}
          >
            {isSubmitting ? 'Procesando...' : 'Completar Pago Seguro'}
          </button>
        </section>

        {/* LADO DERECHO: RESUMEN DE ORDEN */}
        <section className="checkout-right" suppressHydrationWarning>
          <div style={{ position: 'sticky', top: 40 }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: S.obsidian, marginBottom: '32px', fontWeight: 400 }}>
              Resumen de tu Orden
            </h2>

            {cart.length === 0 ? (
              <div style={{ color: S.muted, fontFamily: 'Inter, sans-serif' }}>
                Tu carrito está vacío. <Link href="/#joyeria" style={{ color: S.obsidian, textDecoration: 'underline' }}>Volver a la tienda</Link>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 64, height: 64, background: '#fff', position: 'relative', flexShrink: 0, border: `1px solid ${S.nude}`, borderRadius: 4 }}>
                      {item.image_url && (
                        <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'contain' }} />
                      )}
                      <span style={{ 
                        position: 'absolute', top: -8, right: -8, background: S.muted, color: '#fff', 
                        width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600
                      }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: S.obsidian, fontWeight: 400 }}>{item.title}</h4>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: S.obsidian, fontWeight: 500 }}>
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sección de Cupones */}
            <div style={{ borderTop: `1px solid ${S.nudeDark}`, paddingTop: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="text" 
                  placeholder="Cupón de descuento" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  style={{
                    flex: 1, padding: '10px 14px', border: `1px solid ${S.nudeDark}`, 
                    background: '#fff', fontSize: '0.9rem', outline: 'none'
                  }} 
                />
                {appliedCoupon ? (
                  <button 
                    onClick={handleRemoveCoupon}
                    style={{
                      background: S.gold, color: S.obsidian, border: 'none', 
                      padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                    }}
                  >
                    Quitar
                  </button>
                ) : (
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    style={{
                      background: S.obsidian, color: S.gold, border: 'none', 
                      padding: '10px 16px', cursor: (isApplyingCoupon || !couponCode) ? 'not-allowed' : 'pointer', 
                      fontSize: '0.85rem', fontWeight: 600, opacity: (isApplyingCoupon || !couponCode) ? 0.6 : 1
                    }}
                  >
                    {isApplyingCoupon ? '...' : 'Aplicar'}
                  </button>
                )}
              </div>
              {couponError && <p style={{ color: '#C62828', fontSize: '0.8rem', margin: '6px 0 0 0' }}>{couponError}</p>}
              {appliedCoupon && (
                <p style={{ color: '#2E7D32', fontSize: '0.8rem', margin: '6px 0 0 0', fontWeight: 600 }}>
                  ✓ Cupón {appliedCoupon.code} aplicado ({appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}%` : `$${Number(appliedCoupon.discount_value).toLocaleString('es-CL')}`} desc.)
                </p>
              )}
            </div>

            <div style={{ borderTop: `1px solid ${S.nudeDark}`, paddingTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: S.muted, fontSize: '0.9rem' }}>Subtotal</span>
                <span style={{ color: S.obsidian, fontSize: '0.95rem' }}>${cartTotal.toLocaleString('es-CL')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: '#2E7D32' }}>
                  <span style={{ fontSize: '0.9rem' }}>Descuento ({appliedCoupon?.code})</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>-${discountAmount.toLocaleString('es-CL')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <span style={{ color: S.muted, fontSize: '0.9rem' }}>Envío</span>
                <span style={{ color: selectedRegion ? S.obsidian : S.muted, fontSize: '0.9rem' }}>
                  {selectedRegion ? `$${shippingCost.toLocaleString('es-CL')}` : 'Calculado al seleccionar región'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${S.nudeDark}`, paddingTop: 24 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: S.obsidian, textTransform: 'uppercase' }}>Total</span>
                <span style={{ fontSize: '1.4rem', color: S.obsidian, fontWeight: 300 }}>
                  <span style={{ fontSize: '0.8rem', color: S.muted, marginRight: 8 }}>CLP</span>
                  ${finalTotal.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
               <Image src="/amora_garantia.png" alt="Garantía" width={24} height={24} style={{ opacity: 0.6 }} />
               <span style={{ fontSize: '0.75rem', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                 Compra 100% Segura y Encriptada
               </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
