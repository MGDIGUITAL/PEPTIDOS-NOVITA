import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { T, Icons } from '../components/shared';
import ExpenseForm from './ExpenseForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BalancePage() {
  // 1. Fetch Orders (Ingresos)
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('*')
    .neq('status', 'Cancelado')
    .neq('status', 'Pendiente'); // Solo pagos exitosos
    
  const orders = ordersData || [];
  
  // Ingresos Brutos
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  
  // Costos de Envío cobrados (Opcional separar, asumiremos que es parte del revenue y se compensa con el gasto logístico, o lo restamos si el envío es un passthrough)
  const totalShippingCharged = orders.reduce((acc, o) => acc + (o.shipping_cost || 0), 0);
  const netRevenueProducts = totalRevenue - totalShippingCharged;

  // 2. Fetch Order Items + Products para calcular COGS (Cost of Goods Sold)
  const { data: orderItems } = await supabaseAdmin.from('order_items').select('order_id, product_id, quantity');
  const { data: products } = await supabaseAdmin.from('products').select('id, cost_price');
  
  let totalCogs = 0;
  if (orderItems && products) {
    // Crear un mapa de costo por producto
    const costMap = new Map(products.map(p => [p.id, p.cost_price || 0]));
    
    // Filtrar items que pertenezcan a órdenes válidas
    const validOrderIds = new Set(orders.map(o => o.id));
    
    orderItems.forEach(item => {
      if (validOrderIds.has(item.order_id)) {
        const cost = costMap.get(item.product_id) || 0;
        totalCogs += (cost * item.quantity);
      }
    });
  }

  // 3. Fetch Expenses (Gastos Operativos - OpEx)
  const { data: expensesData } = await supabaseAdmin.from('expenses').select('*');
  const expenses = expensesData || [];
  
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  
  // Agrupar gastos por categoría
  const expensesByCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  // 4. Calcular Profit (Utilidad)
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenses;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Formateador CL
  const formatClp = (val: number) => `$${val.toLocaleString('es-CL')}`;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: T.text, margin: 0 }}>Dashboard Financiero (P&L)</h2>
          <p style={{ color: T.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>Control de rentabilidad en tiempo real y centros de costos.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <MetricCard label="Ingresos Totales (Ventas)" value={formatClp(totalRevenue)} color={T.primary} icon={<Icons.Dollar />} />
        <MetricCard label="Costo de Mercadería (COGS)" value={formatClp(totalCogs)} color={T.textMuted} icon={<Icons.Products />} />
        <MetricCard label="Gastos Operativos (OpEx)" value={formatClp(totalExpenses)} color={T.danger} icon={<Icons.Approved />} />
        <MetricCard label="Utilidad Neta (Net Profit)" value={formatClp(netProfit)} subValue={`Margen: ${margin}%`} color={netProfit >= 0 ? T.success : T.danger} icon={<Icons.Chart />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Desglose P&L */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '24px' }}>Estado de Resultados (P&L)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ color: T.text, fontWeight: 500 }}>Ventas Brutas Pagadas</span>
              <span style={{ color: T.text, fontWeight: 600 }}>{formatClp(totalRevenue)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ color: T.danger }}>(-) Costo de Mercadería Vendida</span>
              <span style={{ color: T.danger }}>- {formatClp(totalCogs)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', background: 'rgba(0,0,0,0.02)', borderRadius: '4px' }}>
              <span style={{ color: T.text, fontWeight: 600, paddingLeft: '8px' }}>Utilidad Bruta</span>
              <span style={{ color: T.text, fontWeight: 700, paddingRight: '8px' }}>{formatClp(grossProfit)}</span>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: T.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gastos Operativos por Centro de Costo</h4>
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: T.textMuted }}>• {category}</span>
                  <span style={{ color: T.danger }}>- {formatClp(Number(amount))}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: `2px solid ${T.border}` }}>
              <span style={{ color: T.text, fontWeight: 700, fontSize: '1.1rem' }}>UTILIDAD NETA FINAL</span>
              <span style={{ color: netProfit >= 0 ? T.success : T.danger, fontWeight: 800, fontSize: '1.2rem' }}>{formatClp(netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Registro de Gastos */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '24px' }}>Registrar Gasto</h3>
          <ExpenseForm />
          
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ fontSize: '0.9rem', color: T.textMuted, marginBottom: '12px' }}>Últimos Gastos Registrados</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expenses.slice(0, 5).map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '8px', background: T.bg, borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: T.text }}>{e.category}</div>
                    <div style={{ color: T.textMuted, fontSize: '0.75rem' }}>{e.description}</div>
                  </div>
                  <div style={{ color: T.danger, fontWeight: 600 }}>- {formatClp(e.amount)}</div>
                </div>
              ))}
              {expenses.length === 0 && <div style={{ fontSize: '0.85rem', color: T.textMuted }}>No hay gastos.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue, color, icon }: any) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: T.textMuted, fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
        <span style={{ color, opacity: 0.8 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: T.text }}>{value}</div>
        {subValue && <div style={{ fontSize: '0.85rem', color: color, fontWeight: 600, marginTop: '4px' }}>{subValue}</div>}
      </div>
    </div>
  );
}
