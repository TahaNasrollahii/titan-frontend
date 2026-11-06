import { faNumber } from '@/lib/format';
import type { Product } from '@/lib/api/types';

export type BenefitIconKey = 'gift' | 'coin' | 'medal' | 'sun' | 'cube' | 'note' | 'bolt';

export interface CrewBenefitBlock {
  id: string;
  kicker: string;
  title: string;
  tag: string;
  p1: string;
  p2: string;
  link: string;
  href: string;
  link2: string;
  href2: string;
  grad: string;
  glow: string;
  ink: string;
  icon: BenefitIconKey;
}

export interface CrewComparisonRow {
  label: string;
  value: string;
}

export interface CrewRelatedLink {
  href: string;
  label: string;
}

export type FaqTextSegment =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; href: string };

export interface CrewFaqItem {
  question: string;
  answer: string;
  segments?: FaqTextSegment[];
}

export interface CrewPricingInfo {
  priceToman: number;
  originalPriceToman: number;
  discountPercent: number;
  priceFormatted: string;
  originalPriceFormatted: string;
  discountFormatted: string;
  deliveryTime: string;
}

export const CREW_ACCENT = '#f2b84b';
export const CREW_BG = '#0b0507';

export const CREW_PRICE_TOMAN = 589000;
export const CREW_ORIGINAL_PRICE_TOMAN = 790000;
export const CREW_DISCOUNT_PERCENT = 25;
export const CREW_DELIVERY_TIME = '۱۵ دقیقه تا ۲ ساعت';
export const CREW_VBUCKS_AMOUNT = '۱٬۰۰۰';

/**
 * Activation detail line for Step 2 ("ثبت اطلاعات اکانت").
 * Hard Rule 3: Never render bracketed placeholders. If empty, hide only that line
 * (keeping the step title and the rest of the step) and report as blocked on the owner.
 */
export const CREW_ACTIVATION_INFO: string = (
  process.env.NEXT_PUBLIC_CREW_ACTIVATION_INFO ?? ''
)
  .replace(/\[[^\]]*\]/g, '')
  .trim();

function formatCrewNumber(value: number): string {
  return faNumber(value).replace(/,/g, '٬');
}

export function resolveCrewPricing(product?: Product | null): CrewPricingInfo {
  const priceToman =
    typeof product?.price === 'number' && product.price > 0
      ? product.price
      : CREW_PRICE_TOMAN;
  const originalPriceToman =
    typeof product?.originalPrice === 'number' && product.originalPrice > priceToman
      ? product.originalPrice
      : CREW_ORIGINAL_PRICE_TOMAN;
  const discountPercent =
    typeof product?.discountPercent === 'number' && product.discountPercent > 0
      ? product.discountPercent
      : CREW_DISCOUNT_PERCENT;

  return {
    priceToman,
    originalPriceToman,
    discountPercent,
    priceFormatted: `${formatCrewNumber(priceToman)} تومان`,
    originalPriceFormatted: `${formatCrewNumber(originalPriceToman)} تومان`,
    discountFormatted: `${formatCrewNumber(discountPercent)}٪`,
    deliveryTime: CREW_DELIVERY_TIME,
  };
}

export const CREW_HERO_CONTENT = {
  eyebrow: 'اشتراک ماهانه Fortnite Crew',
  title: 'خرید کروپک فورتنایت',
  lead: 'با یک پرداخت ریالی به ۱٬۰۰۰ ویباکس، باندل اسکین ماه جاری، چهار پس فورتنایت و Rocket Pass پریمیوم دسترسی پیدا کنید. اشتراک کروپک فورتنایت از تایتان مستقیم روی اکانت شما فعال می‌شود.',
  factChips: [
    '۱٬۰۰۰ ویباکس ماهانه',
    'باندل اسکین جدید هر ماه',
    'Battle + OG + LEGO + Music Pass',
    'Rocket Pass راکت لیگ',
    'تحویل ۱۵ دقیقه تا ۲ ساعت',
  ],
  ctaLabel: 'افزودن به سبد خرید',
  carouselHint: 'کارت‌ها را ورق بزنید؛ روی کارت وسط کلیک کنید تا به توضیحاتش بروید.',
} as const;

