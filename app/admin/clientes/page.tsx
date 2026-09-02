import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { T, Icons } from '../components/shared';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  // 1. Fetch all successful orders to build the CRM
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('*')
    .neq('status', 'Cancelado')
    .neq('status', 'Pendiente')
    .order('created_at', { ascending: false });

  const orders = ordersData || [];

  // 2. Group by email to create Customer Profiles
  const customersMap = new Map<string, any>();

  orders.forEach(order => {
    const email = order.client_email?.toLowerCase();
    if (!email) return;

    if (!customersMap.has(email)) {
      customersMap.set(email, {
        email: email,
        name: order.client_name,
        rut: order.client_rut,
        phone: order.client_phone,
        totalSpent: 0,
        orderCount: 0,
        lastPurchase: order.created_at, // Since it's ordered by desc, the first one seen is the latest
        history: []
      });
    }

    const customer = customersMap.get(email);
    customer.totalSpent += (order.total || 0);
    customer.orderCount += 1;
    customer.history.push(order);
  });

  const customersList = Array.from(customersMap.values());
  // Sort by LTV (Total Spent) descending
  customersList.sort((a, b) => b.totalSpent - a.totalSpent);

  const formatClp = (val: number) => `$${val.toLocaleString('es-CL')}`;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: T.text, margin: 0 }}>Directorio de Clientes (CRM)</h2>
          <p style={{ color: T.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>Gestiona tus compradores, analiza su LTV y fideliza a tus mejores clientes.</p>
        </div>
        <div style={{ background: T.primary, color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
          {customersList.length} Clientes Únicos
        </div>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
        {customersList.length === 0 ? (
          <p style={{ color: T.textMuted, textAlign: 'center', padding: '40px 0' }}>Aún no hay clientes registrados con compras exitosas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}`, color: T.textMuted, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Cliente</th>
                  <th style={{ padding: '12px 16px' }}>Contacto</th>
                  <th style={{ padding: '12px 16px' }}>Última Compra</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>N° Pedidos</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Gastado (LTV)</th>
                </tr>
              </thead>
              <tbody>
                {customersList.map((customer, idx) => (
                  <tr key={customer.email} style={{ borderBottom: `1px solid ${T.border}`, transition: 'background 0.2s', background: idx < 3 ? 'rgba(184, 151, 90, 0.03)' : 'transparent' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: idx < 3 ? '#B8975A' : T.border, color: idx < 3 ? '#fff' : T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.1rem' }}>
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: T.text, fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {customer.name}
                            {idx === 0 && <span title="Top Cliente" style={{ fontSize: '1rem' }}>👑</span>}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: T.textMuted }}>RUT: {customer.rut}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: T.text, fontSize: '0.85rem' }}>{customer.email}</div>
                      <div style={{ color: T.textMuted, fontSize: '0.8rem' }}>{customer.phone || '-'}</div>
                    </td>
                    <td style={{ padding: '16px', color: T.text, fontSize: '0.85rem' }}>
                      {new Date(customer.lastPurchase).toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ background: T.bg, padding: '4px 10px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', color: T.text }}>
                        {customer.orderCount}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: idx < 3 ? 700 : 500, color: idx < 3 ? '#B8975A' : T.text }}>
                      {formatClp(customer.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
