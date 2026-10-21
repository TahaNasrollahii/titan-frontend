import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import TournamentDetailClient from './TournamentDetailClient';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';
import type { Tournament } from '@/lib/api/types';
import {
  buildSportsEventSchema,
  resolveBackendRedirect,
  toAbsoluteUrl,
} from '@/lib/seo/schema';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/tournaments/?page_size=24`, {
      next: { revalidate: 60, tags: ['tournaments'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [{ slug: 'fifa' }];
    const data = await res.json();
    const results = Array.isArray(data) ? data : data.results || [];
    const slugs = results.map((t: { slug: string }) => ({ slug: t.slug }));
    if (!slugs.some((s: { slug: string }) => s.slug === 'fifa')) {
      slugs.push({ slug: 'fifa' });
    }
    return slugs;
  } catch {
    return [{ slug: 'fifa' }];
  }
}

async function getTournament(slug: string): Promise<Tournament | null> {
  try {
    const res = await fetch(`${API_URL}/tournaments/${slug}/`, {
      next: { revalidate: 60, tags: ['tournaments', `tournament-${slug}`] },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function isBuiltInSpecialSlug(slug: string): boolean {
  return /fifa/i.test(slug) || slug.startsWith('special-event-');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournament(slug);

  if (!tournament && !isBuiltInSpecialSlug(slug)) {
    return {
      title: 'تورنومنت یافت نشد',
      robots: { index: false, follow: false },
    };
  }

  const rawTitle = (
    tournament?.metaTitle ||
    (tournament ? `${tournament.title} — تورنومنت گیمینگ` : 'مسابقات فیفا ۲۴ — جام ویژه')
  ).replace(/\s*\|\s*(پلتفرم\s*)?تایتان\s*$/u, '');

  const rawDesc = (
    tournament?.metaDescription ||
    tournament?.description ||
    (tournament
      ? `مسابقه و تورنومنت ${tournament.title} با جایزه نقدی${
          tournament.game ? ` در بازی ${tournament.game.title}` : ''
        }. مشاهده براکت زنده، قوانین و ثبت‌نام در پلتفرم تایتان.`
      : 'مشاهده قوانین، براکت زنده، شرکت‌کنندگان و ثبت‌نام در تورنومنت‌های آنلاین تایتان.')
  )
    .replace(/[\r\n]+/g, ' ')
    .trim();
  const description = rawDesc.length > 158 ? `${rawDesc.slice(0, 155)}...` : rawDesc;

  const imageUrl = toAbsoluteUrl(
    tournament?.ogImage || tournament?.coverImage || '/images/tournoment-banner.webp',
  );
  const canonicalUrl = tournament?.canonicalUrl || `${SITE_URL}/tournaments/${slug}`;

  return {
    title: rawTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    ...(tournament?.noindex
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
    openGraph: {
      title: `${rawTitle} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: tournament?.imageAlt || tournament?.title || 'تورنومنت تایتان',
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${rawTitle} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await getTournament(slug);

  if (!tournament && !isBuiltInSpecialSlug(slug)) {
    await resolveBackendRedirect(`/tournaments/${slug}`);
    notFound();
  }

  const sportsEventJsonLd = tournament
    ? buildSportsEventSchema(tournament)
    : buildSportsEventSchema({
        slug,
        title: 'مسابقات فیفا ۲۴ — جام ویژه تایتان',
        description: 'تورنمنت حذفی جام ویژه فیفا ۲۴ با حضور ۱۶ تیم برتر و جدول مسابقات زنده.',
      });

  const breadcrumbItems = [
    { name: 'صفحه اصلی', path: '/' },
    { name: 'تورنومنت‌ها', path: '/tournaments' },
    { name: tournament?.title || 'مسابقات فیفا ۲۴', path: `/tournaments/${slug}` },
  ];

  return (
    <>
      <JsonLd data={sportsEventJsonLd} />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 24px 0' }}>
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <TournamentDetailClient initialData={tournament} />
    </>
  );
}
