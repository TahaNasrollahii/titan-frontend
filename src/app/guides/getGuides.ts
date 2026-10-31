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
    kicker: 'مسابقات، رنک‌بندی و جوایز نقدی',
    badge: 'رقابت آنلاین',
    intro: 'ثبت‌نام انفرادی و تیمی، سیستم رنک‌ها و امتیازات، جدول مسابقات و دریافت جوایز.',
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

export const RANKS_GUIDE: Guide = {
  slug: 'ranks',
  title: 'آموزش کامل سیستم رنک‌بندی، امتیازات و سطح‌بندی در تایتان',
  category: 'tournament',
  summary:
    'آشنایی کامل با ۵ سطح رنک تایتان (از برنز تا تایتان)، نحوه کسب امتیاز رنک (Points) و تجربه (XP)، تاثیر رنک در سیدبندی جدول مسابقات، قاب‌های آواتار و نشان‌های افتخار.',
  publishedAt: '2026-04-20T00:00:00Z',
  updatedAt: '2026-04-20T00:00:00Z',
  game: null,
  products: [],
  related: [],
  metaTitle: 'آموزش کامل رنک‌ها، امتیازات (Points) و سطح‌بندی در تایتان',
  metaDescription:
    'راهنمای جامع ۵ سطح رنک در تایتان (برنز، نقره، طلا، پلاتینیوم و تایتان)، نحوه کسب امتیاز در تورنومنت‌ها، تفاوت Points و XP، سیدبندی براکت و نشان‌های افتخار.',
  noindex: false,
  ogImage: null,
  canonicalUrl: '',
  body: `## سیستم رنک‌بندی تایتان چیست و چه کاربردی دارد؟

سیستم رنک‌بندی تایتان معیار رسمی سنجش مهارت، سابقه رقابتی و جایگاه هر بازیکن و تیم در مسابقات آنلاین تایتان است. تمام فعالیت‌های رقابتی شما در تورنومنت‌های انفرادی و تیمی به‌صورت خودکار در پروفایل کاربری و پروفایل تیمتان ثبت می‌شود و مسیر صعود شما را از سطح **برنز** تا بالاترین درجه یعنی **تایتان** مشخص می‌کند.

رنک شما در تایتان چهار کاربرد مستقیم دارد:

- تعیین **قاب و نشان اختصاصی آواتار (Rank Frame & Ornament)** در تمام بخش‌های سایت، پنل کاربری، صفحه تیم و جدول مسابقات
- تعیین جایگاه شما و تیمتان در **جدول برترین‌های فصل (Season Leaderboard)** به تفکیک هر بازی
- تعیین **سید (Seed) در جدول براکت تورنومنت‌ها** تا بازیکنان و تیم‌های پرامتیاز در دورهای ابتدایی به یکدیگر برخورد نکنند
- باز شدن **نشان‌های افتخار (Badges)** ویژه قهرمانی و رکوردهای فردی در پروفایل

## معرفی ۵ سطح رنک در تایتان (از برنز تا تایتان)

در تایتان ۵ سطح (Tier) رنک وجود دارد که بر اساس مجموع **امتیاز رنک (Points)** بازیکن یا تیم به‌صورت لحظه‌ای محاسبه و ارتقا داده می‌شود:

1. **برنز (Bronze) — از ۰ امتیاز:** نقطه شروع تمام جنگجویان تایتان («تولد یک جنگجو در میدان»). با ساخت حساب کاربری یا تشکیل تیم جدید، کار خود را با حلقه برنزی و نشان لوزی آغاز می‌کنید.
2. **نقره (Silver) — از +۱,۵۰۰ امتیاز:** اولین پله صعود حرفه‌ای («خروج از سایه‌ها و شکار رقبا»). با کسب چند برد در مسابقات یا قرار گرفتن در رتبه‌های برتر تورنومنت‌ها، قاب نقره‌ای با نشان ستاره برای شما فعال می‌شود.
3. **طلا (Gold) — از +۵,۰۰۰ امتیاز:** سطح بازیکنان و تیم‌های باتجربه («کابوس حریفان؛ درخشش در اوج»). رسیدن به ۵,۰۰۰ امتیاز، حلقه طلایی درخشان به همراه نشان تاج طلایی را به آواتار شما اضافه می‌کند.
4. **پلاتینیوم (Platinum) — از +۱۰,۰۰۰ امتیاز:** جمع نخبگان و مدعیان اصلی قهرمانی («ارباب بی‌نقص مسابقات؛ تشنه‌ی جاودانگی»). دارنده این رنک از حلقه بنفش نئونی و نشان الماس پلاتینیوم برخوردار می‌شود.
5. **تایتان (Titan) — از +۲۰,۰۰۰ امتیاز:** بالاترین و باشکوه‌ترین درجه رقابتی سایت («خدای بی‌رقیب میدان؛ اسطوره تایتان‌ها»). بازیکنان و تیم‌هایی که از مرز ۲۰,۰۰۰ امتیاز عبور می‌کنند، قاب اختصاصی سرخ-مشکی تایتان با نشان متحرک و چشمان درخشان تایتان را دریافت می‌کنند.

> مهم: ارتقای رنک کاملاً خودکار است؛ به محض اینکه امتیاز شما یا تیمتان از حد نصاب هر سطح عبور کند، رنک، رنگ حلقه و نشان بالای آواتار بدون نیاز به هیچ اقدامی ارتقا می‌یابد.

## چطور امتیاز رنک (Points) کسب کنیم؟

امتیاز رنک تنها از طریق حضور و پیروزی در تورنومنت‌های رسمی تایتان به دست می‌آید و دو منبع اصلی دارد:

- **پاداش پیروزی در هر مسابقه براکت (+۲۵ امتیاز):** با بردن هر بازی در جدول حذفی تورنومنت، **۲۵ امتیاز رنک** به بازیکن (در مسابقات انفرادی) یا به تیم و تمام اعضای حاضر در ترکیب فعال آن مسابقه (در مسابقات تیمی) اضافه می‌شود.
- **پاداش رتبه‌های برتر تورنومنت (جایزه امتیازی جدول):** علاوه بر جایزه نقدی، هر تورنومنت برای نفرات یا تیم‌های برتر (معمولاً رتبه‌های اول تا سوم یا چهارم) امتیاز ویژه در نظر می‌گیرد؛ برای مثال قهرمان تورنومنت علاوه بر امتیاز بردهای مسیر، بین **+۶۰۰ تا +۱,۰۰۰ امتیاز**، نایب‌قهرمان بین **+۳۰۰ تا +۶۰۰ امتیاز** و رتبه سوم بین **+۱۵۰ تا +۳۰۰ امتیاز** پاداش می‌گیرد.

> نکته: در تورنومنت‌های تیمی، امتیاز کسب‌شده هم به حساب کل تیم (برای لیدربرد تیمی) و هم به پروفایل تک‌تک بازیکنان حاضر در ترکیب (Roster) آن تورنومنت و به آمار همان بازی در فصل جاری اضافه می‌شود.

## تفاوت امتیاز رنک (Points) با تجربه (XP) و لول (Level)

در پروفایل و داشبورد شما علاوه بر رنک و امتیاز، دو شاخص **لول (Level)** و **تجربه (XP)** نیز دیده می‌شود که عملکرد متفاوتی دارند:

- **امتیاز رنک (Points):** معیار مهارت و موفقیت رقابتی است و مستقیماً سطح رنک (برنز تا تایتان)، رتبه در لیدربرد و سیدبندی براکت را تعیین می‌کند.
- **تجربه (XP) و لول (Level):** معیار میزان فعالیت و سابقه حضور شما در میدان مسابقات است. در هر مسابقه از تورنومنت، برنده **+۱۲۰ XP** و حتی بازنده نیز به پاس حضور و رقابت **+۴۰ XP** دریافت می‌کند.
- **فرمول ارتقای لول:** هر بازیکن از لول ۱ شروع می‌کند و برای صعود از لول فعلی به لول بعدی به اندازه \`500 + (Level × 300)\` تجربه (XP) نیاز دارد. با پر شدن نوار XP، لول شما افزایش یافته و XP مازاد به لول بعدی منتقل می‌شود.

## تاثیر رنک و امتیاز در سیدبندی براکت و لیدربرد فصل

امتیاز رنک فقط یک نشان ظاهری نیست، بلکه مستقیماً روی شانس موفقیت شما در مسابقات آینده تاثیر می‌گذارد:

1. **سیدبندی هوشمند (Bracket Seeding):** هنگام بسته شدن ثبت‌نام و ساخت جدول براکت، سیستم شرکت‌کنندگان را بر اساس امتیاز رنک مرتب می‌کند. نفر یا تیم اول بیشترین امتیاز (Seed 1) و نفر دوم (Seed 2) در دو سمت مخالف جدول قرار می‌گیرند تا تا پیش از فینال به هم برخورد نکنند.
2. **استراحت دور اول (Bye):** اگر تعداد شرکت‌کنندگان یک تورنومنت کمتر از توان دو (مثلاً ۱۲ تیم در جدول ۱۶تایی) باشد، سیدهای برتر که امتیاز رنک بالاتری دارند در دور اول استراحت (**Bye**) می‌خورند و مستقیماً به دور دوم صعود می‌کنند.
3. **لیدربرد فصلی هر بازی:** در صفحه تورنومنت‌ها می‌توانید جدول برترین بازیکنان و برترین تیم‌ها را به تفکیک هر بازی (کالاف دیوتی موبایل، ولورانت، فورتنایت، کلش آف کلنز و...) مشاهده کنید.

## نشان‌های افتخار (Badges) و قاب آواتار

علاوه بر ۵ رنک اصلی، بازیکنان پرافتخار نشان‌های ویژه‌ای (Badges) دریافت می‌کنند که در کارت بازیکن و پروفایل آن‌ها نمایش داده می‌شود:

- **نشان قهرمان (Champion):** به‌صورت خودکار به بازیکن یا تمام اعضای ترکیب تیمی که فینال یک تورنومنت را ببرند و رتبه اول را کسب کنند اهدا می‌شود.
- **استاد برد پیاپی (Streak Master):** ویژه بازیکنانی که چندین پیروزی متوالی بدون شکست ثبت کنند.
- **کهنه‌کار (Veteran):** به‌پاس حضور مستمر در تورنومنت‌های متعدد تایتان.
- **سلطان هدشات (Headshot King) و استاد کلاچ (Clutch Master):** نشان‌های افتخاری ویژه عملکردهای درخشان در مسابقات.`,
  faqs: [
    {
      question: 'چطور می‌توانم رنک خودم را از برنز به نقره، طلا یا تایتان ارتقا دهم؟',
      answer:
        'با شرکت در تورنومنت‌ها و کسب پیروزی در مسابقات (+۲۵ امتیاز به ازای هر برد) و همچنین قرار گرفتن در رتبه‌های برتر تورنومنت (امتیاز جایزه رتبه اول تا سوم)، مجموع امتیاز شما افزایش می‌یابد و به محض رسیدن به حد نصاب هر سطح (۱,۵۰۰ برای نقره، ۵,۰۰۰ برای طلا، ۱۰,۰۰۰ برای پلاتینیوم و ۲۰,۰۰۰ برای تایتان) رنک شما خودکار ارتقا پیدا می‌کند.',
    },
    {
      question: 'در تورنومنت‌های تیمی، امتیاز رنک به تیم می‌رسد یا به بازیکنان؟',
      answer:
        'به هر دو! در مسابقات تیمی، امتیاز برد هر مسابقه و امتیاز جایزه نهایی هم به پروفایل تیم اضافه می‌شود و هم به حساب تک‌تک بازیکنانی که کاپیتان آن‌ها را در لیست ترکیب (Roster) آن تورنومنت قرار داده است.',
    },
    {
      question: 'اگر در مسابقه‌ای ببازم، آیا امتیاز رنک یا XP دریافت می‌کنم؟',
      answer:
        'امتیاز رنک (Points) به پیروزی در مسابقات و کسب رتبه‌های برتر اختصاص دارد، اما حتی در صورت شکست در یک مسابقه نیز ۴۰ واحد تجربه (XP) بابت مشارکت دریافت می‌کنید که به افزایش لول (Level) اکانت شما کمک می‌کند.',
    },
    {
      question: 'داشتن رنک و امتیاز بالاتر چه مزیتی در جدول مسابقات (براکت) دارد؟',
      answer:
        'جدول مسابقات بر اساس امتیاز شرکت‌کنندگان سیدبندی (Seed) می‌شود؛ بنابراین بازیکنان و تیم‌های دارای رنک و امتیاز بالاتر در دورهای ابتدایی به یکدیگر برخورد نمی‌کنند و در صورت کامل نبودن ظرفیت جدول، اولویت دریافت استراحت دور اول (Bye) با سیدهای برتر است.',
    },
  ],
};