export const CREW_INTRO_CONTENT = {
  kicker: 'کروپک چیست؟',
  title: 'اشتراک فورتنایت کرو چیست و چرا هر ماه عوض می‌شود؟',
  p1BeforeLink: 'اشتراک فورتنایت کرو یک عضویت ماهانه در بازی فورتنایت است و جزئیات رسمی‌اش در ',
  p1LinkLabel: 'صفحه Epic Games',
  p1LinkHref: 'https://www.fortnite.com/fortnite-crew-subscription',
  p1AfterLink:
    ' آمده. مزایای اصلی آن، یعنی ویباکس و دسترسی به پس‌ها، ثابت است؛ اما باندل اسکین و آیتم‌های ظاهری هر ماه با کاراکتر جدیدی عوض می‌شود.',
  p2: 'این تغییر روز اول هر ماه میلادی انجام می‌شود، یعنی ساعت ۰۳:۳۰ بامداد به وقت ایران (۰۰:۰۰ UTC). اسکین‌ها، بک‌بلینگ‌ها، پیک‌اکس‌ها و ۱٬۰۰۰ ویباکسی که در دوره اشتراک می‌گیرید دائمی‌اند و بعد از پایان دوره هم در لاکر شما می‌مانند.',
  p3: 'به ازای هر ماه فعال بودن اشتراک، یک استایل ویژه (مثل طلایی، منجمد، فازی و کهکشانی) برای اسکین‌های کروپک قبلی‌تان باز می‌شود. اگر وسط ماه میلادی کروپک را بخرید، چون اشتراک ۳۰ روز اعتبار دارد، اسکین ماه بعد را هم روز اول ماه جدید دریافت می‌کنید.',
} as const;

export const CREW_BENEFITS_HEADER = {
  kicker: 'مزایا',
  title: 'با خرید کروپک فورتنایت هر ماه چه چیزی می‌گیرید؟',
} as const;

