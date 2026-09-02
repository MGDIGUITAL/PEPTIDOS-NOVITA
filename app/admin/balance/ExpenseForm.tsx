'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { T } from '../components/shared';

export default function ExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category: formData.get('category'),
          description: formData.get('description'),
          amount: Number(formData.get('amount'))
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        alert('Error al registrar el gasto');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: T.textMuted, marginBottom: '6px' }}>Centro de Costo (Categoría)</label>
        <select name="category" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: '0.9rem' }}>
          <option value="Marketing">Marketing (Ads, Influencers)</option>
          <option value="Logística">Logística (Cajas, Cinta, Envío)</option>
          <option value="Operaciones">Operaciones (Hosting, Dominios)</option>
          <option value="Sueldos">Sueldos y Honorarios</option>
          <option value="Inventario">Mermas / Daños de Inventario</option>
          <option value="Otros">Otros Gastos</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: T.textMuted, marginBottom: '6px' }}>Descripción</label>
        <input type="text" name="description" required placeholder="Ej: Pago Meta Ads Mayo" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: '0.9rem' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: T.textMuted, marginBottom: '6px' }}>Monto (CLP)</label>
        <input type="number" name="amount" required min="1" placeholder="Ej: 50000" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: '0.9rem' }} />
      </div>
      <button type="submit" disabled={loading} style={{ background: T.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Registrando...' : 'Registrar Gasto'}
      </button>
    </form>
  );
}
