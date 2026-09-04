'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/CartContext';
import Image from 'next/image';
import Link from 'next/link';

const S = {
  black:    '#000000',
  surface:  '#0A0A0A',
  card:     '#121212',
  cardHover:'#1A1A1A',
  border:   '#222222',
  borderLight: '#333333',
  ivory:    '#E6E2D3',
  ivoryDark:'#C4BFA9',
  white:    '#FFFFFF',
  muted:    '#888888',
  success:  '#22c55e',
  successBg:'rgba(34, 197, 94, 0.1)',
};

// ─── Iconos SVG ─────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={S.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconPackage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconTruck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconReceipt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

// ─── Decorador de sección ─────────────────────────────────────────────────────
const SectionLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${S.border}` }}>
    {icon}
    <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: S.ivory, textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
      {label}
    </span>
  </div>
);

// ─── Spinner de carga ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: S.black, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, border: `2px solid ${S.border}`, borderTop: `2px solid ${S.ivory}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontFamily: 'Outfit, sans-serif', color: S.ivory, fontSize: '0.8rem', letterSpacing: '0.2em', fontWeight: 600 }}>VERIFICANDO PAGO WEBPAY / FLOW</p>
    </div>
  );
}

// ─── Pantalla de error ────────────────────────────────────────────────────────
function ErrorScreen({ router }: { router: any }) {
  return (
    <div style={{ minHeight: '100vh', background: S.black, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '56px 40px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12 }}>
        <div style={{ width: 56, height: 56, border: `1px solid #ef4444`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: S.white, marginBottom: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
          Pago No Confirmado
        </h1>
        <p style={{ color: S.muted, marginBottom: 28, lineHeight: 1.8, fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
          No pudimos verificar la confirmación de Flow Webpay.<br/>
          Si el cobro fue descontado de tu cuenta, escríbenos directamente a<br/>
          <a href="mailto:Cnovoadrust@gmail.com" style={{ color: S.ivory, textDecoration: 'underline', fontWeight: 600 }}>Cnovoadrust@gmail.com</a>
        </p>
        <button onClick={() => router.push('/')} style={{ padding: '14px 36px', background: S.white, color: S.black, border: 'none', borderRadius: 6, fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer' }}>
          Volver al Catálogo
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
      setFlowData({ commerceOrder: '1', amount: 94990 });
      setOrderDetails({
        order: {
          id: 1, client_name: 'Cliente Prueba', client_email: 'mpeg.logistica@gmail.com',
          client_rut: '12.345.678-9', client_phone: '+56 9 8765 4321',
          delivery_method: 'domicilio', shipping_region: 'Región Metropolitana',
          shipping_comuna: 'Las Condes', shipping_address: 'Av. Las Condes 1234',
          subtotal: 94990, shipping_cost: 0, total: 94990, status: 'Pagado',
          created_at: new Date().toISOString()
        },
        items: [
          { id: 1, product_title: 'MOTS-c 10mg — Péptido Mitocondrial', quantity: 1, price: 94990, size: null }
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
    <div style={{ minHeight: '100vh', background: S.black, color: S.white, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .boleta-wrap { animation: fadeUp 0.6s ease forwards; }
        .btn-action { transition: all 0.2s; }
        .btn-action:hover { opacity: 0.85; transform: translateY(-1px); }
        @media print {
          .no-print { display: none !important; }
          .boleta-wrap { box-shadow: none !important; border: none !important; background: #fff !important; color: #000 !important; }
          body { background: white !important; color: black !important; }
        }
        @media (max-width: 680px) {
          .boleta-inner { padding: 28px 20px !important; }
          .order-header { flex-direction: column !important; gap: 16px !important; }
          .totals-col { min-width: 100% !important; }
          .grid-client { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Barra superior ── */}
      <div className="no-print" style={{ background: S.surface, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.border}` }}>
        <Link href="/">
          <Image src="/logo-nova-white.png" alt="NOVA Performance" width={160} height={36} style={{ objectFit: 'contain' }} priority />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconCheck />
          <span style={{ color: S.success, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pago Exitoso</span>
        </div>
      </div>

      {/* ── Comprobante ── */}
      <div style={{ maxWidth: 720, margin: '36px auto 64px', padding: '0 16px' }}>
        <div className="boleta-wrap boleta-inner" style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '44px 44px', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>

          {/* ── Cabecera: Logo + Número de orden ── */}
          <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${S.border}` }}>
            <div>
              <Image
                src="/logo-nova-white.png"
                alt="NOVA Performance"
                width={180}
                height={40}
                style={{ objectFit: 'contain', objectPosition: 'left' }}
                priority
              />
              <p style={{ color: S.muted, fontSize: '0.75rem', marginTop: 10, lineHeight: 1.6 }}>
                Contacto Soporte: <a href="mailto:Cnovoadrust@gmail.com" style={{ color: S.ivory, textDecoration: 'none' }}>Cnovoadrust@gmail.com</a><br/>
                Sitio Oficial: <a href="https://novaperformance.cl" style={{ color: S.ivory, textDecoration: 'none' }}>novaperformance.cl</a>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: S.ivory, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>
                Comprobante de Orden
              </p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', color: S.white, margin: 0, fontWeight: 800, letterSpacing: '0.04em' }}>
                #{String(orderId).padStart(5, '0')}
              </p>
              <p style={{ color: S.muted, fontSize: '0.75rem', marginTop: 4 }}>{orderDate}</p>
            </div>
          </div>

          {/* ── Estado de pago ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: S.successBg, border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 8, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconCheck />
            </div>
            <div>
              <p style={{ margin: 0, color: S.success, fontSize: '0.88rem', fontWeight: 700 }}>Pago Aprobado y Registrado</p>
              <p style={{ margin: '2px 0 0', color: S.muted, fontSize: '0.75rem' }}>Transacción confirmada en tiempo real vía Webpay Plus / Flow Chile</p>
            </div>
          </div>

          {/* ── Datos del cliente ── */}
          {order && (
            <div style={{ marginBottom: 32 }}>
              <SectionLabel icon={<IconUser />} label="Datos del Comprador" />
              <div className="grid-client" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', fontSize: '0.85rem' }}>
                <div style={{ padding: '8px 0', borderBottom: `1px solid ${S.border}` }}>
                  <span style={{ color: S.muted, fontSize: '0.7rem', display: 'block', marginBottom: 2 }}>Nombre Completo</span>
                  <span style={{ color: S.white, fontWeight: 600 }}>{order.client_name}</span>
                </div>
                <div style={{ padding: '8px 0', borderBottom: `1px solid ${S.border}` }}>
                  <span style={{ color: S.muted, fontSize: '0.7rem', display: 'block', marginBottom: 2 }}>R.U.T.</span>
                  <span style={{ color: S.white }}>{order.client_rut}</span>
                </div>
                <div style={{ padding: '8px 0', borderBottom: `1px solid ${S.border}` }}>
                  <span style={{ color: S.muted, fontSize: '0.7rem', display: 'block', marginBottom: 2 }}>Correo Electrónico</span>
                  <span style={{ color: S.white }}>{order.client_email}</span>
                </div>
                <div style={{ padding: '8px 0', borderBottom: `1px solid ${S.border}` }}>
                  <span style={{ color: S.muted, fontSize: '0.7rem', display: 'block', marginBottom: 2 }}>Teléfono</span>
                  <span style={{ color: S.white }}>{order.client_phone || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Método de entrega ── */}
          {order && (
            <div style={{ marginBottom: 32 }}>
              <SectionLabel icon={<IconTruck />} label="Método de Despacho" />
              <div style={{ fontSize: '0.85rem', padding: '14px 18px', background: S.card, border: `1px solid ${S.border}`, borderRadius: 8 }}>
                <p style={{ margin: '0 0 6px', color: S.ivory, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                  Despacho a Domicilio Priority (Blue Express)
                </p>
                <p style={{ margin: 0, color: S.white, fontWeight: 500 }}>
                  {order.shipping_address ? `${order.shipping_address}, ${order.shipping_comuna} — ${order.shipping_region}` : `${order.shipping_comuna} — ${order.shipping_region}`}
                </p>
              </div>
            </div>
          )}

          {/* ── Productos ── */}
          <div style={{ marginBottom: 32 }}>
            <SectionLabel icon={<IconPackage />} label="Detalle de Productos" />

            {/* Cabecera tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 120px', gap: 12, padding: '8px 0', fontSize: '0.68rem', color: S.muted, letterSpacing: '0.15em', textTransform: 'uppercase', borderBottom: `1px solid ${S.border}` }}>
              <span>Producto</span>
              <span style={{ textAlign: 'center' }}>Cant.</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>

            {/* Filas */}
            {items.length > 0 ? items.map((item: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 120px', gap: 12, padding: '14px 0', borderBottom: `1px solid ${S.border}`, alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: S.white, fontSize: '0.9rem', fontWeight: 600 }}>{item.product_title}</p>
                  <p style={{ margin: '3px 0 0', color: S.muted, fontSize: '0.75rem' }}>
                    Precio unitario: ${item.price.toLocaleString('es-CL')} CLP
                  </p>
                </div>
                <div style={{ textAlign: 'center', color: S.white, fontSize: '0.88rem', fontWeight: 700 }}>{item.quantity}</div>
                <div style={{ textAlign: 'right', color: S.ivory, fontSize: '0.95rem', fontWeight: 700 }}>
                  ${(item.price * item.quantity).toLocaleString('es-CL')} CLP
                </div>
              </div>
            )) : (
              <p style={{ color: S.muted, fontSize: '0.85rem', padding: '14px 0', textAlign: 'center' }}>Sin productos registrados</p>
            )}
          </div>

          {/* ── Totales ── */}
          <div style={{ marginBottom: 32 }}>
            <SectionLabel icon={<IconReceipt />} label="Resumen Financiero" />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="totals-col" style={{ minWidth: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${S.border}`, fontSize: '0.85rem' }}>
                  <span style={{ color: S.muted }}>Subtotal</span>
                  <span style={{ color: S.white }}>${(order?.subtotal || flowData?.amount || 0).toLocaleString('es-CL')} CLP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${S.border}`, fontSize: '0.85rem' }}>
                  <span style={{ color: S.muted }}>Envío Priority</span>
                  <span style={{ color: S.success, fontWeight: 600 }}>
                    {order?.shipping_cost === 0 ? 'Sin Costo' : `$${(order?.shipping_cost || 0).toLocaleString('es-CL')} CLP`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: S.white, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Total Pagado</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', color: S.white, fontWeight: 800 }}>
                    ${(order?.total || flowData?.amount || 0).toLocaleString('es-CL')} <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: S.muted }}>CLP</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Nota de confirmación ── */}
          <div style={{ padding: '16px 20px', background: S.card, border: `1px solid ${S.border}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ marginTop: 2 }}><IconMail /></div>
              <p style={{ margin: 0, color: S.muted, fontSize: '0.8rem', lineHeight: 1.7 }}>
                Hemos enviado una confirmación formal al correo{' '}
                <strong style={{ color: S.white }}>{order?.client_email}</strong>.<br/>
                Para consultas sobre tu envío cita el N° de Orden{' '}
                <strong style={{ color: S.ivory }}>#{String(orderId).padStart(5, '0')}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ── Botones de acción ── */}
        <div className="no-print" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <button className="btn-action" onClick={() => router.push('/')} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 36px', background: S.white, color: S.black, borderRadius: 8,
            border: 'none', fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem',
            letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer'
          }}>
            <IconStore />
            Volver al Catálogo
          </button>
          <button className="btn-action" onClick={() => window.print()} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 36px', background: 'transparent', color: S.white, borderRadius: 8,
            border: `1px solid ${S.border}`, fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem',
            letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer'
          }}>
            <IconPrint />
            Imprimir Comprobante
          </button>
        </div>

        <p className="no-print" style={{ textAlign: 'center', color: S.muted, fontSize: '0.7rem', marginTop: 28, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
          NOVA Performance® · Investigación & Biohacking de Vanguardia
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
