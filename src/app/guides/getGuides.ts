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

export const EPIC_GAMES_ACCOUNT_GUIDE: Guide = {
  slug: 'epic-games-account',
  title: 'آموزش تصویری ساخت اکانت اپیک گیمز (Epic Games) در ۴ مرحله',
  category: 'account',
  summary:
    'آموزش گام‌به‌گام و تصویری ساخت اکانت اپیک گیمز (Epic Games) برای فورتنایت در ۴ مرحله ساده: ورود به سایت رسمی اپیک گیمز، انتخاب Create an account، تکمیل فرم ثبت‌نام و تایید کد ۶ رقمی ایمیل.',
  publishedAt: '2026-04-20T00:00:00Z',
  updatedAt: '2026-10-31T00:00:00Z',
  game: {
    slug: 'fortnite',
    title: 'فورتنایت',
    titleEn: 'Fortnite',
    accentColor: '#00d4ff',
    iconImage: '/images/categories/large/fortnite.webp',
  },
  products: [],
  related: [],
  metaTitle: 'آموزش تصویری ساخت اکانت اپیک گیمز (Epic Games) در ۴ مرحله | تایتان',
  metaDescription:
    'آموزش گام‌به‌گام و تصویری ساخت اکانت اپیک گیمز (Epic Games) برای فورتنایت در ۴ مرحله ساده به همراه راهنمای کامل فرم ثبت‌نام و کد تایید ایمیل.',
  noindex: false,
  ogImage: '/images/guides/epic-games-account/1.webp',
  canonicalUrl: '',
  body: `برای اجرای بازی فورتنایت، ذخیره دائمی اسکین‌ها و آیتم‌ها و همچنین خرید محصولات فورتنایت مثل وی‌باکس، کروپک و بتل‌پس از [فروشگاه فورتنایت تایتان](/store/fortnite)، به یک **اکانت رسمی اپیک گیمز (Epic Games Account)** نیاز دارید. در این راهنمای تصویری، نحوه ساخت اکانت در [سایت رسمی اپیک گیمز (Epic Games)](https://www.epicgames.com/) را دقیقاً در **۴ مرحله ساده** به همراه تصاویر راهنما یاد می‌گیرید.

## مرحله اول: ورود به سایت رسمی اپیک گیمز و کلیک روی Sign In

ابتدا مرورگر خود را باز کنید و وارد [سایت رسمی اپیک گیمز به آدرس epicgames.com](https://www.epicgames.com/) یا [فروشگاه رسمی اپیک گیمز (Epic Games Store)](https://store.epicgames.com/) شوید. همان‌طور که در تصویر زیر با کادر و فلش قرمز مشخص شده است، در نوار بالای صفحه (گوشه سمت راست کنار دکمه آبی **Download**) روی دکمه **Sign In** کلیک کنید تا وارد بخش ورود و ثبت‌نام شوید.

1. وارد [سایت اصلی Epic Games](https://www.epicgames.com/) شوید و در صورت نیاز از ابزار تغییر آی‌پی معتبر استفاده کنید تا صفحه بدون خطا بارگذاری شود.
2. در هدر بالای سایت (سمت راست)، روی گزینه **Sign In** کلیک کنید.

![مرحله اول ساخت اکانت اپیک گیمز: ورود به سایت رسمی Epic Games و کلیک روی دکمه Sign In در بالای صفحه](/images/guides/epic-games-account/1.webp)

## مرحله دوم: انتخاب گزینه Create an account

پس از کلیک روی **Sign In**، پنجره **Sign in to Epic Games** برای شما باز می‌شود. از آنجایی که قصد ساخت یک حساب کاربری جدید را دارید، کادر ایمیل بالای صفحه را خالی بگذارید و در پایین دکمه آبی **Continue**، جلوی عبارت **New here?** روی لینک آبی‌رنگ **Create an account** (مطابق کادر قرمز در تصویر زیر) کلیک کنید.

1. در پنجره **Sign in to Epic Games** به پایین دکمه **Continue** نگاه کنید.
2. مقابل عبارت **New here?** روی گزینه آبی‌رنگ **Create an account** کلیک کنید تا فرم ساخت اکانت جدید باز شود.

![مرحله دوم ساخت اکانت اپیک گیمز: کلیک روی گزینه Create an account در پنجره Sign in to Epic Games](/images/guides/epic-games-account/2.webp)

## مرحله سوم: تکمیل فرم اطلاعات اکانت (Add your details)

در این مرحله فرم ثبت‌نام **Add your details** نمایش داده می‌شود. طبق راهنمای فارسی مشخص‌شده روی تصویر زیر، فیلدهای فرم را به ترتیب و با دقت تکمیل کنید:

1. **Email address (آدرس ایمیل):** ایمیل معتبر و در دسترس خود را وارد کنید (کد امنیتی ۶ رقمی به همین ایمیل ارسال می‌شود).
2. **First name (نام کوچک):** نام کوچک خود را به حروف انگلیسی وارد کنید.
3. **Last name (نام خانوادگی):** نام خانوادگی خود را به حروف انگلیسی وارد کنید.
4. **Create password (رمز عبور):** یک رمز عبور امن بسازید که هر ۳ شرط زیر را رعایت کند تا تیک سبز آن‌ها فعال شود: حداقل شامل یک حرف انگلیسی (**At least one letter**)، حداقل شامل یک عدد (**At least one number**) و حداقل ۱۰ کاراکتر (**Minimum 10 characters**).
5. **Display Name (نام نمایشی):** نام نمایشی خود را وارد کنید؛ این همان اسم شما در داخل سایت و بازی فورتنایت است (بین ۳ تا ۱۶ کاراکتر).
6. **موافقت با قوانین سایت (I have read and agree to the Terms of Service):** تیک اول مربوط به پذیرش قوانین سایت اپیک گیمز را حتماً فعال کنید (اجباری).
7. **دریافت اخبار و پیشنهادات (Send news, surveys, and offers from Epic Games):** تیک دوم مربوط به دریافت خبرنامه و پیشنهادات اپیک گیمز است که فعال کردن آن اختیاری است.
8. **کلیک روی دکمه Continue:** در پایان پس از بررسی اطلاعات، روی دکمه آبی **Continue** در پایین فرم کلیک کنید.

![مرحله سوم ساخت اکانت اپیک گیمز: تکمیل فرم Add your details شامل ایمیل، نام، رمز عبور ۱۰ کاراکتری و Display Name](/images/guides/epic-games-account/3.webp)

## مرحله چهارم: وارد کردن کد امنیتی ۶ رقمی ایمیل (Check your inbox)

بلافاصله پس از ثبت فرم، اپیک گیمز یک کد امنیتی ۶ رقمی به ایمیل شما ارسال می‌کند و صفحه **Check your inbox** باز می‌شود:

1. وارد صندوق ورودی (Inbox) ایمیل خود شوید (در صورت نبودن ایمیل در صفحه اصلی، پوشه **Spam** یا **Promotions** را هم بررسی کنید).
2. **کد امنیتی ۶ رقمی (6-digit security code)** ارسال‌شده از طرف Epic Games را در ۶ کادر مشخص‌شده در صفحه وارد کنید.
3. سپس روی دکمه آبی **Continue** کلیک کنید تا ساخت اکانت اپیک گیمز شما نهایی و تکمیل شود.

![مرحله چهارم ساخت اکانت اپیک گیمز: وارد کردن کد امنیتی ۶ رقمی ارسال‌شده به ایمیل در صفحه Check your inbox و کلیک روی Continue](/images/guides/epic-games-account/4.webp)

## نکات مهم پس از ساخت اکانت و آماده‌سازی برای خرید از تایتان

پس از تکمیل ۴ مرحله بالا، اکانت اپیک گیمز شما آماده استفاده است. برای اینکه هنگام خرید محصولات فورتنایت از تایتان هیچ مشکلی نداشته باشید، این نکات را رعایت کنید:

- **اتصال به کنسول (PlayStation / Xbox / Nintendo):** اگر روی کنسول بازی می‌کنید، طبق [آموزش اتصال اکانت اپیک گیمز به پلی استیشن یا ایکس باکس](/guides/epic-games-link-console) در [سایت رسمی اپیک گیمز](https://www.epicgames.com/) وارد بخش **Account ← Linked accounts** شوید و اکانت کنسول خود را به اپیک گیمز لینک کنید.
- **ذخیره امن اطلاعات ورود:** ایمیل و رمز عبور اکانت اپیک گیمز خود را در [بخش اکانت‌های من در پنل تایتان](/dashboard/accounts) ذخیره کنید تا در زمان سفارش محصولات [فروشگاه فورتنایت](/store/fortnite) نیازی به تایپ مجدد نداشته باشید.
- **فعال‌سازی تایید دومرحله‌ای (2FA):** برای افزایش امنیت اکانت و باز شدن قابلیت گیفت در فورتنایت، پیشنهاد می‌کنیم [آموزش فعال‌سازی تایید دومرحله‌ای (2FA)](/guides/epic-games-2fa) را نیز مطالعه کنید.`,
  faqs: [
    {
      question: 'برای ساخت اکانت اپیک گیمز باید وارد چه سایتی شویم؟',
      answer:
        'برای ساخت اکانت باید مستقیماً وارد سایت رسمی اپیک گیمز به آدرس https://www.epicgames.com شوید و از گوشه بالا سمت راست روی دکمه Sign In و سپس گزینه Create an account کلیک کنید.',
    },
    {
      question: 'رمز عبور اکانت اپیک گیمز (Create password) باید چه شرایطی داشته باشد؟',
      answer:
        'طبق قوانین جدید Epic Games، رمز عبور شما باید حداقل ۱۰ کاراکتر (Minimum 10 characters) باشد و حداقل شامل یک حرف انگلیسی (At least one letter) و یک عدد (At least one number) باشد تا هر ۳ تیک سبز فعال شوند.',
    },
    {
      question: 'اگر کد ۶ رقمی تایید ایمیل اپیک گیمز را دریافت نکردم چه کار کنم؟',
      answer:
        'ابتدا پوشه‌های Spam، Junk و Promotions ایمیل خود را بررسی کنید. اگر پس از ۲ دقیقه ایمیل دریافت نشد، در صفحه Check your inbox روی گزینه Resend email کلیک کنید تا کد جدید برایتان ارسال شود.',
    },
    {
      question: 'Display Name در فرم ثبت‌نام اپیک گیمز چیست؟',
      answer:
        'Display Name همان نام نمایشی شما در سایت اپیک گیمز و داخل بازی فورتنایت است که سایر بازیکنان آن را می‌بینند و باید بین ۳ تا ۱۶ کاراکتر باشد.',
    },
  ],
};

