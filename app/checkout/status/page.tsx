'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/CartContext';
import Image from 'next/image';

const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  charcoal: '#1E1E1E',
  muted:    '#7A7468',
  gold:     '#B8975A',
  goldLight:'#D4B483',
  success:  '#2E7D32',
  successBg:'#F0FAF0',
};

// ─── Iconos SVG sin emojis ───────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={S.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconPackage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconTruck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconReceipt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const IconPrint = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const IconStore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

// ─── Decorador de sección ─────────────────────────────────────────────────────
const SectionLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 10, borderBottom: `1px solid ${S.nude}` }}>
    {icon}
    <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: S.muted, textTransform: 'uppercase', fontWeight: 500 }}>
      {label}
    </span>
  </div>
);

// ─── Diamante decorativo ──────────────────────────────────────────────────────
const DiamondDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
    <div style={{ flex: 1, height: '1px', background: S.nude }} />
    <svg width="10" height="10" viewBox="0 0 10 10">
      <polygon points="5,0 10,5 5,10 0,5" fill={S.gold} opacity="0.5"/>
    </svg>
    <div style={{ flex: 1, height: '1px', background: S.nude }} />
  </div>
);

// ─── Spinner de carga ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: S.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, border: `1px solid ${S.nude}`, borderTop: `1px solid ${S.gold}`, borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
        <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={S.gold} strokeWidth="1.5">
          <polygon points="5,0 10,5 5,10 0,5" fill={S.gold}/>
        </svg>
      </div>
      <p style={{ fontFamily: 'Cinzel, serif', color: S.muted, fontSize: '0.75rem', letterSpacing: '0.2em' }}>VERIFICANDO PAGO</p>
    </div>
  );
}

