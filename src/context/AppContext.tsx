'use client';

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { errorMessage } from '@/lib/api/client';
import { cartApi, notificationsApi } from '@/lib/api/endpoints';
import type { Cart } from '@/lib/api/types';

import { useAuth } from './AuthContext';

const GUEST_CART_KEY = 'titan.guestCart';
const UNREAD_POLL_MS = 60_000;

/** Colour of a toast by meaning; defaults to `info`. */
export type ToastTone = 'success' | 'error' | 'warning' | 'info';

/** A PNG from /public/icons (the same set as the sidebars and dashboard); defaults to `notif`. */
export type ToastIcon =
  | 'notif'
  | 'cart'
  | 'store'
  | 'team'
  | 'favorite'
  | 'tournament'
  | 'account'
  | 'accounts'
  | 'dashboard'
  | 'support';

export type Toast = {
  id: number;
  title: string;
  text?: string;
  icon?: ToastIcon;
  tone?: ToastTone;
};

/** One cart line as shown in the UI, whether it lives on the server (logged in) or in the browser (guest). */
export interface CartLine {
  key: string;
  itemId?: number;
  productSlug: string;
  variantId: number | null;
  title: string;
  variantLabel: string | null;
  image: string | null;
  unitPrice: number;
  unitOriginalPrice: number;
  quantity: number;
  lineTotal: number;
  requiresGameAccount: boolean;
}

export interface CartView {
  lines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  requiresGameAccount: boolean;
}

/** What the UI passes to ``addToCart``; the price fields are only used to display a guest cart. */
export interface AddToCartInput {
  product: {
    slug: string;
    title: string;
    image: string | null;
    price: number | null;
    originalPrice: number | null;
    requiresGameAccount?: boolean;
  };
  variant?: { id: number; label: string; price: number; originalPrice: number | null } | null;
  quantity?: number;
}

type GuestLine = Omit<CartLine, 'key' | 'itemId' | 'lineTotal'>;

const lineKey = (slug: string, variantId: number | null) => `${slug}:${variantId ?? '-'}`;

function viewFromServer(cart: Cart): CartView {
  return {
    lines: cart.items.map(item => ({
      key: lineKey(item.product.slug, item.variant?.id ?? null),
      itemId: item.id,
      productSlug: item.product.slug,
      variantId: item.variant?.id ?? null,
      title: item.product.title,
      variantLabel: item.variant?.label ?? null,
      image: item.product.image,
      unitPrice: item.unitPrice,
      unitOriginalPrice: item.unitOriginalPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      requiresGameAccount: item.product.requiresGameAccount,
    })),
    count: cart.count,
    subtotal: cart.subtotal,
    discount: cart.discount,
    total: cart.total,
    requiresGameAccount: cart.requiresGameAccount,
  };
}

function viewFromGuest(lines: GuestLine[]): CartView {
  const view = lines.map(line => ({
    ...line,
    key: lineKey(line.productSlug, line.variantId),
    lineTotal: line.unitPrice * line.quantity,
  }));
  const total = view.reduce((sum, line) => sum + line.lineTotal, 0);
  const subtotal = view.reduce((sum, line) => sum + line.unitOriginalPrice * line.quantity, 0);
  return {
    lines: view,
    count: view.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    discount: subtotal - total,
    total,
    requiresGameAccount: view.some(line => line.requiresGameAccount),
  };
}

function readGuestCart(): GuestLine[] {
  try {
    return JSON.parse(window.localStorage.getItem(GUEST_CART_KEY) ?? '[]') as GuestLine[];
  } catch {
    return [];
  }
}

function writeGuestCart(lines: GuestLine[]) {
  if (lines.length) window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  else window.localStorage.removeItem(GUEST_CART_KEY);
}

const EMPTY_CART: CartView = viewFromGuest([]);

