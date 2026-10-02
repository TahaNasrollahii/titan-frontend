'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icons';
import { useAppContext } from '@/context/AppContext';
import './cart.css';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useAppContext();

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-page reveal" style={{ '--d': 1 } as React.CSSProperties}>
      <div className="cart-header">
        <h1>سبد خرید شما</h1>
        <p>{cartItems.length} محصول در سبد خرید</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <Icon name="cart" />
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
            {cartItems.map((item, index) => (
              <div key={item.id} className="cart-item reveal" style={{ '--d': index + 2 } as React.CSSProperties}>
                <div className="cart-item-img">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="cart-item-info">
                  <h3>{item.title}</h3>
                  <span className="cart-item-price">{item.price.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-qty">
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Icon name="plus" />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Icon name="minus" />
                    </button>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-sidebar reveal" style={{ '--d': cartItems.length + 2 } as React.CSSProperties}>
            <div className="cart-summary">
              <h3>خلاصه سفارش</h3>
              <div className="summary-row">
                <span>جمع کل:</span>
                <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="summary-row">
                <span>تخفیف:</span>
                <span className="discount">۰ تومان</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>مبلغ قابل پرداخت:</span>
                <span className="total-val">
                  {totalPrice.toLocaleString('fa-IR')} <small>تومان</small>
                </span>
              </div>
              <Link href="/checkout" className="cart-btn primary block">
                تکمیل سفارش
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