// ─── Pantalla de error ────────────────────────────────────────────────────────
function ErrorScreen({ router }: { router: any }) {
  return (
    <div style={{ minHeight: '100vh', background: S.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '56px 40px', background: '#fff', border: `1px solid ${S.nude}` }}>
        <div style={{ width: 56, height: 56, border: `1px solid ${S.nude}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.nudeDark} strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: S.obsidian, marginBottom: 12, fontWeight: 400, letterSpacing: '0.05em' }}>
          Pago No Confirmado
        </h1>
        <p style={{ color: S.muted, marginBottom: 28, lineHeight: 1.8, fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
          No pudimos confirmar tu pago. Si el monto fue descontado,<br/>
          escríbenos a <a href="mailto:amorajewelrychile@gmail.com" style={{ color: S.gold, textDecoration: 'none' }}>amorajewelrychile@gmail.com</a>
        </p>
        <button onClick={() => router.push('/')} style={{ padding: '14px 36px', background: S.obsidian, color: '#fff', border: 'none', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Volver a la Tienda
        </button>
      </div>
    </div>
  );
}

// ─── Contenido principal ──────────────────────────────────────────────────────
function StatusContent() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;
  const router = useRouter();
  const { clearCart } = useCart();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [flowData, setFlowData] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<{ order: any; items: any[] } | null>(null);

  useEffect(() => {
    if (!token) { setStatus('error'); return; }

    if (token === 'demo') {
      setStatus('success');
      setFlowData({ commerceOrder: '1', amount: 59900 });
      setOrderDetails({
        order: {
          id: 1, client_name: 'María González', client_email: 'maria@example.com',
          client_rut: '12.345.678-9', client_phone: '+56 9 8765 4321',
          delivery_method: 'domicilio', shipping_region: 'Región Metropolitana',
          shipping_comuna: 'Las Condes', shipping_address: 'Av. Providencia 1234, Depto 502',
          subtotal: 59900, shipping_cost: 0, total: 59900, status: 'Pagado',
          created_at: new Date().toISOString()
        },
        items: [
          { id: 1, product_title: 'Aro Argolla Estrella Guía', quantity: 1, price: 39900, size: null },
          { id: 2, product_title: 'Collar Luna Menguante', quantity: 1, price: 20000, size: null },
        ]
      });
      return;
    }

    const verify = async () => {
      try {
        const flowRes = await fetch(`/api/checkout/flow-status?token=${token}`);
        const flow = await flowRes.json();
        if (flow.status !== 2) { setStatus('error'); return; }
        setFlowData(flow);
        clearCart();
        const detailsRes = await fetch(`/api/checkout/order-details?orderId=${flow.commerceOrder}`);
        const details = await detailsRes.json();
        if (detailsRes.ok) setOrderDetails(details);
        setStatus('success');
      } catch { setStatus('error'); }
    };

    verify();
  }, [token, clearCart]);

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'error') return <ErrorScreen router={router} />;

  const order = orderDetails?.order;
  const items = orderDetails?.items || [];
  const orderId = flowData?.commerceOrder || order?.id;
  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: S.ivory, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .boleta-wrap { animation: fadeUp 0.6s ease forwards; }
        .btn-action { transition: opacity 0.25s, background 0.25s, border-color 0.25s; }
        .btn-action:hover { opacity: 0.82; }
        @media print {
          .no-print { display: none !important; }
          .boleta-wrap { box-shadow: none !important; border: none !important; }
          body { background: white !important; }
        }
        @media (max-width: 680px) {
          .boleta-inner { padding: 28px 20px !important; }
          .order-header { flex-direction: column !important; gap: 16px !important; }
          .totals-col { min-width: 100% !important; }
          .grid-client { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Barra superior ── */}
      <div className="no-print" style={{ background: S.obsidian, padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={120} height={28} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconCheck />
          <span style={{ color: S.success, fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em' }}>Pago Confirmado</span>
        </div>
      </div>

      {/* ── Boleta ── */}
      <div style={{ maxWidth: 700, margin: '36px auto 64px', padding: '0 16px' }}>
        <div className="boleta-wrap boleta-inner" style={{ background: '#fff', border: `1px solid ${S.nude}`, padding: '52px 52px', boxShadow: '0 12px 56px rgba(0,0,0,0.07)' }}>

          {/* ── Cabecera: Logo + Número de orden ── */}
          <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, paddingBottom: 32, borderBottom: `1px solid ${S.nude}` }}>
            <div>
              <Image
                src="/Amora_Jewelry_logo_header_480x114.png"
                alt="Amora Jewelry"
                width={180}
                height={43}
                style={{ objectFit: 'contain', objectPosition: 'left' }}
                priority
              />
              <p style={{ color: S.muted, fontSize: '0.72rem', marginTop: 10, lineHeight: 1.6 }}>
                amorajewelrychile@gmail.com<br/>
                <a href="https://www.instagram.com/amorajewelrychile/" target="_blank" rel="noopener noreferrer" style={{ color: S.muted, textDecoration: 'none' }}>@amorajewelrychile</a> &nbsp;·&nbsp; <a href="https://amorajewelry.cl" style={{ color: S.muted, textDecoration: 'none' }}>amorajewelry.cl</a>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: S.muted, fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
                Comprobante de Compra
              </p>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: S.obsidian, margin: 0, fontWeight: 400, letterSpacing: '0.04em' }}>
                #{String(orderId).padStart(5, '0')}
              </p>
              <p style={{ color: S.muted, fontSize: '0.72rem', marginTop: 6 }}>{orderDate}</p>
            </div>
          </div>

          {/* ── Estado de pago ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: S.successBg, border: `1px solid #C8E6C9`, marginBottom: 32 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconCheck />
            </div>
            <div>
              <p style={{ margin: 0, color: S.success, fontSize: '0.82rem', fontWeight: 600 }}>Pago Procesado Exitosamente</p>
              <p style={{ margin: '2px 0 0', color: '#4CAF50', fontSize: '0.72rem' }}>Transacción confirmada por Flow · Webpay Plus</p>
            </div>
          </div>

          {/* ── Datos del cliente ── */}
          {order && (
            <div style={{ marginBottom: 32 }}>
              <SectionLabel icon={<IconUser />} label="Datos del Cliente" />
              <div className="grid-client" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px', fontSize: '0.83rem' }}>
                <div style={{ padding: '6px 0', borderBottom: `1px solid ${S.ivory}` }}>
                  <span style={{ color: S.muted, fontSize: '0.68rem', display: 'block', marginBottom: 2 }}>Nombre</span>
                  <span style={{ color: S.obsidian, fontWeight: 500 }}>{order.client_name}</span>
                </div>
                <div style={{ padding: '6px 0', borderBottom: `1px solid ${S.ivory}` }}>
                  <span style={{ color: S.muted, fontSize: '0.68rem', display: 'block', marginBottom: 2 }}>R.U.T.</span>
                  <span style={{ color: S.obsidian }}>{order.client_rut}</span>
                </div>
                <div style={{ padding: '6px 0', borderBottom: `1px solid ${S.ivory}` }}>
                  <span style={{ color: S.muted, fontSize: '0.68rem', display: 'block', marginBottom: 2 }}>Correo Electrónico</span>
                  <span style={{ color: S.obsidian }}>{order.client_email}</span>
                </div>
                <div style={{ padding: '6px 0', borderBottom: `1px solid ${S.ivory}` }}>
                  <span style={{ color: S.muted, fontSize: '0.68rem', display: 'block', marginBottom: 2 }}>Teléfono</span>
                  <span style={{ color: S.obsidian }}>{order.client_phone || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Método de entrega ── */}
          {order && (
            <div style={{ marginBottom: 32 }}>
              <SectionLabel icon={<IconTruck />} label="Método de Entrega" />
              <div style={{ fontSize: '0.83rem', padding: '12px 16px', background: S.ivory, border: `1px solid ${S.nude}` }}>
                <p style={{ margin: '0 0 6px', color: S.muted, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {order.delivery_method === 'domicilio' ? 'Despacho a Domicilio' : 'Retiro en Punto Blue Express'}
                </p>
                <p style={{ margin: 0, color: S.obsidian, fontWeight: 500 }}>
                  {order.delivery_method === 'domicilio'
                    ? `${order.shipping_address}, ${order.shipping_comuna} — ${order.shipping_region}`
                    : order.pickup_point_name}
                </p>
              </div>
            </div>
          )}

          {/* ── Productos ── */}
          <div style={{ marginBottom: 32 }}>
            <SectionLabel icon={<IconPackage />} label="Detalle de Productos" />

            {/* Cabecera tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 120px', gap: 12, padding: '8px 0', fontSize: '0.62rem', color: S.muted, letterSpacing: '0.15em', textTransform: 'uppercase', borderBottom: `1px solid ${S.nude}` }}>
              <span>Descripción</span>
              <span style={{ textAlign: 'center' }}>Cant.</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>

            {/* Filas */}
            {items.length > 0 ? items.map((item: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 120px', gap: 12, padding: '14px 0', borderBottom: `1px solid ${S.ivory}`, alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: S.obsidian, fontSize: '0.88rem', fontWeight: 500, fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.02em' }}>{item.product_title}</p>
                  <p style={{ margin: '3px 0 0', color: S.muted, fontSize: '0.72rem' }}>
                    Precio unitario: ${item.price.toLocaleString('es-CL')} CLP{item.size ? ` · Talla: ${item.size}` : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'center', color: S.muted, fontSize: '0.85rem' }}>{item.quantity}</div>
                <div style={{ textAlign: 'right', color: S.obsidian, fontSize: '0.92rem', fontWeight: 600 }}>
                  ${(item.price * item.quantity).toLocaleString('es-CL')} CLP
                </div>
              </div>
            )) : (
              <p style={{ color: S.muted, fontSize: '0.83rem', padding: '14px 0', textAlign: 'center' }}>Sin productos registrados</p>
            )}
          </div>

          {/* ── Totales ── */}
          <div>
            <SectionLabel icon={<IconReceipt />} label="Resumen de Pago" />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="totals-col" style={{ minWidth: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${S.ivory}`, fontSize: '0.83rem' }}>
                  <span style={{ color: S.muted }}>Subtotal</span>
                  <span style={{ color: S.obsidian }}>${(order?.subtotal || flowData?.amount || 0).toLocaleString('es-CL')} CLP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${S.ivory}`, fontSize: '0.83rem' }}>
                  <span style={{ color: S.muted }}>Costo de Despacho</span>
                  <span style={{ color: order?.shipping_cost === 0 ? S.success : S.obsidian, fontWeight: order?.shipping_cost === 0 ? 500 : 400 }}>
                    {order?.shipping_cost === 0 ? 'Sin costo' : `$${(order?.shipping_cost || 0).toLocaleString('es-CL')} CLP`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: S.obsidian, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total Pagado</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', color: S.obsidian, fontWeight: 400 }}>
                    ${(order?.total || flowData?.amount || 0).toLocaleString('es-CL')} <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>CLP</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DiamondDivider />

          {/* ── Nota de email enviado ── */}
          <div style={{ padding: '16px 20px', background: S.ivory, borderLeft: `2px solid ${S.gold}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ marginTop: 2 }}><IconMail /></div>
              <p style={{ margin: 0, color: S.muted, fontSize: '0.78rem', lineHeight: 1.8 }}>
                Una copia de este comprobante ha sido enviada al correo{' '}
                <strong style={{ color: S.obsidian }}>{order?.client_email}</strong>.<br/>
                Para consultas sobre tu despacho, cita el N° de orden{' '}
                <strong style={{ color: S.obsidian }}>#{String(orderId).padStart(5, '0')}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ── Botones de acción ── */}
        <div className="no-print" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <button className="btn-action" onClick={() => router.push('/')} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '15px 36px', background: S.obsidian, color: '#fff',
            border: 'none', fontFamily: 'Cinzel, serif', fontSize: '0.72rem',
            letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer'
          }}>
            <IconStore />
            Seguir Comprando
          </button>
          <button className="btn-action" onClick={() => window.print()} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '15px 36px', background: 'transparent', color: S.obsidian,
            border: `1px solid ${S.nudeDark}`, fontFamily: 'Cinzel, serif', fontSize: '0.72rem',
            letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer'
          }}>
            <IconPrint />
            Imprimir Comprobante
          </button>
        </div>

        <p className="no-print" style={{ textAlign: 'center', color: S.nudeDark, fontSize: '0.68rem', marginTop: 24, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Tu Historia · Tu Brillo · Tu Amora
        </p>
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StatusContent />
    </Suspense>
  );
}
