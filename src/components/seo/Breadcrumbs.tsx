import React from 'react';
import type { BreadcrumbItem } from '@/lib/seo/schema';
import { buildBreadcrumbSchema } from '@/lib/seo/schema';
import { JsonLd } from './JsonLd';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  includeJsonLd?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, includeJsonLd = true }: BreadcrumbsProps) {
  if (!items || items.length === 0 || !includeJsonLd) return null;

  return <JsonLd data={buildBreadcrumbSchema(items)} />;
}