function toSummary(guide: Guide): GuideSummary {
  return {
    slug: guide.slug,
    title: guide.title,
    category: guide.category,
    summary: guide.summary,
    publishedAt: guide.publishedAt,
    updatedAt: guide.updatedAt,
    game: guide.game,
  };
}

/** Published guides, optionally filtered. Lists degrade to empty so links never break a page. */
export async function getGuides(params: Record<string, string> = {}): Promise<GuideSummary[]> {
  let list: GuideSummary[] = [];
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/content/guides/${query ? `?${query}` : ''}`, {
      next: { revalidate: 300, tags: ['guides'] },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      list = sanitizeApiPayload((await res.json()) as GuideSummary[]);
    }
  } catch {
    list = [];
  }

  const matchesRanksFilter =
    !params.game &&
    !params.product &&
    (!params.category || params.category === 'tournament');

  if (matchesRanksFilter && !list.some(item => item.slug === RANKS_GUIDE.slug)) {
    list = [...list, toSummary(RANKS_GUIDE)];
  }
  return list;
}

export async function getGuide(slug: string): Promise<Guide | null> {
  const remote = await fetchEntity<Guide>(`/content/guides/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
    tags: ['guides', `guide-${slug}`],
  });
  if (remote) return remote;
  if (slug === RANKS_GUIDE.slug) return RANKS_GUIDE;
  return null;
}

/** The guide a store or product page links to: its buying guide first. */
export function primaryGuide(guides: GuideSummary[]): GuideSummary | null {
  return guides.find(guide => guide.category === 'purchase') ?? guides[0] ?? null;
}
