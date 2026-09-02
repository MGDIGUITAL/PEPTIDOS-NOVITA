'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { T } from '../components/shared';

export default function VentasPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
      } else {
        alert('Error actualizando estado: ' + (data.error || 'Error desconocido'));
      }
    } catch (err: any) {
      alert('Error de conexión: ' + err.message);
    }
  };

  const saveTracking = async (id: string) => {
    try {
      const res = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, trackingNumber: trackingInput, status: orders.find(o => o.id === id)?.status || 'Enviado' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, tracking_number: trackingInput } : o));
        if (selectedOrder) setSelectedOrder({ ...selectedOrder, tracking_number: trackingInput });
        alert('Tracking guardado con éxito');
      } else {
        alert('Error guardando tracking: ' + (data.error || 'Error desconocido'));
      }
    } catch (err: any) {
      alert('Error de conexión: ' + err.message);
    }
  };

  const openOrder = (order: any) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number || '');
  };

  // Agrupar órdenes por estado para un resumen Kanban-lite
  const pendingCount = orders.filter(o => o.status === 'Pendiente').length;
  const paidCount = orders.filter(o => o.status === 'Pagado').length;
  const shippedCount = orders.filter(o => o.status === 'Enviado').length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: T.text, margin: 0 }}>Gestor de Despachos y Ventas</h2>
          <p style={{ color: T.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>Procesa pagos, genera picking lists y asigna números de seguimiento.</p>
        </div>
      </div>

      {/* Kanban KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px', borderLeft: `4px solid ${T.textMuted}` }}>
          <div style={{ fontSize: '0.85rem', color: T.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Por Pagar (Pendientes)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: T.text }}>{pendingCount}</div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px', borderLeft: `4px solid ${T.primary}` }}>
          <div style={{ fontSize: '0.85rem', color: T.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Por Despachar (Pagados)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: T.text }}>{paidCount}</div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px', borderLeft: `4px solid ${T.success}` }}>
          <div style={{ fontSize: '0.85rem', color: T.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Enviados</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: T.text }}>{shippedCount}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '2fr 1.2fr' : '1fr', gap: '24px' }}>
        
        {/* Tabla principal */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          {loading ? (
            <p style={{ color: T.textMuted }}>Cargando sistema...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}`, color: T.textMuted, fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 16px' }}>Orden</th>
                    <th style={{ padding: '12px 16px' }}>Cliente</th>
                    <th style={{ padding: '12px 16px' }}>Monto</th>
                    <th style={{ padding: '12px 16px' }}>Estado</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ 
                      borderBottom: `1px solid ${T.border}`, 
                      background: selectedOrder?.id === order.id ? T.bg : 'transparent',
                      transition: 'background 0.2s'
                    }}>
                      <td style={{ padding: '16px', color: T.text, fontWeight: 500 }}>
                        #{String(order.id || order.order_number).substring(0,6).toUpperCase()}
                        <div style={{ fontSize: '0.75rem', color: T.textMuted, marginTop: '4px' }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: T.text, fontWeight: 500 }}>{order.client_name}</div>
                        <div style={{ fontSize: '0.8rem', color: T.textMuted }}>{order.client_email}</div>
                      </td>
                      <td style={{ padding: '16px', color: T.text, fontWeight: 600 }}>
                        ${(order.total || 0).toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select 
                          value={order.status} 
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: `1px solid ${T.border}`,
                            background: order.status === 'Pagado' ? 'rgba(37, 99, 235, 0.1)' : 
                                       order.status === 'Enviado' ? 'rgba(16, 185, 129, 0.1)' : T.surface,
                            color: order.status === 'Pagado' ? T.primary : 
                                   order.status === 'Enviado' ? T.success : T.textMuted,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Pagado">Pagado (Por Despachar)</option>
                          <option value="Empaquetando">Empaquetando</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Completado">Completado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => openOrder(order)}
                          style={{ background: T.bg, border: `1px solid ${T.border}`, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: T.text, fontSize: '0.85rem', fontWeight: 500 }}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel lateral: Picking & Tracking */}
        {selectedOrder && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: T.text, margin: 0 }}>Orden #{String(selectedOrder.id).substring(0,6).toUpperCase()}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted }}>✕</button>
            </div>

            {/* Picking List */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Picking List (Productos)</div>
              <div style={{ background: T.bg, borderRadius: '8px', padding: '16px', border: `1px solid ${T.border}` }}>
                {selectedOrder.order_items?.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i !== selectedOrder.order_items.length -1 ? `1px solid ${T.border}` : 'none' }}>
                    <div>
                      <div style={{ color: T.text, fontWeight: 500, fontSize: '0.9rem' }}>{item.quantity}x {item.product_title}</div>
                      {item.size && <div style={{ color: T.textMuted, fontSize: '0.8rem' }}>Talla: {item.size}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Datos de Etiqueta</div>
              <div style={{ fontSize: '0.9rem', color: T.text, lineHeight: 1.6 }}>
                <strong>{selectedOrder.client_name}</strong><br/>
                RUT: {selectedOrder.client_rut}<br/>
                Tel: {selectedOrder.client_phone || 'N/A'}<br/>
                <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(234, 179, 8, 0.1)', borderLeft: '3px solid #eab308' }}>
                  {selectedOrder.delivery_method === 'domicilio' 
                    ? `🏠 ${selectedOrder.shipping_address}, ${selectedOrder.shipping_comuna} (${selectedOrder.shipping_region})`
                    : `🏪 PxP: ${selectedOrder.pickup_point_name}`
                  }
                </div>
              </div>
            </div>

            {/* Tracking Blue Express */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Logística (Blue Express)</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="ID de Seguimiento (Ej: 99887766)"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: '0.9rem' }}
                />
                <button 
                  onClick={() => saveTracking(selectedOrder.id)}
                  style={{ background: T.text, color: T.surface, border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Guardar
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: T.textMuted, marginTop: '8px' }}>Al ingresar el tracking, el cliente será notificado de su envío (próximamente).</p>
            </div>
            
            <a 
              href={`/admin/envios/imprimir?id=${selectedOrder.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%', marginTop: '24px', background: T.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
            >
              🖨 Imprimir Nota de Despacho A4 de esta Orden →
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
