'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect } from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { walletApi } from '@/lib/api/endpoints';
import { toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import '../../checkout/checkout.css';

const SUCCESS_STATUSES = new Set(['paid', 'processing', 'completed', 'confirmed']);

function nextStep(purpose: string | null, reference: string | null) {
  if (purpose === 'tournament_registration' && reference) {
    return { href: `/tournaments/${reference}`, label: 'مشاهده تورنمنت' };
  }
  if (purpose === 'wallet_topup') return { href: '/dashboard', label: 'رفتن به پیشخوان' };
  return { href: '/dashboard?tab=orders', label: 'مشاهده سفارش‌ها' };
}

function PaymentResult() {
  const params = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { refreshCart, refreshUnread } = useAppContext();

  const paymentId = params.get('paymentId');
  const purpose = params.get('purpose');
  const reference = params.get('reference');
  const payment = useApi(isAuthenticated && paymentId ? () => walletApi.payment(paymentId) : null, [
    isAuthenticated,
    paymentId,
  ]);

  // A successful payment changes the cart and creates notifications.
  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshCart();
    void refreshUnread();
  }, [isAuthenticated, refreshCart, refreshUnread]);

  if (payment.loading) return <Loading label="در حال بررسی پرداخت..." />;

  const status = payment.data?.status ?? params.get('status');
  const success = status != null && SUCCESS_STATUSES.has(status);
  const step = nextStep(payment.data?.purpose ?? purpose, payment.data?.reference ?? reference);

  return (
    <div className="checkout-page reveal" style={{ '--d': 1 } as React.CSSProperties}>
      <div className="checkout-empty">
        <Icon name={success ? 'check' : 'x'} />
        <h2>{success ? 'پرداخت با موفقیت انجام شد' : 'پرداخت انجام نشد'}</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 2, textAlign: 'center' }}>
          {success
            ? 'سفارش شما ثبت شد و جزئیات آن در پنل کاربری در دسترس است.'
            : 'اگر مبلغی از حساب شما کسر شده باشد، حداکثر تا ۷۲ ساعت آینده توسط بانک بازگردانده می‌شود.'}
          {payment.data && (
            <>
              <br />
              مبلغ: {toman(payment.data.amount)}
              {payment.data.refId && <> · کد پیگیری: {payment.data.refId}</>}
            </>
          )}
          {!payment.data && reference && (
            <>
              <br />
              شماره مرجع: {reference}
            </>
          )}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href={step.href} className="chk-btn primary">
            {step.label}
          </Link>
          {!success && (
            <Link href="/cart" className="chk-btn secondary">
              بازگشت به سبد خرید
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentResult />
    </Suspense>
  );
}
