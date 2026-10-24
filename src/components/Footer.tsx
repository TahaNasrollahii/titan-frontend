import React from 'react';
import Link from 'next/link';

const ENAMAD_ID = process.env.NEXT_PUBLIC_ENAMAD_ID || '';
const ENAMAD_CODE = process.env.NEXT_PUBLIC_ENAMAD_CODE || '';

const FOOTER_CATEGORY_LINKS = [
  { href: '/store', label: 'فروشگاه تایتان' },
  { href: '/store/fortnite', label: 'فورتنایت و ویباکس' },
  { href: '/fortnite-shop', label: 'آیتم شاپ فورتنایت' },
  { href: '/store/valorant', label: 'ولورانت پوینت (VP)' },
  { href: '/store/apex-legends', label: 'اپکس کوین' },
  { href: '/store/premium', label: 'اکانت پریمیوم و گیفت کارت' },
  { href: '/tournaments', label: 'لیست تورنومنت‌ها' },
  { href: '/tournament', label: 'لیدربرد و رتبه‌بندی' },
];

const FOOTER_TRUST_LINKS = [
  { href: '/faq', label: 'سوالات متداول' },
  { href: '/terms', label: 'قوانین و شرایط تحویل' },
  { href: '/privacy', label: 'حریم خصوصی' },
];

function CheckSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5.5 12.5 4 4 9-9.5" />
    </svg>
  );
}

function ShieldSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function InfoSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.6v.1" />
    </svg>
  );
}

function ChatSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5.5h16v11H10l-4.5 4v-4H4z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  );
}

function ArrowSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h15.5M13.5 6l6 6-6 6" />
    </svg>
  );
}

function EnamadSeal() {
  const innerRingAndCheck = (
    <>
      <span className="footer-seal-ring" aria-hidden="true" />
      <span className="footer-seal-check" aria-hidden="true">
        <i data-icon="check">
          <CheckSvg />
        </i>
      </span>
    </>
  );

  if (ENAMAD_ID && ENAMAD_CODE) {
    const query = `id=${encodeURIComponent(ENAMAD_ID)}&Code=${encodeURIComponent(ENAMAD_CODE)}`;
    return (
      <a
        className="footer-seal"
        referrerPolicy="origin"
        target="_blank"
        rel="noopener"
        href={`https://trustseal.enamad.ir/?${query}`}
        aria-label="نماد اعتماد الکترونیکی تایتان"
      >
        {innerRingAndCheck}
        <span className="footer-seal-face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            referrerPolicy="origin"
            src={`https://trustseal.enamad.ir/logo.aspx?${query}`}
            alt="نماد اعتماد الکترونیکی تایتان"
            width={88}
            height={88}
            loading="lazy"
          />
        </span>
      </a>
    );
  }

  return (
    <div className="footer-seal" role="img" aria-label="نماد اعتماد الکترونیکی">
      {innerRingAndCheck}
      <span className="footer-seal-face">
        <span className="footer-seal-ph">
          <i data-icon="shield">
            <ShieldSvg />
          </i>
          <b>اینماد</b>
        </span>
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="site-footer reveal" style={{ '--d': 7 } as React.CSSProperties} aria-label="فوتر سایت تایتان">
      <div className="footer-aurora" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="footer-grid" aria-hidden="true" />

      <div className="footer-main">
        <div className="footer-badge">
          <EnamadSeal />
          <div className="footer-copy">
            <span className="footer-kicker">
              <i data-icon="check">
                <CheckSvg />
              </i>
              فروشگاه تاییدشده
            </span>
            <h3>خرید مطمئن با نماد اعتماد</h3>
            <p>
              تایتان دارای نماد اعتماد الکترونیکی است؛ خرید قانونی پول درون‌برنامه‌ای بازی‌ها، آیتم‌ها و ثبت‌نام تورنومنت‌های آنلاین با تحویل فوری و پشتیبانی ۲۴ ساعته.
            </p>
          </div>
        </div>

        <nav className="footer-cards" aria-label="درباره ما و ارتباط با پشتیبانی">
          <Link className="footer-card spot" href="/about">
            <span className="footer-card-ic">
              <i data-icon="info">
                <InfoSvg />
              </i>
            </span>
            <span className="footer-card-tx">
              <b>درباره ما</b>
              <small>
                <span>با تیم تایتان آشنا شوید</span>
              </small>
            </span>
            <span className="footer-card-go">
              <i data-icon="arrow">
                <ArrowSvg />
              </i>
            </span>
          </Link>

          <Link className="footer-card footer-card--hot spot" href="/contact">
            <span className="footer-card-ic">
              <i data-icon="chat">
                <ChatSvg />
              </i>
            </span>
            <span className="footer-card-tx">
              <b>ارتباط با ما</b>
              <small>
                <span className="footer-live" />
                <span>پاسخ‌گویی سریع</span>
              </small>
            </span>
            <span className="footer-card-go">
              <i data-icon="arrow">
                <ArrowSvg />
              </i>
            </span>
          </Link>
        </nav>
      </div>

      <div className="footer-seo-bar">
        <nav className="footer-nav-links" aria-label="دسترسی سریع به بخش‌های تایتان">
          {FOOTER_CATEGORY_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="footer-nav-chip">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="footer-meta-row">
          <nav className="footer-legal-links" aria-label="قوانین و راهنمای کاربران">
            {FOOTER_TRUST_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="footer-legal-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="footer-copyright">
            © تایتان — پلتفرم گیمینگ، فروشگاه آیتم بازی و تورنومنت‌های آنلاین
          </span>
        </div>
      </div>
    </footer>
  );
}

