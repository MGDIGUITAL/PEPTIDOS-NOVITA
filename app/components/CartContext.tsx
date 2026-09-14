'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string; // The cart item ID (product.id or product.id + size)
  productId: string;
  title: string;
  price: number;
  image_url: string | null;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: any, quantity?: number, size?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
  cartTotal: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('peptidos_cart');
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('peptidos_cart', JSON.stringify(cart));

      // Sincronizar en segundo plano si el usuario está autenticado
      const timer = setTimeout(async () => {
        try {
          const { supabase } = await import('@/lib/supabase/client');
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            await fetch('/api/cart/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                email: user.email,
                fullName: user.user_metadata?.full_name || '',
                items: cart,
                subtotal: cart.reduce((t, i) => t + (i.price * i.quantity), 0),
                status: cart.length === 0 ? 'cleared' : 'active'
              })
            });
          }
        } catch (syncErr) {
          console.error('Error sincronizando carrito:', syncErr);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [cart, isMounted]);


  const addToCart = (product: any, quantity = 1, size?: string) => {
    const cartItemId = size ? `${product.id}-${size}` : String(product.id);
    
    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: cartItemId,
        productId: String(product.id),
        title: product.title,
        price: product.sale_price || product.price || 0,
        image_url: product.image_url,
        quantity,
        size
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Return empty initially for SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <CartContext.Provider value={{ cart: [], isCartOpen: false, addToCart, removeFromCart, updateQuantity, openCart, closeCart, clearCart, cartCount: 0, cartTotal: 0 }}>
        {children}
      </CartContext.Provider>
    );
  }

  return (
    <CartContext.Provider value={{ cart, isCartOpen, addToCart, removeFromCart, updateQuantity, openCart, closeCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
