import { API_URL, sanitizeApiPayload } from '@/lib/api/client';
import { fetchEntity } from '@/lib/api/server';
import type { Guide, GuideCategory, GuideSummary } from '@/lib/api/types';

export interface GuideCategoryMeta {
  key: GuideCategory;
  title: string;
  shortTitle: string;
  kicker: string;
  badge: string;
  intro: string;
  icon: string;
  accent: string;
  accentSoft: string;
}

export const GUIDE_CATEGORIES: GuideCategoryMeta[] = [
  {
    key: 'purchase',
    title: 'آموزش خرید و فعال‌سازی',
    shortTitle: 'خرید و فعال‌سازی',
    kicker: 'راهنمای محصولات فروشگاه',
    badge: 'محبوب‌ترین',
    intro: 'مراحل خرید هر محصول، اطلاعات لازم و کارهایی که بعد از تحویل باید انجام دهید.',
    icon: '/icons/store.webp',
    accent: '#e2453f',
    accentSoft: 'rgba(226, 69, 63, 0.18)',
  },
  {
    key: 'account',
    title: 'آماده‌سازی و امنیت اکانت',
    shortTitle: 'آماده‌سازی اکانت',
    kicker: 'پیش‌نیاز خرید و امنیت',
    badge: 'ضروری قبل از خرید',
    intro: 'ساخت و تنظیم اکانت بازی‌ها پیش از خرید، تأیید دومرحله‌ای و امنیت اکانت.',
    icon: '/icons/accounts.webp',
    accent: '#00d4ff',
    accentSoft: 'rgba(0, 212, 255, 0.16)',
  },
  {
    key: 'site',
    title: 'راهنمای استفاده از تایتان',
    shortTitle: 'راهنمای سایت',
    kicker: 'امکانات پلتفرم',
    badge: 'کار با سایت',
    intro: 'پرداخت، کیف پول، ثبت اکانت بازی، پیگیری سفارش و پشتیبانی.',
    icon: '/icons/dashboard.webp',
    accent: '#f59e0b',
    accentSoft: 'rgba(245, 158, 11, 0.16)',
  },
  {
    key: 'tournament',
    title: 'تورنومنت‌ها و رقابت',
    shortTitle: 'تورنومنت‌ها',
    kicker: 'مسابقات و جوایز نقدی',
    badge: 'رقابت آنلاین',
    intro: 'ثبت‌نام انفرادی و تیمی، جدول مسابقات، کد لابی و دریافت جوایز.',
    icon: '/icons/tournament.webp',
    accent: '#9d6fff',
    accentSoft: 'rgba(157, 111, 255, 0.18)',
  },
];

export const guideCategoryMeta = (key: GuideCategory): GuideCategoryMeta =>
  GUIDE_CATEGORIES.find(category => category.key === key) ?? GUIDE_CATEGORIES[0];

export const guideCategoryTitle = (key: GuideCategory) =>
  GUIDE_CATEGORIES.find(category => category.key === key)?.title ?? 'آموزش‌ها';

export interface GuideVisualTheme {
  accent: string;
  secondaryAccent: string;
  badgeLabel: string;
  characterImage: string;
  backgroundImage: string;
  watermarkImage: string;
  floatingImage: string;
  storeHref: string;
  storeLabel: string;
}

