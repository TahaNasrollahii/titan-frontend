import { API_URL, sanitizeApiPayload } from '@/lib/api/client';
import { fetchEntity } from '@/lib/api/server';
import type { Guide, GuideCategory, GuideSummary } from '@/lib/api/types';

export const GUIDE_CATEGORIES: { key: GuideCategory; title: string; intro: string }[] = [
  {
    key: 'purchase',
    title: 'آموزش خرید و فعال‌سازی',
    intro: 'مراحل خرید هر محصول، اطلاعات لازم و کارهایی که بعد از تحویل باید انجام دهید.',
  },
  {
    key: 'account',
    title: 'آماده‌سازی اکانت',
    intro: 'ساخت و تنظیم اکانت بازی‌ها پیش از خرید، تأیید دومرحله‌ای و امنیت اکانت.',
  },
  {
    key: 'site',
    title: 'راهنمای استفاده از تایتان',
    intro: 'پرداخت، کیف پول، ثبت اکانت بازی، پیگیری سفارش و پشتیبانی.',
  },
  {
    key: 'tournament',
    title: 'تورنومنت‌ها',
    intro: 'ثبت‌نام انفرادی و تیمی، جدول مسابقات و دریافت جوایز.',
  },
];

export const guideCategoryTitle = (key: GuideCategory) =>
  GUIDE_CATEGORIES.find(category => category.key === key)?.title ?? 'آموزش‌ها';

/** Published guides, optionally filtered. Lists degrade to empty so links never break a page. */
export async function getGuides(params: Record<string, string> = {}): Promise<GuideSummary[]> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/content/guides/${query ? `?${query}` : ''}`, {
      next: { revalidate: 300, tags: ['guides'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    return sanitizeApiPayload((await res.json()) as GuideSummary[]);
  } catch {
    return [];
  }
}

export function getGuide(slug: string): Promise<Guide | null> {
  return fetchEntity<Guide>(`/content/guides/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
    tags: ['guides', `guide-${slug}`],
  });
}

/** The guide a store or product page links to: its buying guide first. */
export function primaryGuide(guides: GuideSummary[]): GuideSummary | null {
  return guides.find(guide => guide.category === 'purchase') ?? guides[0] ?? null;
}
