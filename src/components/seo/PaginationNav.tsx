import React from 'react';
import Link from 'next/link';

interface PaginationNavProps {
  basePath: string;
  currentPage: number;
  totalCount: number;
  pageSize?: number;
}

export function buildPaginatedHref(basePath: string, page: number): string {
  if (page <= 1) return basePath;
  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}page=${page}`;
}

export function PaginationNav({
  basePath,
  currentPage,
  totalCount,
  pageSize = 24,
}: PaginationNavProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="seo-pagination"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '28px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      {currentPage > 1 && (
        <Link
          href={buildPaginatedHref(basePath, currentPage - 1)}
          rel="prev"
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.85rem',
          }}
        >
          صفحه قبل
        </Link>
      )}
      {pages.map((p) => {
        const isCurrent = p === currentPage;
        return (
          <Link
            key={p}
            href={buildPaginatedHref(basePath, p)}
            aria-current={isCurrent ? 'page' : undefined}
            style={{
              minWidth: '38px',
              height: '38px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              background: isCurrent ? 'rgba(229, 9, 20, 0.85)' : 'rgba(255, 255, 255, 0.05)',
              border: isCurrent
                ? '1px solid rgba(255, 90, 100, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontWeight: isCurrent ? 700 : 500,
              textDecoration: 'none',
              fontSize: '0.85rem',
            }}
          >
            {p.toLocaleString('fa-IR')}
          </Link>
        );
      })}
      {currentPage < totalPages && (
        <Link
          href={buildPaginatedHref(basePath, currentPage + 1)}
          rel="next"
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.85rem',
          }}
        >
          صفحه بعد
        </Link>
      )}
    </nav>
  );
}
