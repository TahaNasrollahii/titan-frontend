'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';

export function Sidebar() {
  const pathname = usePathname();

  const [navIndStyle, setNavIndStyle] = useState({});
  const navRefs = useRef<Record<string, HTMLElement | null>>({});

  let activeKey = pathname;
  if (pathname.startsWith('/product/')) {
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
          <img src="/titan-logo.png" alt="تایتان" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
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
            <img src="/icons/home.png" alt="home" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/store"
            className={`nav-item ${activeKey === '/store' ? 'active' : ''}`}
            data-label="فروشگاه"
            ref={el => { navRefs.current['/store'] = el; }}
          >
            <img src="/icons/store.png" alt="store" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/tournament"
            className={`nav-item ${activeKey === '/tournament' ? 'active' : ''}`}
            data-label="تورنومنت"
            ref={el => { navRefs.current['/tournament'] = el; }}
          >
            <img src="/icons/tournament.png" alt="tournament" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>
          <Link
            href="/contact"
            className={`nav-item ${activeKey === '/contact' ? 'active' : ''}`}
            data-label="ارتباط با ما"
            ref={el => { navRefs.current['/contact'] = el; }}
          >
            <img src="/icons/contact-us.png" alt="contact-us" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/about"
            className={`nav-item ${activeKey === '/about' ? 'active' : ''}`}
            data-label="درباره ما"
            ref={el => { navRefs.current['/about'] = el; }}
          >
            <img src="/icons/about-us.png" alt="about-us" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

          <Link
            href="/dashboard"
            className={`nav-item ${activeKey === '/dashboard' ? 'active' : ''}`}
            data-label="داشبورد"
            ref={el => { navRefs.current['/dashboard'] = el; }}
          >
            <img src="/icons/dashboard.png" alt="dashboard" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </Link>

        </nav>
        <button className="add-btn scroll-top-btn" aria-label="برو به بالا" data-label="برو به بالا" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="plus"><Icon name="arrow-up" /></span>
        </button>
      </div>
    </aside>
  );
}
