import type { Metadata } from 'next';
import React from 'react';
import TournamentDetailClient from './TournamentDetailClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';

interface TournamentData {
  slug: string;
  title: string;
  rules?: string;
  coverImage?: string;
  prizePool?: number;
  prizeCurrency?: string;
  entryFee?: number;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  game?: {
    slug: string;
    title: string;
  };
}

async function getTournament(slug: string): Promise<TournamentData | null> {
  try {
    const res = await fetch(`${API_URL}/tournaments/${slug}/`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournament(slug);

  const title = tournament ? `${tournament.title} | تورنومنت گیمینگ تایتان` : 'جزئیات تورنومنت مسابقات';
  const description = tournament
    ? `مسابقه و تورنومنت ${tournament.title} با جایزه نقدی${tournament.game ? ` در بازی ${tournament.game.title}` : ''}. مشاهده براکت زنده، قوانین و ثبت‌نام در پلتفرم تایتان.`
    : 'مشاهده قوانین، براکت، شرکت‌کنندگان و ثبت‌نام در تورنومنت‌های آنلاین تایتان.';

  const imageUrl = tournament?.coverImage
    ? tournament.coverImage.startsWith('http')
      ? tournament.coverImage
      : `${SITE_URL}${tournament.coverImage.startsWith('/') ? '' : '/'}${tournament.coverImage}`
    : `${SITE_URL}/images/tournoment-banner.webp`;

  return {
    title,
    description,
    alternates: {
      canonical: `/tournaments/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/tournaments/${slug}`,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: tournament?.title || 'تورنومنت تایتان',
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
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

  const imageUrl = tournament?.coverImage
    ? tournament.coverImage.startsWith('http')
      ? tournament.coverImage
      : `${SITE_URL}${tournament.coverImage.startsWith('/') ? '' : '/'}${tournament.coverImage}`
    : `${SITE_URL}/images/tournoment-banner.webp`;

  const sportsEventJsonLd = tournament
    ? {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: tournament.title,
        description:
          (Array.isArray(tournament.rules) ? (tournament.rules as string[]).join(' — ') : tournament.rules) ||
          `مسابقه و تورنومنت آنلاین ${tournament.title} با جوایز نقدی در پلتفرم گیمینگ تایتان.`,
        startDate: tournament.startsAt,
        endDate: tournament.endsAt,
        eventStatus:
          tournament.status === 'completed'
            ? 'https://schema.org/EventMovedOnline'
            : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {
          '@type': 'VirtualLocation',
          url: `${SITE_URL}/tournaments/${slug}`,
        },
        image: [imageUrl],
        organizer: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
        ...(tournament.prizePool
          ? {
              award: `${tournament.prizePool.toLocaleString()} ${tournament.prizeCurrency || 'USD'}`,
            }
          : {}),
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/tournaments/${slug}`,
          price: (tournament.entryFee || 0) * 10,
          priceCurrency: 'IRR',
          availability:
            tournament.status === 'registration_open'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
        },
      }
    : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'صفحه اصلی',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'تورنومنت‌ها',
        item: `${SITE_URL}/tournaments`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tournament?.title || slug,
        item: `${SITE_URL}/tournaments/${slug}`,
      },
    ],
  };

  return (
    <>
      {sportsEventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="sr-only">{tournament?.title || 'تورنومنت مسابقات تایتان'}</h1>
      <TournamentDetailClient />
    </>
  );
}
