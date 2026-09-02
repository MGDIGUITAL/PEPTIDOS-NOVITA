'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

// ─── Styles ───────────────────────────────────────────────────────────────
const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDk:   '#C8BBA8',
  obs:      '#101010',
  muted:    '#7A7468',
  gold:     '#B8975A',
  error:    '#c0392b',
  white:    '#fff',
};

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 16px', fontSize: '0.88rem',
  background: 'rgba(253,252,248,0.9)', border: `1px solid ${S.nude}`,
  borderRadius: 6, color: S.obs, outline: 'none',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '0.68rem', color: S.muted,
  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
  fontFamily: 'Cinzel, serif',
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
        setMsg({ type: 'err', text: 'Tu correo está pendiente de confirmación. Por favor revisa tu correo o intenta de nuevo.' });
      } else {
        setMsg({ type: 'err', text: 'Correo o contraseña incorrectos. Verifica tus datos.' });
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
      // Auto-confirmar el correo y enviar email de bienvenida
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, name: regName, userId: signUpData?.user?.id }),
        });
      } catch (err) {
        console.error('No se pudo enviar el correo de bienvenida', err);
      }

      // Iniciar sesión automáticamente
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: regPass,
      });

      setLoading(false);
      if (loginErr) {
        setMsg({ type: 'ok', text: `¡Bienvenido(a), ${regName}! Tu cuenta ha sido creada exitosamente. Ya puedes ingresar.` });
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>

      {/* Fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Image src="/fondo-login.png" alt="Fondo" fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} />
        {/* Overlay suave para legibilidad */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(253,252,248,0.55)' }} />
      </div>

      {/* Nav mínimo */}
      <nav style={{ position: 'relative', zIndex: 10, background: 'rgba(253,252,248,0.85)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${S.nude}`, padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={160} height={38} style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/" style={{ fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.12em', color: S.muted, textDecoration: 'none', textTransform: 'uppercase' }}>
          ← Volver a la tienda
        </Link>
      </nav>

      {/* Card central */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 1rem' }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(253,252,248,0.92)', backdropFilter: 'blur(20px)',
          border: `1px solid ${S.nude}`,
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 16px 60px rgba(16,16,16,0.15)',
        }}>

          {/* Header */}
          <div style={{ padding: '36px 40px 0', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ display: 'block', height: 1, width: 40, background: `linear-gradient(90deg,transparent,${S.nudeDk})` }} />
              <span style={{ fontFamily: 'Cinzel,serif', color: S.nudeDk, fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Amora Jewelry</span>
              <span style={{ display: 'block', height: 1, width: 40, background: `linear-gradient(90deg,${S.nudeDk},transparent)` }} />
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 400, color: S.obs, marginBottom: 6 }}>
              Mi Cuenta
            </h1>
            <p style={{ color: S.muted, fontSize: '0.82rem', lineHeight: 1.6 }}>
              Accede a tus cupones y beneficios exclusivos
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${S.nude}`, margin: '24px 0 0' }}>
            {(['login', 'registro'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setMsg(null); }} style={{
                flex: 1, padding: '14px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: tab === t ? S.gold : S.muted,
                borderBottom: tab === t ? `2px solid ${S.gold}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}>
                {t === 'login' ? 'Ingresar' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div style={{ padding: '32px 40px 40px' }}>
            {msg && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.82rem', lineHeight: 1.5,
                background: msg.type === 'ok' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${msg.type === 'ok' ? '#bbf7d0' : '#fecaca'}`,
                color: msg.type === 'ok' ? '#166534' : S.error,
              }}>
                {msg.text}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={lbl}>Correo electrónico</label>
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="tu@correo.com" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Contraseña</label>
                  <input type="password" required value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" style={inp} />
                </div>
                <button type="submit" disabled={loading} style={{
                  marginTop: 8, padding: '14px', background: S.obs, color: S.offWhite, border: 'none',
                  borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.14em',
                  textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? 'Ingresando…' : 'Ingresar'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: S.muted, marginTop: 4 }}>
                  ¿No tienes cuenta?{' '}
                  <button type="button" onClick={() => setTab('registro')} style={{ background: 'none', border: 'none', color: S.gold, cursor: 'pointer', fontSize: '0.78rem', padding: 0, fontFamily: 'inherit' }}>
                    Regístrate gratis
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={lbl}>Nombre completo</label>
                  <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} placeholder="María González" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Correo electrónico</label>
                  <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="tu@correo.com" style={inp} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>Teléfono</label>
                    <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+56 9 1234 5678" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>RUT</label>
                    <input type="text" value={regRut} onChange={e => setRegRut(formatRut(e.target.value))} placeholder="12.345.678-9" maxLength={12} style={inp} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Contraseña</label>
                  <input type="password" required minLength={6} value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp} />
                </div>
                <button type="submit" disabled={loading} style={{
                  marginTop: 8, padding: '14px', background: S.gold, color: S.white, border: 'none',
                  borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.14em',
                  textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.73rem', color: S.nudeDk, lineHeight: 1.5 }}>
                  Al registrarte accedes a cupones de descuento exclusivos.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
