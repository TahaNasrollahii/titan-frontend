'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icon, Avatar } from './Icons';
import { useAppContext } from '@/context/AppContext';
import { games } from '@/data/games';
import { tournaments } from '@/data/tournaments';

const CATALOG = [
  ...games.map(g => ({ t: g.title, k: g.genre || 'Game' })),
  ...tournaments.map(s => ({ t: s.title + ' Cup', k: 'Tournament' })),
  { t: 'FIFA 23', k: 'Game' }
];

export function Topbar() {
  const { cartCount, cartPop, hasUnreadNotifications, clearNotifications, addToast } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Handle keyboard shortcut for search ('/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchFocus = () => setSearchOpen(true);
  const handleSearchBlur = () => setTimeout(() => setSearchOpen(false), 160);

  const renderResults = () => {
    const query = searchQuery.trim().toLowerCase();
    const list = (query ? CATALOG.filter(x => x.t.toLowerCase().includes(query)) : CATALOG).slice(0, 5);

    if (!query) {
      return (
        <>
          <h5>جستجوهای پرطرفدار</h5>
          {list.map((x, i) => (
            <button key={i} type="button" onClick={() => handleResultClick(x.t)}>
              <span>{x.t}</span><small>{x.k}</small>
            </button>
          ))}
        </>
      );
    }

    if (list.length === 0) {
      return <div className="empty">بدون نتیجه برای “{query}”</div>;
    }

    return list.map((x, i) => (
      <button key={i} type="button" onClick={() => handleResultClick(x.t)}>
        <span>{x.t}</span><small>{x.k}</small>
      </button>
    ));
  };

  const handleResultClick = (name: string) => {
    addToast({ title: name, text: 'در حال باز کردن صفحه...', icon: 'search' });
    setSearchQuery('');
    searchInputRef.current?.blur();
    setSearchOpen(false);
  };

  return (
    <header className="topbar reveal" style={{ '--d': 1 } as React.CSSProperties}>
      <div className={`search ${searchOpen ? 'open' : ''}`} id="search" role="search">
        <img src="/icons/search.png" alt="search" style={{ width: '20px', height: '20px', objectFit: 'contain', marginLeft: '10px' }} />
        <input 
          type="search" 
          placeholder="جستجو" 
          autoComplete="off" 
          aria-label="جستجوی بازی‌ها، تجهیزات و تورنمنت‌ها"
          ref={searchInputRef}
          value={searchQuery}
          suppressHydrationWarning
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onKeyDown={e => {
            if (e.key === 'Escape') searchInputRef.current?.blur();
          }}
        />
        <kbd aria-hidden="true">/</kbd>
        <div className="results" id="results" onMouseDown={e => e.preventDefault()}>
          {renderResults()}
        </div>
      </div>
      
      <div className="top-actions">
        <button className="round" aria-label="اعلان‌ها" onClick={clearNotifications}>
          <img src="/icons/notif.png" alt="notifications" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span className="dot" hidden={!hasUnreadNotifications}></span>
        </button>
        
        <Link href="/cart" className="round" aria-label="سبد خرید" id="cartBtn" style={{ textDecoration: 'none' }}>
          <img src="/icons/cart.png" alt="cart" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span className={`badge ${cartPop ? 'pop' : ''}`} hidden={cartCount === 0}>{cartCount}</span>
        </Link>
      </div>
    </header>
  );
}
