'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

const S = {
  black:    '#000000',
  surface:  '#0A0A0A',
  card:     '#121212',
  border:   '#222222',
  ivory:    '#E6E2D3',
  white:    '#FFFFFF',
  muted:    '#888888',
  error:    '#ef4444',
};

const inpStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', fontSize: '0.9rem',
  background: '#141414', border: `1px solid ${S.border}`,
  borderRadius: 8, color: S.white, outline: 'none',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  transition: 'all 0.2s',
};

const lblStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', color: S.ivory,
  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
  fontFamily: 'Outfit, sans-serif', fontWeight: 700,
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
      setError('Credenciales de colaborador incorrectas.');
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
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', background: S.black }}>

      {/* Fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Image src="/fondo-login.png" alt="Fondo NOVA" fill priority style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.3 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.95) 100%)' }} />
      </div>

      {/* Nav mínimo */}
      <nav style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${S.border}`, padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <Image src="/logo-nova-white.png" alt="NOVA Performance" width={180} height={40} style={{ objectFit: 'contain' }} priority />
        </Link>
        <Link href="/" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', letterSpacing: '0.14em', color: S.ivory, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 600 }}>
          ← Volver a la tienda
        </Link>
      </nav>

      {/* Card centrada */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 1rem' }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: S.surface, backdropFilter: 'blur(24px)',
          border: `1px solid ${S.border}`,
          borderRadius: 12, padding: '44px 40px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.95)',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ display: 'block', height: 1, width: 36, background: `linear-gradient(90deg,transparent,${S.ivory})` }} />
              <span style={{ fontFamily: 'Outfit, sans-serif', color: S.ivory, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800 }}>Área Interna</span>
              <span style={{ display: 'block', height: 1, width: 36, background: `linear-gradient(90deg,${S.ivory},transparent)` }} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: S.white, letterSpacing: '0.04em', marginBottom: 6, textTransform: 'uppercase' }}>
              Acceso Colaborador
            </h1>
            <p style={{ color: S.muted, fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>
              Panel de administración NOVA Performance®
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, color: S.error, fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={lblStyle}>Correo electrónico</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="colaborador@novaperformance.cl" style={inpStyle} />
            </div>
            <div>
              <label style={lblStyle}>Contraseña</label>
              <input type="password" required value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" style={inpStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              marginTop: 6, padding: '16px',
              background: loading ? S.muted : S.white,
              color: S.black, border: 'none', borderRadius: 8,
              fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', letterSpacing: '0.14em',
              textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontWeight: 800,
              transition: 'all 0.2s',
            }}>
              {loading ? 'Verificando…' : 'Acceder al Sistema'}
            </button>
          </form>

          {/* Separador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 0' }}>
            <span style={{ flex: 1, height: 1, background: S.border }} />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.62rem', color: S.ivory, letterSpacing: '0.18em', fontWeight: 800 }}>NOVA PERFORMANCE®</span>
            <span style={{ flex: 1, height: 1, background: S.border }} />
          </div>
        </div>
      </div>
    </div>
  );
}
