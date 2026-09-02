'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCart } from './CartContext';
import CartSidebar from './CartSidebar';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  charcoal: '#1E1E1E',
  muted:    '#7A7468',
  gold:     '#B8975A',
  goldLight:'#D4B878',
};

const CATS = ['Todos', 'Anillos', 'Cadenas', 'Pulseras', 'Aros'];

// ─── PROMO BAR ────────────────────────────────────────────────────────────
function PromoBar() {
  return (
    <div className="promo-bar" style={{ padding:'10px 0', textAlign:'center', color:S.ivory, fontFamily:'Cinzel,serif', fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.18em' }}>
      ✦ DESPACHO GRATIS EN TODAS LAS COMPRAS &nbsp;·&nbsp; CUPÓN <strong>AMORAJEWELRY</strong> – 10% EN TU PRIMERA COMPRA ✦
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [userName, setUserName]         = useState<string | null>(null);
  const [showMenu, setShowMenu]         = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { cartCount, openCart } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);

  // Detectar scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Detectar sesión activa
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name as string | undefined;
        setUserName(name ? name.split(' ')[0] : session.user.email?.split('@')[0] || 'Mi Cuenta');
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name as string | undefined;
        setUserName(name ? name.split(' ')[0] : session.user.email?.split('@')[0] || 'Mi Cuenta');
      } else {
        setUserName(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Cerrar menú al clicar fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    setMobileDrawerOpen(false);
    window.location.href = '/';
  };

  const navBg  = scrolled ? 'rgba(253,252,248,0.97)' : 'rgba(253,252,248,0.95)';
  const linkColor = S.charcoal;

  const btnBox: React.CSSProperties = {
    fontFamily:'Cinzel,serif', fontSize:'0.68rem', letterSpacing:'0.12em',
    textTransform:'uppercase', textDecoration:'none',
    color:S.obsidian, border:`1px solid ${S.nude}`,
    padding:'9px 20px', cursor:'pointer', background:'transparent',
    transition:'all 0.25s', whiteSpace:'nowrap' as const,
  };

  return (
    <>
      <nav style={{ position:'sticky', top:0, zIndex:100, background:navBg, borderBottom:`1px solid ${S.nude}`, backdropFilter:'blur(20px)', transition:'all 0.3s', width:'100%' }}>
        <style>{`
          .nav-desktop-links { display: flex; gap: 36px; align-items: center; }
          .nav-desktop-actions { display: flex; gap: 12px; align-items: center; }
          .nav-mobile-hamburger { display: none; }
          
          @media (max-width: 960px) {
            .nav-desktop-links { display: none !important; }
            .nav-desktop-actions .hide-mobile-item { display: none !important; }
            .nav-mobile-hamburger { display: flex !important; }
            .nav-inner-container { padding: 0 1rem !important; height: 60px !important; }
            .nav-logo-img { width: 140px !important; height: 34px !important; }
          }
        `}</style>
        
        <div className="nav-inner-container" style={{ maxWidth:1320, margin:'0 auto', padding:'0 2rem', height:72, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          
          {/* Mobile Hamburger Button — hidden on desktop via .nav-mobile-hamburger CSS */}
          <button 
            className="nav-mobile-hamburger"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Abrir menú de navegación"
            style={{ background:'none', border:'none', cursor:'pointer', padding:4, alignItems:'center', justifyContent:'center' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={S.obsidian} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none', flexShrink:0 }}>
            <Image className="nav-logo-img" src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={200} height={48} style={{ objectFit:'contain' }} priority />
          </Link>

          {/* Desktop Links */}
          <div className="nav-desktop-links">
            {[
              { l:'Novedades', h:'#novedades' },
              { l:'Catálogo',  h:'#joyeria' },
            ].map(({ l, h }) => (
              <a key={l} href={h} style={{ color:linkColor, textDecoration:'none', fontFamily:'Cinzel,serif', fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color=S.gold)}
                onMouseLeave={e=>(e.currentTarget.style.color=linkColor)}
              >{l}</a>
            ))}
            <a href="#sale" style={{ color:S.gold, textDecoration:'none', fontFamily:'Cinzel,serif', fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase' }}>Sale</a>
          </div>

          {/* Actions */}
          <div className="nav-desktop-actions">
            {/* Ícono Buscar */}
            <button title="Buscar" style={{ width:30, height:30, background:'none', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:1, transition:'opacity 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='0.6')}
              onMouseLeave={e=>(e.currentTarget.style.opacity='1')}
            >
              <div style={{ position:'relative', width:'100%', height:'100%' }}>
                <Image src="/amora_buscar.png" alt="Buscar" fill style={{ objectFit:'contain' }} />
              </div>
            </button>



            {/* Carrito con badge */}
            <button title="Carrito" onClick={openCart} style={{ width:30, height:30, background:'none', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', transition:'opacity 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='0.6')}
              onMouseLeave={e=>(e.currentTarget.style.opacity='1')}
            >
              <div style={{ position:'relative', width:'100%', height:'100%' }}>
                <Image src="/amora_carrito.png" alt="Carrito" fill style={{ objectFit:'contain' }} />
              </div>
              {cartCount > 0 && (
                <span style={{ position:'absolute', top:-4, right:-4, background:S.obsidian, color:S.offWhite, borderRadius:'50%', width:16, height:16, fontSize:'0.55rem', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif', fontWeight:700 }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Separador */}
            <span className="hide-mobile-item" style={{ width:1, height:24, background:S.nude, display:'block' }} />

            {/* Botón Mi Cuenta */}
            <div className="hide-mobile-item" ref={menuRef} style={{ position:'relative' }}>
              {userName ? (
                <>
                  <button
                    onClick={() => setShowMenu(v => !v)}
                    style={{ ...btnBox, background: showMenu ? S.obsidian : 'transparent', color: showMenu ? S.offWhite : S.obsidian }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=S.obsidian; e.currentTarget.style.color=S.offWhite; }}
                    onMouseLeave={e=>{ if(!showMenu){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=S.obsidian; } }}
                  >
                    {userName} ▾
                  </button>
                  {showMenu && (
                    <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:S.offWhite, border:`1px solid ${S.nude}`, borderRadius:8, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.08)', zIndex:200, overflow:'hidden' }}>
                      <div style={{ padding:'10px 16px', fontFamily:'Cinzel,serif', fontSize:'0.6rem', letterSpacing:'0.1em', color:S.nudeDark, borderBottom:`1px solid ${S.nude}`, textTransform:'uppercase' }}>
                        Mi cuenta
                      </div>
                      <button onClick={handleLogout} style={{ width:'100%', padding:'12px 16px', background:'none', border:'none', textAlign:'left', fontFamily:'Cinzel,serif', fontSize:'0.68rem', color:S.obsidian, cursor:'pointer', letterSpacing:'0.08em', transition:'background 0.2s' }}
                        onMouseEnter={e=>(e.currentTarget.style.background=S.ivory)}
                        onMouseLeave={e=>(e.currentTarget.style.background='none')}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/auth/cliente" style={btnBox}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=S.obsidian; (e.currentTarget as HTMLElement).style.color=S.offWhite; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color=S.obsidian; }}
                >
                  Mi Cuenta
                </Link>
              )}
            </div>

            {/* Botón Colaborador */}
            <Link className="hide-mobile-item" href="/auth/colaborador" style={{ ...btnBox, color:S.muted, border:`1px solid ${S.nude}` }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=S.obsidian; (e.currentTarget as HTMLElement).style.color=S.offWhite; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color=S.muted; }}
            >
              Colaborador
            </Link>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER NAVIGATION OVERLAY */}
      {mobileDrawerOpen && (
        <>
          <div 
            onClick={() => setMobileDrawerOpen(false)} 
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:999, transition:'opacity 0.3s' }} 
          />
          <div style={{
            position:'fixed', top:0, left:0, bottom:0, width:'85vw', maxWidth:340,
            background:S.offWhite, zIndex:1000, padding:'24px 20px', display:'flex',
            flexDirection:'column', justifyContent:'space-between', boxShadow:'8px 0 32px rgba(0,0,0,0.2)',
            overflowY:'auto'
          }}>
            <div>
              {/* Header Drawer */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:20, borderBottom:`1px solid ${S.nude}` }}>
                <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={140} height={34} style={{ objectFit:'contain' }} />
                <button 
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:S.obsidian, padding:4 }}
                >✕</button>
              </div>

              {/* Links de Navegación */}
              <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:24 }}>
                {[
                  { l:'Novedades', h:'#novedades' },
                  { l:'Catálogo',  h:'#joyeria' },
                  { l:'Sale / Ofertas', h:'#sale', isGold: true },
                ].map(({ l, h, isGold }) => (
                  <a 
                    key={l} 
                    href={h} 
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{
                      fontFamily:'Cinzel,serif', fontSize:'0.9rem', letterSpacing:'0.1em',
                      textTransform:'uppercase', textDecoration:'none',
                      color: isGold ? S.gold : S.obsidian, fontWeight:600,
                      padding:'10px 0', borderBottom:`1px solid ${S.ivory}`
                    }}
                  >
                    {l}
                  </a>
                ))}
              </div>

              {/* Acceso a cuenta / colaborador */}
              <div style={{ marginTop:32, display:'flex', flexDirection:'column', gap:12 }}>
                {userName ? (
                  <div style={{ background:S.ivory, padding:'12px 16px', borderRadius:8, border:`1px solid ${S.nude}` }}>
                    <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.7rem', color:S.gold, textTransform:'uppercase', letterSpacing:'0.1em' }}>Sesión activa</p>
                    <p style={{ fontWeight:600, fontSize:'0.9rem', color:S.obsidian, margin:'4px 0 10px' }}>{userName}</p>
                    <button 
                      onClick={handleLogout}
                      style={{ width:'100%', padding:'8px', background:S.obsidian, color:S.offWhite, border:'none', borderRadius:4, fontFamily:'Cinzel,serif', fontSize:'0.7rem', cursor:'pointer' }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/auth/cliente" 
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{ ...btnBox, width:'100%', textAlign:'center', padding:'12px', background:S.obsidian, color:S.offWhite, borderRadius:6 }}
                  >
                    Mi Cuenta / Ingresar
                  </Link>
                )}

                <Link 
                  href="/auth/colaborador" 
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ ...btnBox, width:'100%', textAlign:'center', padding:'12px', borderRadius:6, color:S.muted }}
                >
                  Portal Colaborador
                </Link>
              </div>
            </div>

            {/* Footer Drawer */}
            <div style={{ paddingTop:20, borderTop:`1px solid ${S.nude}`, fontSize:'0.75rem', color:S.muted }}>
              <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.65rem', letterSpacing:'0.1em', marginBottom:6 }}>SÍGUENOS</p>
              <div style={{ display:'flex', gap:16 }}>
                <a href="https://www.instagram.com/amorajewelrychile/" target="_blank" rel="noreferrer" style={{ color:S.obsidian, textDecoration:'none' }}>Instagram</a>
                <a href="https://wa.me/56951555556?text=Hola%20Amora%20Jewelry%2C%20quisiera%20consultar%20por%20sus%20joyas" target="_blank" rel="noreferrer" style={{ color:S.obsidian, textDecoration:'none' }}>WhatsApp</a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────
const FONDOS_DESKTOP = ['/Fondo 1.jpeg', '/Fondo 2.png', '/Fondo 3.png', '/Fondo 4.png', '/fondo 5.png'];
const FONDOS_MOBILE = ['/fondo 1 Movil.png', '/Fondo 2 Movil.png', '/Fondo 3 Movil.png', '/Fondo 4 Movil.png', '/Fondo 5 Movil.png'];

function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number|null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setFading(true);
      setCurrent(c => (c + 1) % FONDOS_DESKTOP.length);
      setTimeout(() => { setPrev(null); setFading(false); }, 900);
    }, 4000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <section style={{ position:'relative', minHeight:'94vh', overflow:'hidden', display:'flex', alignItems:'center' }}>
      <style>{`
        .hero-img-mobile { display: none !important; }
        .hero-btn-container { justify-content: flex-end; padding: 0 5vw; }
        .hero-catalog-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: ${S.obsidian} !important;
          color: ${S.offWhite} !important;
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 18px 44px;
          border: 1px solid ${S.obsidian};
          box-shadow: 0 8px 28px rgba(0,0,0,0.45);
          text-decoration: none;
          transition: all 0.3s ease;
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .hero-img-desktop { display: none !important; }
          .hero-img-mobile { display: block !important; }
          .hero-btn-container { justify-content: center !important; padding: 0 20px !important; }
          .hero-catalog-btn {
            background-color: #101010 !important;
            color: #FFFFFF !important;
            padding: 16px 36px !important;
            font-size: 0.82rem !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            box-shadow: 0 10px 35px rgba(0,0,0,0.7) !important;
            border-radius: 4px;
          }
        }
      `}</style>

      {/* Prev Image (Crossfade) */}
      {prev !== null && (
        <>
          <Image className="hero-img-desktop" key={`prev-d-${prev}`} src={FONDOS_DESKTOP[prev]} alt="" fill style={{ objectFit:'cover', objectPosition:'center 20%', opacity: fading ? 0 : 1, transition:'opacity 0.9s ease', zIndex:0 }} />
          <Image className="hero-img-mobile" key={`prev-m-${prev}`} src={FONDOS_MOBILE[prev]} alt="" fill style={{ objectFit:'cover', objectPosition:'center 20%', opacity: fading ? 0 : 1, transition:'opacity 0.9s ease', zIndex:0 }} />
        </>
      )}

      {/* Current Image */}
      <Image className="hero-img-desktop" key={`curr-d-${current}`} src={FONDOS_DESKTOP[current]} alt="Amora Jewelry" fill priority style={{ objectFit:'cover', objectPosition:'center 20%', opacity:1, transition:'opacity 0.9s ease', zIndex:0 }} />
      <Image className="hero-img-mobile" key={`curr-m-${current}`} src={FONDOS_MOBILE[current]} alt="Amora Jewelry" fill priority style={{ objectFit:'cover', objectPosition:'center 20%', opacity:1, transition:'opacity 0.9s ease', zIndex:0 }} />

      {/* Subtle overlay gradient on mobile so button is 100% legible over any photo */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(16,16,16,0.35) 0%, transparent 50%)', zIndex:1 }} />

      <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, zIndex:4 }}>
        {FONDOS_DESKTOP.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Ir a la imagen ${i + 1}`} style={{ width: i===current ? 24 : 8, height:8, borderRadius:4, border:'none', cursor:'pointer', transition:'all 0.35s', background: i===current ? S.obsidian : S.nudeDark, padding:0 }} />
        ))}
      </div>

      <div className="hero-btn-container" style={{ position:'relative', zIndex:3, width:'100%', display:'flex' }}>
        <div className="fade-in">
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
            <a href="#joyeria" className="hero-catalog-btn">Ver Catálogo</a>
          </div>
        </div>
      </div>

    </section>
  );
}

function FeaturesBar() {
  const items = [
    { img:'/amora_garantia.png', t:'Inversión Protegida',    d:'Garantía de privacidad absoluta' },
    { img:'/amora_envios.png', t:'Despacho Premium',  d:'Discreción y rapidez a todo Chile' },
    { img:'/amora_garantia.png', t:'Sello de Autenticidad',    d:'Materiales nobles y genuinos' },
    { img:'/amora_sobre_nosotros.png', t:'Experiencia Amora',         d:'30 días para enamorarte o cambiarlo' },
  ];
  return (
    <div style={{ background:S.nude, borderBottom:`1px solid ${S.nudeDark}`, padding:'22px 2rem' }}>
      <style>{`
        .features-grid { display: grid; gap: 24px; grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 10px 0; }
        }
      `}</style>
      <div className="features-grid" style={{ maxWidth:1000, margin:'0 auto' }}>
        {items.map(f => (
          <div key={f.t} style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ position:'relative', width:28, height:28, flexShrink:0 }}>
              <Image src={f.img} alt={f.t} fill style={{ objectFit:'contain' }} />
            </div>
            <div>
              <div style={{ fontFamily:'Cinzel,serif', color:S.obsidian, fontSize:'0.66rem', letterSpacing:'0.12em', textTransform:'uppercase' }}>{f.t}</div>
              <div style={{ color:S.muted, fontSize:'0.75rem', marginTop:2 }}>{f.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRODUCT CARD COMPONENT ──────────────────────────────────────────────────
function ProductCard({ p }: { p: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
  // Decide which image to show based on hover state and availability
  const hasRefImage = Boolean(p.reference_image_url);
  const currentImage = (isHovered && hasRefImage) ? p.reference_image_url : p.image_url;

  return (
    <article 
      className="product-card" 
      style={{ borderRight:`1px solid ${S.nude}`, borderBottom: `1px solid ${S.nude}`, display: 'flex', flexDirection: 'column' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${p.id}`} className="product-card-img-link" style={{ display: 'block', height:260, position:'relative', overflow:'hidden', background:S.offWhite, padding: '10px' }}>
        <div style={{ width: '100%', height: '100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {currentImage ? (
           <div style={{ position: 'relative', width: '100%', height: '100%' }}>
             <Image 
               key={currentImage} 
               src={currentImage} 
               alt={p.title} 
               fill 
               style={{ 
                 objectFit:'contain', 
                 transition:'transform 0.5s ease',
                 transform: isHovered ? 'scale(1.05)' : 'scale(1)'
               }} 
             />
           </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, opacity:0.35 }}>
            <div style={{ position:'relative', width:64, height:64 }}>
              <Image src={`/amora_${(p.category || 'collares').toLowerCase().replace('é','e').replace('a','a')}.png`} alt={p.category} fill style={{ objectFit:'contain' }} onError={() => {}} />
            </div>
            <span style={{ color:S.nudeDark, fontFamily:'Cinzel,serif', fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>Imagen próximamente</span>
          </div>
        )}
        {/* Category badge */}
        <span style={{ position:'absolute', bottom:14, right:14, background:'rgba(253,252,248,0.9)', border:`1px solid ${S.nude}`, color:S.muted, fontFamily:'Cinzel,serif', fontSize:'0.6rem', padding:'3px 10px', letterSpacing:'0.1em' }}>
          {p.category}
        </span>
        </div>
      </Link>
      <div className="product-card-info" style={{ padding:'20px 20px 26px', background:S.ivory, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="font-display product-card-title" style={{ fontSize:'1.05rem', fontWeight:400, color:S.obsidian, lineHeight:1.3, marginBottom:16, cursor: 'pointer' }}>
            {p.title}
          </h3>
        </Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 'auto', gap: 6, flexWrap: 'wrap' }}>
          <span className="font-display product-card-price" style={{ fontSize:'1.2rem', color:S.obsidian, fontWeight:300 }} suppressHydrationWarning>
            ${p.sale_price?.toLocaleString('es-CL')}
          </span>
          <button onClick={() => addToCart(p)} style={{
            fontFamily:'Cinzel,serif', fontSize:'0.58rem', letterSpacing:'0.1em', textTransform:'uppercase',
            background:'transparent', border:`1px solid ${S.nude}`, color:S.charcoal,
            padding:'8px 14px', cursor:'pointer', transition:'all 0.25s',
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background=S.obsidian; e.currentTarget.style.color=S.offWhite; e.currentTarget.style.borderColor=S.obsidian; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=S.charcoal; e.currentTarget.style.borderColor=S.nude; }}
          >Agregar</button>
        </div>
      </div>
    </article>
  );
}

