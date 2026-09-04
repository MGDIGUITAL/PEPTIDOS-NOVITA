'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCart } from './CartContext';
import CartSidebar from './CartSidebar';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const S = {
  black:    '#000000',
  surface:  '#0A0A0A',
  card:     '#121212',
  border:   '#222222',
  ivory:    '#E6E2D3',
  ivoryDark:'#C4BFA9',
  offWhite: '#EEEEEE',
  white:    '#FFFFFF',
  muted:    '#888888',
};

const CATS = ['Todos', 'Péptidos GLP-1', 'Péptidos Regenerativos', 'Péptidos Mitocondriales', 'Péptidos GHRH', 'Accesorios'];

// ─── PROMO BAR ────────────────────────────────────────────────────────────
function PromoBar() {
  return (
    <div className="promo-bar" style={{ padding:'10px 0', textAlign:'center', color:S.ivory, fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.18em', background:S.black, borderBottom:`1px solid ${S.border}` }}>
      ✦ COBERTURA NACIONAL &nbsp;·&nbsp; ENVÍO DISCRETO A TODO CHILE &nbsp;·&nbsp; DESPACHO A DOMICILIO Y PUNTOS DE RETIRO ✦
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

  const navBg  = scrolled ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.85)';
  const linkColor = S.white;

  const btnBox: React.CSSProperties = {
    fontFamily:'Outfit,sans-serif', fontSize:'0.72rem', letterSpacing:'0.14em',
    textTransform:'uppercase', textDecoration:'none',
    color:S.white, border:`1px solid ${S.border}`,
    padding:'9px 20px', cursor:'pointer', background:'transparent',
    transition:'all 0.25s', whiteSpace:'nowrap' as const,
  };

  return (
    <>
      <nav style={{ position:'sticky', top:0, zIndex:100, background:navBg, borderBottom:`1px solid ${S.border}`, backdropFilter:'blur(20px)', transition:'all 0.3s', width:'100%' }}>

        
        <div className="nav-inner-container" style={{ maxWidth:1320, margin:'0 auto', padding:'0 2rem', height:72, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          
          {/* Mobile Hamburger Button */}
          <button 
            className="nav-mobile-hamburger"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Abrir menú de navegación"
            style={{ background:'none', border:'none', cursor:'pointer', padding:4, alignItems:'center', justifyContent:'center' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Logo NOVA PERFORMANCE */}
          <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none', flexShrink:0 }}>
            <Image className="nav-logo-img" src="/logo-nova-white.png" alt="NOVA Performance" width={220} height={48} style={{ objectFit:'contain' }} priority />
          </Link>

          {/* Desktop Links */}
          <div className="nav-desktop-links">
            {[
              { l:'Catálogo',  h:'#catalogo' },
              { l:'Novedades', h:'#novedades' },
              { l:'Garantía', h:'#garantia' },
              { l:'Marco Regulatorio', h:'/marco-regulatorio' },
            ].map(({ l, h }) => (
              <a key={l} href={h} className="nav-link">
                {l}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="nav-desktop-actions">
            {/* Carrito con badge */}
            <button title="Carrito" onClick={openCart} className="icon-btn-nova" style={{ height:38 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
              <span>Carrito</span>
              {cartCount > 0 && (
                <span style={{ background:S.ivory, color:S.black, borderRadius:'50%', width:18, height:18, fontSize:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Outfit,sans-serif', fontWeight:800 }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Separador */}
            <span className="hide-mobile-item" style={{ width:1, height:24, background:S.border, display:'block' }} />

            {/* Botón Mi Cuenta */}
            <div className="hide-mobile-item" ref={menuRef} style={{ position:'relative' }}>
              {userName ? (
                <>
                  <button
                    onClick={() => setShowMenu(v => !v)}
                    className="icon-btn-nova" style={{ height:38, background: showMenu ? S.white : 'transparent', color: showMenu ? S.black : S.white }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>{userName} ▾</span>
                  </button>
                  {showMenu && (
                    <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:S.surface, border:`1px solid ${S.border}`, borderRadius:6, minWidth:170, boxShadow:'0 8px 24px rgba(0,0,0,0.8)', zIndex:200, overflow:'hidden' }}>
                      <div style={{ padding:'10px 16px', fontFamily:'Outfit,sans-serif', fontSize:'0.65rem', letterSpacing:'0.1em', color:S.muted, borderBottom:`1px solid ${S.border}`, textTransform:'uppercase' }}>
                        Mi cuenta
                      </div>
                      <button onClick={handleLogout} style={{ width:'100%', padding:'12px 16px', background:'none', border:'none', textAlign:'left', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color:S.white, cursor:'pointer', letterSpacing:'0.08em', transition:'background 0.2s' }}
                        onMouseEnter={e=>(e.currentTarget.style.background=S.card)}
                        onMouseLeave={e=>(e.currentTarget.style.background='none')}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/auth/cliente" className="icon-btn-nova" style={{ height:38, textDecoration:'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Mi Cuenta</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER NAVIGATION OVERLAY */}
      {mobileDrawerOpen && (
        <>
          <div 
            onClick={() => setMobileDrawerOpen(false)} 
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)', zIndex:999, transition:'opacity 0.3s' }} 
          />
          <div style={{
            position:'fixed', top:0, left:0, bottom:0, width:'85vw', maxWidth:340,
            background:S.black, borderRight:`1px solid ${S.border}`, zIndex:1000, padding:'24px 20px', display:'flex',
            flexDirection:'column', justifyContent:'space-between', boxShadow:'8px 0 32px rgba(0,0,0,0.8)',
            overflowY:'auto'
          }}>
            <div>
              {/* Header Drawer */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:20, borderBottom:`1px solid ${S.border}` }}>
                <Image src="/logo-nova-white.png" alt="NOVA Performance" width={150} height={36} style={{ objectFit:'contain' }} />
                <button 
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:S.white, padding:4 }}
                >✕</button>
              </div>

              {/* Links de Navegación */}
              <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:24 }}>
                {[
                  { l:'Catálogo',  h:'#catalogo' },
                  { l:'Novedades', h:'#novedades' },
                  { l:'Garantía', h:'#garantia' },
                ].map(({ l, h }) => (
                  <a 
                    key={l} 
                    href={h} 
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{
                      fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', letterSpacing:'0.14em',
                      textTransform:'uppercase', textDecoration:'none',
                      color: S.white, fontWeight:700,
                      padding:'10px 0', borderBottom:`1px solid ${S.card}`
                    }}
                  >
                    {l}
                  </a>
                ))}
              </div>

              {/* Acceso a cuenta */}
              <div style={{ marginTop:32, display:'flex', flexDirection:'column', gap:12 }}>
                {userName ? (
                  <div style={{ background:S.card, padding:'12px 16px', borderRadius:8, border:`1px solid ${S.border}` }}>
                    <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.7rem', color:S.ivory, textTransform:'uppercase', letterSpacing:'0.1em' }}>Sesión activa</p>
                    <p style={{ fontWeight:600, fontSize:'0.9rem', color:S.white, margin:'4px 0 10px' }}>{userName}</p>
                    <button 
                      onClick={handleLogout}
                      style={{ width:'100%', padding:'8px', background:S.white, color:S.black, border:'none', borderRadius:4, fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer', fontWeight:800 }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/auth/cliente" 
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{ ...btnBox, width:'100%', textAlign:'center', padding:'12px', background:S.white, color:S.black, borderRadius:4, fontWeight:800 }}
                  >
                    Mi Cuenta / Ingresar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────
const FONDOS_DESKTOP = ['/fondo-1.png'];
const FONDOS_MOBILE = ['/fondo-1-movil.png'];

function Hero() {
  return (
    <section className="hero-container">

      {/* Hero Background Image (Desktop Full Screen) */}
      <Image
        className="hero-img-desktop"
        src={FONDOS_DESKTOP[0]}
        alt="NOVA Performance Biotech"
        fill
        priority
        style={{
          objectFit: 'cover',
          objectPosition: 'center center',
          zIndex: 0,
        }}
      />

      {/* Hero Background Image (Mobile Full Screen) */}
      <Image
        className="hero-img-mobile"
        src={FONDOS_MOBILE[0]}
        alt="NOVA Performance Biotech"
        fill
        priority
        style={{
          objectFit: 'cover',
          objectPosition: 'center center',
          zIndex: 0,
        }}
      />

      {/* Degradado sutil para integración prolija */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Recuadro de botón en la zona derecha central para máxima inmersión */}
      <div 
        className="hero-btn-container" 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end', 
          padding: '0 10vw' 
        }}
      >
        <div className="fade-in">
          <a href="#catalogo" className="hero-catalog-btn">
            <span>Ver Catálogo</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 8 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function FeaturesBar() {
  const items = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.5L4.5 18a2 2 0 001.7 3h11.6a2 2 0 001.7-3L14 9.5V2" />
          <path d="M8.5 2h7" />
          <path d="M7 16h10" />
        </svg>
      ),
      t:'Pureza Verificada', d:'>99% HPLC certificado por lote'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
      t:'Despacho Discreto', d:'Empaque neutro a todo Chile'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15l2 2 4-4" />
        </svg>
      ),
      t:'Certificado COA', d:'Trazabilidad analítica completa'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={S.ivory} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18h12M12 6v12M9 9l3-3 3 3" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
      t:'Research Only', d:'Compuestos para investigación'
    },
  ];
  return (
    <div style={{ background: S.surface, borderBottom:`1px solid ${S.border}`, padding:'28px 2rem' }}>

      <div className="features-grid" style={{ maxWidth:1200, margin:'0 auto' }}>
        {items.map(f => (
          <div key={f.t} style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ padding: 10, background: '#121212', border: `1px solid ${S.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontFamily:'Outfit,sans-serif', color:S.white, fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700 }}>{f.t}</div>
              <div style={{ color:S.muted, fontSize:'0.76rem', marginTop:2 }}>{f.d}</div>
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
  
  const hasRefImage = Boolean(p.reference_image_url);
  const currentImage = (isHovered && hasRefImage) ? p.reference_image_url : p.image_url;

  return (
    <article 
      className="product-card" 
      style={{ background: '#121212', border: `1px solid ${S.border}`, display: 'flex', flexDirection: 'column', borderRadius: 6, overflow: 'hidden' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${p.id}`} className="product-card-img-link" style={{ display: 'block', height:260, position:'relative', overflow:'hidden', background:'#050505', padding: '12px' }}>
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
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, opacity:0.4 }}>
            <span style={{ color:S.ivory, fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700 }}>Péptido NOVA</span>
          </div>
        )}
        {/* Category badge */}
        <span style={{ position:'absolute', bottom:14, right:14, background:'rgba(0,0,0,0.85)', border:`1px solid ${S.border}`, color:S.ivory, fontFamily:'Outfit,sans-serif', fontSize:'0.65rem', padding:'4px 10px', letterSpacing:'0.1em', borderRadius:4, fontWeight:700 }}>
          {p.category}
        </span>
        </div>
      </Link>
      <div className="product-card-info" style={{ padding:'20px', background:'#121212', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="font-display product-card-title" style={{ fontSize:'1.1rem', fontWeight:700, color:S.white, lineHeight:1.3, marginBottom:16, cursor: 'pointer' }}>
            {p.title}
          </h3>
        </Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 'auto', gap: 6, flexWrap: 'wrap' }}>
          <span className="font-display product-card-price" style={{ fontSize:'1.25rem', color:S.ivory, fontWeight:800 }} suppressHydrationWarning>
            ${p.sale_price ? Math.round(p.sale_price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0'}
          </span>
          <button 
            onClick={() => addToCart(p)} 
            style={{
              fontFamily:'Outfit,sans-serif', fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:800,
              background:S.white, border:`1px solid ${S.white}`, color:S.black,
              padding:'10px 18px', cursor:'pointer', transition:'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', borderRadius:4,
              display:'inline-flex', alignItems:'center', gap:6
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background=S.ivory; e.currentTarget.style.borderColor=S.ivory; e.currentTarget.style.boxShadow='0 0 14px rgba(230,226,211,0.5)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background=S.white; e.currentTarget.style.borderColor=S.white; e.currentTarget.style.boxShadow='none'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            <span>Agregar</span>
          </button>
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

  useEffect(() => {
    setVisibleCount(15);
  }, [filter]);

  return (
    <section id="catalogo" style={{ padding:'80px 1rem', background:S.black }}>
      <div style={{ maxWidth:1400, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:40, flexWrap:'wrap', gap:16 }}>
          <div>
            <span style={{ color:S.ivory, fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:800 }}>Alta Pureza</span>
            <h2 className="font-display" style={{ fontSize:'clamp(2.2rem,5vw,3.5rem)', fontWeight:800, color:S.white, textTransform:'uppercase' }}>Catálogo de Compuestos</h2>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700,
                padding:'10px 20px', borderRadius:4,
                background: filter===c ? S.white : S.surface,
                color: filter===c ? S.black : S.muted,
                border: filter===c ? `1px solid ${S.white}` : `1px solid ${S.border}`,
                cursor:'pointer', transition:'all 0.25s',
              }}>{c}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: S.muted, fontSize: '1.1rem', fontFamily: 'Outfit,sans-serif', border:`1px solid ${S.border}`, borderRadius:8, background:S.surface }}>
            Aún no hay compuestos cargados en esta categoría.
          </div>
        ) : (
          <>

            <div className="product-grid-container">
              {shown.map(p => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
                <button 
                  onClick={() => setVisibleCount(v => v + 15)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${S.white}`,
                    color: S.white,
                    fontFamily: 'Outfit,sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '14px 36px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = S.white; e.currentTarget.style.color = S.black; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.white; }}
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
    <section style={{ padding: '80px 2rem', background: S.black }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ color: S.ivory, fontFamily: 'Outfit,sans-serif', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>Destacados</span>
          <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 800, color: S.white, textTransform: 'uppercase' }}>
            Compuestos Principales
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
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
    <section id="novedades" style={{ position:'relative', height:480, overflow:'hidden', display:'flex', alignItems:'center', background: S.black }}>
      <Image src="/fondo-1.png" alt="NOVA Performance Biotech" fill style={{ objectFit:'cover', objectPosition:'center center', opacity: 0.2 }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.5) 100%), linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.85) 100%)' }} />
      <div style={{ position:'relative', zIndex:1, maxWidth:1320, margin:'0 auto', padding:'0 2rem' }}>
        <div style={{ maxWidth:540 }}>
          <div style={{ marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ color:S.ivory, fontSize:'0.75rem', fontFamily:'Outfit,sans-serif', letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:800 }}>
              ✦ TECNOLOGÍA & PUREZA ANALÍTICA
            </span>
          </div>
          <h2 className="font-display section-title" style={{ fontSize:'clamp(2.2rem,5vw,3.8rem)', fontWeight:800, lineHeight:1.1, color:S.white, marginBottom:20, textTransform:'uppercase' }}>
            Estándar de Pureza<br /><span style={{ color: S.ivory }}>Investigación Superior</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.7)', marginBottom:32, lineHeight:1.75, fontSize:'0.95rem' }}>
            Cada compuesto producido por NOVA PERFORMANCE® cuenta con estrictos controles de calidad HPLC superior al 99% y certificación por lote para uso en investigación científica.
          </p>
          <a href="#catalogo" style={{ display:'inline-flex', alignItems:'center', gap:10, background:S.white, color:S.black, fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', padding:'16px 36px', textDecoration:'none', transition:'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', borderRadius:4 }}
            onMouseEnter={e=>{ e.currentTarget.style.background=S.ivory; e.currentTarget.style.boxShadow='0 0 22px rgba(230,226,211,0.5)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background=S.white; e.currentTarget.style.boxShadow='none'; }}
          >
            <span>Ver Compuestos</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS & REVIEWS SECTION ─────────────────────────────────────
const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Dr. Matías E.',
    location: 'Las Condes, Santiago',
    product: 'BPC-157 5mg (HPLC >99.4%)',
    date: 'Hace 2 días',
    rating: 5,
    tag: 'Trazabilidad & COA',
    comment: 'Recepción impecable con cadena de frío protegida. Solicitamos el Certificado de Análisis (COA) vía WhatsApp y nos adjuntaron el informe espectrométrico en menos de 10 minutos. Altísima solubilidad y estabilidad de formulación.',
  },
  {
    id: 2,
    name: 'Dra. Camila S.',
    location: 'Viña del Mar, Valparaíso',
    product: 'TB-500 5mg Research Grade',
    date: 'Hace 4 días',
    rating: 5,
    tag: 'Calidad & Pureza',
    comment: 'Excelente consistencia entre lotes para ensayos celulares in vitro. El vial de liofilizado presenta un disco perfecto sin apelmazamiento. La comunicación técnica directa brinda una seguridad absoluta.',
  },
  {
    id: 3,
    name: 'Laboratorio Biomédico R.',
    location: 'Concepción, Biobío',
    product: 'CJC-1295 + Ipamorelin Blend',
    date: 'Hace 1 semana',
    rating: 5,
    tag: 'Despacho & Discreción',
    comment: 'Despacho en empaque neutro blindado sin rotulación externa, tal como se requiere para material de investigación sensible. Entregado en 24h hábiles por courier prioritario.',
  },
  {
    id: 4,
    name: 'Investigador Álvaro G.',
    location: 'Antofagasta',
    product: 'GHK-Cu 50mg Bio-Active',
    date: 'Hace 1 semana',
    rating: 5,
    tag: 'Calidad & Pureza',
    comment: 'Tono azul cobalto intenso característico del complejo cúprico de alta pureza. Excelente tasa de disolución y cero residuos en suspensión. Definitivamente nuestro proveedor principal en Chile.',
  },
  {
    id: 5,
    name: 'Dr. Fernando V.',
    location: 'La Serena, Coquimbo',
    product: 'NAD+ 100mg Ultra-Pure',
    date: 'Hace 2 semanas',
    rating: 5,
    tag: 'Trazabilidad & COA',
    comment: 'Standard analítico superior. Sellado al vacío con indicador térmico de conservación. Procedimientos de compra y gestión por canal directo sumamente eficaces.',
  },
  {
    id: 6,
    name: 'Dra. Isidora P.',
    location: 'Temuco, Araucanía',
    product: 'Tirzepatide Research 10mg',
    date: 'Hace 2 semanas',
    rating: 5,
    tag: 'Despacho & Discreción',
    comment: 'Empaque de transporte ultraseguro y discreto. Cumplimiento riguroso del marco de compuestos de investigación (Research Use Only). Totalmente recomendado para la comunidad científica.',
  },
];

function TestimonialsSection() {
  const [activeFilter, setActiveFilter] = useState('Todas');
  const filters = ['Todas', 'Despacho & Discreción', 'Calidad & Pureza', 'Trazabilidad & COA'];

  const filteredReviews = activeFilter === 'Todas' 
    ? REVIEWS_DATA 
    : REVIEWS_DATA.filter(r => r.tag === activeFilter);

  return (
    <section id="reseñas" style={{ padding: '88px 1.5rem', background: S.black, borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        
        {/* Header / Summary */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 18px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 30, marginBottom: 18 }}>
            <span style={{ color: S.ivory, fontSize: '0.85rem' }}>★ ★ ★ ★ ★</span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', letterSpacing: '0.12em', color: S.white, fontWeight: 700 }}>
              4.9 / 5.0 REVIEWS DE INVESTIGACIÓN VERIFICADOS
            </span>
          </div>

          <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 800, color: S.white, marginBottom: 16, textTransform: 'uppercase' }}>
            Experiencias & Reseñas de Clientes
          </h2>
          <p style={{ color: S.muted, fontSize: '0.98rem', maxWidth: 640, margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
            Conoce los testimonios de profesionales e investigadores en Chile. Pureza analítica verificada >99%, empaque totalmente discreto y despacho prioritario.
          </p>

          {/* Badges de Confianza */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 24, fontSize: '0.78rem', color: S.ivory, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.08em', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#4CAF50' }}>✓</span> Lotes Verificados HPLC
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>🔒</span> Empaque 100% Discreto
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>🚚</span> Envíos a todo Chile
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
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '4px',
                border: activeFilter === f ? `1px solid ${S.white}` : `1px solid ${S.border}`,
                background: activeFilter === f ? S.white : S.surface,
                color: activeFilter === f ? S.black : S.muted,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filteredReviews.map(r => (
            <div
              key={r.id}
              style={{
                background: S.surface,
                border: `1px solid ${S.border}`,
                borderRadius: '8px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = S.ivory; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; }}
            >
              <div>
                {/* Rating & Tag Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ color: S.ivory, letterSpacing: '2px', fontSize: '0.9rem' }}>
                    {'★'.repeat(r.rating)}
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'Outfit, sans-serif',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    background: '#181818',
                    color: S.ivory,
                    border: `1px solid ${S.border}`,
                    padding: '4px 10px',
                    borderRadius: '4px'
                  }}>
                    {r.tag}
                  </span>
                </div>

                <p style={{ color: S.white, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
                  "{r.comment}"
                </p>
              </div>

              <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: S.white, fontFamily: 'Outfit, sans-serif' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: S.muted, marginTop: 2 }}>
                    {r.location}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif', color: S.ivory, letterSpacing: '0.05em', fontWeight: 600 }}>
                    {r.product}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: S.muted, marginTop: 2 }}>
                    {r.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: 64, textAlign: 'center', background: S.surface, border: `1px solid ${S.border}`, borderRadius: '8px', padding: '44px 24px' }}>
          <h3 className="font-display" style={{ fontSize: '1.6rem', color: S.white, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase' }}>
            ¿Necesitas Certificado de Análisis (COA) o Atención Directa?
          </h3>
          <p style={{ color: S.muted, fontSize: '0.92rem', marginBottom: 28, maxWidth: 540, margin: '0 auto 28px' }}>
            Contacta a nuestro equipo para solicitar información de lotes, hojas de datos analíticos o asesoría de adquisición.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a
              href="#catalogo"
              style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800,
                background: S.white, color: S.black, padding: '16px 36px', textDecoration: 'none', borderRadius: '4px'
              }}
            >
              Explorar Compuestos
            </a>
            <a
              href="https://wa.me/56951555556?text=Hola%20NOVA%20Performance%2C%20quisiera%20consultar%20por%20sus%20compuestos"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800,
                background: '#25D366', color: '#FFFFFF', padding: '16px 36px', textDecoration: 'none', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: 8
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
    title: 'Cómo Comprar en NOVA Performance®',
    icon: '🛍️',
    body: (
      <div>
        <p style={{ marginBottom: 16, lineHeight: 1.8 }}>En <strong>NOVA Performance®</strong> cuentas con procesos ágiles y seguros para la adquisición de compuestos de investigación:</p>
        <div style={{ marginBottom: 20, padding: '16px 20px', background: '#121212', borderLeft: '3px solid #E6E2D3', borderRadius: 4 }}>
          <strong style={{ display: 'block', marginBottom: 8, fontFamily: 'Outfit,sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#E6E2D3' }}>💬 ASESORÍA Y PEDIDOS WHATSAPP</strong>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.75, color: '#CCCCCC' }}>Escríbenos directamente a nuestro canal oficial para resolver dudas técnicas sobre lotes o COA. Aceptamos <strong>transferencia bancaria instantánea y tarjetas de crédito/débito</strong>.</p>
        </div>
        <div style={{ marginBottom: 20, padding: '16px 20px', background: '#121212', borderLeft: '3px solid #E6E2D3', borderRadius: 4 }}>
          <strong style={{ display: 'block', marginBottom: 8, fontFamily: 'Outfit,sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#E6E2D3' }}>🌐 PEDIDO EN LÍNEA</strong>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.75, color: '#CCCCCC' }}>Selecciona tus compuestos, agrégalos al carrito y completa la solicitud. Tu orden será procesada inmediatamente con despacho discreto en caja sellada.</p>
        </div>
      </div>
    ),
  },
  'Envíos': {
    title: 'Política de Envíos Discretos',
    icon: '📦',
    body: (
      <div>
        <p style={{ marginBottom: 16, lineHeight: 1.8, color: '#CCCCCC' }}>En <strong>NOVA Performance®</strong> priorizamos la velocidad y total discreción en cada envío a lo largo de Chile.</p>
        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          {[
            { icon: '🚚', t: 'Cobertura Nacional', d: 'Envíos a todo Chile con embalaje térmico/protegido a través de operadores logísticos certificados.' },
            { icon: '🔒', t: 'Empaque Discreto', d: 'Empaque neutro sin rotulación exterior de compuestos, garantizando máxima privacidad.' },
            { icon: '📍', t: 'Trazabilidad en Tiempo Real', d: 'Número de seguimiento enviado inmediatamente tras despacho.' },
          ].map(i => (
            <div key={i.t} style={{ padding: '12px 16px', background: '#121212', borderRadius: 6, display: 'flex', gap: 12, alignItems: 'flex-start', border: '1px solid #222222' }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{i.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: 4, color: '#E6E2D3' }}>{i.t}</strong>
                <span style={{ fontSize: '0.82rem', color: '#AAAAAA', lineHeight: 1.65 }}>{i.d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'Marco Regulatorio': {
    title: 'Marco Regulatorio & Uso Autorizado',
    icon: '⚖️',
    body: (
      <div>
        <p style={{ marginBottom: 16, lineHeight: 1.8, color: '#CCCCCC' }}>
          Los compuestos comercializados por <strong>NOVA PERFORMANCE®</strong> son productos químicos destinados exclusivamente a investigación científica (<em>“research use only”</em>).
        </p>
        <p style={{ fontSize: '0.85rem', color: '#AAAAAA', marginBottom: 16 }}>
          NO son medicamentos, suplementos alimenticios ni cosméticos. Se requiere ser mayor de 18 años para su adquisición.
        </p>
        <Link 
          href="/marco-regulatorio" 
          style={{ 
            display: 'inline-block', 
            background: '#FFFFFF', 
            color: '#000000', 
            padding: '12px 24px', 
            borderRadius: 4, 
            fontFamily: 'Outfit, sans-serif', 
            fontWeight: 800, 
            fontSize: '0.78rem', 
            textTransform: 'uppercase', 
            textDecoration: 'none',
            letterSpacing: '0.12em'
          }}
        >
          Leer Documento Completo →
        </Link>
      </div>
    ),
  },
};

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const modal = activeModal ? MODAL_CONTENT[activeModal] : null;

  return (
    <>
      {/* ── MODAL OVERLAY ── */}
      {modal && (
        <div
          onClick={() => setActiveModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#0A0A0A', border: '1px solid #222222', borderRadius: 8, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.9)' }}
          >
            {/* Modal Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #222222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0A0A0A', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>{modal.icon}</span>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.9rem', letterSpacing: '0.1em', color: '#E6E2D3', margin: 0, textTransform: 'uppercase', fontWeight: 800 }}>{modal.title}</h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888888', lineHeight: 1, padding: 4 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888888')}
                aria-label="Cerrar"
              >✕</button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: '24px 28px 32px', color: '#FFFFFF', fontSize: '0.88rem' }}>
              {modal.body}
            </div>
          </div>
        </div>
      )}

      <footer style={{ background: '#000000', borderTop: `1px solid #222222`, paddingTop: 72 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px repeat(2,1fr)', gap: 48, paddingBottom: 56, borderBottom: `1px solid #222222` }}>
            <div>
              <Image src="/logo-nova-white.png" alt="NOVA Performance" width={180} height={40} style={{ objectFit: 'contain', marginBottom: 20 }} />
              <p style={{ color: '#888888', fontSize: '0.82rem', lineHeight: 1.75, marginBottom: 24 }}>
                NOVA PERFORMANCE® — Compuestos de vanguardia biotecnológica y alta pureza para investigación.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: 'Outfit,sans-serif', color: '#E6E2D3', fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 20, fontWeight: 700 }}>Categorías</div>
              {['Péptidos', 'Rendimiento', 'Bienestar', 'Recuperación'].map(cat => (
                <a key={cat} href="#catalogo" style={{ display: 'block', color: '#888888', fontSize: '0.85rem', textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#888888')}
                >{cat}</a>
              ))}
            </div>

            <div>
              <div style={{ fontFamily: 'Outfit,sans-serif', color: '#E6E2D3', fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 20, fontWeight: 700 }}>Información & Ayuda</div>
              <button 
                onClick={() => setActiveModal('Cómo comprar')} 
                style={{ display: 'block', background: 'none', border: 'none', color: '#888888', fontSize: '0.85rem', cursor: 'pointer', marginBottom: 12, textAlign: 'left', fontFamily: 'inherit', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888888')}
              >
                Cómo Comprar →
              </button>
              <button 
                onClick={() => setActiveModal('Envíos')} 
                style={{ display: 'block', background: 'none', border: 'none', color: '#888888', fontSize: '0.85rem', cursor: 'pointer', marginBottom: 12, textAlign: 'left', fontFamily: 'inherit', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888888')}
              >
                Política de Envíos →
              </button>
              <Link 
                href="/marco-regulatorio" 
                style={{ display: 'block', color: '#E6E2D3', fontSize: '0.85rem', textDecoration: 'underline', marginBottom: 12, fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#E6E2D3')}
              >
                Marco Regulatorio y Legal →
              </Link>
            </div>
          </div>

          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <span style={{ color: '#666666', fontSize: '0.72rem', fontFamily: 'Outfit,sans-serif', letterSpacing: '0.08em' }}>
              © {new Date().getFullYear()} NOVA PERFORMANCE®. TODOS LOS DERECHOS RESERVADOS.
            </span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/marco-regulatorio" style={{ color: '#888888', fontSize: '0.72rem', textDecoration: 'none', fontFamily: 'Outfit,sans-serif' }}>
                Aviso Legal / Marco Regulatorio
              </Link>
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
        {/* H1 SEO accesible para lectores de pantalla y motores de búsqueda */}
        <h1 className="sr-only" style={{ display: 'none' }}>NOVA Performance® — Péptidos & Compuestos de Investigación Biotecnológica en Chile</h1>
        
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
      <a href="https://wa.me/56951555556?text=Hola%20NOVA%20Performance%2C%20quisiera%20consultar%20por%20sus%20compuestos%20de%20investigaci%C3%B3n" target="_blank" rel="noopener noreferrer" aria-label="Contáctanos por WhatsApp" style={{
        position:'fixed', bottom:30, right:30, zIndex:1000,
        width:56, height:56, borderRadius:'50%',
        background:'#25D366', border:'1px solid #1EBE5D',
        boxShadow:'0 4px 20px rgba(37,211,102,0.4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'transform 0.3s ease, box-shadow 0.3s ease',
        padding:12
      }}
        onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(37,211,102,0.6)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(37,211,102,0.4)'; }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      </a>
    </>
  );
}
