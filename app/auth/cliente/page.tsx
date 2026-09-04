'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

// ─── Design System NOVA Performance ───────────────────────────────────────
const S = {
  black:    '#000000',
  surface:  '#0A0A0A',
  card:     '#121212',
  border:   '#222222',
  borderFocus:'#E6E2D3',
  ivory:    '#E6E2D3',
  white:    '#FFFFFF',
  muted:    '#888888',
  error:    '#ef4444',
  success:  '#22c55e',
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

function formatRut(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  const fmt  = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${fmt}-${dv}`;
}

export default function ClienteAuthPage() {
  const [tab, setTab]         = useState<'login' | 'registro'>('login');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass,  setLoginPass]  = useState('');

  const [regName,  setRegName]  = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRut,   setRegRut]   = useState('');
  const [regPass,  setRegPass]  = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const cleanEmail = loginEmail.trim();
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: loginPass });
    setLoading(false);
    if (error) {
      console.error('Error al ingresar:', error);
      if (error.message.includes('Email not confirmed')) {
        setMsg({ type: 'err', text: 'Tu correo está pendiente de confirmación. Por favor revisa tu bandeja o intenta de nuevo.' });
      } else {
        setMsg({ type: 'err', text: 'Correo o contraseña incorrectos. Verifica tus datos de acceso.' });
      }
    } else {
      window.location.href = '/';
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const cleanEmail = regEmail.trim();
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: cleanEmail, password: regPass,
      options: { data: { full_name: regName, phone: regPhone, rut: regRut, role: 'cliente' } },
    });
    
    if (error) {
      setLoading(false);
      setMsg({ type: 'err', text: error.message });
    } else {
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, name: regName, userId: signUpData?.user?.id }),
        });
      } catch (err) {
        console.error('No se pudo enviar el correo de bienvenida', err);
      }

      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: regPass,
      });

      setLoading(false);
      if (loginErr) {
        setMsg({ type: 'ok', text: `¡Bienvenido(a), ${regName}! Tu cuenta ha sido registrada. Ya puedes ingresar.` });
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', background: S.black }}>

      {/* Fondo de alta resolución NOVA */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Image src="/fondo-1.png" alt="NOVA Background" fill priority style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.95) 100%)' }} />
      </div>

      {/* Nav mínimo */}
      <nav style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${S.border}`, padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <Image src="/logo-nova-white.png" alt="NOVA Performance" width={180} height={40} style={{ objectFit: 'contain' }} priority />
        </Link>
        <Link href="/" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', letterSpacing: '0.14em', color: S.ivory, textDecoration: 'none', textTransform: 'uppercase', fontWeight: 600 }}>
          ← Volver al catálogo
        </Link>
      </nav>

      {/* Card central */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 1rem' }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: S.surface, backdropFilter: 'blur(24px)',
          border: `1px solid ${S.border}`,
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.95)',
        }}>

          {/* Header con divisor minimalista */}
          <div style={{ padding: '36px 40px 0', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ display: 'block', height: 1, width: 40, background: `linear-gradient(90deg,transparent,${S.ivory})` }} />
              <span style={{ fontFamily: 'Outfit, sans-serif', color: S.ivory, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800 }}>NOVA Performance®</span>
              <span style={{ display: 'block', height: 1, width: 40, background: `linear-gradient(90deg,${S.ivory},transparent)` }} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: S.white, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>
              Mi Cuenta
            </h1>
            <p style={{ color: S.muted, fontSize: '0.85rem', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
              Accede a tus solicitudes, órdenes y seguimiento
            </p>
          </div>

          {/* Tabs con estética oficial */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${S.border}`, margin: '28px 0 0' }}>
            {(['login', 'registro'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setMsg(null); }} style={{
                flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800,
                color: tab === t ? S.white : S.muted,
                borderBottom: tab === t ? `2px solid ${S.ivory}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}>
                {t === 'login' ? 'Ingresar' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Formulario */}
          <div style={{ padding: '32px 40px 40px' }}>
            {msg && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.82rem', lineHeight: 1.5,
                background: msg.type === 'ok' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${msg.type === 'ok' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: msg.type === 'ok' ? S.success : S.error, fontFamily: 'Inter, sans-serif'
              }}>
                {msg.text}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={lblStyle}>Correo electrónico</label>
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="tu@correo.com" style={inpStyle} />
                </div>
                <div>
                  <label style={lblStyle}>Contraseña</label>
                  <input type="password" required value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" style={inpStyle} />
                </div>
                <button type="submit" disabled={loading} style={{
                  marginTop: 8, padding: '16px', background: loading ? S.muted : S.white, color: S.black, border: 'none',
                  borderRadius: 8, fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', letterSpacing: '0.14em',
                  textTransform: 'uppercase', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}>
                  {loading ? 'Ingresando…' : 'Ingresar a mi Cuenta'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: S.muted, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
                  ¿Aún no tienes cuenta?{' '}
                  <button type="button" onClick={() => setTab('registro')} style={{ background: 'none', border: 'none', color: S.ivory, cursor: 'pointer', fontSize: '0.8rem', padding: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 700, textDecoration: 'underline' }}>
                    Regístrate gratis
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={lblStyle}>Nombre completo</label>
                  <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} placeholder="María González" style={inpStyle} />
                </div>
                <div>
                  <label style={lblStyle}>Correo electrónico</label>
                  <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="tu@correo.com" style={inpStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lblStyle}>Teléfono</label>
                    <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+56 9 1234 5678" style={inpStyle} />
                  </div>
                  <div>
                    <label style={lblStyle}>RUT</label>
                    <input type="text" value={regRut} onChange={e => setRegRut(formatRut(e.target.value))} placeholder="12.345.678-9" maxLength={12} style={inpStyle} />
                  </div>
                </div>
                <div>
                  <label style={lblStyle}>Contraseña</label>
                  <input type="password" required minLength={6} value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Mínimo 6 caracteres" style={inpStyle} />
                </div>
                <button type="submit" disabled={loading} style={{
                  marginTop: 8, padding: '16px', background: loading ? S.muted : S.white, color: S.black, border: 'none',
                  borderRadius: 8, fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', letterSpacing: '0.14em',
                  textTransform: 'uppercase', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}>
                  {loading ? 'Creando cuenta…' : 'Crear Cuenta Gratis'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: S.muted, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                  Al registrarte podrás realizar seguimiento en tiempo real a tus solicitudes y órdenes.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
