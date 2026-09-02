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
      <nav style={{ position: 'relative', zIndex: 10, background: 'rgba(16,16,16,0.5)', backdropFilter: 'blur(12px)', borderBottom: `1px solid rgba(200,187,168,0.2)`, padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={160} height={38}
            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </Link>
        <Link href="/" style={{ fontFamily: 'Cinzel,serif', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(253,252,248,0.5)', textDecoration: 'none', textTransform: 'uppercase' }}>
          ← Volver a la tienda
        </Link>
      </nav>

      {/* Card centrada */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 1rem' }}>
        <div style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(253,252,248,0.10)', backdropFilter: 'blur(24px)',
          border: `1px solid rgba(200,187,168,0.35)`,
          borderRadius: 16, padding: '44px 40px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}>

          {/* Header con divider estilo sitio */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ display: 'block', height: 1, width: 36, background: `linear-gradient(90deg,transparent,rgba(200,187,168,0.6))` }} />
              <span style={{ fontFamily: 'Cinzel,serif', color: S.nudeDk, fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Área Interna</span>
              <span style={{ display: 'block', height: 1, width: 36, background: `linear-gradient(90deg,rgba(200,187,168,0.6),transparent)` }} />
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 400, color: S.offWhite, letterSpacing: '0.02em', marginBottom: 8 }}>
              Acceso Colaborador
            </h1>
            <p style={{ color: 'rgba(253,252,248,0.5)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}>
              Área exclusiva para el equipo Amora Jewelry
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.35)', borderRadius: 8, padding: '10px 14px', marginBottom: 24, color: '#f87171', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ ...lbl, color: S.nudeDk }}>Correo electrónico</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="colaborador@amorajewelry.cl" style={inp} />
            </div>
            <div>
              <label style={{ ...lbl, color: S.nudeDk }}>Contraseña</label>
              <input type="password" required value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" style={inp} />
            </div>
            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '14px',
              background: loading ? 'rgba(184,151,90,0.5)' : S.gold,
              color: '#fff', border: 'none', borderRadius: 6,
              fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.16em',
              textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontWeight: 500,
              transition: 'background 0.2s',
            }}>
              {loading ? 'Verificando…' : 'Acceder al sistema'}
            </button>
          </form>

          {/* Separador dorado estilo sitio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 0' }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(200,187,168,0.2)' }} />
            <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.55rem', color: 'rgba(200,187,168,0.4)', letterSpacing: '0.14em' }}>AMORA JEWELRY</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(200,187,168,0.2)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
