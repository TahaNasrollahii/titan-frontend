'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

export type Toast = {
  id: number;
  title: string;
  text?: string;
  icon?: string;
};

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
};

type AppContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartPop: boolean;
  addToCart: (item: Partial<CartItem> | string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: number) => void;
  hasUnreadNotifications: boolean;
  clearNotifications: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartPop, setCartPop] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastIdCounter, setToastIdCounter] = useState(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToastIdCounter(prev => {
      const id = prev + 1;
      setToasts(current => {
        const newToasts = [...current, { ...toast, id }];
        if (newToasts.length > 3) return newToasts.slice(newToasts.length - 3);
        return newToasts;
      });
      return id;
    });
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  const addToCart = useCallback((itemData: Partial<CartItem> | string) => {
    setCartItems(current => {
      let title = typeof itemData === 'string' ? itemData : itemData.title || 'محصول ناشناس';
      let price = typeof itemData === 'string' ? 2500000 : itemData.price || 2500000;
      let id = typeof itemData === 'string' ? Math.random().toString(36).substring(7) : itemData.id || Math.random().toString(36).substring(7);
      let image = typeof itemData === 'string' ? '/images/games/valorant-character.png' : itemData.image || '/images/games/valorant-character.png';
      let qty = typeof itemData === 'string' ? 1 : itemData.quantity || 1;

      const existingIndex = current.findIndex(i => i.title === title || i.id === id);
      if (existingIndex > -1) {
        const newItems = [...current];
        newItems[existingIndex].quantity += qty;
        return newItems;
      } else {
        return [...current, { id, title, price, image, quantity: qty }];
      }
    });

    setCartPop(false);
    setTimeout(() => setCartPop(true), 10);
    addToast({
      title: 'به سبد خرید اضافه شد',
      text: typeof itemData === 'string' ? itemData : itemData.title || '',
      icon: 'cart'
    });
  }, [addToast]);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(current => current.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(current => 
      current.map(item => item.id === id ? { ...item, quantity } : item)
    );
  }, [removeFromCart]);

  const clearNotifications = useCallback(() => {
    setHasUnreadNotifications(false);
    addToast({
      title: "You're all caught up",
      text: 'اعلان جدیدی ندارید',
      icon: 'bell'
    });
  }, [addToast]);

  useEffect(() => {
    (window as any).titanToast = addToast;
    (window as any).titanAddToCart = addToCart;
  }, [addToast, addToCart]);

  return (
    <AppContext.Provider
      value={{
        cartItems,
        cartCount,
        cartPop,
        addToCart,
        removeFromCart,
        updateQuantity,
        toasts,
        addToast,
        removeToast,
        hasUnreadNotifications,
        clearNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
