'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { FormEvent, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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

/** Floating logo data */
const floatingLogos = [
  {
    src: '/images/glossy-apex-logo.png',
    alt: 'Apex Legends',
    className: 'logoApex',
    delay: 0,
  },
  {
    src: '/images/glossy-valorant-logo.png',
    alt: 'Valorant',
    className: 'logoValorant',
    delay: 0.15,
  },
  {
    src: '/images/glossy-fortnite-logo.png',
    alt: 'Fortnite',
    className: 'logoFortnite',
    delay: 0.3,
  },
];

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

  const variants = {
    hidden: { opacity: 0, x: -20, filter: 'blur(10px)' },
    visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: 20, filter: 'blur(10px)' },
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.ambientGlow} />

      {/* Scene: character + card layered */}
      <div className={styles.scene}>
        {/* Floating game logos — behind & around the form */}
        <div className={styles.floatingLogos}>
          {floatingLogos.map((logo) => (
            <motion.div
              key={logo.alt}
              className={`${styles.floatingLogo} ${styles[logo.className]}`}
              initial={{ opacity: 0, scale: 0, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.6 + logo.delay,
                duration: 0.8,
                type: 'spring',
                stiffness: 120,
                damping: 14,
              }}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={100}
                height={100}
                priority
                draggable={false}
              />
            </motion.div>
          ))}
        </div>
        {/* Character peeking from behind the card */}
        <div>
          <Image
            className={styles.characterBehind}
            src="/images/character-behind-login-v2.png"
            alt="Gaming character"
            width={340}
            height={400}
            priority
            draggable={false}
            style={{ height: 'auto' }}
          />
        </div>

        {/* Login card (on top of character) */}
        <motion.form 
          className={styles.card} 
          onSubmit={onSubmit} 
          noValidate
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.logo}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                {step === 'phone' ? (
                  <Image src="/titan-logo.png" alt="Titan Logo" width={42} height={42} priority style={{ objectFit: 'contain', display: 'block' }} />
                ) : (
                  <Icon name="lock" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className={styles.stepContent}
            >
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
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.p 
                className={styles.error}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            className={styles.primary}
            type="submit"
            disabled={busy || (step === 'phone' ? phone.trim().length < 10 : code.trim().length < 5)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {busy ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className={styles.spinner}
              >
                <Icon name="loader" />
              </motion.div>
            ) : step === 'phone' ? 'دریافت کد' : 'ورود'}
          </motion.button>

          <AnimatePresence>
            {step === 'code' && (
              <motion.div 
                className={styles.links}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
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
