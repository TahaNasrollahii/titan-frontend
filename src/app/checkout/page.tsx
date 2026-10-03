'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Icon } from '@/components/Icons';
import { RequireAuth } from '@/components/RequireAuth';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { errorMessage } from '@/lib/api/client';
import { gameAccountsApi, ordersApi, walletApi } from '@/lib/api/endpoints';
import type { PaymentMethod } from '@/lib/api/types';
import { faNumber, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import './checkout.css';

function Checkout() {
  const router = useRouter();
  const { cart, cartLoading, refreshCart, addToast } = useAppContext();
  const accounts = useApi(gameAccountsApi.list);
  const wallet = useApi(walletApi.get);

  const [chosenAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [addingRequested, setIsAddingNew] = useState(false);
  const [newAccount, setNewAccount] = useState({ title: '', username: '', password: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gateway');
  const [submitting, setSubmitting] = useState(false);

  // Preselect the first saved account; show the form straight away when there is none.
  const selectedAccountId = chosenAccountId ?? accounts.data?.[0]?.id ?? null;
  const isAddingNew = addingRequested || accounts.data?.length === 0;

  const balance = wallet.data?.balance ?? 0;
  const walletCovers = balance >= cart.total;

  const saveAccount = async () => {
    const { title, username, password } = newAccount;
    if (!title.trim() || !username.trim() || !password.trim()) {
      addToast({ title: 'خطا', text: 'لطفاً تمام فیلدهای اکانت را پر کنید', icon: 'info' });
      return;
    }
    try {
      const created = await gameAccountsApi.create({ title, username, password });
      accounts.setData(current => [...(current ?? []), created]);
      setSelectedAccountId(created.id);
      setIsAddingNew(false);
      setNewAccount({ title: '', username: '', password: '' });
      addToast({ title: 'موفق', text: 'اکانت با موفقیت ذخیره شد', icon: 'check' });
    } catch (error) {
      addToast({ title: 'خطا', text: errorMessage(error), icon: 'info' });
    }
  };

  const pay = async () => {
    if (cart.requiresGameAccount && !selectedAccountId) {
      addToast({ title: 'خطا', text: 'لطفاً یک اکانت بازی برای دریافت سفارش انتخاب کنید', icon: 'info' });
      return;
    }
    setSubmitting(true);
    try {
      const { order, paymentUrl } = await ordersApi.checkout(
        paymentMethod,
        cart.requiresGameAccount ? selectedAccountId : null,
      );
      if (paymentUrl) {
        addToast({ title: 'در حال انتقال...', text: 'در حال انتقال به درگاه پرداخت', icon: 'cart' });
        window.location.assign(paymentUrl);
        return;
      }
      await refreshCart();
      router.push(`/payment/result?status=${order.status}&purpose=order&reference=${order.number}`);
    } catch (error) {
      addToast({ title: 'پرداخت انجام نشد', text: errorMessage(error), icon: 'info' });
      setSubmitting(false);
    }
  };

  if (cartLoading) return <Loading />;

  if (cart.lines.length === 0) {
    return (
      <div className="checkout-page reveal" style={{ '--d': 1 } as React.CSSProperties}>
        <div className="checkout-empty">
          <Icon name="cart" />
          <h2>سبد خرید شما خالی است</h2>
          <Link href="/store" className="chk-btn primary">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page reveal" style={{ '--d': 1 } as React.CSSProperties}>
      <div className="checkout-header">
        <h1>تکمیل سفارش</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {cart.requiresGameAccount && (
            <div className="chk-section reveal" style={{ '--d': 2 } as React.CSSProperties}>
              <div className="chk-sec-header">
                <div className="chk-sec-icon">
                  <Icon name="user" />
                </div>
                <h2>اطلاعات اکانت بازی</h2>
              </div>
              <p className="chk-sec-desc">
                محصولات خریداری شده مستقیماً روی اکانت شما فعال می‌شوند. لطفاً اکانت مورد نظر را انتخاب کرده یا اکانت
                جدیدی اضافه کنید. رمز عبور به‌صورت رمزنگاری‌شده نگهداری می‌شود.
              </p>

              {accounts.loading ? (
                <Loading />
              ) : !isAddingNew ? (
                <div className="accounts-list">
                  {(accounts.data ?? []).map(account => (
                    <div
                      key={account.id}
                      className={`account-card ${selectedAccountId === account.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAccountId(account.id)}
                    >
                      <div className="acc-radio">
                        <div className="acc-radio-inner"></div>
                      </div>
                      <div className="acc-info">
                        <h4>{account.title}</h4>
                        <span>Username: {account.username}</span>
                      </div>
                    </div>
                  ))}
                  <button className="add-acc-btn" onClick={() => setIsAddingNew(true)}>
                    <Icon name="plus" /> افزودن اکانت جدید
                  </button>
                </div>
              ) : (
                <div className="new-account-form">
                  <div className="form-group">
                    <label>عنوان اکانت (مثلاً اکانت اصلی)</label>
                    <input
                      type="text"
                      value={newAccount.title}
                      onChange={e => setNewAccount({ ...newAccount, title: e.target.value })}
                      placeholder="اکانت استیم / اپیک گیمز..."
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>نام کاربری (Username / Email)</label>
                      <input
                        type="text"
                        value={newAccount.username}
                        onChange={e => setNewAccount({ ...newAccount, username: e.target.value })}
                        placeholder="username@email.com"
                        dir="ltr"
                      />
                    </div>
                    <div className="form-group">
                      <label>رمز عبور (Password)</label>
                      <input
                        type="password"
                        value={newAccount.password}
                        onChange={e => setNewAccount({ ...newAccount, password: e.target.value })}
                        placeholder="••••••••"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="chk-btn primary" onClick={saveAccount}>
                      ذخیره و انتخاب
                    </button>
                    {(accounts.data?.length ?? 0) > 0 && (
                      <button className="chk-btn secondary" onClick={() => setIsAddingNew(false)}>
                        انصراف
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="chk-section reveal" style={{ '--d': 3 } as React.CSSProperties}>
            <div className="chk-sec-header">
              <div className="chk-sec-icon">
                <Icon name="card" />
              </div>
              <h2>روش پرداخت</h2>
            </div>

            <div className="payment-methods">
              <div
                className={`pay-method ${paymentMethod === 'gateway' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('gateway')}
              >
                <div className="acc-radio">
                  <div className="acc-radio-inner"></div>
                </div>
                <div className="pay-info">
                  <h4>درگاه پرداخت اینترنتی زرین‌پال</h4>
                  <span>پرداخت با تمامی کارت‌های عضو شتاب</span>
                </div>
                <div className="pay-logo">
                  <span>ZarrinPal</span>
                </div>
              </div>
              <div
                className={`pay-method ${paymentMethod === 'wallet' ? 'selected' : ''} ${walletCovers ? '' : 'disabled'}`}
                onClick={() => walletCovers && setPaymentMethod('wallet')}
              >
                <div className="acc-radio">
                  <div className="acc-radio-inner"></div>
                </div>
                <div className="pay-info">
                  <h4>پرداخت از کیف پول</h4>
                  <span>
                    {walletCovers ? 'موجودی' : 'موجودی ناکافی'} (موجودی: {toman(balance)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-sidebar reveal" style={{ '--d': 4 } as React.CSSProperties}>
          <div className="chk-summary">
            <h3>فاکتور نهایی</h3>

            <div className="chk-items">
              {cart.lines.map(line => (
                <div key={line.key} className="chk-item">
                  {line.image && <img src={line.image} alt={line.title} className="chk-item-img" />}
                  <div className="chk-item-details">
                    <span className="chk-item-title">
                      {line.title}
                      {line.variantLabel && ` — ${line.variantLabel}`}
                    </span>
                    <span className="chk-item-qty">{faNumber(line.quantity)}x</span>
                  </div>
                  <span className="chk-item-price">{faNumber(line.lineTotal)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>مبلغ کل کالاها:</span>
              <span>{toman(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="summary-row">
                <span>تخفیف:</span>
                <span>{toman(cart.discount)}</span>
              </div>
            )}

            <div className="summary-row total">
              <span>قابل پرداخت:</span>
              <span className="total-val">
                {faNumber(cart.total)} <small>تومان</small>
              </span>
            </div>

            <button className="chk-btn submit-btn block" onClick={pay} disabled={submitting}>
              {submitting ? 'در حال پردازش...' : 'پرداخت و ثبت سفارش'}{' '}
              <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} />
            </button>
            <p className="secure-text">
              <Icon name="lock" /> پرداخت امن و رمزنگاری شده
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <Checkout />
    </RequireAuth>
  );
}