export const CREW_BENEFIT_BLOCKS: CrewBenefitBlock[] = [
  {
    id: 'b-0',
    kicker: 'هر ماه یک کاراکتر جدید',
    title: 'باندل اسکین انحصاری ماه (Crew Pack)',
    tag: 'باندل ماهانه',
    p1: 'هر ماه یک باندل مخصوص مشترکین کروپک منتشر می‌شود. این باندل شامل اسکین اصلی ماه، نسخه استایل لگو، بک‌بلینگ و پیک‌اکس است و گاهی گلایدر یا صفحه لودینگ اختصاصی هم دارد.',
    p2: 'Epic Games اول هر ماه میلادی این ست را با کاراکتر جدیدی عوض می‌کند. آیتم‌هایی که دریافت کرده‌اید برای همیشه در لاکر شما می‌مانند. آیتم‌های دیگر را هم می‌توانید در آیتم‌شاپ امروز ببینید.',
    link: 'آیتم‌شاپ امروز',
    href: '/fortnite-shop',
    link2: 'همه محصولات فورتنایت',
    href2: '/store/fortnite',
    grad: 'linear-gradient(150deg,#4a1626,#1a0910 70%)',
    glow: 'rgba(242,184,75,.35)',
    ink: '#f2b84b',
    icon: 'gift',
  },
  {
    id: 'b-1',
    kicker: 'ارز اصلی بازی',
    title: '۱٬۰۰۰ ویباکس ماهانه',
    tag: 'ویباکس',
    p1: 'بعد از فعال‌سازی، ۱٬۰۰۰ ویباکس به موجودی حساب شما اضافه می‌شود. با آن می‌توانید اسکین، ایموت و باندل‌های آیتم‌شاپ روزانه فورتنایت را بخرید و بعد از پایان اشتراک هم ویباکس‌ها باقی می‌مانند.',
    p2: 'اگر این ماه کروپک را فعال کرده‌اید و برای یک باندل خاص به ۲٬۸۰۰ یا ۵٬۰۰۰ ویباکس نیاز دارید، خرید مستقیم ویباکس انتخاب بهتری است.',
    link: 'خرید ویباکس فورتنایت',
    href: '/product/fortnite-vbucks',
    link2: 'راهنمای خرید',
    href2: '/guides',
    grad: 'linear-gradient(150deg,#1b2c4a,#0a0f1a 70%)',
    glow: 'rgba(120,180,255,.35)',
    ink: '#9fc6ff',
    icon: 'coin',
  },
  {
    id: 'b-2',
    kicker: 'بدون پرداخت جداگانه',
    title: 'دسترسی کامل به بتل‌پس اصلی',
    tag: 'Battle Pass',
    p1: 'جوایز پریمیوم بتل‌پس سیزن جاری بدون خرج کردن ۱٬۰۰۰ ویباکس برای شما باز می‌شود. با بازی کردن، مرحله‌به‌مرحله جوایز را برمی‌دارید.',
    p2: 'پیشروی در پس علاوه بر اسکین و آیتم، می‌تواند ویباکس پاداش هم بدهد. به همین دلیل بازیکنان فعال از اشتراک سود بیشتری می‌برند.',
    link: 'راهنمای بتل‌پس',
    href: '/guides',
    link2: 'سوالات متداول',
    href2: '/faq',
    grad: 'linear-gradient(150deg,#4a2a10,#1a0e06 70%)',
    glow: 'rgba(255,160,70,.35)',
    ink: '#ffb866',
    icon: 'medal',
  },
  {
    id: 'b-3',
    kicker: 'حالت کلاسیک',
    title: 'OG Pass؛ پس نسخه کلاسیک فورتنایت',
    tag: 'OG Pass',
    p1: 'جوایز پریمیوم OG Pass، یعنی پس حالت کلاسیک فورتنایت، هم‌زمان با بقیه پس‌ها برای شما باز می‌شود. قبلاً این پس را باید جداگانه با ۱٬۰۰۰ ویباکس می‌خریدید.',
    p2: 'اگر بیشتر وقت‌تان را در حالت اوجی می‌گذرانید، همین مزیت به‌تنهایی ارزش اشتراک را بالا می‌برد.',
    link: 'محصولات فورتنایت',
    href: '/store/fortnite',
    link2: 'تورنومنت‌های تایتان',
    href2: '/tournament',
    grad: 'linear-gradient(150deg,#14382f,#08130f 70%)',
    glow: 'rgba(90,220,170,.3)',
    ink: '#7be0c3',
    icon: 'sun',
  },
  {
    id: 'b-4',
    kicker: 'برای سازنده‌ها',
    title: 'LEGO Pass؛ جوایز حالت لگو',
    tag: 'LEGO Pass',
    p1: 'لگو پس جوایز پریمیوم حالت لگو را باز می‌کند و با اشتراک فعال، همه‌اش در دسترس شماست. خرید جداگانه آن ۱٬۴۰۰ ویباکس ارزش دارد.',
    p2: 'باندل ماهانه کروپک هم یک نسخه استایل لگو دارد، پس طرفداران این حالت از هر دو سمت سود می‌برند.',
    link: 'ارتباط با پشتیبانی',
    href: '/contact',
    link2: 'قوانین و شرایط',
    href2: '/terms',
    grad: 'linear-gradient(150deg,#4a1a3a,#170a13 70%)',
    glow: 'rgba(255,110,190,.3)',
    ink: '#ff9fd6',
    icon: 'cube',
  },
  {
    id: 'b-5',
    kicker: 'برای موسیقی‌دوست‌ها',
    title: 'Music Pass؛ جوایز حالت فستیوال',
    tag: 'Music Pass',
    p1: 'موزیک پس برای طرفداران حالت فستیوال است. با اشتراک فعال، جوایز پریمیوم آن را هم‌زمان با بقیه پس‌ها باز می‌کنید.',
    p2: 'خرید جداگانه این پس ۱٬۴۰۰ ویباکس می‌شود. برای دیدن بقیه محصولات بازی هم می‌توانید به فروشگاه تایتان سر بزنید.',
    link: 'فروشگاه تایتان',
    href: '/store',
    link2: 'آیتم‌شاپ امروز',
    href2: '/fortnite-shop',
    grad: 'linear-gradient(150deg,#2f1a4a,#100a1a 70%)',
    glow: 'rgba(180,140,255,.35)',
    ink: '#c9a7ff',
    icon: 'note',
  },
  {
    id: 'b-6',
    kicker: 'هدیه‌ای در راکت لیگ',
    title: 'Rocket Pass پریمیوم راکت لیگ',
    tag: 'Rocket Pass',
    p1: 'اگر با همان حساب اپیک گیمز وارد راکت لیگ شوید، بتل‌پس پریمیوم فصل جاری Rocket League به‌همراه ماشین و آیتم‌های مشترک با فورتنایت خودکار برایتان فعال می‌شود.',
    p2: 'برای دریافت آن کار اضافه‌ای لازم نیست؛ فقط با همان حساب وارد بازی شوید. اگر سوالی داشتید، پشتیبانی تایتان کمک‌تان می‌کند.',
    link: 'محصولات فورتنایت',
    href: '/store/fortnite',
    link2: 'ارتباط با پشتیبانی',
    href2: '/contact',
    grad: 'linear-gradient(150deg,#15304a,#08121a 70%)',
    glow: 'rgba(80,200,255,.3)',
    ink: '#78d4ff',
    icon: 'bolt',
  },
];

