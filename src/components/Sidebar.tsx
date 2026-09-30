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
  } else if (pathname.startsWith('/tournament')) {
    activeKey = '/tournament';
  } else if (pathname.startsWith('/contact')) {
    activeKey = '/contact';
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
          <Icon name="home"/>
        </Link>
        
        <Link 
          href="/store" 
          className={`nav-item ${activeKey === '/store' ? 'active' : ''}`} 
          data-label="فروشگاه" 
          ref={el => { navRefs.current['/store'] = el; }}
        >
          <Icon name="bag"/>
        </Link>
        
        <Link 
          href="/tournament" 
          className={`nav-item ${activeKey === '/tournament' ? 'active' : ''}`} 
          data-label="تورنومنت" 
          ref={el => { navRefs.current['/tournament'] = el; }}
        >
          <Icon name="trophy"/>
        </Link>
        <Link 
          href="/contact" 
          className={`nav-item ${activeKey === '/contact' ? 'active' : ''}`} 
          data-label="ارتباط با ما" 
          ref={el => { navRefs.current['/contact'] = el; }}
        >
          <Icon name="phone"/>
        </Link>
        <a className="nav-item" href="#" data-label="گیفت کارت" onClick={e => e.preventDefault()}>
          <Icon name="gift"/>
        </a>
        <a className="nav-item" href="#" data-label="آمار" onClick={e => e.preventDefault()}>
          <Icon name="chart"/>
        </a>
        <a className="nav-item" href="#" data-label="تنظیمات" onClick={e => e.preventDefault()}>
          <Icon name="sliders"/>
        </a>
      </nav>
      <button className="add-btn" aria-label="ساخت تیم" data-label="ساخت تیم" onClick={handleAddSquad}>
        <span className="plus"><Icon name="plus"/></span>
      </button>
    </aside>
  );
}
