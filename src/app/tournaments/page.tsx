'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';
import { TournamentCard } from '@/components/TournamentCard';
import { ErrorState, Loading } from '@/components/ui/State';
import { errorMessage } from '@/lib/api/client';
import { catalogApi, tournamentsApi } from '@/lib/api/endpoints';
import type { TournamentStatus, TournamentSummary } from '@/lib/api/types';
import { useApi } from '@/lib/hooks/useApi';
import { useSpotlight } from '@/lib/hooks/useSpotlight';

import '../tournament/tournament.css';
import './list.css';

const PAGE_SIZE = 12;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'registration_open', label: 'ثبت‌نام باز' },
  { value: 'live', label: 'در جریان' },
  { value: 'upcoming', label: 'به‌زودی' },
  { value: 'completed', label: 'پایان یافته' },
  { value: 'full', label: 'تکمیل ظرفیت' },
];

const SORT_OPTIONS = [
  { value: 'starts_at', label: 'نزدیک‌ترین زمان' },
  { value: '-prize_pool', label: 'بیشترین جایزه' },
  { value: '-starts_at', label: 'جدیدترین' },
];

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label ?? value;

  return (
    <div className={`custom-dropdown ${open ? 'open' : ''}`} onMouseLeave={() => setOpen(false)}>
      <div className="cd-trigger" onClick={() => setOpen(!open)}>
        <span>{selectedLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>
      <div className="cd-menu">
        {options.map(option => (
          <div
            key={option.value}
            className={`cd-item ${value === option.value ? 'active' : ''}`}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TournamentFilters {
  game: string;
  status: string;
  ordering: string;
  search: string;
}

/** Paginated tournament cards. Keyed by its filters, so changing them starts again from page 1. */
function TournamentResults({ filters }: { filters: TournamentFilters }) {
  const [items, setItems] = useState<TournamentSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    (pageNumber: number, isActive: () => boolean = () => true) => {
      // "Full" is a flag, not a status: it means open registration with no seats left.
      const status = (filters.status === 'full' ? 'registration_open' : filters.status) as TournamentStatus | '';
      return tournamentsApi
        .list({
          game: filters.game || undefined,
          status: status || undefined,
          search: filters.search || undefined,
          ordering: filters.ordering,
          page: pageNumber,
          page_size: PAGE_SIZE,
        })
        .then(result => {
          if (!isActive()) return;
          const results = filters.status === 'full' ? result.results.filter(t => t.isFull) : result.results;
          setItems(current => (pageNumber === 1 ? results : [...current, ...results]));
          setPage(pageNumber);
          setHasMore(Boolean(result.next));
          setError(null);
        })
        .catch(err => isActive() && setError(errorMessage(err)))
        .finally(() => isActive() && setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    let active = true;
    void fetchPage(1, () => active);
    return () => {
      active = false;
    };
  }, [fetchPage]);

  useSpotlight('.spot-track', [items]);

  const loadMore = () => {
    setLoading(true);
    void fetchPage(page + 1);
  };

  if (error && !items.length) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setLoading(true);
          void fetchPage(1);
        }}
      />
    );
  }

  return (
    <>
      <div className="tour-matches reveal" style={{ '--d': 3, marginTop: '24px' } as React.CSSProperties}>
        {items.map((tournament, i) => (
          <TournamentCard key={tournament.id} tournament={tournament} index={i % PAGE_SIZE} />
        ))}
        {!loading && items.length === 0 && (
          <div className="empty-state">
            <Icon name="search" />
            <p>هیچ تورنومنتی با این مشخصات یافت نشد!</p>
          </div>
        )}
      </div>

      {loading && <Loading compact={items.length > 0} />}
      {!loading && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <button className="mc-btn-full" style={{ maxWidth: 260 }} onClick={loadMore}>
            بارگذاری بیشتر
          </button>
        </div>
      )}
    </>
  );
}

export default function TournamentsListPage() {
  const games = useApi(() => catalogApi.games());
  const [game, setGame] = useState('');
  const [status, setStatus] = useState('');
  const [ordering, setOrdering] = useState('starts_at');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const gameOptions = [{ value: '', label: 'همه بازی‌ها' }].concat(
    (games.data ?? []).filter(g => g.kind === 'game').map(g => ({ value: g.slug, label: g.titleEn })),
  );

  return (
    <main className="tour-wrapper">
      <div className="liquid-bg">
        <div className="l-blob blob-1"></div>
        <div className="l-blob blob-2"></div>
        <div className="l-blob blob-3"></div>
      </div>

      <div className="tour-sec-h reveal" style={{ '--d': 1, marginTop: '20px' } as React.CSSProperties}>
        <h3>لیست مسابقات</h3>
      </div>

      <div className="filter-bar-wrapper spot reveal" style={{ '--d': 2 } as React.CSSProperties}>
        <div className="filter-search">
          <Icon name="search" />
          <input
            type="text"
            placeholder="جستجوی تورنومنت یا بازی..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdowns">
          <Dropdown value={game} options={gameOptions} onChange={setGame} />
          <Dropdown value={status} options={STATUS_OPTIONS} onChange={setStatus} />
          <Dropdown value={ordering} options={SORT_OPTIONS} onChange={setOrdering} />
        </div>
      </div>

      <TournamentResults
        key={`${game}|${status}|${ordering}|${debouncedSearch}`}
        filters={{ game, status, ordering, search: debouncedSearch }}
      />
    </main>
  );
}
