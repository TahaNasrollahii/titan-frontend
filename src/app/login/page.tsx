'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { FormEvent, Suspense, useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';
import { toEnglishDigits } from '@/lib/format';

import styles from './login.module.css';

/** Only allow redirects back into this site. */
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const { status, completeLogin } = useAuth();

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (status === 'authenticated') router.replace(next);
  }, [status, next, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn(seconds => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const requestCode = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await authApi.requestOtp(toEnglishDigits(phone));
      setPhone(response.phone);
      setResendIn(response.resendIn);
      setStep('code');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError('');
    try {
      completeLogin(await authApi.verifyOtp(phone, toEnglishDigits(code)));
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void (step === 'phone' ? requestCode() : verify());
  };

  return (
    <div className={`${styles.wrapper} reveal`} style={{ '--d': 1 } as React.CSSProperties}>
      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <div className={styles.logo}>
          <Icon name={step === 'phone' ? 'user' : 'lock'} />
        </div>
        <h1>{step === 'phone' ? 'ورود / ثبت‌نام' : 'کد تایید'}</h1>
        <p className={styles.hint}>
          {step === 'phone'
            ? 'شماره موبایل خود را وارد کنید. اگر حساب ندارید، به‌صورت خودکار ساخته می‌شود.'
            : `کد ارسال‌شده به ${phone} را وارد کنید.`}
        </p>

        {step === 'phone' ? (
          <div className={styles.field}>
            <label htmlFor="phone">شماره موبایل</label>
            <input
              id="phone"
              className={styles.input}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="09123456789"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <div className={styles.field}>
            <label htmlFor="code">کد ۵ رقمی</label>
            <input
              id="code"
              className={styles.codeInput}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={5}
              value={code}
              onChange={event => setCode(event.target.value)}
              autoFocus
            />
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.primary}
          type="submit"
          disabled={busy || (step === 'phone' ? phone.trim().length < 10 : code.trim().length < 5)}
        >
          {busy ? 'لطفاً صبر کنید...' : step === 'phone' ? 'دریافت کد' : 'ورود'}
        </button>

        {step === 'code' && (
          <div className={styles.links}>
            <button type="button" className={styles.linkButton} onClick={() => setStep('phone')}>
              تغییر شماره
            </button>
            <button
              type="button"
              className={styles.linkButton}
              disabled={resendIn > 0 || busy}
              onClick={() => void requestCode()}
            >
              {resendIn > 0 ? `ارسال مجدد تا ${resendIn} ثانیه` : 'ارسال مجدد کد'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}
