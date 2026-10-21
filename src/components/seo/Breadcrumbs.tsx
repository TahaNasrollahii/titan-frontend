import React from 'react';
import Link from 'next/link';
import type { BreadcrumbItem } from '@/lib/seo/schema';
import { buildBreadcrumbSchema } from '@/lib/seo/schema';
import { JsonLd } from './JsonLd';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  includeJsonLd?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, includeJsonLd = true, className = '' }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <>
      {includeJsonLd && <JsonLd data={buildBreadcrumbSchema(items)} />}
      <nav
        aria-label="مسیر صفحه"
        className={`seo-breadcrumbs ${className}`.trim()}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.82rem',
          color: 'rgba(255, 255, 255, 0.62)',
          marginBottom: '14px',
        }}
      >
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={`${item.path}-${index}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {isLast ? (
                  <span
                    aria-current="page"
                    style={{ color: 'rgba(255, 255, 255, 0.92)', fontWeight: 600 }}
                  >
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.path}
                      style={{
                        color: 'rgba(255, 255, 255, 0.68)',
                        textDecoration: 'none',
                      }}
                    >
                      {item.name}
                    </Link>
                    <span aria-hidden="true" style={{ opacity: 0.45 }}>
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
