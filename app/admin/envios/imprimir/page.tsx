'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PrintContent() {
  const searchParams = useSearchParams();
  const singleId = searchParams ? searchParams.get('id') : null;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/admin/orders', { cache: 'no-store' });
        const data = await res.json();
        
        let allOrders = data.orders || [];
        
        if (singleId) {
          allOrders = allOrders.filter((o: any) => String(o.id) === String(singleId));
        } else {
          // Filter all pending / paid orders for dispatch
          allOrders = allOrders.filter((o: any) => o.status === 'Pagado' || o.status === 'Pendiente');
        }

        setOrders(allOrders);
      } catch (err) {
        console.error('Error loading print orders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [singleId]);

  // Auto trigger print when orders are loaded
  useEffect(() => {
    if (!loading && orders.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [loading, orders]);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', background: '#fff', color: '#101010' }}>
        <h2>⏳ Cargando Documentos A4 para Impresión...</h2>
        <p style={{ color: '#666' }}>Optimizando imágenes y datos del destinatario...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', background: '#fff', color: '#101010' }}>
        <h2>⚠️ No hay notas de despacho disponibles</h2>
        <p style={{ color: '#666' }}>No se encontraron órdenes pendientes para imprimir.</p>
        <button 
          onClick={() => window.close()} 
          style={{ padding: '10px 20px', background: '#101010', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
        >
          Cerrar Ventana
        </button>
      </div>
    );
  }

  return (
    <>
      {/* CSS PRINT MEDIA STYLES */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0mm;
        }

        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .no-print {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #101010;
          color: #fff;
          padding: 12px 24px;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .a4-page {
            box-shadow: none !important;
            margin: 0 auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }

        .a4-page {
          width: 210mm;
          min-height: 290mm;
          padding: 14mm 16mm;
          margin: 20px auto;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      `}</style>

      {/* Floating Control Toolbar (Hidden when printing) */}
      <div className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-nova-white.png" alt="NOVA Performance" style={{ height: '24px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 'bold', color: '#B8975A', fontSize: '14px' }}>
            Vista de Impresión — {orders.length} {orders.length === 1 ? 'Nota A4' : 'Notas A4 Pendientes'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => window.print()} 
            style={{ 
              background: '#B8975A', 
              color: '#101010', 
              border: 'none', 
              padding: '8px 18px', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            🖨️ Imprimir Ahora ({orders.length})
          </button>
          <a
            href="/admin/envios"
            style={{ 
              background: '#2563EB', 
              color: '#fff', 
              textDecoration: 'none',
              padding: '8px 16px', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ⬅️ Volver al Panel SaaS
          </a>
          <button 
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/admin/envios';
              }
            }} 
            style={{ 
              background: '#333', 
              color: '#fff', 
              border: 'none', 
              padding: '8px 14px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            ❌ Cerrar
          </button>
        </div>
      </div>

      {/* Pure Printable Document Area */}
      <div id="document-area">
        {orders.map((order) => {
          const items = (order.order_items && order.order_items.length > 0) 
            ? order.order_items 
            : [{ id: 'fallback', quantity: 1, product_title: 'Péptido NOVA Performance', price: (order.subtotal || order.total || 15990) }];

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
                      src="/logo-nova-white.png" 
                      alt="NOVA Performance" 
                      style={{ height: '32px', width: 'auto', display: 'block', marginBottom: '2px', filter: 'brightness(0)' }} 
                    />
                    <p style={{ margin: 0, fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Péptidos de Investigación • www.novaperformance.cl</p>
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
                        src="/logo-nova-white.png" 
                        alt="NOVA Performance Logo" 
                        style={{ width: '60px', height: 'auto', display: 'block', margin: '0 auto 2px auto', filter: 'invert(1)' }} 
                      />
                      <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#101010', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        NOVA PERFORMANCE®
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
    </>
  );
}

export default function AdminImprimirNotasPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>⏳ Preparando Documentos de Impresión...</h2>
      </div>
    }>
      <PrintContent />
    </Suspense>
  );
}