export const EPIC_GAMES_LINK_CONSOLE_GUIDE: Guide = {
  slug: 'epic-games-link-console',
  title: 'اتصال اکانت اپیک گیمز به پلی استیشن یا ایکس باکس',
  category: 'account',
  summary:
    'آموزش تصویری و گام‌به‌گام اتصال (Link) اکانت اپیک گیمز به پلی‌استیشن (PSN) و ایکس‌باکس در ۵ مرحله برای همگام‌سازی اسکین‌های فورتنایت و خرید وی‌باکس و کروپک.',
  publishedAt: '2026-04-20T00:00:00Z',
  updatedAt: '2026-10-31T00:00:00Z',
  game: {
    slug: 'fortnite',
    title: 'فورتنایت',
    titleEn: 'Fortnite',
    accentColor: '#00d4ff',
    iconImage: '/images/categories/large/fortnite.webp',
  },
  products: [],
  related: [],
  metaTitle: 'آموزش اتصال اکانت اپیک گیمز به پلی استیشن یا ایکس باکس | تایتان',
  metaDescription:
    'آموزش تصویری اتصال (Link) اکانت اپیک گیمز به پلی‌استیشن (PSN) و ایکس‌باکس در ۵ مرحله به همراه نکات محدودیت ۱ ساله تغییر اکانت.',
  noindex: false,
  ogImage: '/images/guides/epic-games-link-console/1.webp',
  canonicalUrl: '',
  body: `برای اینکه بتوانید آیتم‌ها، اسکین‌ها، بتل‌پس و پیشرفت بازی فورتنایت خود را بین کامپیوتر، موبایل و کنسول به اشتراک بگذارید و همچنین سفارش‌های [فروشگاه فورتنایت تایتان](/store/fortnite) مثل وی‌باکس، کروپک و پک‌های فورتنایت بدون مشکل روی اکانت شما شارژ شوند، باید اکانت **اپیک گیمز (Epic Games)** خود را به اکانت **پلی‌استیشن (PlayStation Network - PSN)** یا **ایکس‌باکس (Xbox)** متصل (Link) کنید. در این راهنمای تصویری، تمام ۵ مرحله اتصال اکانت را گام‌به‌گام بررسی می‌کنیم.

## مرحله اول: ورود به سایت اپیک گیمز و باز کردن بخش Account

ابتدا وارد [سایت رسمی اپیک گیمز (Epic Games)](https://www.epicgames.com/) شوید و با ایمیل و رمز عبور اکانت اپیک گیمز خود وارد شوید (اگر هنوز اکانت نساخته‌اید، ابتدا [آموزش تصویری ساخت اکانت اپیک گیمز](/guides/epic-games-account) را مشاهده کنید).

1. همان‌طور که در تصویر زیر با فلش قرمز مشخص شده است، در نوار بالای سایت (گوشه سمت راست) روی **نام کاربری یا آیکون پروفایل خود** کلیک کنید.
2. از منوی بازشده، روی گزینه **Account** کلیک کنید تا وارد پنل تنظیمات حساب کاربری شوید.

![مرحله اول اتصال اکانت اپیک گیمز به پلی استیشن یا ایکس باکس: کلیک روی پروفایل کاربری در سایت Epic Games و انتخاب گزینه Account](/images/guides/epic-games-link-console/1.webp)

## مرحله دوم: رفتن به بخش Linked accounts و انتخاب پلتفرم

پس از ورود به صفحه تنظیمات حساب، طبق راهنمای مشخص‌شده در تصویر زیر عمل کنید (همچنین می‌توانید مستقیماً وارد صفحه [مدیریت حساب‌های متصل در سایت اپیک گیمز](https://www.epicgames.com/account/connections) شوید):

1. از منوی سمت چپ صفحه (زیر بخش Account)، روی گزینه **Linked accounts** کلیک کنید.
2. در قسمت **Link an account**، پلتفرم کنسول مورد نظر خود را انتخاب کنید: برای اتصال به پلی‌استیشن روی **PlayStation™ Network** و برای اتصال به ایکس‌باکس روی **Xbox network** کلیک کنید.

![مرحله دوم اتصال اکانت اپیک گیمز به پلی استیشن یا ایکس باکس: کلیک روی Linked accounts و انتخاب پلتفرم PlayStation Network یا Xbox network](/images/guides/epic-games-link-console/2.webp)

## مرحله سوم: تایید قوانین اتصال و کلیک روی دکمه Continue

با انتخاب پلتفرم، پنجره تایید اتصال (**Link your account for PlayStation™ Network** یا **Xbox network**) باز می‌شود. در این صفحه توضیح داده شده است که با اتصال این دو اکانت، اطلاعات پروفایل، پیشرفت بازی و آیتم‌های خریداری‌شده با اکانت اپیک گیمز شما همگام‌سازی خواهد شد.

1. بررسی کنید که نام کاربری اپیک گیمز شما در پایین پنجره (**Signed in as ...**) درست باشد.
2. طبق فلش قرمز در تصویر زیر، روی دکمه آبی‌رنگ **Continue** کلیک کنید تا به درگاه رسمی سونی (PlayStation) یا مایکروسافت (Xbox) هدایت شوید.

![مرحله سوم اتصال اکانت اپیک گیمز به کنسول: کلیک روی دکمه آبی Continue در پنجره Link your account](/images/guides/epic-games-link-console/3.webp)

## مرحله چهارم: ورود به اکانت پلی‌استیشن (PSN) یا ساخت اکانت جدید

اکنون به صفحه رسمی ورود به حساب کنسول (مانند **Sign in to PlayStation** در سایت سونی) منتقل می‌شوید. مطابق کادرهای راهنمای فارسی در تصویر زیر، یکی از دو حالت زیر را انجام دهید:

1. **اگر اکانت پلی‌استیشن (یا ایکس‌باکس) دارید:** ایمیل اکانت کنسول خود را در کادر **Sign-In ID (Email Address)** وارد کنید، سپس روی دکمه **Next** بزنید و در مرحله بعد رمز عبور خود را وارد نمایید.
2. **اگر اکانت پلی‌استیشن (یا ایکس‌باکس) ندارید:** در پایین صفحه روی دکمه **Create an Account** کلیک کنید و یک اکانت جدید بسازید.

![مرحله چهارم اتصال اکانت اپیک گیمز به پلی استیشن: وارد کردن ایمیل اکانت PSN و کلیک روی Next یا ساخت اکانت جدید با Create an Account](/images/guides/epic-games-link-console/4.webp)

## مرحله پنجم: وارد کردن کد تایید ایمیل و تکمیل اتصال (Link)

در گام آخر، زمانی که اکانت پلی‌استیشن (PSN) یا ایکس‌باکس خود را وارد می‌کنید یا اکانت جدیدی می‌سازید، یک **کد تایید امنیتی (Verification Code)** به ایمیل شما ارسال می‌شود:

1. وارد صندوق ورودی (Inbox) ایمیل خود شوید (در صورت عدم مشاهده ایمیل، پوشه **Spam** یا **Junk** را نیز بررسی کنید).
2. کد تایید ارسال‌شده را در کادر مربوطه در صفحه پلی‌استیشن یا ایکس‌باکس وارد کرده و تایید نهایی را بزنید.
3. به محض وارد کردن کد تایید، به سایت اپیک گیمز بازگردانده می‌شوید و اکانت پلی‌استیشن یا ایکس‌باکس شما رسماً به اکانت اپیک گیمز **لینک (متصل)** می‌شود.

پس از تکمیل اتصال، می‌توانید اطلاعات اکانت خود را در [بخش اکانت‌های من در پنل تایتان](/dashboard/accounts) ذخیره کنید تا در زمان خرید از [فروشگاه فورتنایت تایتان](/store/fortnite) سفارش شما در سریع‌ترین زمان ممکن انجام شود.`,
  faqs: [
    {
      question: 'می‌توانم یک اکانت اپیک گیمز را چند بار به یک پلتفرم لینک کنم؟',
      answer:
        'هر اکانت اپیک گیمز در هر لحظه فقط به یک حساب از هر پلتفرم (یک اکانت PlayStation Network و یک اکانت Xbox) متصل می‌شود. اگر اکانت پلی‌استیشن یا ایکس‌باکس فعلی خود را از اپیک گیمز جدا (Unlink) کنید: ۱) هر زمان که بخواهید می‌توانید همان اکانت قبلی را بدون هیچ محدودیت زمانی دوباره لینک کنید. ۲) اما اگر بخواهید یک اکانت پلی‌استیشن یا ایکس‌باکس جدید و متفاوت را به اپیک گیمز خود لینک کنید، طبق قانون امنیتی اپیک گیمز محدودیت ۱ ساله (۳۶۵ روزه) وجود دارد؛ یعنی هر ۳۶۵ روز (یک سال) فقط یک بار می‌توانید محدودیت تغییر حساب را از بخش Linked accounts بردارید و یک اکانت جدید روی پلی‌استیشن یا ایکس‌باکس به اپیک گیمز خود متصل کنید.',
    },
    {
      question: 'چرا هنگام ورود به اکانت PSN یا ساخت اکانت جدید کد تایید ایمیل دریافت می‌کنم؟',
      answer:
        'برای تایید هویت و امنیت حساب، سونی (PlayStation) و مایکروسافت (Xbox) هنگام لینک شدن به اپیک گیمز یا ساخت حساب جدید یک کد تایید به ایمیل شما ارسال می‌کنند که با وارد کردن آن، اتصال دو اکانت نهایی و فعال می‌شود.',
    },
    {
      question: 'آیا با اتصال اکانت اپیک گیمز به پلی‌استیشن و ایکس‌باکس، اسکین‌ها و آیتم‌های فورتنایت من حفظ می‌شود؟',
      answer:
        'بله! تمام اسکین‌ها، بتل‌پس، ایموت‌ها و پیشرفت بازی شما روی اکانت اپیک گیمز ذخیره می‌شود و به محض لینک کردن اکانت PSN یا Xbox، تمام آیتم‌ها روی کنسول نیز در دسترس شما قرار می‌گیرد.',
    },
    {
      question: 'اگر هنگام اتصال با خطای This account is already linked مواجه شوم چه کار کنم؟',
      answer:
        'این پیغام یعنی اکانت پلی‌استیشن یا ایکس‌باکس شما قبلاً به یک اکانت اپیک گیمز دیگر متصل شده است. برای رفع آن ابتدا با گزینه PlayStation یا Xbox وارد سایت اپیک گیمز شوید، از بخش Linked accounts اتصال قبلی را Unlink کنید و سپس آن را به اکانت اصلی اپیک گیمز خود متصل نمایید.',
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

  list = list.map(item => {
    if (item.slug === EPIC_GAMES_ACCOUNT_GUIDE.slug) {
      return {
        ...item,
        title: EPIC_GAMES_ACCOUNT_GUIDE.title,
        summary: EPIC_GAMES_ACCOUNT_GUIDE.summary,
        updatedAt: EPIC_GAMES_ACCOUNT_GUIDE.updatedAt,
      };
    }
    if (item.slug === EPIC_GAMES_LINK_CONSOLE_GUIDE.slug) {
      return {
        ...item,
        title: EPIC_GAMES_LINK_CONSOLE_GUIDE.title,
        summary: EPIC_GAMES_LINK_CONSOLE_GUIDE.summary,
        updatedAt: EPIC_GAMES_LINK_CONSOLE_GUIDE.updatedAt,
      };
    }
    return item;
  });

  const matchesConsoleFilter =
    !params.product &&
    (!params.game || params.game === 'fortnite') &&
    (!params.category || params.category === 'account');

  if (
    matchesConsoleFilter &&
    !list.some(item => item.slug === EPIC_GAMES_LINK_CONSOLE_GUIDE.slug)
  ) {
    list = [...list, toSummary(EPIC_GAMES_LINK_CONSOLE_GUIDE)];
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
  if (slug === EPIC_GAMES_ACCOUNT_GUIDE.slug) {
    return remote
      ? {
          ...remote,
          title: EPIC_GAMES_ACCOUNT_GUIDE.title,
          summary: EPIC_GAMES_ACCOUNT_GUIDE.summary,
          body: EPIC_GAMES_ACCOUNT_GUIDE.body,
          faqs: EPIC_GAMES_ACCOUNT_GUIDE.faqs,
          metaTitle: EPIC_GAMES_ACCOUNT_GUIDE.metaTitle,
          metaDescription: EPIC_GAMES_ACCOUNT_GUIDE.metaDescription,
          updatedAt: EPIC_GAMES_ACCOUNT_GUIDE.updatedAt,
        }
      : EPIC_GAMES_ACCOUNT_GUIDE;
  }
  if (slug === EPIC_GAMES_LINK_CONSOLE_GUIDE.slug) {
    return remote
      ? {
          ...remote,
          title: EPIC_GAMES_LINK_CONSOLE_GUIDE.title,
          summary: EPIC_GAMES_LINK_CONSOLE_GUIDE.summary,
          body: EPIC_GAMES_LINK_CONSOLE_GUIDE.body,
          faqs: EPIC_GAMES_LINK_CONSOLE_GUIDE.faqs,
          metaTitle: EPIC_GAMES_LINK_CONSOLE_GUIDE.metaTitle,
          metaDescription: EPIC_GAMES_LINK_CONSOLE_GUIDE.metaDescription,
          updatedAt: EPIC_GAMES_LINK_CONSOLE_GUIDE.updatedAt,
        }
      : EPIC_GAMES_LINK_CONSOLE_GUIDE;
  }
  if (remote) return remote;
  if (slug === RANKS_GUIDE.slug) return RANKS_GUIDE;
  return null;
}

/** The guide a store or product page links to: its buying guide first. */
export function primaryGuide(guides: GuideSummary[]): GuideSummary | null {
  return guides.find(guide => guide.category === 'purchase') ?? guides[0] ?? null;
}
