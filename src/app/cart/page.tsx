'use client';

import Link from 'next/link';
import React from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { faNumber, toman } from '@/lib/format';

import './cart.css';

export default function CartPage() {
  const { cart, cartLoading, updateQuantity, removeFromCart } = useAppContext();
  const { isAuthenticated } = useAuth();

  if (cartLoading && cart.lines.length === 0) return <Loading />;

  return (
    <div className="cart-page reveal" style={{ '--d': 1 } as React.CSSProperties}>
      <div className="cart-header">
        <h1>سبد خرید شما</h1>
        <p>{faNumber(cart.count)} محصول در سبد خرید</p>
      </div>

      {cart.lines.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <img src="/icons/cart.png" alt="" />
          </div>
          <h2>سبد خرید شما خالی است</h2>
          <p>برای مشاهده محصولات به فروشگاه سر بزنید</p>
          <Link href="/store" className="cart-btn primary">
            بازگشت به فروشگاه
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.lines.map((line, index) => (
              <div key={line.key} className="cart-item reveal" style={{ '--d': index + 2 } as React.CSSProperties}>
                <Link href={`/product/${line.productSlug}`} className="cart-item-img">
                  {line.image ? <img src={line.image} alt={line.title} /> : <Icon name="gift" />}
                </Link>
                <div className="cart-item-info">
                  <h3>{line.title}</h3>
                  {line.variantLabel && <span className="cart-item-variant">{line.variantLabel}</span>}
                  <span className="cart-item-price">{toman(line.unitPrice)}</span>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-qty">
                    <button onClick={() => updateQuantity(line.key, line.quantity + 1)} aria-label="افزایش">
                      <Icon name="plus" />
                    </button>
                    <span>{faNumber(line.quantity)}</span>
                    <button onClick={() => updateQuantity(line.key, line.quantity - 1)} aria-label="کاهش">
                      <Icon name="minus" />
                    </button>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(line.key)} aria-label="حذف">
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-sidebar reveal" style={{ '--d': cart.lines.length + 2 } as React.CSSProperties}>
            <div className="cart-summary">
              <h3>خلاصه سفارش</h3>
              <div className="summary-row">
                <span>جمع کل:</span>
                <span>{toman(cart.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>تخفیف:</span>
                <span className="discount">{toman(cart.discount)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>مبلغ قابل پرداخت:</span>
                <span className="total-val">
                  {faNumber(cart.total)} <small>تومان</small>
                </span>
              </div>
              <Link
                href={isAuthenticated ? '/checkout' : '/login?next=/checkout'}
                className="cart-btn primary block"
              >
                {isAuthenticated ? 'تکمیل سفارش' : 'ورود و تکمیل سفارش'}
              </Link>
              <Link href="/store" className="cart-btn secondary block mt-2">
                ادامه خرید
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
