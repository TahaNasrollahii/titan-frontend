'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Icon } from '@/components/Icons';
import { SITE_NAME, SOCIAL_DISCORD, SOCIAL_TELEGRAM } from '@/lib/siteConfig';

import styles from './Footer.module.css';

const ENAMAD_ID = process.env.NEXT_PUBLIC_ENAMAD_ID || '';
const ENAMAD_CODE = process.env.NEXT_PUBLIC_ENAMAD_CODE || '';

interface FooterLink {
  href: string;
  label: string;
}

interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

// Only routes that resolve on the live site: a broken sitewide link is
// repeated on every page and hurts crawl quality everywhere.
const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: 'footer-col-shop',
    title: 'خرید سریع',
    links: [
      { href: '/product/fortnite-vbucks', label: 'ویباکس فورتنایت' },
      { href: '/store/valorant', label: 'ولورانت پوینت' },
      { href: '/product/pubg-uc', label: 'یوسی پابجی' },
      { href: '/product/steam-wallet', label: 'شارژ استیم' },
    ],
  },
  {
    id: 'footer-col-play',
    title: 'فورتنایت و رقابت',
    links: [
      { href: '/fortnite-shop', label: 'آیتم شاپ امروز' },
      { href: '/product/fortnite-crew', label: 'کروپک فورتنایت' },
      { href: '/tournaments', label: 'تورنومنت‌ها' },
      { href: '/tournament', label: 'لیدربرد' },
    ],
  },
  {
    id: 'footer-col-titan',
    title: 'تایتان',
    links: [
      { href: '/store', label: 'فروشگاه' },
      { href: '/about', label: 'درباره ما' },
      { href: '/contact', label: 'تماس با ما' },
      { href: '/guides', label: 'آموزش‌ها و راهنمای خرید' },
      { href: '/faq', label: 'سوالات متداول' },
    ],
  },
];

const LEGAL_LINKS: FooterLink[] = [
  { href: '/terms', label: 'قوانین و شرایط تحویل' },
  { href: '/privacy', label: 'حریم خصوصی' },
];

const TRUST_POINTS = [
  { icon: 'clock', title: 'تحویل فوری', desc: 'شارژ سریع پس از پرداخت' },
  { icon: 'shield', title: 'خرید قانونی و امن', desc: 'دارای نماد اعتماد الکترونیکی' },
  { icon: 'chat', title: 'پشتیبانی ۲۴ ساعته', desc: 'همراه شما در تمام مراحل خرید' },
  { icon: 'trophy', title: 'تورنومنت هفتگی', desc: 'رقابت با جوایز نقدی' },
];

function TelegramSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.5 4.3 18.4 19c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.6 13 2 11.6c-1-.3-1-1 .2-1.5L20.2 3.2c.8-.3 1.6.2 1.3 1.1z" />
    </svg>
  );
}

function DiscordSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.3 5.3A16.6 16.6 0 0 0 15.2 4l-.5 1a15.4 15.4 0 0 0-5.4 0l-.5-1a16.6 16.6 0 0 0-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a16.7 16.7 0 0 0 5 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.8l.4-.3a11.9 11.9 0 0 0 11 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a16.6 16.6 0 0 0 5-2.6c.4-4.3-.7-8-2.9-11.4zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
    </svg>
  );
}

function EnamadSeal() {
  const ringAndCheck = (
    <>
      <span className={styles.sealRing} aria-hidden="true" />
      <span className={styles.sealCheck} aria-hidden="true">
        <Icon name="check" />
      </span>
    </>
  );

  if (ENAMAD_ID && ENAMAD_CODE) {
    const query = `id=${encodeURIComponent(ENAMAD_ID)}&Code=${encodeURIComponent(ENAMAD_CODE)}`;
    return (
      <a
        className={styles.seal}
        referrerPolicy="origin"
        target="_blank"
        rel="noopener"
        href={`https://trustseal.enamad.ir/?${query}`}
        aria-label="نماد اعتماد الکترونیکی تایتان"
      >
        {ringAndCheck}
        <span className={styles.sealFace}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            referrerPolicy="origin"
            src={`https://trustseal.enamad.ir/logo.aspx?${query}`}
            alt="نماد اعتماد الکترونیکی تایتان"
            width={72}
            height={72}
            loading="lazy"
          />
        </span>
      </a>
    );
  }

  return (
    <div className={styles.seal} role="img" aria-label="نماد اعتماد الکترونیکی">
      {ringAndCheck}
      <span className={styles.sealFace}>
        <span className={styles.sealPlaceholder}>
          <Icon name="shield" />
          <b>اینماد</b>
        </span>
      </span>
    </div>
  );
}

