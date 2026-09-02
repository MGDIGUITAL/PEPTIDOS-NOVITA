'use client';
import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('amora_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('amora_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('amora_cookie_consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 9999,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
      animation: 'slideUp 0.5s ease-out'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
        <div style={{ flex: '1 1 300px', fontSize: '0.85rem', lineHeight: 1.5, color: '#ccc' }}>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>🍪 Usamos cookies</strong>
          Utilizamos cookies propias y de terceros para analizar el tráfico, mejorar tu experiencia y ofrecerte recomendaciones personalizadas. 
          Al hacer clic en "Aceptar", consientes el uso de todas las cookies.
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={declineCookies}
            style={{
              background: 'transparent',
              color: '#ccc',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#ccc';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            Rechazar
          </button>
          
          <button 
            onClick={acceptCookies}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Aceptar Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
