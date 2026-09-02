'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { T, Icons } from './components/shared';

function NavItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px 16px',
          background: active ? T.primary : 'transparent',
          color: active ? '#FFF' : T.textMuted,
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: active ? 600 : 500,
          transition: 'all 0.2s ease',
          marginBottom: '4px',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.color = T.text;
            e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.color = T.textMuted;
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </span>
        {label}
      </div>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Bypass Admin Sidebar & Header completely for pure print route
  if (pathname === '/admin/envios/imprimir') {
    return <>{children}</>;
  }

  // Extract the active page name from pathname
  let pageName = 'Analíticas';
  const path = pathname || '';
  if (path.includes('/productos')) pageName = 'Productos';
  else if (path.includes('/ventas')) pageName = 'Ventas';
  else if (path.includes('/clientes')) pageName = 'Clientes';
  else if (path.includes('/envios')) pageName = 'Envíos';
  else if (path.includes('/configuracion')) pageName = 'Configuración';
  else if (path.includes('/mensajes')) pageName = 'Mensajes';
  else if (path.includes('/balance')) pageName = 'Balance';

  return (
    <div className="admin-layout-wrapper" style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: T.bg,
      color: T.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      {/* ─── PRINT CSS OVERRIDES FOR ENTIRE ADMIN DASHBOARD ─── */}
      <style>{`
        @media print {
          aside, header, nav, .no-print {
            display: none !important;
          }
          body, html, main, .admin-layout-wrapper, .admin-layout-wrapper > div {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            width: 100% !important;
            overflow: visible !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width: '260px',
        backgroundColor: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxShadow: '2px 0 10px rgba(0,0,0,0.02)',
        zIndex: 10
      }}>
        {/* Brand */}
        <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF', fontWeight: 'bold', fontSize: '1.2rem'
          }}>
            P
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: T.text }}>Peptidos Admin</span>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          <NavItem icon={<Icons.Analytics />} label="Analíticas" href="/admin" active={path === '/admin'} />
          <NavItem icon={<Icons.Products />} label="Ventas" href="/admin/ventas" active={path.includes('/ventas')} />
          <NavItem icon={<Icons.Storefront />} label="Productos" href="/admin/productos" active={path.includes('/productos')} />
          <NavItem icon={<Icons.Truck />} label="Envíos" href="/admin/envios" active={path.includes('/envios')} />
          <NavItem icon={<Icons.Customers />} label="Clientes" href="/admin/clientes" active={path.includes('/clientes')} />
          <NavItem icon={<Icons.Ticket />} label="Cupones" href="/admin/cupones" active={path.includes('/cupones')} />
          <NavItem icon={<Icons.Messages />} label="Mensajes" href="/admin/mensajes" active={path.includes('/mensajes')} />
          <NavItem icon={<Icons.Dollar />} label="Balance" href="/admin/balance" active={path.includes('/balance')} />
          
          <div style={{ margin: '16px 0', height: '1px', backgroundColor: T.border }} />
          
          <NavItem icon={<Icons.Settings />} label="Configuración" href="/admin/settings" />
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', color: T.textMuted, fontSize: '0.9rem', fontWeight: 500
            }}>
              <Icons.Storefront />
              Ver Tienda
            </div>
          </Link>
        </nav>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <header style={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          borderBottom: `1px solid ${T.border}`,
          backgroundColor: T.surface,
          zIndex: 5
        }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', color: T.text }}>
            Resumen de {pageName}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Date Range Mock */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px',
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: T.text
            }}>
              <span style={{ color: T.textMuted, display: 'flex' }}><Icons.Calendar /></span> 
              01.08.2026 - 31.08.2026
            </div>
            
            {/* Profile Mock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: T.primary, color: '#FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '0.9rem'
              }}>
                M
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: T.text }}>Usuario Admin</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
