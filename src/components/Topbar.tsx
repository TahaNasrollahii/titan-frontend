'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { contentApi } from '@/lib/api/endpoints';
import type { SearchResults } from '@/lib/api/types';

const SEARCH_DEBOUNCE_MS = 250;

interface ResultRow {
  key: string;
  title: string;
  kind: string;
  href: string;
}

function toRows(results: SearchResults): ResultRow[] {
  return [
    ...results.games.map(game => ({
      key: `g-${game.slug}`,
      title: game.title,
      kind: 'بازی',
      href: `/store?game=${game.slug}`,
    })),
    ...results.tournaments.map(tournament => ({
      key: `t-${tournament.slug}`,
      title: tournament.title,
      kind: 'تورنمنت',
      href: `/tournaments/${tournament.slug}`,
    })),
    ...results.products.map(product => ({
      key: `p-${product.slug}`,
      title: product.title,
      kind: 'محصول',
      href: `/product/${product.slug}`,
    })),
  ];
}

const iconStyle: React.CSSProperties = { width: '24px', height: '24px', objectFit: 'contain' };

export function Topbar() {
  const router = useRouter();
  const { cartCount, cartPop, unreadNotifications } = useAppContext();
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!searchOpen) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await contentApi.search(searchQuery.trim());
        if (!cancelled) setRows(toRows(results).slice(0, 8));
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, searchOpen]);

  const openResult = (href: string) => {
    setSearchQuery('');
    setSearchOpen(false);
    searchInputRef.current?.blur();
    router.push(href);
  };

  const query = searchQuery.trim();

  return (
    <header className="topbar reveal" style={{ '--d': 1 } as React.CSSProperties}>
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
              <small>{row.kind}</small>
            </button>
          ))}
          {!searching && query && rows.length === 0 && <div className="empty">بدون نتیجه برای “{query}”</div>}
        </div>
      </div>

      <div className="top-actions">
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
      </div>
    </header>
  );
}
