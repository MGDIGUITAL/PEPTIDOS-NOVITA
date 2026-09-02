'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { T } from '../components/shared';

const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  charcoal: '#1E1E1E',
  muted:    '#7A7468',
  gold:     '#B8975A',
  green:    '#2E7D32',
  red:      '#C62828'
};

export default function CuponesPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState('1');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
    setLoading(false);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discount_type: discountType,
          discount_value: Number(discountValue),
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          max_uses: maxUses ? Number(maxUses) : null,
          max_uses_per_user: maxUsesPerUser ? Number(maxUsesPerUser) : 1
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons([data.coupon, ...coupons]);
        // Reset form
        setCode('');
        setDiscountValue('');
        setExpiresAt('');
        setMaxUses('');
        setMaxUsesPerUser('1');
        alert('Cupón creado exitosamente.');
      } else {
        alert('Error: ' + (data.error || 'Error desconocido'));
      }
    } catch (err: any) {
      alert('Error de conexión: ' + err.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      } else {
        alert('Error al actualizar estado del cupón.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
        alert('Cupón eliminado.');
      } else {
        alert('Error al eliminar el cupón.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* KPIs Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: S.offWhite, border: `1px solid ${S.nude}`, borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Cupones</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: S.obsidian, marginTop: '8px' }}>{coupons.length}</div>
        </div>
        <div style={{ background: S.offWhite, border: `1px solid ${S.nude}`, borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cupones Activos</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: S.green, marginTop: '8px' }}>{coupons.filter(c => c.is_active).length}</div>
        </div>
        <div style={{ background: S.offWhite, border: `1px solid ${S.nude}`, borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Redenciones Totales</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: S.gold, marginTop: '8px' }}>
            {coupons.reduce((sum, c) => sum + (c.used_count || 0), 0)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        
        {/* CREATE COUPON FORM */}
        <div style={{ background: S.offWhite, border: `1px solid ${S.nude}`, borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: S.obsidian, margin: '0 0 24px 0', borderBottom: `2px solid ${S.nude}`, paddingBottom: '12px', fontFamily: 'Cinzel, serif' }}>
            Crear Código de Descuento
          </h3>

          <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: S.charcoal, marginBottom: '6px' }}>Código del Cupón *</label>
              <input 
                type="text" 
                placeholder="Ej: AMORAJEWELRY" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: `1px solid ${S.nudeDark}`, fontSize: '0.9rem', outline: 'none' }}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: S.charcoal, marginBottom: '6px' }}>Tipo de Descuento</label>
                <select 
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: `1px solid ${S.nudeDark}`, fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                >
                  <option value="percent">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo (CLP)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: S.charcoal, marginBottom: '6px' }}>Valor *</label>
                <input 
                  type="number" 
                  placeholder={discountType === 'percent' ? 'Ej: 10' : 'Ej: 5000'} 
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: `1px solid ${S.nudeDark}`, fontSize: '0.9rem', outline: 'none' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: S.charcoal, marginBottom: '6px' }}>Fecha de Expiración (Opcional)</label>
              <input 
                type="date" 
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: `1px solid ${S.nudeDark}`, fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: S.charcoal, marginBottom: '6px' }}>Usos Totales Máx.</label>
                <input 
                  type="number" 
                  placeholder="Sin límite" 
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: `1px solid ${S.nudeDark}`, fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: S.charcoal, marginBottom: '6px' }}>Usos Máx. Por Usuario</label>
                <input 
                  type="number" 
                  value={maxUsesPerUser}
                  onChange={(e) => setMaxUsesPerUser(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: `1px solid ${S.nudeDark}`, fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', background: S.obsidian, color: S.gold, border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s' }}>
              Crear Cupón de Descuento
            </button>
          </form>
        </div>

        {/* COUPONS LIST */}
        <div style={{ background: S.offWhite, border: `1px solid ${S.nude}`, borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: S.obsidian, margin: '0 0 24px 0', borderBottom: `2px solid ${S.nude}`, paddingBottom: '12px', fontFamily: 'Cinzel, serif' }}>
            Listado de Cupones
          </h3>

          {loading ? (
            <p style={{ color: S.muted }}>Cargando cupones...</p>
          ) : coupons.length === 0 ? (
            <p style={{ color: S.muted, textAlign: 'center', padding: '40px' }}>No hay cupones creados aún.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${S.nude}`, color: S.muted, textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>Código</th>
                    <th style={{ padding: '12px 8px' }}>Descuento</th>
                    <th style={{ padding: '12px 8px' }}>Límites (Uso / Usuario)</th>
                    <th style={{ padding: '12px 8px' }}>Redimido</th>
                    <th style={{ padding: '12px 8px' }}>Expira</th>
                    <th style={{ padding: '12px 8px' }}>Estado</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => {
                    const isExpired = c.expires_at ? new Date(c.expires_at) < new Date() : false;
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${S.nude}`, verticalAlign: 'middle' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: S.obsidian }}>{c.code}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                          {c.discount_type === 'percent' ? `${c.discount_value}%` : `$${Number(c.discount_value).toLocaleString('es-CL')} CLP`}
                        </td>
                        <td style={{ padding: '12px 8px', color: S.charcoal }}>
                          {c.max_uses ? `${c.max_uses}` : '∞'} / {c.max_uses_per_user}
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: S.gold }}>{c.used_count || 0} usos</td>
                        <td style={{ padding: '12px 8px', color: isExpired ? S.red : S.charcoal }}>
                          {c.expires_at ? new Date(c.expires_at).toLocaleDateString('es-CL') : 'Nunca'}
                          {isExpired && ' (Expirado)'}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <button 
                            onClick={() => handleToggleActive(c.id, c.is_active)}
                            style={{ 
                              border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem',
                              background: c.is_active ? '#E8F5E9' : '#FFEBEE',
                              color: c.is_active ? S.green : S.red
                            }}>
                            {c.is_active ? 'Activo' : 'Pausado'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteCoupon(c.id)}
                            style={{ background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: '1.1rem', padding: '4px' }}
                            title="Eliminar cupón"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
