'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { KIND_LABELS, useSearchRows } from '@/lib/hooks/useSearch';

import { Avatar } from './Icons';
import { MobileSearch } from './MobileSearch';

/** Mobile app bar: hide after scrolling down this far, show again on any upward scroll. */
const HIDE_AFTER_PX = 120;

/** `scrolled` once the page leaves the top; `hidden` while scrolling down past HIDE_AFTER_PX. */
function useScrollState() {
  const [state, setState] = useState({ scrolled: false, hidden: false });

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      setState(current => {
        const hidden = y > HIDE_AFTER_PX && (delta > 4 ? true : delta < -4 ? false : current.hidden);
        const scrolled = y > 8;
        return hidden === current.hidden && scrolled === current.scrolled ? current : { scrolled, hidden };
      });
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}

const iconStyle: React.CSSProperties = { width: '24px', height: '24px', objectFit: 'contain' };

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, cartPop, unreadNotifications } = useAppContext();
  const { user, isAuthenticated } = useAuth();
  const { scrolled, hidden } = useScrollState();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  // Remember where mobile search was opened: navigating anywhere closes it.
  const [mobileSearchPath, setMobileSearchPath] = useState<string | null>(null);
  const mobileSearchOpen = mobileSearchPath === pathname;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { rows, searching } = useSearchRows(searchQuery, searchOpen);

  // '/' focuses the search box.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeMobileSearch = useCallback(() => setMobileSearchPath(null), []);

  const openResult = (href: string) => {
    setSearchQuery('');
    setSearchOpen(false);
    searchInputRef.current?.blur();
    router.push(href);
  };

  const query = searchQuery.trim();
  const barClass = ['topbar', 'reveal', scrolled && 'is-scrolled', hidden && 'is-hidden'].filter(Boolean).join(' ');

  return (
    <header className={barClass} style={{ '--d': 1 } as React.CSSProperties}>
      {/* Mobile app bar only */}
      <Link href="/" className="top-logo" aria-label="خانه تایتان">
        <img src="/titan-logo.png" alt="" />
        <span>TITAN</span>
      </Link>

      <div className={`search ${searchOpen ? 'open' : ''}`} id="search" role="search">
        <img
          src="/icons/search.png"
          alt=""
          style={{ width: '20px', height: '20px', objectFit: 'contain', marginLeft: '10px' }}
        />
        <input
          type="search"
          placeholder="جستجو"
          autoComplete="off"
          aria-label="جستجوی بازی‌ها، محصولات و تورنمنت‌ها"
          ref={searchInputRef}
          value={searchQuery}
          suppressHydrationWarning
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => window.setTimeout(() => setSearchOpen(false), 160)}
          onKeyDown={e => {
            if (e.key === 'Escape') searchInputRef.current?.blur();
            if (e.key === 'Enter' && rows[0]) openResult(rows[0].href);
          }}
        />
        <div className="results" id="results" onMouseDown={e => e.preventDefault()}>
          {!query && <h5>پیشنهادهای محبوب</h5>}
          {rows.map(row => (
            <button key={row.key} type="button" onClick={() => openResult(row.href)}>
              <span>{row.title}</span>
              <small>{KIND_LABELS[row.kind]}</small>
            </button>
          ))}
          {!searching && query && rows.length === 0 && <div className="empty">بدون نتیجه برای “{query}”</div>}
        </div>
      </div>

      <div className="top-actions">
        <button
          type="button"
          className="round search-trigger"
          aria-label="جستجو"
          onClick={() => setMobileSearchPath(pathname)}
        >
          <img src="/icons/search.png" alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
        </button>

        <Link
          href={isAuthenticated ? '/dashboard?tab=notifications' : '/login'}
          className="round"
          aria-label="اعلان‌ها"
          style={{ textDecoration: 'none' }}
        >
          <img src="/icons/notif.png" alt="" style={iconStyle} />
          <span className="dot" hidden={unreadNotifications === 0}></span>
        </Link>

        <Link href="/cart" className="round" aria-label="سبد خرید" id="cartBtn" style={{ textDecoration: 'none' }}>
          <img src="/icons/cart.png" alt="" style={iconStyle} />
          <span className={`badge ${cartPop ? 'pop' : ''}`} hidden={cartCount === 0}>
            {cartCount}
          </span>
        </Link>

        {/* Tablet only: the rail (account) is hidden there and phones use the tab bar */}
        <Link
          href={isAuthenticated ? '/dashboard' : '/login'}
          className="round top-account"
          aria-label={isAuthenticated ? 'حساب کاربری' : 'ورود یا ثبت‌نام'}
        >
          {isAuthenticated && user ? (
            <span className="top-account-av">
              {user.avatar ? <img src={user.avatar} alt="" /> : <Avatar seed={user.avatarSeed || 5} />}
            </span>
          ) : (
            <img src="/icons/login.png" alt="" style={iconStyle} />
          )}
        </Link>
      </div>

      <MobileSearch open={mobileSearchOpen} onClose={closeMobileSearch} />
    </header>
  );
}