const GAME_THEMES: Record<string, GuideVisualTheme> = {
  fortnite: {
    accent: '#00d4ff',
    secondaryAccent: '#7c4dff',
    badgeLabel: 'Fortnite',
    characterImage: '/images/hero/characters/fortnite.webp',
    backgroundImage: '/images/games/fortnite-background.webp',
    watermarkImage: '/images/categories/large/fortnite.webp',
    floatingImage: '/images/glossy-fortnite-logo.webp',
    storeHref: '/store/fortnite',
    storeLabel: 'فروشگاه فورتنایت',
  },
  valorant: {
    accent: '#ff4655',
    secondaryAccent: '#ff8a5c',
    badgeLabel: 'Valorant',
    characterImage: '/images/hero/characters/valorant.webp',
    backgroundImage: '/images/games/valorant-background.webp',
    watermarkImage: '/images/categories/large/valorant.webp',
    floatingImage: '/images/glossy-valorant-logo.webp',
    storeHref: '/store/valorant',
    storeLabel: 'فروشگاه ولورانت',
  },
  'call-of-duty': {
    accent: '#f59e0b',
    secondaryAccent: '#ef4444',
    badgeLabel: 'Call of Duty Mobile',
    characterImage: '/images/hero/characters/callof-v2.webp',
    backgroundImage: '/images/games/callof-background.webp',
    watermarkImage: '/images/categories/large/callof-v2.webp',
    floatingImage: '/images/glossy-cod-logo.webp',
    storeHref: '/store/call-of-duty',
    storeLabel: 'فروشگاه کالاف دیوتی',
  },
  'clash-of-clans': {
    accent: '#38bdf8',
    secondaryAccent: '#f59e0b',
    badgeLabel: 'Clash of Clans',
    characterImage: '/images/hero/characters/clash.webp',
    backgroundImage: '/images/games/clash-background.webp',
    watermarkImage: '/images/categories/large/clash.webp',
    floatingImage: '/images/categories/large/clash.webp',
    storeHref: '/store/clash-of-clans',
    storeLabel: 'فروشگاه کلش آف کلنز',
  },
  premium: {
    accent: '#3ddc84',
    secondaryAccent: '#00d4ff',
    badgeLabel: 'Premium Services',
    characterImage: '/images/login-premium.webp',
    backgroundImage: '/images/games/premium.webp',
    watermarkImage: '/images/categories/large/premium.webp',
    floatingImage: '/images/discount.webp',
    storeHref: '/store/premium',
    storeLabel: 'اشتراک‌های پریمیوم',
  },
};

export function getGuideTheme(guide: Pick<GuideSummary, 'category' | 'game'>): GuideVisualTheme {
  const gameSlug = guide.game?.slug;
  if (gameSlug && GAME_THEMES[gameSlug]) {
    return GAME_THEMES[gameSlug];
  }
  const cat = guideCategoryMeta(guide.category);
  if (guide.category === 'tournament') {
    return {
      accent: cat.accent,
      secondaryAccent: '#e2453f',
      badgeLabel: 'Titan Tournaments',
      characterImage: '/images/hero/characters/callof-v2.webp',
      backgroundImage: '/images/tournoment-banner.webp',
      watermarkImage: '/icons/tournament.webp',
      floatingImage: '/icons/tournament.webp',
      storeHref: '/tournaments',
      storeLabel: 'مشاهده تورنومنت‌ها',
    };
  }
  return {
    accent: guide.game?.accentColor || cat.accent,
    secondaryAccent: '#ffcf8a',
    badgeLabel: 'Titan Academy',
    characterImage: '/images/support-robot.webp',
    backgroundImage: '/images/banner-hero.webp',
    watermarkImage: cat.icon,
    floatingImage: cat.icon,
    storeHref: '/store',
    storeLabel: 'ورود به فروشگاه تایتان',
  };
}

/**
 * Removes editorial draft placeholders like "[بررسی شود: ...]" or "[بررسی شود]"
 * that may still be present in raw database text so readers only see clean copy,
 * and isolates parenthetical English terms so RTL headings never split "(V-Bucks)" across lines.
 */
export function cleanGuideText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\[بررسی شود[^\]]*\][ \t]*/g, '')
    .replace(/(?<!\])\(([A-Za-z0-9][A-Za-z0-9\s+&.-]*)\)/g, (_, inner: string) => {
      const compact = inner
        .trim()
        .replace(/-/g, '\u2011')
        .replace(/\s+/g, '\u00A0');
      return `\u2066(${compact})\u2069`;
    })
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function cleanGuideFaqs(
  faqs: { question: string; answer: string }[],
): { question: string; answer: string }[] {
  return faqs
    .map(faq => ({
      question: cleanGuideText(faq.question),
      answer: cleanGuideText(faq.answer),
    }))
    .filter(faq => faq.question.length > 0 && faq.answer.length > 0);
}

/** Published guides, optionally filtered. Lists degrade to empty so links never break a page. */
export async function getGuides(params: Record<string, string> = {}): Promise<GuideSummary[]> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/content/guides/${query ? `?${query}` : ''}`, {
      next: { revalidate: 300, tags: ['guides'] },
      signal: AbortSignal.timeout(10000),
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
