'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';
import { useAppContext } from '@/context/AppContext';

export function Sidebar() {
  const pathname = usePathname();
  const { addToast } = useAppContext();
  
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
  } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/teams')) {
    activeKey = '/dashboard';
  } else if (pathname !== '/' && pathname !== '/store') {
    activeKey = '/';
  }

  useEffect(() => {
    const el = navRefs.current[activeKey];
    if (el) {
      setNavIndStyle({
        transform: `translate(${el.offsetLeft}px, ${el.offsetTop}px)`,
      });
    }
  }, [pathname, activeKey]);

  const handleAddSquad = () => {
    addToast({
      title: 'تیم جدید',
      text: 'دوستان خود را به لابی دعوت کنید',
      icon: 'users'
    });
  };

  return (
    <aside className="nav panel reveal" style={{ '--d': 0 } as React.CSSProperties} aria-label="منوی اصلی">
      <Link href="/" className="logo" aria-label="خانه تایتان">
        <svg viewBox="0 0 34 34" width="34" height="34" aria-hidden="true">
          <path d="M3 4h28v8H21v18h-8V12H3z" fill="#fff"/><path d="M3 4h11L3 15z" fill="#e2453f"/>
        </svg>
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
          <img src="/icons/home.png" alt="home" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </Link>
        
        <Link 
          href="/store" 
          className={`nav-item ${activeKey === '/store' ? 'active' : ''}`} 
          data-label="فروشگاه" 
          ref={el => { navRefs.current['/store'] = el; }}
        >
          <img src="/icons/store.png" alt="store" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </Link>
        
        <Link 
          href="/tournament" 
          className={`nav-item ${activeKey === '/tournament' ? 'active' : ''}`} 
          data-label="تورنومنت" 
          ref={el => { navRefs.current['/tournament'] = el; }}
        >
          <img src="/icons/tournament.png" alt="tournament" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </Link>
        <Link 
          href="/contact" 
          className={`nav-item ${activeKey === '/contact' ? 'active' : ''}`} 
          data-label="ارتباط با ما" 
          ref={el => { navRefs.current['/contact'] = el; }}
        >
          <img src="/icons/contact-us.png" alt="contact-us" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </Link>

        <Link 
          href="/dashboard" 
          className={`nav-item ${activeKey === '/dashboard' ? 'active' : ''}`} 
          data-label="داشبورد" 
          ref={el => { navRefs.current['/dashboard'] = el; }}
        >
          <img src="/icons/dashboard.png" alt="dashboard" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </Link>

      </nav>
      <button className="add-btn" aria-label="ساخت تیم" data-label="ساخت تیم" onClick={handleAddSquad}>
        <span className="plus"><Icon name="plus"/></span>
      </button>
    </aside>
  );
}