type AppContextType = {
  cart: CartView;
  cartCount: number;
  cartPop: boolean;
  cartLoading: boolean;
  addToCart: (input: AddToCartInput) => Promise<boolean>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeFromCart: (key: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: number) => void;
  unreadNotifications: number;
  refreshUnread: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, status } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const [cart, setCart] = useState<CartView>(EMPTY_CART);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartPop, setCartPop] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadNotifications = isAuthenticated ? unreadCount : 0;

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++toastId.current;
    setToasts(current => [...current, { ...toast, id }].slice(-3));
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  const popCartBadge = useCallback(() => {
    setCartPop(false);
    window.setTimeout(() => setCartPop(true), 10);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(viewFromGuest(readGuestCart()));
      return;
    }
    try {
      setCart(viewFromServer(await cartApi.get()));
    } catch (error) {
      addToast({ title: 'سبد خرید', text: errorMessage(error), icon: 'cart', tone: 'error' });
    }
  }, [isAuthenticated, addToast]);

  // Load the right cart for the session; on login, move the guest cart to the server.
  useEffect(() => {
    if (status === 'loading') return;
    const sync = async () => {
      setCartLoading(true);
      const guest = readGuestCart();
      if (isAuthenticated && guest.length) {
        try {
          const lines = guest.map(line => ({
            product: line.productSlug,
            variant: line.variantId,
            quantity: line.quantity,
          }));
          const { cart: merged, skipped } = await cartApi.merge(lines);
          writeGuestCart([]);
          setCart(viewFromServer(merged));
          if (skipped.length) {
            addToast({ title: 'سبد خرید', text: 'برخی محصولات دیگر موجود نبودند و حذف شدند.', icon: 'cart', tone: 'warning' });
          }
        } catch {
          await refreshCart();
        }
      } else {
        await refreshCart();
      }
      setCartLoading(false);
    };
    void sync();
  }, [status, isAuthenticated, refreshCart, addToast]);

  const addToCart = useCallback(
    async ({ product, variant, quantity = 1 }: AddToCartInput) => {
      try {
        if (isAuthenticated) {
          setCart(viewFromServer(await cartApi.add({ product: product.slug, variant: variant?.id, quantity })));
        } else {
          const lines = readGuestCart();
          const variantId = variant?.id ?? null;
          const existing = lines.find(l => l.productSlug === product.slug && l.variantId === variantId);
          if (existing) existing.quantity = Math.min(existing.quantity + quantity, 20);
          else {
            const unitPrice = variant?.price ?? product.price ?? 0;
            lines.push({
              productSlug: product.slug,
              variantId,
              title: product.title,
              variantLabel: variant?.label ?? null,
              image: product.image,
              unitPrice,
              unitOriginalPrice: (variant ? variant.originalPrice : product.originalPrice) ?? unitPrice,
              quantity,
              requiresGameAccount: Boolean(product.requiresGameAccount),
            });
          }
          writeGuestCart(lines);
          setCart(viewFromGuest(lines));
        }
        popCartBadge();
        addToast({
          title: 'به سبد خرید اضافه شد',
          text: variant ? `${product.title} — ${variant.label}` : product.title,
          icon: 'cart',
          tone: 'success',
        });
        return true;
      } catch (error) {
        addToast({ title: 'افزودن به سبد ناموفق بود', text: errorMessage(error), icon: 'cart', tone: 'error' });
        return false;
      }
    },
    [isAuthenticated, addToast, popCartBadge],
  );

  const updateQuantity = useCallback(
    async (key: string, quantity: number) => {
      const line = cart.lines.find(l => l.key === key);
      if (!line) return;
      try {
        if (isAuthenticated && line.itemId) {
          setCart(viewFromServer(await cartApi.update(line.itemId, Math.max(0, quantity))));
        } else {
          const lines = readGuestCart()
            .map(l => (lineKey(l.productSlug, l.variantId) === key ? { ...l, quantity } : l))
            .filter(l => l.quantity > 0);
          writeGuestCart(lines);
          setCart(viewFromGuest(lines));
        }
      } catch (error) {
        addToast({ title: 'سبد خرید', text: errorMessage(error), icon: 'cart', tone: 'error' });
      }
    },
    [cart.lines, isAuthenticated, addToast],
  );

  const removeFromCart = useCallback((key: string) => updateQuantity(key, 0), [updateQuantity]);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setUnreadCount((await notificationsApi.unreadCount()).count);
    } catch {
      // Non-critical badge; keep the previous value.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const poll = () =>
      notificationsApi
        .unreadCount()
        .then(({ count }) => active && setUnreadCount(count))
        .catch(() => undefined);
    void poll();
    const timer = window.setInterval(poll, UNREAD_POLL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isAuthenticated]);

  // Legacy hook used by the home-page prototype script.
  useEffect(() => {
    (window as unknown as { titanToast?: typeof addToast }).titanToast = addToast;
  }, [addToast]);

  const value = useMemo<AppContextType>(
    () => ({
      cart,
      cartCount: cart.count,
      cartPop,
      cartLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart,
      toasts,
      addToast,
      removeToast,
      unreadNotifications,
      refreshUnread,
    }),
    [
      cart,
      cartPop,
      cartLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart,
      toasts,
      addToast,
      removeToast,
      unreadNotifications,
      refreshUnread,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