let activeScrollCleanup: (() => void) | null = null;

function scrollToTop(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();

  activeScrollCleanup?.();

  const startY = window.scrollY || document.documentElement.scrollTop;
  if (startY <= 0) return;

  const duration = Math.min(900, Math.max(550, Math.sqrt(startY) * 16));
  const startTime = performance.now();
  let rafId = 0;

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('keydown', stop);
    if (activeScrollCleanup === stop) {
      activeScrollCleanup = null;
    }
  };

  activeScrollCleanup = stop;
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop, { passive: true });

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, Math.round(startY * (1 - eased)));

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      stop();
    }
  };

  rafId = requestAnimationFrame(step);
}

export function Footer() {
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date());

  return (
    <footer className={`${styles.footer} reveal`} style={{ '--d': 7 } as React.CSSProperties}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.wordmark} aria-hidden="true">
        TITAN
      </div>

      <div className={styles.inner}>
        <ul className={styles.trust} aria-label="مزایای خرید از تایتان">
          {TRUST_POINTS.map(point => (
            <li key={point.title} className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">
                <Icon name={point.icon} />
              </span>
              <span className={styles.trustText}>
                <strong>{point.title}</strong>
                <span>{point.desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.main}>
          <section className={styles.brand} aria-labelledby="footer-brand-title">
            <Link href="/" className={styles.brandHead}>
              <Image
                src="/titan-logo.webp"
                alt=""
                width={48}
                height={48}
                className={styles.brandLogo}
              />
              <span className={styles.brandText}>
                <span id="footer-brand-title" className={styles.brandName}>
                  {SITE_NAME}
                </span>
                <span className={styles.brandTag}>پلتفرم گیمینگ و فروشگاه آیتم بازی</span>
              </span>
            </Link>

            <p className={styles.brandDesc}>
              خرید قانونی و سریع پول بازی‌ها، گیفت کارت و اکانت‌های پریمیوم، همراه با تورنومنت‌های
              آنلاین هفتگی.
            </p>

            <div className={styles.brandActions}>
              <Link href="/contact" className={styles.contactBtn}>
                <Icon name="chat" />
                ارتباط با پشتیبانی
              </Link>
              {SOCIAL_TELEGRAM && (
                <a
                  href={SOCIAL_TELEGRAM}
                  className={styles.social}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label="تایتان در تلگرام"
                >
                  <TelegramSvg />
                </a>
              )}
              {SOCIAL_DISCORD && (
                <a
                  href={SOCIAL_DISCORD}
                  className={styles.social}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label="تایتان در دیسکورد"
                >
                  <DiscordSvg />
                </a>
              )}
              <EnamadSeal />
            </div>
          </section>

          {FOOTER_COLUMNS.map(column => (
            <nav key={column.id} className={styles.col} aria-labelledby={column.id}>
              <h2 id={column.id} className={styles.colTitle}>
                {column.title}
              </h2>
              <ul className={styles.links}>
                {column.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} {SITE_NAME} — پلتفرم گیمینگ، فروشگاه آیتم بازی و تورنومنت‌های آنلاین. تمامی حقوق
            محفوظ است.
          </p>

          <div className={styles.bottomEnd}>
            <nav aria-label="قوانین و حریم خصوصی">
              <ul className={styles.legal}>
                {LEGAL_LINKS.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.legalLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <a href="#frame" className={styles.toTop} onClick={scrollToTop}>
              <Icon name="arrow-up" />
              بازگشت به بالا
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