export const CREW_ACTIVATION_CONTENT = {
  kicker: 'فعال‌سازی',
  title: 'نحوه فعال‌سازی و تحویل کروپک فورتنایت در تایتان',
  subtitle: 'فعال‌سازی به‌صورت مستقیم روی حساب اپیک گیمز شما انجام می‌شود و فقط چهار مرحله دارد.',
  steps: [
    {
      num: '۱',
      title: 'ثبت سفارش و پرداخت',
      text: 'روی «افزودن به سبد خرید» بزنید و هزینه را با کارت شتاب یا کیف پول تایتان بپردازید.',
    },
    {
      num: '۲',
      title: 'ثبت اطلاعات اکانت',
      consoleBeforeLink: 'اگر حساب کنسول‌تان متصل نیست، از بخش اتصال حساب‌ها در ',
      consoleLinkLabel: 'Epic Games',
      consoleLinkHref: 'https://www.epicgames.com',
      consoleAfterLink: ' وصلش کنید.',
    },
    {
      num: '۳',
      title: 'فعال‌سازی اشتراک',
      text: 'کارشناسان تایتان اشتراک یک‌ماهه را روی حساب شما فعال می‌کنند. اگر پشتیبانی کد یا اطلاعات اضافه‌ای خواست، فقط از همین سایت یا تیکت رسمی بدهید.',
    },
    {
      num: '۴',
      title: 'خاموش شدن تمدید خودکار',
      text: 'تمدید خودکار خاموش می‌شود تا بعد از ۳۰ روز هزینه‌ای از حساب شما کسر نشود.',
    },
  ],
} as const;

export const CREW_PRICE_DELIVERY_CONTENT = {
  kicker: 'قیمت و تحویل',
  title: 'قیمت کروپک فورتنایت، روش پرداخت و زمان تحویل',
  subtitle:
    'برای خرید اشتراک Fortnite Crew لازم نیست پرداخت دلاری انجام دهید. سفارش را با کارت بانکی عضو شتاب ثبت کنید.',
  guideBeforeLink: 'برای جزئیات بیشتر قبل از خرید، ',
  guideLinkLabel: 'راهنمای جامع خرید کروپک فورتنایت در ایران',
  guideLinkHref: '/guides',
  guideAfterLink: ' را بخوانید.',
} as const;

export const CREW_COMPARISON_CONTENT = {
  kicker: 'مقایسه',
  title: 'کروپک بهتر است یا خرید مستقیم ویباکس و بتل‌پس؟',
  p1: 'بسیاری از بازیکنان موقع شروع سیزن جدید بین خرید بتل‌پس، تهیه مستقیم ویباکس و خرید کروپک مردد می‌شوند. اگر همه پس‌ها را می‌خواهید، کروپک معمولاً انتخاب به‌صرفه‌تری است، چون همه آن‌ها را به‌علاوه یک اسکین انحصاری یک‌جا می‌دهد.',
  p2BeforeVbucks:
    'اما اگر این ماه کروپک را فعال کرده‌اید و فقط برای یک باندل یا اسکین خاص به ۲٬۸۰۰ یا ۵٬۰۰۰ ویباکس نیاز دارید، صفحه ',
  p2VbucksLabel: 'خرید ویباکس فورتنایت',
  p2VbucksHref: '/product/fortnite-vbucks',
  p2BetweenLinks: ' گزینه مناسب‌تری است. قوانین هم‌پوشانی پس‌ها و اشتراک را در ',
  p2EpicLabel: 'مرکز راهنمای Epic Games',
  p2EpicHref: 'https://www.epicgames.com',
  p2AfterEpic: ' ببینید.',
  tableHeading: 'ارزش خرید جداگانه (به ویباکس)',
} as const;

