'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

// Respeta la paleta del sitio: ivory/nude/obsidian/gold
const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDk:   '#C8BBA8',
  obs:      '#101010',
  muted:    '#7A7468',
  gold:     '#B8975A',
  error:    '#c0392b',
};

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 16px', fontSize: '0.88rem',
  background: 'rgba(253,252,248,0.85)', border: `1px solid #C8BBA8`,
  borderRadius: 6, color: '#101010', outline: 'none',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '0.66rem', color: S.muted,
  letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6,
  fontFamily: 'Cinzel, serif',
};

export default function ColaboradorAuthPage() {
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);

    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password: pass });

    if (authErr || !data.user) {
      setLoading(false);
      setError('Credenciales incorrectas.');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single();

    setLoading(false);

    if (profile?.role === 'colaborador') {
      window.location.href = '/admin';
    } else {
      await supabase.auth.signOut();
      setError('Sin acceso autorizado. Esta área es solo para colaboradores.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>

      {/* Fondo con imagen del sitio */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Image src="/fondo-login.png" alt="Fondo" fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} />
        {/* Overlay oscuro elegante para panel interno */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,16,16,0.60)' }} />
      </div>

      {/* Nav mínimo con estética del sitio */}
      <nav style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${S.border}`, padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <Image src="/logo-nova-white.png" alt="NOVA Performance" width={180} height={40} style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.72rem', letterSpacing: '0.14em', color: S.ivory, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 600 }}>
          ← Volver a la tienda
        </Link>
      </nav>

      {/* Card centrada */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 1rem' }}>
        <div style={{
          width: '100%', maxWidth: 400,
          background: S.surface, backdropFilter: 'blur(24px)',
          border: `1px solid ${S.border}`,
          borderRadius: 12, padding: '44px 40px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}>

          {/* Header con divider estilo sitio */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ display: 'block', height: 1, width: 36, background: `linear-gradient(90deg,transparent,${S.ivory})` }} />
              <span style={{ fontFamily: 'Outfit,sans-serif', color: S.ivory, fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700 }}>Área Interna</span>
              <span style={{ display: 'block', height: 1, width: 36, background: `linear-gradient(90deg,${S.ivory},transparent)` }} />
            </div>
            <h1 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: S.white, letterSpacing: '0.02em', marginBottom: 8, textTransform: 'uppercase' }}>
              Acceso Colaborador
            </h1>
            <p style={{ color: S.muted, fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}>
              Área exclusiva para el equipo NOVA Performance®
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.35)', borderRadius: 8, padding: '10px 14px', marginBottom: 24, color: '#f87171', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ ...lbl, color: S.ivory }}>Correo electrónico</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="colaborador@novaperformance.cl" style={inp} />
            </div>
            <div>
              <label style={{ ...lbl, color: S.ivory }}>Contraseña</label>
              <input type="password" required value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" style={inp} />
            </div>
            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '14px',
              background: loading ? S.muted : S.white,
              color: S.black, border: 'none', borderRadius: 4,
              fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', letterSpacing: '0.16em',
              textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontWeight: 800,
              transition: 'all 0.2s',
            }}>
              {loading ? 'Verificando…' : 'Acceder al sistema'}
            </button>
          </form>

          {/* Separador estilo sitio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 0' }}>
            <span style={{ flex: 1, height: 1, background: S.border }} />
            <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.6rem', color: S.ivory, letterSpacing: '0.14em', fontWeight: 700 }}>NOVA PERFORMANCE®</span>
            <span style={{ flex: 1, height: 1, background: S.border }} />
          </div>
        </div>
      </div>
    </div>
  );
}
