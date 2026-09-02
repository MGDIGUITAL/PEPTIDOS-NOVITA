'use client';
import { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// ─── Hook ───────────────────────────────────────────────────────────────
let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    globalAddToast = addToast;
    return () => { globalAddToast = null; };
  }, [addToast]);

  return { toasts, addToast, removeToast };
}

/** Fire a toast from anywhere (must have ToastContainer mounted) */
export function toast(t: Omit<Toast, 'id'>) {
  globalAddToast?.(t);
}

// ─── Container Component ────────────────────────────────────────────────
const ICON: Record<Toast['type'], string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

const BG: Record<Toast['type'], string> = {
  success: 'rgba(16,185,129,0.12)',
  error:   'rgba(239,68,68,0.12)',
  info:    'rgba(212,175,55,0.12)',
};

const BORDER: Record<Toast['type'], string> = {
  success: 'rgba(16,185,129,0.35)',
  error:   'rgba(239,68,68,0.35)',
  info:    'rgba(212,175,55,0.35)',
};

const COLOR: Record<Toast['type'], string> = {
  success: '#10B981',
  error:   '#EF4444',
  info:    '#D4AF37',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380,
    }}>
      {toasts.map(t => (
        <div key={t.id}
          style={{
            background: BG[t.type],
            border: `1px solid ${BORDER[t.type]}`,
            backdropFilter: 'blur(16px)',
            borderRadius: 12,
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'toastSlideIn 0.3s ease',
            cursor: 'pointer',
          }}
          onClick={() => removeToast(t.id)}
        >
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: COLOR[t.type],
            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{ICON[t.type]}</span>
          <span style={{ color: '#E5E5E5', fontSize: '0.85rem', lineHeight: 1.5 }}>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
