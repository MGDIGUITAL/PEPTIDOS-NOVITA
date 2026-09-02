import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { T, Icons } from './components/shared';
import Link from 'next/link';

// ─── StatCard Component ──────────────────────────────────────────────────
function StatCard({ label, value, trend, isPositive, icon, trendLabel, color = T.primary, link }: { label: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode, trendLabel: string, color?: string, link?: string }) {
  const CardContent = (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: T.shadow,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: link ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: T.textMuted, fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ color: color, display: 'flex', opacity: 0.9 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: T.text, marginBottom: '8px' }}>
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{
            color: isPositive ? T.success : T.danger,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {isPositive ? '↑' : '↓'} {trend}
          </span>
          <span style={{ color: T.textMuted }}>{trendLabel}</span>
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link} style={{ textDecoration: 'none' }}>{CardContent}</Link>;
  }
  return CardContent;
}

// ─── Server Component ───────────────────────────────────────────────────
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  // 1. Fetch Orders
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(product_id, quantity)')
    .order('created_at', { ascending: false });

  const orders = ordersData || [];
  
  // 2. Fetch Products
  const { data: productsData } = await supabaseAdmin.from('products').select('*');
  const products = productsData || [];
  
  // 3. Fetch Expenses
  const { data: expensesData } = await supabaseAdmin.from('expenses').select('amount');
  const expenses = expensesData || [];

  // --- Calculations ---
  
  // Sales & Orders
  const validOrders = orders.filter(o => o.status !== 'Cancelado' && o.status !== 'Pendiente');
  const pendingOrders = orders.filter(o => o.status === 'Pendiente');
  const toDispatchOrders = orders.filter(o => o.status === 'Pagado'); // Pagado = Por Despachar
  
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  // COGS Calculation
  const costMap = new Map(products.map(p => [p.id, p.cost_price || 0]));
  let totalCogs = 0;
  validOrders.forEach(o => {
    o.order_items?.forEach((item: any) => {
      totalCogs += (costMap.get(item.product_id) || 0) * item.quantity;
    });
  });

  // Profit Calculation
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalCogs - totalExpenses;
  
  // Inventory
  const lowStockCount = products.filter(p => p.stock !== null && p.stock <= 5).length;
  const inventoryValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0);

  const formatClp = (val: number) => `$${val.toLocaleString('es-CL')}`;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: T.text, margin: 0 }}>Panel Ejecutivo (ERP)</h2>
          <p style={{ color: T.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>Resumen operativo y financiero de Peptidos Novita en tiempo real.</p>
        </div>
      </div>

      {/* Top KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard 
          label="Utilidad Neta Real" 
          value={formatClp(netProfit)} 
          trend="P&L" isPositive={netProfit >= 0} 
          icon={<Icons.Chart />} trendLabel="calculado"
          color={netProfit >= 0 ? T.success : T.danger}
          link="/admin/balance"
        />
        <StatCard 
          label="Por Despachar" 
          value={toDispatchOrders.length.toString()} 
          trend={`${pendingOrders.length} pedientes`} isPositive={true} 
          icon={<Icons.Truck />} trendLabel="en espera"
          color="#EAB308"
          link="/admin/ventas"
        />
        <StatCard 
          label="Alertas de Stock" 
          value={lowStockCount.toString()} 
          trend="productos" isPositive={lowStockCount === 0} 
          icon={<Icons.Products />} trendLabel="bajo stock"
          color={lowStockCount > 0 ? T.danger : T.textMuted}
          link="/admin/productos"
        />
        <StatCard 
          label="Capital Inmovilizado" 
          value={formatClp(inventoryValue)} 
          trend="inventario" isPositive={true} 
          icon={<Icons.Dollar />} trendLabel="al costo"
          color={T.textMuted}
          link="/admin/productos"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recientes */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, margin: 0 }}>Últimas Ventas Procesadas</h3>
            <Link href="/admin/ventas" style={{ fontSize: '0.85rem', color: T.primary, textDecoration: 'none', fontWeight: 600 }}>Ver Todas →</Link>
          </div>
          
          {orders.slice(0, 5).length === 0 ? (
            <p style={{ color: T.textMuted, fontSize: '0.9rem' }}>No hay actividad reciente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.slice(0, 5).map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: T.bg, borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E0E7FF', color: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                      {order.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: T.text }}>{order.client_name}</div>
                      <div style={{ fontSize: '0.8rem', color: T.textMuted }}>{new Date(order.created_at).toLocaleDateString('es-CL')} - #{String(order.id).substring(0,6).toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontWeight: 700, color: T.text }}>{formatClp(order.total || 0)}</div>
                    <div style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      background: order.status === 'Pendiente' ? '#FFF3CD' : (order.status === 'Pagado' ? '#CFE2FF' : (order.status === 'Enviado' ? '#D1E7DD' : '#E2E3E5')),
                      color: order.status === 'Pendiente' ? '#856404' : (order.status === 'Pagado' ? '#084298' : (order.status === 'Enviado' ? '#0F5132' : '#383D41'))
                    }}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accessos Rápidos */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '20px', margin: 0 }}>Módulos ERP</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/admin/balance" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: T.bg, borderRadius: '12px', textDecoration: 'none', color: T.text, transition: 'background 0.2s' }}>
              <div style={{ fontSize: '1.5rem' }}>💰</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Finanzas & Costos</div>
                <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Rentabilidad (P&L) y Gastos</div>
              </div>
            </Link>

            <Link href="/admin/ventas" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: T.bg, borderRadius: '12px', textDecoration: 'none', color: T.text, transition: 'background 0.2s' }}>
              <div style={{ fontSize: '1.5rem' }}>📦</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Ventas & Despachos</div>
                <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Tracking y Picking Lists</div>
              </div>
            </Link>

            <Link href="/admin/productos" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: T.bg, borderRadius: '12px', textDecoration: 'none', color: T.text, transition: 'background 0.2s' }}>
              <div style={{ fontSize: '1.5rem' }}>💎</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Inventario</div>
                <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Control de stock y valor</div>
              </div>
            </Link>

            <Link href="/admin/clientes" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: T.bg, borderRadius: '12px', textDecoration: 'none', color: T.text, transition: 'background 0.2s' }}>
              <div style={{ fontSize: '1.5rem' }}>👥</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>CRM Clientes</div>
                <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Historial de compras y LTV</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