export const CREW_COMPARISON_ROWS: CrewComparisonRow[] = [
  { label: 'ویباکس ماهانه', value: '۱٬۰۰۰' },
  { label: 'بتل‌پس اصلی', value: '۱٬۰۰۰' },
  { label: 'OG Pass', value: '۱٬۰۰۰' },
  { label: 'LEGO Pass', value: '۱٬۴۰۰' },
  { label: 'Music Pass', value: '۱٬۴۰۰' },
];

export const CREW_COMPARISON_TOTAL: CrewComparisonRow = {
  label: 'مجموع، به‌علاوه Rocket Pass',
  value: 'بیش از ۵٬۸۰۰',
};

export const CREW_SUPPORT_CONTENT = {
  kicker: 'پشتیبانی',
  title: 'پشتیبانی ۲۴ ساعته سفارش و بازگشت وجه',
  beforeLink:
    'همه سفارش‌های تایتان در پنل کاربری، بخش «سفارش‌های من»، قابل پیگیری‌اند و پشتیبانی آنلاین ۲۴ ساعته از طریق چت سایت و تیکت پاسخ‌گوی شماست. اگر به دلیل فنی از سمت فروشگاه اشتراک در بازه اعلام‌شده فعال نشود، مبلغ پرداختی طبق ',
  linkLabel: 'قوانین و مقررات تایتان',
  linkHref: '/terms',
  afterLink: ' به کارت بانکی یا کیف پول شما برگردانده می‌شود.',
} as const;

export const CREW_RELATED_HEADER = {
  kicker: 'ادامه مسیر',
  title: 'قبل از خرید این صفحات را ببینید',
} as const;

export const CREW_RELATED_LINKS: CrewRelatedLink[] = [
  { href: '/product/fortnite-vbucks', label: 'خرید ویباکس فورتنایت' },
  { href: '/fortnite-shop', label: 'آیتم‌شاپ امروز' },
  { href: '/store/fortnite', label: 'همه محصولات فورتنایت' },
  { href: '/guides', label: 'آموزش‌ها و راهنمای خرید' },
  { href: '/tournament', label: 'تورنومنت‌های تایتان' },
  { href: '/faq', label: 'سوالات متداول' },
  { href: '/terms', label: 'قوانین و شرایط تحویل' },
  { href: '/contact', label: 'ارتباط با پشتیبانی' },
];

export const CREW_FAQ_HEADER = {
  kicker: 'پرسش‌ها',
  title: 'سوالات متداول درباره خرید کروپک فورتنایت',
  beforeContact: 'پاسخ سوال شما اینجا نبود؟ از ',
  contactLabel: 'پشتیبانی',
  contactHref: '/contact',
  betweenLinks: ' بپرسید یا ',
  faqLabel: 'همه سوالات',
  faqHref: '/faq',
  afterFaq: ' را ببینید.',
} as const;

