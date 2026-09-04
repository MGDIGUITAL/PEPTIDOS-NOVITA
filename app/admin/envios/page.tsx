'use client';
import { useState, useEffect } from 'react';
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
  green:    '#2E7D32'
};

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function AdminEnvios() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<'Pendiente' | 'Pagado' | 'Enviado'>('Pagado');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [printOrders, setPrintOrders] = useState<any[] | null>(null);

  // Timeframe / monthly history filters
  const [timeframe, setTimeframe] = useState<'semanal' | 'mensual' | 'todos'>('todos');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchOrders();

    const handleAfterPrint = () => {
      setPrintOrders(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setFetchError(`Error del servidor (${res.status}): ${errData.error || 'Verifique SUPABASE_SERVICE_ROLE_KEY en Vercel'}`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      } else if (data.error) {
        setFetchError(`Error de base de datos: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setFetchError(`Error de conexión: ${err.message}. Verifique que las variables de entorno estén configuradas en Vercel.`);
    }
    setLoading(false);
  };

  const markAsShipped = async (order: any) => {
    const trackingNum = prompt('Introduce el número de seguimiento de Blue Express (opcional):', '');
    if (trackingNum === null) return; // Cancelled

    try {
      const res = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id, 
          status: 'Enviado', 
          trackingNumber: trackingNum 
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Enviado', tracking_number: trackingNum } : o));
        
        try {
          await fetch('/api/emails/order-shipped', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: order.client_email,
              orderId: order.id,
              name: order.client_name,
              method: order.delivery_method,
              address: order.delivery_method === 'domicilio' ? order.shipping_address : order.pickup_point_name,
              trackingNumber: trackingNum
            }),
          });
        } catch (err) {
          console.error('Error enviando correo de despacho', err);
        }
        alert('Orden marcada como Enviada exitosamente. Se ha notificado al cliente.');
      } else {
        alert('Error actualizando estado: ' + (data.error || 'Error desconocido'));
      }
    } catch (err: any) {
      alert('Error de conexión: ' + err.message);
    }
  };

  const pendingDispatches = orders.filter(o => o.status === 'Pagado' || o.status === 'Pendiente');
  const shippedDispatches = orders.filter(o => o.status === 'Enviado');

  const handlePrintAll = (ordersToPrint?: any[]) => {
    window.open('/admin/envios/imprimir', '_blank');
  };

  const handlePrintSingle = (order: any) => {
    if (!order) return;
    window.open(`/admin/envios/imprimir?id=${order.id}`, '_blank');
  };

  // Filter shippedDispatches based on timeframe selection
  const filteredShippedDispatches = shippedDispatches.filter(o => {
    const orderDate = new Date(o.created_at);
    if (timeframe === 'semanal') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return orderDate >= oneWeekAgo;
    }
    if (timeframe === 'mensual') {
      return orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
    }
    return true;
  });

  const filteredOrders = filter === 'Pagado' ? pendingDispatches : filteredShippedDispatches;

  // Active orders to be printed (defaults to all pending dispatches for instant pre-rendering)
  const activePrintOrders = (printOrders !== null && printOrders.length > 0) 
    ? printOrders 
    : pendingDispatches;

  // Export dynamically filtered orders to CSV
  const exportToCSV = (ordersToExport: any[]) => {
    const headers = [
      'ID Orden',
      'Fecha Creacion',
      'Cliente',
      'RUT',
      'Email',
      'Telefono',
      'Courier o Metodo',
      'Region',
      'Comuna',
      'Direccion o Punto',
      'Total Articulos',
      'Total Venta CLP'
    ];

    const rows = ordersToExport.map(o => {
      const itemsCount = o.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 1;
      const calculatedSubtotal = o.order_items?.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
      const shippingCost = o.shipping_cost || 0;
      const totalCost = calculatedSubtotal + shippingCost;
      const address = o.delivery_method === 'domicilio' ? o.shipping_address : o.pickup_point_name;

      return [
        o.id,
        new Date(o.created_at).toLocaleDateString('es-CL'),
        o.client_name,
        o.client_rut,
        o.client_email,
        o.client_phone || 'N/A',
        o.delivery_method === 'domicilio' ? 'Blue Express Domicilio' : 'Punto Blue Express',
        o.shipping_region,
        o.shipping_comuna,
        `"${String(address || '').replace(/"/g, '""')}"`,
        itemsCount,
        totalCost
      ];
    });

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `amora_reporte_despachos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-envios-root" style={{ minHeight: '100vh', background: S.ivory, fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── CSS PRINT MEDIA STYLES ────────────────────────────────────────── */}
      <style>{`
        #print-area {
          display: none;
        }

        @page {
          size: A4 portrait;
          margin: 0mm;
        }

        @media print {
          html, body, div, main, .admin-envios-root {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          #print-area {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .a4-page {
            width: 210mm !important;
            height: 290mm !important;
            max-height: 295mm !important;
            padding: 12mm 15mm !important;
            margin: 0 auto !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
        }
      `}</style>

      {/* ── HEADER NO PRINT ──────────────────────────────────────────────── */}
      <header className="no-print" style={{ padding: '24px 5%', background: S.obsidian, color: S.offWhite, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/logo-nova-white.png" alt="NOVA Performance" width={160} height={36} style={{ objectFit: 'contain' }} />
          <div style={{ width: 1, height: 24, background: S.charcoal }}></div>
          <h1 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: S.gold }}>Módulo de Resumen de Envíos</h1>
        </div>
      </header>

      {/* ── MAIN CONTENT NO PRINT ────────────────────────────────────────── */}
      <main className="no-print" style={{ padding: '40px 5%', maxWidth: 1200, margin: '0 auto' }}>
        {/* Tab & Primary Print Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => { setFilter('Pagado'); setTimeframe('todos'); }}
              style={{
                background: filter === 'Pagado' ? S.obsidian : S.ivory,
                color: filter === 'Pagado' ? S.offWhite : S.obsidian,
                border: `1px solid ${S.nudeDark}`,
                padding: '10px 20px',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Por Despachar ({pendingDispatches.length})
            </button>

            <button 
              onClick={() => { setFilter('Enviado'); setTimeframe('semanal'); }}
              style={{
                background: filter === 'Enviado' ? S.obsidian : S.ivory,
                color: filter === 'Enviado' ? S.offWhite : S.obsidian,
                border: `1px solid ${S.nudeDark}`,
                padding: '10px 20px',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Historial Enviados ({shippedDispatches.length})
            </button>
          </div>

          {filter === 'Pagado' && pendingDispatches.length > 0 && (
            <button
              onClick={() => handlePrintAll(pendingDispatches)}
              style={{
                background: S.obsidian,
                color: S.gold,
                border: `1px solid ${S.gold}`,
                padding: '10px 20px',
                borderRadius: 6,
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              🖨️ IMPRIMIR TODAS LAS NOTAS DE DESPACHO PENDIENTES ({pendingDispatches.length})
            </button>
          )}
        </div>

        {/* Historial Filters & Analytics Export Panel */}
        {filter === 'Enviado' && (
          <div style={{
            background: S.offWhite,
            border: `1px solid ${S.nude}`,
            borderRadius: 8,
            padding: '20px 24px',
            marginBottom: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filtrar historial:</span>
              <button 
                onClick={() => setTimeframe('todos')}
                style={{
                  padding: '8px 16px', borderRadius: 4, cursor: 'pointer', border: `1px solid ${S.nude}`,
                  background: timeframe === 'todos' ? S.obsidian : 'transparent',
                  color: timeframe === 'todos' ? S.gold : S.charcoal,
                  fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
                }}>
                Todos
              </button>
              <button 
                onClick={() => setTimeframe('semanal')}
                style={{
                  padding: '8px 16px', borderRadius: 4, cursor: 'pointer', border: `1px solid ${S.nude}`,
                  background: timeframe === 'semanal' ? S.obsidian : 'transparent',
                  color: timeframe === 'semanal' ? S.gold : S.charcoal,
                  fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
                }}>
                Últimos 7 días
              </button>
              <button 
                onClick={() => setTimeframe('mensual')}
                style={{
                  padding: '8px 16px', borderRadius: 4, cursor: 'pointer', border: `1px solid ${S.nude}`,
                  background: timeframe === 'mensual' ? S.obsidian : 'transparent',
                  color: timeframe === 'mensual' ? S.gold : S.charcoal,
                  fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
                }}>
                Mensual
              </button>

              {timeframe === 'mensual' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 8 }}>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    style={{ padding: '8px 12px', borderRadius: 4, border: `1px solid ${S.nude}`, fontSize: '0.85rem', background: '#fff', fontWeight: 600 }}
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    style={{ padding: '8px 12px', borderRadius: 4, border: `1px solid ${S.nude}`, fontSize: '0.85rem', background: '#fff', fontWeight: 600 }}
                  >
                    {[2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={() => exportToCSV(filteredShippedDispatches)}
              disabled={filteredShippedDispatches.length === 0}
              style={{
                background: S.gold,
                color: S.obsidian,
                border: 'none',
                padding: '10px 20px',
                borderRadius: 6,
                cursor: filteredShippedDispatches.length > 0 ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'transform 0.2s',
                opacity: filteredShippedDispatches.length > 0 ? 1 : 0.5,
                boxShadow: filteredShippedDispatches.length > 0 ? '0 4px 10px rgba(184,151,90,0.2)' : 'none'
              }}
            >
              <span>📊</span> Exportar a Excel/CSV ({filteredShippedDispatches.length})
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: S.muted }}>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>⏳ Cargando órdenes de envío...</p>
          </div>
        ) : fetchError ? (
          <div style={{ padding: 32, background: '#FFF3CD', border: '1px solid #FFCA28', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#856404', fontWeight: 700, marginBottom: 8 }}>⚠️ Error al cargar las órdenes</p>
            <p style={{ color: '#856404', fontSize: '0.9rem', marginBottom: 16 }}>{fetchError}</p>
            <button
              onClick={fetchOrders}
              style={{ background: S.obsidian, color: S.gold, border: 'none', padding: '10px 24px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
            >
              🔄 Reintentar
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: 40, background: S.offWhite, border: `1px dashed ${S.nudeDark}`, textAlign: 'center', color: S.muted, borderRadius: 8 }}>
            <p style={{ marginBottom: 12 }}>
              {filter === 'Pagado' ? '✅ No hay órdenes pendientes de despacho.' : '📭 No hay historial de envíos en este período.'}
            </p>
            <button onClick={fetchOrders} style={{ background: 'transparent', border: `1px solid ${S.nudeDark}`, padding: '8px 20px', borderRadius: 4, cursor: 'pointer', color: S.muted, fontSize: '0.85rem' }}>
              🔄 Actualizar
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filteredOrders.map(order => (
              <div key={order.id} style={{ 
                background: S.offWhite, border: `1px solid ${S.nude}`, borderRadius: 8, overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ padding: '16px 24px', background: S.nude, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: '1.1rem', color: S.obsidian }}>Orden #{order.id?.substring(0,8).toUpperCase()}</span>
                    <span style={{ marginLeft: 16, fontSize: '0.85rem', color: S.charcoal }}>{new Date(order.created_at).toLocaleString('es-CL')}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button 
                      onClick={() => handlePrintSingle(order)}
                      style={{ padding: '8px 16px', background: S.obsidian, color: S.gold, border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                      🖨️ Nota A4 Individual
                    </button>

                    {order.status !== 'Enviado' ? (
                      <button 
                        onClick={() => markAsShipped(order)}
                        style={{ padding: '8px 16px', background: S.green, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        ✓ Marcar como Enviado
                      </button>
                    ) : (
                      <span style={{ color: S.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>✓</span> Enviado
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', padding: 24, gap: 32, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Datos del Destinatario</h3>
                    <p style={{ margin: '4px 0', fontWeight: 600, color: S.obsidian }}>{order.client_name}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>RUT: {order.client_rut}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>Email: {order.client_email}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>Teléfono: {order.client_phone || 'N/A'}</p>
                  </div>

                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Dirección & Courier</h3>
                    <div style={{ 
                      display: 'inline-block', padding: '4px 12px', background: S.charcoal, color: S.gold, 
                      borderRadius: 16, fontSize: '0.8rem', fontWeight: 600, marginBottom: 12
                    }}>
                      {order.delivery_method === 'domicilio' ? '🏠 Domicilio (Blue Express)' : '🏪 Punto Blue Express'}
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Región:</strong> {order.shipping_region}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Comuna:</strong> {order.shipping_comuna}</p>
                    {order.delivery_method === 'domicilio' ? (
                      <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Dirección:</strong> {order.shipping_address}</p>
                    ) : (
                      <>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Punto:</strong> {order.pickup_point_name}</p>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem', color: S.muted }}>{order.pickup_point_address}</p>
                      </>
                    )}
                  </div>

                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Contenido del Paquete</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {(!order.order_items || order.order_items.length === 0) ? (
                        <li style={{ padding: '8px 0', fontSize: '0.85rem', color: S.muted }}>1x Joya Amora (Detalle no especificado)</li>
                      ) : (
                        order.order_items.map((item: any) => (
                          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${S.nude}`, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {item.image_url && (
                                <img src={item.image_url} alt={item.product_title} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                              )}
                              <span style={{ fontSize: '0.9rem' }}>{item.quantity}x {item.product_title}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: S.muted }}>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── PRINT AREA (PERFECT A4 SINGLE-PAGE FIT - PRE-RENDERED FOR INSTANT LOAD) ────── */}
      <div id="print-area">
        {activePrintOrders.map((order) => {
          const items = (order.order_items && order.order_items.length > 0) 
            ? order.order_items 
            : [{ id: 'fallback', quantity: 1, product_title: 'Joya Amora Jewelry', price: (order.subtotal || order.total || 15990) }];

          const itemsSubtotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
          const shippingCost = order.shipping_cost || 0;
          const grandTotal = itemsSubtotal + shippingCost;

          return (
            <div key={order.id} className="a4-page">
              <div>
                {/* Document Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #101010', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <img 
                      src="/Amora_Jewelry_logo_header_480x114.png" 
                      alt="Amora Jewelry" 
                      style={{ height: '38px', width: 'auto', display: 'block', marginBottom: '2px' }} 
                    />
                    <p style={{ margin: 0, fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alta Joyería en Chile • www.amorajewelry.cl</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ background: '#101010', color: '#B8975A', padding: '5px 14px', fontWeight: 'bold', fontSize: '13px', borderRadius: '4px', display: 'inline-block' }}>
                      NOTA DE DESPACHO
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: 'bold', color: '#333' }}>
                      N° {String(order.id).substring(0, 8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      Fecha: {new Date(order.created_at).toLocaleDateString('es-CL')}
                    </div>
                  </div>
                </div>

                {/* Info Grid (2 columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  
                  {/* Customer Box */}
                  <div style={{ border: '1px solid #E3DBCC', padding: '12px', borderRadius: '6px', background: '#FDFCF8' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '10px', textTransform: 'uppercase', color: '#B8975A', borderBottom: '1px solid #E3DBCC', paddingBottom: '3px', letterSpacing: '0.5px' }}>
                      DATOS DEL CLIENTE / DESTINATARIO
                    </h3>
                    <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#222' }}>
                      <div><strong>Nombre:</strong> {order.client_name}</div>
                      <div><strong>RUT:</strong> {order.client_rut}</div>
                      <div><strong>Email:</strong> {order.client_email}</div>
                      <div><strong>Teléfono:</strong> {order.client_phone || 'No registrado'}</div>
                    </div>
                  </div>

                  {/* Delivery Box */}
                  <div style={{ border: '1px solid #E3DBCC', padding: '12px', borderRadius: '6px', background: '#FDFCF8' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '10px', textTransform: 'uppercase', color: '#B8975A', borderBottom: '1px solid #E3DBCC', paddingBottom: '3px', letterSpacing: '0.5px' }}>
                      DATOS DE ENVÍO Y DESTINO
                    </h3>
                    <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#222' }}>
                      <div><strong>Courier / Método:</strong> {order.delivery_method === 'domicilio' ? 'Blue Express (Domicilio)' : 'Punto Blue Express'}</div>
                      <div><strong>Región:</strong> {order.shipping_region}</div>
                      <div><strong>Comuna:</strong> {order.shipping_comuna}</div>
                      <div>
                        <strong>Dirección / Entrega:</strong>{' '}
                        {order.delivery_method === 'domicilio' ? order.shipping_address : `${order.pickup_point_name} (${order.pickup_point_address})`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Table */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', color: '#101010', letterSpacing: '0.5px' }}>
                    DETALLE DE PRODUCTOS A ENTREGAR (FOTO REFERENCIAL)
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#101010', color: '#fff', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', width: '40px' }}>Cant.</th>
                        <th style={{ padding: '8px 10px' }}>Producto / Foto Referencial</th>
                        <th style={{ padding: '8px 10px', width: '90px', textAlign: 'right' }}>Precio Unit.</th>
                        <th style={{ padding: '8px 10px', width: '90px', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, idx: number) => {
                        const imgUrl = item.image_url || item.products?.image_url || item.products?.reference_image_url || null;
                        return (
                          <tr key={item.id || idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 'bold', fontSize: '13px' }}>{item.quantity}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {imgUrl ? (
                                  <img 
                                    src={imgUrl} 
                                    alt={item.product_title} 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd', background: '#fff' }} 
                                  />
                                ) : (
                                  <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '4px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>💎</div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#101010' }}>{item.product_title}</div>
                                  {item.size && <div style={{ fontSize: '10px', color: '#666' }}>Talla: {item.size}</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>${(item.price || 0).toLocaleString('es-CL')}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>
                              ${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-CL')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Total Summary Box */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <div style={{ width: '250px', background: '#FDFCF8', border: '1px solid #E3DBCC', padding: '10px 14px', borderRadius: '6px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                      <span>Subtotal Productos:</span>
                      <span>${itemsSubtotal.toLocaleString('es-CL')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                      <span>Envío Courier:</span>
                      <span>${shippingCost.toLocaleString('es-CL')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid #101010', fontWeight: 'bold', fontSize: '13px', color: '#101010' }}>
                      <span>TOTAL GENERAL:</span>
                      <span>${grandTotal.toLocaleString('es-CL')} CLP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature / Receiving Acknowledgment Section & Official Logistics Stamp */}
              <div style={{ borderTop: '1px dashed #bbb', paddingTop: '12px', marginTop: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'center' }}>
                  
                  {/* Client Receiving Area */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#444', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                      ACREDITACIÓN DE RECEPCIÓN Y CONFORMIDAD DEL CLIENTE
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '10px' }}>
                      <div style={{ borderBottom: '1px solid #000', paddingBottom: '20px' }}>
                        <strong>Nombre Receptor:</strong>
                      </div>
                      <div style={{ borderBottom: '1px solid #000', paddingBottom: '20px' }}>
                        <strong>RUT Receptor:</strong>
                      </div>
                      <div style={{ borderBottom: '1px solid #000', paddingBottom: '20px' }}>
                        <strong>Firma / Fecha:</strong>
                      </div>
                    </div>
                  </div>

                  {/* Logistics Manager Official Stamp / Seal */}
                  <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#B8975A', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                      ENCARGADO DE LOGÍSTICA
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block', padding: '6px 12px', border: '1.5px dashed #101010', borderRadius: '8px', background: '#FDFCF8' }}>
                      <img 
                        src="/Amora_Jewelry_logo_mark.png" 
                        alt="Amora Jewelry Mark" 
                        style={{ width: '28px', height: 'auto', display: 'block', margin: '0 auto 2px auto', opacity: 0.85 }} 
                      />
                      <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#101010', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        AMORA JEWELRY
                      </div>
                      <div style={{ fontSize: '8px', color: '#2E7D32', fontWeight: 'bold', marginTop: '2px' }}>
                        ✓ REVISADO & APROBADO
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
