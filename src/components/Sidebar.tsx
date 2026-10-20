'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toggleSupportChat } from './support/SupportWidget';

export function Sidebar() {
  const pathname = usePathname();

  const [navIndStyle, setNavIndStyle] = useState({});
  const [unread, setUnread] = useState(0);
  const navRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const onUnread = (e: Event) => {
      setUnread((e as CustomEvent<number>).detail ?? 0);
    };
    window.addEventListener('titan:support-unread', onUnread);
    return () => window.removeEventListener('titan:support-unread', onUnread);
  }, []);

  let activeKey = pathname;
  if (pathname.startsWith('/fortnite-shop')) {
    activeKey = '/fortnite-shop';
  } else if (pathname.startsWith('/product/') || pathname.startsWith('/store')) {
    activeKey = '/store';
  } else if (pathname.startsWith('/tournaments') && pathname.includes('/bracket')) {
    activeKey = '/dashboard';
  } else if (pathname.startsWith('/tournament') || pathname.startsWith('/tournaments')) {
    activeKey = '/tournament';
  } else if (pathname.startsWith('/contact')) {
    activeKey = '/contact';
  } else if (pathname.startsWith('/about')) {
    activeKey = '/about';
  } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/teams')) {
    activeKey = '/dashboard';
  } else if (pathname !== '/' && pathname !== '/store') {
    activeKey = '/';
  }

  useEffect(() => {
    const updatePosition = () => {
      const el = navRefs.current[activeKey];
      const indicator = el?.parentElement?.querySelector<HTMLElement>('.nav-ind');
      if (el && indicator) {
        // Layout offsets (relative to #navList) ignore transforms, so neither the panel's
        // entrance animation nor the hovered item's scale/shift can throw the indicator off.
        setNavIndStyle({
          left: `${el.offsetLeft + (el.offsetWidth - indicator.offsetWidth) / 2}px`,
          top: `${el.offsetTop + (el.offsetHeight - indicator.offsetHeight) / 2}px`,
          transform: 'none',
          transition: 'all 0.55s cubic-bezier(0.3, 1.35, 0.4, 1)'
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [pathname, activeKey]);

  return (
    <aside className="nav panel reveal" style={{ '--d': 0 } as React.CSSProperties} aria-label="منوی اصلی">
      <div className="sticky-nav-inner">
        <Link href="/" className="logo" aria-label="خانه تایتان">
          <img src="/titan-logo.webp" alt="لوگوی فروشگاه تایتان" width="48" height="48" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        </Link>
        <nav className="nav-list" id="navList">
          <span className="nav-ind" style={navIndStyle}>
            <span className="nav-ind-glow-wrap">
              <span className="nav-ind-glow"></span>
            </span>
            <span className="nav-ind-glass"></span>
          </span>

          <Link
            href="/"
            className={`nav-item ${activeKey === '/' ? 'active' : ''}`}
            data-label="خانه"
            ref={el => { navRefs.current['/'] = el; }}
          >
            <img src="/icons/home.webp" alt="خانه" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/store"
            className={`nav-item ${activeKey === '/store' ? 'active' : ''}`}
            data-label="فروشگاه"
            ref={el => { navRefs.current['/store'] = el; }}
          >
            <img src="/icons/store.webp" alt="فروشگاه" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/fortnite-shop"
            className={`nav-item ${activeKey === '/fortnite-shop' ? 'active' : ''}`}
            data-label="آیتم شاپ فورتنایت"
            ref={el => { navRefs.current['/fortnite-shop'] = el; }}
          >
            <img src="/images/categories/fortnite.webp" alt="آیتم شاپ فورتنایت" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/tournament"
            className={`nav-item ${activeKey === '/tournament' ? 'active' : ''}`}
            data-label="تورنومنت"
            ref={el => { navRefs.current['/tournament'] = el; }}
          >
            <img src="/icons/tournament.webp" alt="تورنومنت" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>
          <Link
            href="/contact"
            className={`nav-item ${activeKey === '/contact' ? 'active' : ''}`}
            data-label="ارتباط با ما"
            ref={el => { navRefs.current['/contact'] = el; }}
          >
            <img src="/icons/contact-us.webp" alt="ارتباط با ما" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/about"
            className={`nav-item ${activeKey === '/about' ? 'active' : ''}`}
            data-label="درباره ما"
            ref={el => { navRefs.current['/about'] = el; }}
          >
            <img src="/icons/about-us.webp" alt="درباره ما" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/dashboard"
            className={`nav-item ${activeKey === '/dashboard' ? 'active' : ''}`}
            data-label="داشبورد"
            ref={el => { navRefs.current['/dashboard'] = el; }}
          >
            <img src="/icons/dashboard.webp" alt="داشبورد" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

        </nav>
        <button
          type="button"
          className="support-nav-btn"
          aria-label="پشتیبانی آنلاین"
          data-label="پشتیبانی"
          onClick={() => toggleSupportChat()}
        >
          <span className="support-nav-ring" />
          <img src="/icons/support.svg" alt="پشتیبانی" />
          {unread > 0 && <span className="support-nav-badge">{unread > 9 ? '9+' : unread}</span>}
        </button>
      </div>
    </aside>
  );
}