export const CREW_FAQ_ITEMS: CrewFaqItem[] = [
  {
    question: 'کروپک فورتنایت چند روز اعتبار دارد؟',
    answer:
      'اشتراک یک‌ماهه ۳۰ روز اعتبار دارد. در تایتان تمدید خودکار خاموش می‌شود، پس بعد از پایان دوره چیزی از حساب شما کم نمی‌شود.',
  },
  {
    question: 'آیا اسکین و ویباکس بعد از پایان اشتراک می‌ماند؟',
    answer:
      'بله. اسکین‌ها، بک‌بلینگ‌ها، پیک‌اکس‌ها و ۱٬۰۰۰ ویباکس دریافتی دائمی‌اند و در لاکر شما می‌مانند. فقط دسترسی به جوایز پریمیوم پس‌ها به فعال بودن اشتراک بستگی دارد.',
  },
  {
    question: 'اسکین کروپک چه زمانی عوض می‌شود؟',
    answer:
      'روز اول هر ماه میلادی، ساعت ۰۳:۳۰ بامداد به وقت ایران. با هر بار ثبت سفارش، پکیج ماه جاری روی حساب شما فعال می‌شود.',
  },
  {
    question: 'قیمت کروپک فورتنایت در تایتان چقدر است؟',
    answer:
      'قیمت اشتراک یک‌ماهه ۵۸۹٬۰۰۰ تومان است، با ۲۵٪ تخفیف نسبت به قیمت پایه ۷۹۰٬۰۰۰ تومان. قیمت همیشه در بالای همین صفحه به‌روز نمایش داده می‌شود.',
  },
  {
    question: 'فعال‌سازی کروپک چقدر طول می‌کشد؟',
    answer:
      'بین ۱۵ دقیقه تا حداکثر ۲ ساعت بعد از ثبت نهایی سفارش، در ساعات کاری. سفارش را از پنل کاربری، بخش «سفارش‌های من»، پیگیری کنید.',
  },
  {
    question: 'کروپک روی چه پلتفرم‌هایی کار می‌کند؟',
    answer:
      'چون اشتراک روی حساب اپیک گیمز فعال می‌شود، روی PC، PS4، PS5، Xbox، Nintendo Switch و موبایل قابل استفاده است.',
  },
  {
    question: 'فرق کروپک با خرید ویباکس چیست؟',
    answer:
      'کروپک یک اشتراک ماهانه با ۱٬۰۰۰ ویباکس، باندل اسکین و دسترسی به پس‌هاست؛ ویباکس فقط ارز بازی است و هر مقدار لازم دارید می‌خرید. بسته‌های ویباکس را ببینید.',
    segments: [
      {
        type: 'text',
        value:
          'کروپک یک اشتراک ماهانه با ۱٬۰۰۰ ویباکس، باندل اسکین و دسترسی به پس‌هاست؛ ویباکس فقط ارز بازی است و هر مقدار لازم دارید می‌خرید. ',
      },
      { type: 'link', label: 'بسته‌های ویباکس', href: '/product/fortnite-vbucks' },
      { type: 'text', value: ' را ببینید.' },
    ],
  },
  {
    question: 'اگر اشتراک فعال نشد چه می‌شود؟',
    answer:
      'وجه پرداختی طبق قوانین تایتان به کارت بانکی یا کیف پول شما بازگردانده می‌شود. پشتیبانی ۲۴ ساعته از طریق چت و تیکت در کنار شماست.',
    segments: [
      { type: 'text', value: 'وجه پرداختی طبق ' },
      { type: 'link', label: 'قوانین تایتان', href: '/terms' },
      {
        type: 'text',
        value: ' به کارت بانکی یا کیف پول شما بازگردانده می‌شود. پشتیبانی ۲۴ ساعته از طریق ',
      },
      { type: 'link', label: 'چت و تیکت', href: '/contact' },
      { type: 'text', value: ' در کنار شماست.' },
    ],
  },
];

export const CREW_SEO_METADATA = {
  title: 'خرید کروپک فورتنایت | اشتراک Fortnite Crew با ۱٬۰۰۰ ویباکس | تایتان',
  description:
    'خرید کروپک فورتنایت با ۱٬۰۰۰ ویباکس، باندل اسکین ماهانه و همه پس‌ها. قیمت ۵۸۹٬۰۰۰ تومان، تحویل ۱۵ دقیقه تا ۲ ساعت. همین حالا سفارش دهید.',
  ogImagePath: '/images/og/fortnite-crew-titan-og.png',
  ogImageAlt: 'خرید کروپک فورتنایت — اشتراک ماهانه Fortnite Crew در فروشگاه تایتان',
} as const;

export const CREW_FINAL_CTA_CONTENT = {
  title: 'آماده فعال‌سازی کروپک فورتنایت هستید؟',
  subtitle: '۵۸۹٬۰۰۰ تومان، تحویل ۱۵ دقیقه تا ۲ ساعت و پشتیبانی ۲۴ ساعته.',
  ctaLabel: 'افزودن به سبد خرید',
  ctaHref: '#buy',
} as const;