// ─── DYNAMIC CATALOG (Connected to DB) ────────────────────────────────────
function Products({ products }: { products: any[] }) {
  const [filter, setFilter] = useState('Todos');
  const [visibleCount, setVisibleCount] = useState(15);

  const filtered = filter === 'Todos' ? products : products.filter(p => p.category === filter);
  const shown = filtered.slice(0, visibleCount);

  // Cuando cambian de filtro, volvemos a mostrar 15 por defecto
  useEffect(() => {
    setVisibleCount(15);
  }, [filter]);

  return (
    <section id="joyeria" style={{ padding:'60px 1rem', background:S.ivory }}>
      <div style={{ maxWidth:1400, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36, flexWrap:'wrap', gap:16 }}>
          <div>
            <h2 className="font-display" style={{ fontSize:'clamp(2.2rem,5vw,3.8rem)', fontWeight:300, color:S.obsidian }}>Catálogo</h2>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                fontFamily:'Cinzel,serif', fontSize:'0.66rem', letterSpacing:'0.12em', textTransform:'uppercase',
                padding:'8px 16px',
                background: filter===c ? S.obsidian : 'transparent',
                color: filter===c ? S.offWhite : S.muted,
                border: filter===c ? `1px solid ${S.obsidian}` : `1px solid ${S.nude}`,
                cursor:'pointer', transition:'all 0.25s',
              }}>{c}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: S.muted, fontSize: '1.2rem', fontFamily: 'Cinzel,serif' }}>
            Aún no hay productos disponibles en esta categoría.
          </div>
        ) : (
          <>
            <style>{`
              .product-grid-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 1px;
                border: 1px solid ${S.nude};
              }
              @media (min-width: 1300px) {
                .product-grid-container {
                  grid-template-columns: repeat(5, 1fr) !important;
                }
              }
              @media (max-width: 640px) {
                .product-grid-container {
                  grid-template-columns: repeat(2, 1fr) !important;
                }
                .product-card-img-link {
                  height: 180px !important;
                  padding: 6px !important;
                }
                .product-card-info {
                  padding: 12px 10px 16px !important;
                }
                .product-card-title {
                  font-size: 0.88rem !important;
                  margin-bottom: 8px !important;
                }
                .product-card-price {
                  font-size: 0.98rem !important;
                }
              }
            `}</style>
            <div className="product-grid-container">
              {shown.map(p => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filtered.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
                <button 
                  onClick={() => setVisibleCount(v => v + 15)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${S.obsidian}`,
                    color: S.obsidian,
                    fontFamily: 'Cinzel,serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '12px 32px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = S.obsidian; e.currentTarget.style.color = S.offWhite; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.obsidian; }}
                >
                  Cargar Más
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── FEATURED PRODUCTS ──────────────────────────────────────────────────────
function FeaturedProducts({ products }: { products: any[] }) {
  const featured = products.slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <section style={{ padding: '80px 2rem', background: S.offWhite }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div className="amora-divider" style={{ marginBottom: 32 }}>
          <span className="line" />
          <span>Selección Exclusiva</span>
          <span className="line rev" />
        </div>
        <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 300, textAlign: 'center', color: S.obsidian, marginBottom: 56 }}>
          Productos Destacados
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {featured.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECOND BANNER ────────────────────────────────────────────────────────
function SecondBanner() {
  return (
    <section id="novedades" style={{ position:'relative', height:520, overflow:'hidden', display:'flex', alignItems:'center' }}>
      <Image src="/seccion-banner.png" alt="Colección Amora" fill style={{ objectFit:'cover', objectPosition:'center 20%' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(16,16,16,0.75) 40%, rgba(16,16,16,0.25) 100%)' }} />
      <div style={{ position:'relative', zIndex:1, maxWidth:1320, margin:'0 auto', padding:'0 2rem' }}>
        <div style={{ maxWidth:500 }}>
          <div className="amora-divider" style={{ marginBottom:20, maxWidth:290 }}>
            <span className="line" style={{ background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.5))' }} />
            <span style={{ color:'#D4B878', fontSize:'0.82rem' }}>✦ JOYERÍA EXCLUSIVA</span>
            <span className="line rev" style={{ background:'linear-gradient(90deg,rgba(212,175,55,0.5),transparent)' }} />
          </div>
          <h2 className="font-display" style={{ fontSize:'clamp(2.5rem,5vw,4.2rem)', fontWeight:300, lineHeight:1.1, color:S.offWhite, marginBottom:20 }}>
            La elegancia en<br /><em style={{ fontStyle:'italic' }}>cada detalle</em>
          </h2>
          <p style={{ color:'rgba(253,252,248,0.65)', marginBottom:32, lineHeight:1.75, fontSize:'0.95rem' }}>
            Cada pieza Amora nace de la pasión por la joyería artesanal. Diseños únicos que resaltan tu belleza natural.
          </p>
          <a href="#joyeria" style={{ display:'inline-flex', alignItems:'center', gap:8, background:S.offWhite, color:S.obsidian, fontFamily:'Cinzel,serif', fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', padding:'15px 38px', textDecoration:'none', transition:'all 0.3s' }}
            onMouseEnter={e=>e.currentTarget.style.background=S.ivory}
            onMouseLeave={e=>e.currentTarget.style.background=S.offWhite}
          >Explorar ahora</a>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS & REVIEWS SECTION ─────────────────────────────────────
const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Valentina M.',
    location: 'Las Condes, Santiago',
    product: 'Cadena Figaro Baño Oro 18K',
    date: 'Hace 2 días',
    rating: 5,
    tag: 'Despacho & Envíos',
    comment: '¡El despacho fue increíblemente rápido! Hice el pedido un martes en la mañana y al día siguiente ya estaba en mi domicilio por Blue Express con seguimiento continuo. El empaque de lujo con la cinta de raso y la caja rígida le da un toque de joyería fina total. 100% recomendado.',
  },
  {
    id: 2,
    name: 'Camila S.',
    location: 'Viña del Mar, Valparaíso',
    product: 'Anillo Solitario Zirconia Premium',
    date: 'Hace 4 días',
    rating: 5,
    tag: 'Calidad & Acabados',
    comment: 'La calidad superó totalmente mis expectativas. El brillo de la piedra y el pulido espejo son impecables. Me comuniqué por WhatsApp al +56 9 5155 5556 para confirmar mi talla y la atención fue rápida, amable y muy profesional.',
  },
  {
    id: 3,
    name: 'Francisca R.',
    location: 'Concepción, Biobío',
    product: 'Pulsera Tennis Plata Ley 925',
    date: 'Hace 1 semana',
    rating: 5,
    tag: 'Presentación de Lujo',
    comment: 'La compré para un regalo de aniversario y fue un éxito rotundo. Recibirla en su caja firma Ivory con bolsa protectora y certificado de autenticidad genera una confianza total. Se nota el compromiso con los clientes.',
  },
  {
    id: 4,
    name: 'Constanza A.',
    location: 'Antofagasta',
    product: 'Aros Huggies Brillantes',
    date: 'Hace 1 semana',
    rating: 5,
    tag: 'Despacho & Envíos',
    comment: 'Tenía dudas sobre el envío al norte por la distancia, pero llegó intacto, muy seguro y en tiempo récord. Es mi segunda compra en Amora y la calidad del material no se opaca con nada.',
  },
  {
    id: 5,
    name: 'Javiera B.',
    location: 'La Serena, Coquimbo',
    product: 'Collar Medalla Girasol Escultórico',
    date: 'Hace 2 semanas',
    rating: 5,
    tag: 'Calidad & Acabados',
    comment: 'Diseño bellísimo y terminación elegante. Es muy liviano pero firme y no causa ninguna alergia. Además, me incluyeron una nota de agradecimiento personalizada preciosa.',
  },
  {
    id: 6,
    name: 'Isidora P.',
    location: 'Temuco, Araucanía',
    product: 'Set de Anillos Layering Elegance',
    date: 'Hace 2 semanas',
    rating: 5,
    tag: 'Presentación de Lujo',
    comment: 'Transparencia absoluta y excelente canal de atención por WhatsApp. El empaque huele delicioso y viene protegido con plástico burbuja. Es un agrado comprar en un sitio tan profesional.',
  },
];

function TestimonialsSection() {
  const [activeFilter, setActiveFilter] = useState('Todas');
  const filters = ['Todas', 'Despacho & Envíos', 'Calidad & Acabados', 'Presentación de Lujo'];

  const filteredReviews = activeFilter === 'Todas' 
    ? REVIEWS_DATA 
    : REVIEWS_DATA.filter(r => r.tag === activeFilter);

  return (
    <section id="reseñas" style={{ padding: '88px 1.5rem', background: S.offWhite, borderTop: `1px solid ${S.nude}` }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        
        {/* Header / Summary */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 18px', background: 'rgba(184,151,90,0.1)', border: `1px solid ${S.gold}`, borderRadius: 30, marginBottom: 18 }}>
            <span style={{ color: S.gold, fontSize: '0.85rem' }}>★ ★ ★ ★ ★</span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.12em', color: S.obsidian, fontWeight: 600 }}>
              4.9 / 5.0 RESEÑAS VERIFICADAS
            </span>
          </div>

          <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: S.obsidian, marginBottom: 16 }}>
            Opiniones de Nuestras Clientas
          </h2>
          <p style={{ color: S.muted, fontSize: '0.98rem', maxWidth: 640, margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
            Descubre las experiencias reales de quienes han adquirido nuestras piezas exclusivas. Calidad garantizada, empaque firma y despacho asegurado a todo Chile.
          </p>

          {/* Badges de Confianza */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 24, fontSize: '0.78rem', color: S.charcoal, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#25D366' }}>✓</span> Compradores Verificados
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: S.gold }}>📦</span> Despacho Express Chile
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: S.gold }}>💎</span> Plata 925 & Baño de Oro
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 44 }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '10px 20px',
                borderRadius: '24px',
                border: activeFilter === f ? `1px solid ${S.obsidian}` : `1px solid ${S.nude}`,
                background: activeFilter === f ? S.obsidian : S.ivory,
                color: activeFilter === f ? S.offWhite : S.muted,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {filteredReviews.map(r => (
            <div
              key={r.id}
              style={{
                background: S.ivory,
                border: `1px solid ${S.nude}`,
                borderRadius: '12px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.02)'; }}
            >
              <div>
                {/* Rating & Tag Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ color: S.gold, letterSpacing: '2px', fontSize: '0.9rem' }}>
                    {'★'.repeat(r.rating)}
                  </div>
                  <span style={{
                    fontSize: '0.62rem',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: 'rgba(184,151,90,0.12)',
                    color: S.gold,
                    border: `1px solid rgba(184,151,90,0.3)`,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    {r.tag}
                  </span>
                </div>

                {/* Comment Text */}
                <p style={{ color: S.obsidian, fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
                  "{r.comment}"
                </p>
              </div>

              {/* Client Info & Product Purchased */}
              <div style={{ borderTop: `1px solid ${S.nude}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', background: S.obsidian, color: S.gold,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: '0.85rem'
                  }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: S.obsidian, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {r.name}
                      <span style={{ fontSize: '0.7rem', color: '#25D366' }} title="Compra Verificada">✓</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: S.muted, fontFamily: 'Inter, sans-serif' }}>
                      {r.location}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'Cinzel, serif', color: S.gold, letterSpacing: '0.05em' }}>
                    {r.product}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: S.nudeDark, marginTop: 2 }}>
                    {r.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: 56, textAlign: 'center', background: S.ivory, border: `1px solid ${S.nude}`, borderRadius: '12px', padding: '36px 24px' }}>
          <h3 className="font-display" style={{ fontSize: '1.5rem', color: S.obsidian, fontWeight: 400, marginBottom: 10 }}>
            ¿Quieres vivir la experiencia Amora?
          </h3>
          <p style={{ color: S.muted, fontSize: '0.88rem', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Únete a cientos de clientas satisfechas. Recibe tus piezas en empaque de regalo de lujo con despacho asegurado a todo Chile.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a
              href="#joyeria"
              style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase',
                background: S.obsidian, color: S.offWhite, padding: '14px 32px', textDecoration: 'none', border: `1px solid ${S.obsidian}`, borderRadius: '4px'
              }}
            >
              Explorar Catálogo
            </a>
            <a
              href="https://wa.me/56951555556?text=Hola%20Amora%20Jewelry%2C%20quisiera%20consultar%20por%20sus%20joyas"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase',
                background: '#25D366', color: '#FFFFFF', padding: '14px 32px', textDecoration: 'none', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: 8
              }}
            >
              <span>💬</span> Consultar por WhatsApp
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── FOOTER HELP MODALS ───────────────────────────────────────────────────
const MODAL_CONTENT: Record<string, { title: string; icon: string; body: React.ReactNode }> = {
  'Cómo comprar': {
    title: 'Cómo Comprar en Amora Jewelry',
    icon: '🛍️',
    body: (
      <div>
        <p style={{ marginBottom: 16, lineHeight: 1.8 }}>En <strong>Amora Jewelry</strong> tienes <strong>dos formas sencillas</strong> de realizar tu compra:</p>
        <div style={{ marginBottom: 20, padding: '16px 20px', background: '#f9f7f4', borderLeft: '3px solid #B8975A', borderRadius: 4 }}>
          <strong style={{ display: 'block', marginBottom: 8, fontFamily: 'Cinzel,serif', fontSize: '0.75rem', letterSpacing: '0.1em' }}>💬 VÍA WHATSAPP</strong>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.75 }}>Escríbenos directamente al <strong>+56 9 5155 5556</strong>, cuéntanos qué pieza te interesa y te guiamos en el proceso de compra de forma personalizada. Aceptamos <strong>transferencia bancaria, Mercado Pago y débito/crédito</strong>.</p>
        </div>
        <div style={{ marginBottom: 20, padding: '16px 20px', background: '#f9f7f4', borderLeft: '3px solid #B8975A', borderRadius: 4 }}>
          <strong style={{ display: 'block', marginBottom: 8, fontFamily: 'Cinzel,serif', fontSize: '0.75rem', letterSpacing: '0.1em' }}>🌐 VÍA SITIO WEB</strong>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.75 }}>Selecciona la pieza que deseas, elige tu talla si corresponde, agrégala al carrito y sigue el proceso de pago seguro en nuestra plataforma. Tu orden quedará confirmada vía correo electrónico.</p>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#9A8C7E', lineHeight: 1.7 }}>
          ✅ De acuerdo a la <strong>Ley 19.496 del Consumidor (Chile)</strong>, tienes derecho a recibir información clara y veraz sobre los productos, precios y condiciones de compra antes de finalizar tu pedido.
        </p>
      </div>
    ),
  },
  'Envíos': {
    title: 'Política de Envíos',
    icon: '📦',
    body: (
      <div>
        <p style={{ marginBottom: 16, lineHeight: 1.8 }}>En <strong>Amora Jewelry</strong> gestionamos cada despacho con nuestro equipo logístico para garantizarte el mejor servicio.</p>
        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          {[
            { icon: '🚚', t: 'Cobertura nacional', d: 'Despachamos a todo Chile: Región Metropolitana, regiones del norte y sur del país, incluidas zonas extremas (Arica–Punta Arenas).' },
            { icon: '⏱️', t: 'Plazo de entrega', d: 'RM: 1–3 días hábiles. Regiones: 3–7 días hábiles según destino. Zonas extremas: hasta 10 días hábiles.' },
            { icon: '📍', t: 'Seguimiento', d: 'Una vez despachado tu pedido, recibirás el número de seguimiento por WhatsApp o correo para que puedas rastrearlo en tiempo real.' },
            { icon: '🎁', t: 'Empaque de lujo', d: 'Todos los pedidos se despachan en caja rígida con cinta de raso negra y bolsa tissue, lista para regalo sin costo adicional.' },
          ].map(i => (
            <div key={i.t} style={{ padding: '12px 16px', background: '#f9f7f4', borderRadius: 6, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{i.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: 4 }}>{i.t}</strong>
                <span style={{ fontSize: '0.82rem', color: '#6B5F54', lineHeight: 1.65 }}>{i.d}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#9A8C7E', lineHeight: 1.7 }}>
          ✅ Según el <strong>Artículo 12 de la Ley 19.496</strong>, estás en tu derecho de recibir el producto en las condiciones y plazos ofrecidos. Ante cualquier atraso injustificado, puedes contactarnos para gestionar una solución.
        </p>
      </div>
    ),
  },
  'Cambios': {
    title: 'Política de Cambios y Devoluciones',
    icon: '🔄',
    body: (
      <div>
        <p style={{ marginBottom: 16, lineHeight: 1.8 }}>Tu satisfacción es nuestra prioridad. Si tu pedido llegó con algún <strong>daño de fábrica o error de despacho</strong>, lo gestionamos sin costo adicional.</p>
        <div style={{ marginBottom: 20, padding: '16px 20px', background: '#f9f7f4', borderLeft: '3px solid #4CAF50', borderRadius: 4 }}>
          <strong style={{ display: 'block', marginBottom: 8, fontFamily: 'Cinzel,serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#2e7d32' }}>✅ CAUSALES ACEPTADAS</strong>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem', lineHeight: 1.9 }}>
            <li>Producto con daño de fábrica o defecto de manufactura</li>
            <li>Pieza distinta a la solicitada (error en el despacho)</li>
            <li>Producto con daño causado por la logística de transporte</li>
          </ul>
        </div>
        <div style={{ marginBottom: 20, padding: '16px 20px', background: '#f9f7f4', borderLeft: '3px solid #B8975A', borderRadius: 4 }}>
          <strong style={{ display: 'block', marginBottom: 8, fontFamily: 'Cinzel,serif', fontSize: '0.75rem', letterSpacing: '0.1em' }}>📋 PROCEDIMIENTO</strong>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem', lineHeight: 1.9 }}>
            <li>Contáctanos dentro de <strong>5 días hábiles</strong> desde la recepción</li>
            <li>Envíanos fotografías del producto y empaque al correo <strong>amorajewelrychile@gmail.com</strong></li>
            <li>Nuestro equipo evaluará el caso y coordinará el retiro sin costo</li>
            <li>Reponemos el producto o realizamos devolución según disponibilidad</li>
          </ol>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#9A8C7E', lineHeight: 1.7 }}>
          ✅ Conforme al <strong>Artículo 19 y 20 de la Ley 19.496 de Protección al Consumidor</strong>, tienes derecho a la reparación, reposición o devolución del precio pagado cuando el producto presente defectos o no corresponda a lo ofrecido.
        </p>
      </div>
    ),
  },
  'Contacto': {
    title: 'Canales de Contacto Oficial',
    icon: '📞',
    body: (
      <div>
        <p style={{ marginBottom: 20, lineHeight: 1.8 }}>Estamos disponibles para atenderte por <strong>tres canales oficiales</strong>. Elige el que más te acomode:</p>
        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          <a href="https://wa.me/56951555556?text=Hola%20Amora%20Jewelry%2C%20quisiera%20consultar" target="_blank" rel="noopener noreferrer" style={{ padding: '16px 20px', background: '#f1fdf4', border: '1px solid #c8e6c9', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, transition: 'transform 0.2s' }}>
            <span style={{ fontSize: '1.8rem' }}>💬</span>
            <div>
              <strong style={{ display: 'block', color: '#1b5e20', fontSize: '0.88rem' }}>WhatsApp / Fono</strong>
              <span style={{ color: '#2e7d32', fontSize: '0.85rem' }}>+56 9 5155 5556 — Atención L–S 10:00 a 19:00 hrs</span>
            </div>
            <span style={{ marginLeft: 'auto', color: '#4CAF50', fontSize: '0.75rem', fontFamily: 'Cinzel,serif' }}>ESCRIBIR →</span>
          </a>
          <a href="mailto:amorajewelrychile@gmail.com?subject=Consulta%20Amora%20Jewelry" style={{ padding: '16px 20px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, transition: 'transform 0.2s' }}>
            <span style={{ fontSize: '1.8rem' }}>✉️</span>
            <div>
              <strong style={{ display: 'block', color: '#5c4a00', fontSize: '0.88rem' }}>Correo Electrónico</strong>
              <span style={{ color: '#7a6200', fontSize: '0.85rem' }}>amorajewelrychile@gmail.com — Respuesta en 24 hrs hábiles</span>
            </div>
            <span style={{ marginLeft: 'auto', color: '#F9A825', fontSize: '0.75rem', fontFamily: 'Cinzel,serif' }}>ENVIAR →</span>
          </a>
          <a href="https://www.instagram.com/amorajewelrychile/" target="_blank" rel="noopener noreferrer" style={{ padding: '16px 20px', background: '#fce4ec', border: '1px solid #f48fb1', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, transition: 'transform 0.2s' }}>
            <span style={{ fontSize: '1.8rem' }}>📸</span>
            <div>
              <strong style={{ display: 'block', color: '#880e4f', fontSize: '0.88rem' }}>Instagram</strong>
              <span style={{ color: '#ad1457', fontSize: '0.85rem' }}>@amorajewelrychile — DM disponible las 24 hrs</span>
            </div>
            <span style={{ marginLeft: 'auto', color: '#e91e63', fontSize: '0.75rem', fontFamily: 'Cinzel,serif' }}>SEGUIR →</span>
          </a>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#9A8C7E', lineHeight: 1.7 }}>
          ✅ Según el <strong>Artículo 3 letra b) de la Ley 19.496</strong>, tienes derecho a recibir una atención honesta, oportuna y sin discriminación arbitraria. Nuestro equipo se compromete a responder toda consulta dentro del horario establecido.
        </p>
      </div>
    ),
  },
};

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const modal = activeModal ? MODAL_CONTENT[activeModal] : null;

  const cols = [
    { t: 'Joyería', ls: [
      { label: 'Anillos', href: '#joyeria' },
      { label: 'Cadenas', href: '#joyeria' },
      { label: 'Pulseras', href: '#joyeria' },
      { label: 'Aros', href: '#joyeria' },
    ]},
    { t: 'Ayuda', ls: [
      { label: 'Cómo comprar', modal: true },
      { label: 'Envíos', modal: true },
      { label: 'Cambios', modal: true },
      { label: 'Contacto', modal: true },
    ]},
  ];

  return (
    <>
      {/* ── MODAL OVERLAY ── */}
      {modal && (
        <div
          onClick={() => setActiveModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.65)', backdropFilter: 'blur(6px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#FDFCF8', borderRadius: 12, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', animation: 'modalIn 0.25s ease' }}
          >
            {/* Modal Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #E3DBCC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#FDFCF8', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>{modal.icon}</span>
                <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: '0.9rem', letterSpacing: '0.1em', color: '#101010', margin: 0, textTransform: 'uppercase' }}>{modal.title}</h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#9A8C7E', lineHeight: 1, padding: 4, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#101010')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9A8C7E')}
                aria-label="Cerrar"
              >✕</button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: '24px 28px 32px', color: '#3D3530', fontSize: '0.88rem' }}>
              {modal.body}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <footer style={{ background: S.offWhite, borderTop: `1px solid ${S.nude}`, paddingTop: 72 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px repeat(2,1fr)', gap: 48, paddingBottom: 56, borderBottom: `1px solid ${S.nude}` }}>
            <div>
              <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={140} height={33} style={{ objectFit: 'contain', marginBottom: 20 }} />
              <p style={{ color: S.muted, fontSize: '0.82rem', lineHeight: 1.75, marginBottom: 24 }}>
                Joyería premium diseñada para mujeres que aprecian el lujo en cada detalle.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { img: '/amora_instagram.png', href: 'https://www.instagram.com/amorajewelrychile/', title: 'Instagram' },
                  { img: '/amora_whatsapp.png', href: 'https://wa.me/56951555556?text=Hola%20Amora%20Jewelry%2C%20quisiera%20consultar%20por%20sus%20joyas', title: 'WhatsApp' },
                  { img: '/amora_email.png', href: 'mailto:amorajewelrychile@gmail.com', title: 'Email' },
                ].map(s => (
                  <a key={s.title} href={s.href} title={s.title} target={s.href.startsWith('http') ? '_blank' : undefined} rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{ width: 36, height: 36, border: `1px solid ${S.nude}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s', padding: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.background = S.nude; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Image src={s.img} alt={s.title} fill style={{ objectFit: 'contain' }} />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {cols.map(col => (
              <div key={col.t}>
                <div style={{ fontFamily: 'Cinzel,serif', color: S.obsidian, fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 20 }}>{col.t}</div>
                {col.ls.map((item: any) => (
                  item.modal ? (
                    <button
                      key={item.label}
                      onClick={() => setActiveModal(item.label)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, color: S.muted, fontSize: '0.85rem', textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                      onMouseEnter={e => { e.currentTarget.style.color = S.obsidian; }}
                      onMouseLeave={e => { e.currentTarget.style.color = S.muted; }}
                    >
                      {item.label}
                      <span style={{ fontSize: '0.65rem', color: S.gold, opacity: 0.7 }}>→</span>
                    </button>
                  ) : (
                    <a key={item.label} href={item.href} style={{ display: 'block', color: S.muted, fontSize: '0.85rem', textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = S.obsidian)}
                      onMouseLeave={e => (e.currentTarget.style.color = S.muted)}
                    >{item.label}</a>
                  )
                ))}
              </div>
            ))}
          </div>

          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: S.nudeDark, fontSize: '0.7rem', fontFamily: 'Cinzel,serif', letterSpacing: '0.08em' }}>© {new Date().getFullYear()} AMORA JEWELRY. TODOS LOS DERECHOS RESERVADOS.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacidad', 'Términos', 'Cookies'].map(t => (
                <a key={t} href="#" style={{ color: S.nudeDark, fontSize: '0.7rem', textDecoration: 'none', fontFamily: 'Cinzel,serif' }}>{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}


// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function StorefrontClient({ products }: { products: any[] }) {
  return (
    <>
      <PromoBar />
      <Navbar />
      <main>
        {/* Usamos h1 invisible para SEO general si es necesario, o que el Hero contenga el título principal. */}
        <h1 className="sr-only" style={{ display: 'none' }}>Amora Jewelry - Joyería Premium en Chile</h1>
        
        <Hero />
        <FeaturesBar />
        <FeaturedProducts products={products} />
        <Products products={products} />
        <SecondBanner />
        <TestimonialsSection />
      </main>
      <Footer />
      <CartSidebar />

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/56951555556?text=Hola%20Amora%20Jewelry%2C%20quisiera%20consultar%20por%20sus%20joyas" target="_blank" rel="noopener noreferrer" aria-label="Contáctanos por WhatsApp" style={{
        position:'fixed', bottom:30, right:30, zIndex:1000,
        width:56, height:56, borderRadius:'50%',
        background:'#FFFFFF', border:'1px solid #E3DBCC',
        boxShadow:'0 4px 16px rgba(0,0,0,0.1)',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'transform 0.3s ease, box-shadow 0.3s ease',
        padding:12
      }}
        onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(184,151,90,0.3)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; }}
      >
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
          <Image src="/amora_whatsapp.png" alt="WhatsApp" fill style={{ objectFit:'contain' }} />
        </div>
      </a>
    </>
  );
}
