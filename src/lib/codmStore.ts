/* eslint-disable @typescript-eslint/no-explicit-any */

export type CodmRegionKey = 'us' | 'ae' | 'in' | 'gb' | 'tr';

export type CodmFilterCategory = 'all' | 'cp' | 'bundle' | 'event' | 'freebie';

export interface CodmRegionConfig {
  key: CodmRegionKey;
  pathSlug: string;
  nameEn: string;
  nameFa: string;
  currency: string;
  currencySymbol: string;
  flag: string;
}

export const CODM_REGIONS: CodmRegionConfig[] = [
  {
    key: 'us',
    pathSlug: 'en-us',
    nameEn: 'United States (Global)',
    nameFa: 'گلوبال / آمریکا (USD)',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
  },
  {
    key: 'ae',
    pathSlug: 'en-ae',
    nameEn: 'United Arab Emirates',
    nameFa: 'امارات / خاورمیانه (AED)',
    currency: 'AED',
    currencySymbol: 'AED',
    flag: '🇦🇪',
  },
  {
    key: 'in',
    pathSlug: 'en-in',
    nameEn: 'India',
    nameFa: 'ریجن هند (INR)',
    currency: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
  },
  {
    key: 'gb',
    pathSlug: 'en-gb',
    nameEn: 'United Kingdom',
    nameFa: 'انگلستان / اروپا (GBP)',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
  },
  {
    key: 'tr',
    pathSlug: 'tr-tr',
    nameEn: 'Turkey',
    nameFa: 'ریجن ترکیه (TRY)',
    currency: 'TRY',
    currencySymbol: 'TL',
    flag: '🇹🇷',
  },
];

export interface CodmPackageItem {
  id: string;
  title: string;
  titleFa: string;
  description: string | null;
  descriptionFa: string | null;
  image: string | null;
  itemTypeFa: string;
}

export interface CodmPurchaseLimit {
  limit: number | null;
  remaining: number | null;
  refreshType: string | null;
  refreshTime: string | null;
  endTime: string | null;
}

export interface CodmStoreOffer {
  id: string;
  title: string;
  titleFa: string;
  subtitle: string | null;
  subtitleFa: string | null;
  descriptionFa: string;
  image: string;
  bannerImage: string | null;
  category: Exclude<CodmFilterCategory, 'all'>;
  categoryFa: string;
  sectionId: number;
  sectionName: string;
  sectionNameFa: string;
  baseCp: number;
  bonusCp: number;
  totalCp: number;
  bonusPercent: number;
  price: number;
  regularPrice: number;
  discountAmount: number;
  discountPercent: number;
  currency: string;
  currencySymbol: string;
  formattedPrice: string;
  formattedRegularPrice: string | null;
  isFreebie: boolean;
  isPackage: boolean;
  packageItems: CodmPackageItem[];
  isPopular: boolean;
  isHighlighted: boolean;
  isFirstPurchaseOffer: boolean;
  isFirstPurchaseDiscount: boolean;
  webStoreExclusive: boolean;
  purchaseLimit: CodmPurchaseLimit | null;
  sortOrder: number;
}

export interface CodmStoreSection {
  id: number;
  uuid: string;
  name: string;
  nameFa: string;
  description: string | null;
  descriptionFa: string | null;
  imageUrl: string | null;
  themeBgImageUrl: string | null;
  themeHeadlineColor: string | null;
  themeSupportColor: string | null;
  sortOrder: number;
  offers: CodmStoreOffer[];
}

export interface CodmStoreData {
  fetchedAt: string;
  nextRevalidateAt: string;
  region: CodmRegionKey;
  regionNameEn: string;
  regionNameFa: string;
  currency: string;
  currencySymbol: string;
  sourceUrl: string;
  isFallback: boolean;
  totalOffers: number;
  cpPacksCount: number;
  bundlesCount: number;
  freebiesCount: number;
  maxBonusPercent: number;
  maxDiscountPercent: number;
  featuredBannerUrl: string | null;
  featuredSkuId: string | null;
  sections: CodmStoreSection[];
  offers: CodmStoreOffer[];
}

export const CODM_REVALIDATE_SECONDS = 1800; // 30 minutes

const SECTION_NAME_FA_MAP: Record<string, string> = {
  'cp': 'بسته‌های سی‌پی (COD Points)',
  'gifts': 'هدایای رایگان وباستور',
  'halloween': 'باندل‌های ویژه هالووین (Halloween)',
  'honkai impact 3rd': 'رویداد همکاری Honkai Impact 3rd',
  'day of the dead': 'رویداد روز مردگان (Day of the Dead)',
};

const SECTION_DESC_FA_MAP: Record<string, string> = {
  'cp': 'بسته‌های رسمی سی‌پی کالاف دیوتی موبایل به همراه بونوس انحصاری وباستور و تخفیف‌های اولین خرید.',
  'gifts': 'هدایا و جعبه‌های شانس رایگانی که با ورود روزانه به وباستور رسمی کالاف دیوتی موبایل قابل دریافت هستند.',
  'halloween': 'پکیج‌ها و باندل‌های محدود فصل هالووین شامل سی‌پی به همراه اسکین‌های سلاح، چاقو و چتر نجات.',
  'honkai impact 3rd': 'امتیازهای ویژه رویداد Honkai قابل استفاده در بخش Herrscher’s Armory و پیشنهاد دو برابر سی‌پی.',
  'day of the dead': 'پکیج‌های ترکیبی سی‌پی به همراه کریت‌های (جعبه‌های شانس) Ghost Town.',
};

export function resolveCodmRegion(raw?: string | null): CodmRegionConfig {
  const key = (raw || 'us').toLowerCase().trim() as CodmRegionKey;
  return CODM_REGIONS.find(r => r.key === key) || CODM_REGIONS[0];
}

function unflattenNuxtPayload(arr: any[]): any {
  const memo = new Map<number, any>();

  function resolve(idx: number): any {
    if (typeof idx !== 'number' || idx < 0 || idx >= arr.length) return idx;
    if (memo.has(idx)) return memo.get(idx);

    const val = arr[idx];
    if (val === null || typeof val !== 'object') return val;

    if (Array.isArray(val)) {
      const tag = val[0];
      if (
        tag === 'ShallowReactive' ||
        tag === 'Reactive' ||
        tag === 'ShallowRef' ||
        tag === 'Ref'
      ) {
        const res = resolve(val[1]);
        memo.set(idx, res);
        return res;
      }
      if (tag === 'Set') {
        const res = val.slice(1).map(resolve);
        memo.set(idx, res);
        return res;
      }
      const res: any[] = [];
      memo.set(idx, res);
      for (const item of val) {
        res.push(resolve(item));
      }
      return res;
    }

    const res: Record<string, any> = {};
    memo.set(idx, res);
    for (const [k, v] of Object.entries(val)) {
      res[k] = resolve(v as number);
    }
    return res;
  }

  return resolve(0);
}

function stripHtml(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw
    .replace(/<br\s*\/?>/gi, ' — ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || null;
}

function parseCpAmounts(
  title: string,
  subtitle: string | null,
  displayId: string,
): { baseCp: number; bonusCp: number; totalCp: number; bonusPercent: number } {
  const sub = subtitle || '';

  // Pattern 1: "800 + 160 WEB BONUS"
  const webBonusMatch = sub.match(/(\d[\d,]*)\s*\+\s*(\d[\d,]*)\s*WEB\s*BONUS/i);
  if (webBonusMatch) {
    const baseCp = parseInt(webBonusMatch[1].replace(/,/g, ''), 10) || 0;
    const bonusCp = parseInt(webBonusMatch[2].replace(/,/g, ''), 10) || 0;
    const totalCp = baseCp + bonusCp;
    const bonusPercent = baseCp > 0 ? Math.round((bonusCp / baseCp) * 100) : 0;
    return { baseCp, bonusCp, totalCp, bonusPercent };
  }

  // Pattern 2: "80CP + 80CP ..." in title
  const doubleCpMatch = title.match(/(\d[\d,]*)\s*CP\s*\+\s*(\d[\d,]*)\s*CP/i);
  if (doubleCpMatch) {
    const baseCp = parseInt(doubleCpMatch[1].replace(/,/g, ''), 10) || 0;
    const bonusCp = parseInt(doubleCpMatch[2].replace(/,/g, ''), 10) || 0;
    const totalCp = baseCp + bonusCp;
    const bonusPercent = baseCp > 0 ? Math.round((bonusCp / baseCp) * 100) : 0;
    return { baseCp, bonusCp, totalCp, bonusPercent };
  }

  // Pattern 3: CODMSTORE-880-20_960_160
  const idMatch = displayId.match(/^CODMSTORE-\d+-(\d+)_(\d+)_(\d+)$/i);
  if (idMatch) {
    const totalCp = parseInt(idMatch[2], 10) || 0;
    const bonusCp = parseInt(idMatch[3], 10) || 0;
    const baseCp = Math.max(0, totalCp - bonusCp);
    const bonusPercent = baseCp > 0 ? Math.round((bonusCp / baseCp) * 100) : parseInt(idMatch[1], 10) || 0;
    return { baseCp, bonusCp, totalCp, bonusPercent };
  }

  // Pattern 4: Standalone "5,400 CP" in title or subtitle
  const standaloneMatch = (title + ' ' + sub).match(/(\d[\d,]*)\s*CP\b/i);
  if (standaloneMatch) {
    const totalCp = parseInt(standaloneMatch[1].replace(/,/g, ''), 10) || 0;
    return { baseCp: totalCp, bonusCp: 0, totalCp, bonusPercent: 0 };
  }

  return { baseCp: 0, bonusCp: 0, totalCp: 0, bonusPercent: 0 };
}

function formatRegionalPrice(amount: number, currency: string, currencySymbol: string): string {
  if (amount <= 0) return 'رایگان';
  const formattedNum = Number.isInteger(amount)
    ? amount.toLocaleString('en-US')
    : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (currency === 'USD' || currency === 'GBP' || currency === 'INR') {
    return `${currencySymbol}${formattedNum}`;
  }
  return `${formattedNum} ${currencySymbol || currency}`;
}

function translatePackageItem(rawTitle: string, rawDesc?: string | null): {
  titleFa: string;
  descriptionFa: string | null;
  itemTypeFa: string;
} {
  const cleanTitle = rawTitle.trim();
  const upper = cleanTitle.toUpperCase();

  if (upper.includes('FANGS OUT GUN')) {
    return {
      titleFa: 'اسکین سلاح Fangs Out',
      descriptionFa: 'اسکین اختصاصی سلاح از مجموعه هالووین Fangs Out',
      itemTypeFa: 'اسکین سلاح',
    };
  }
  if (upper.includes('FANGS OUT KNIFE')) {
    return {
      titleFa: 'اسکین چاقوی Fangs Out',
      descriptionFa: 'اسکین سلاح سرد (چاقو) از مجموعه هالووین Fangs Out',
      itemTypeFa: 'سلاح سرد',
    };
  }
  if (upper.includes('PARACHUTE')) {
    return {
      titleFa: 'چتر نجات ویژه هالووین',
      descriptionFa: 'اسکین چتر نجات انحصاری بتل رویال (Halloween Parachute)',
      itemTypeFa: 'چتر نجات',
    };
  }
  if (upper.includes('SILK SPINNER') || upper.includes('M4LMG')) {
    return {
      titleFa: 'سلاح اپیک M4LMG - Silk Spinner',
      descriptionFa: 'بلوپرینت اپیک سلاح M4LMG با طرح Silk Spinner',
      itemTypeFa: 'سلاح اپیک (Epic)',
    };
  }
  if (upper.includes('HONKAI AVATAR')) {
    return {
      titleFa: 'آواتار انحصاری Honkai (All Hail Homu)',
      descriptionFa: 'آواتار پروفایل ویژه رویداد همکاری با طرح All Hail Homu!',
      itemTypeFa: 'آواتار پروفایل',
    };
  }
  if (upper.includes('WEAPON XP')) {
    const countMatch = upper.match(/(\d[\d,]*)/);
    const countFa = countMatch ? parseInt(countMatch[1].replace(/,/g, ''), 10).toLocaleString('fa-IR') : '';
    return {
      titleFa: `${countFa} کارت ارتقای سلاح (Weapon XP)`,
      descriptionFa: 'کارت تجربه برای ارتقای سریع لول و اتچمنت‌های سلاح در Gunsmith',
      itemTypeFa: 'کارت XP سلاح',
    };
  }
  if (upper.includes('CP')) {
    const doubleMatch = upper.match(/(\d[\d,]*)\s*CP\s*\+\s*(\d[\d,]*)\s*CP/);
    if (doubleMatch) {
      const a = parseInt(doubleMatch[1].replace(/,/g, ''), 10);
      const b = parseInt(doubleMatch[2].replace(/,/g, ''), 10);
      return {
        titleFa: `${(a + b).toLocaleString('fa-IR')} سی‌پی (${a.toLocaleString('fa-IR')} + ${b.toLocaleString('fa-IR')} بونوس)`,
        descriptionFa: 'اعتبار رسمی سی‌پی برای خرید بتل‌پس، گردونه شانس و باندل‌های درون بازی',
        itemTypeFa: 'ارز درون‌بازی (CP)',
      };
    }
    const cpMatch = upper.match(/(\d[\d,]*)\s*CP/);
    if (cpMatch) {
      const cpVal = parseInt(cpMatch[1].replace(/,/g, ''), 10);
      return {
        titleFa: `${cpVal.toLocaleString('fa-IR')} سی‌پی کالاف دیوتی موبایل`,
        descriptionFa: 'اعتبار رسمی سی‌پی قابل استفاده در تمامی بخش‌های فروشگاه درون بازی',
        itemTypeFa: 'ارز درون‌بازی (CP)',
      };
    }
  }

  return {
    titleFa: cleanTitle,
    descriptionFa: stripHtml(rawDesc),
    itemTypeFa: 'آیتم بونوس',
  };
}

function buildPersianOfferCopy(params: {
  title: string;
  subtitle: string | null;
  category: Exclude<CodmFilterCategory, 'all'>;
  baseCp: number;
  bonusCp: number;
  totalCp: number;
  bonusPercent: number;
  discountPercent: number;
  isFPO: boolean;
  isFPD: boolean;
}): { titleFa: string; subtitleFa: string | null; descriptionFa: string } {
  const {
    title,
    subtitle,
    category,
    baseCp,
    bonusCp,
    totalCp,
    bonusPercent,
    discountPercent,
    isFPO,
    isFPD,
  } = params;

  const upperTitle = title.toUpperCase();
  const upperSub = (subtitle || '').toUpperCase();

  if (category === 'freebie' || upperTitle.includes('DAILY GIFT')) {
    return {
      titleFa: 'هدیه رایگان روزانه وباستور',
      subtitleFa: '۲ عدد جعبه مخفی لجندری (2X Legendary Secret Cache)',
      descriptionFa:
        'دریافت رایگان ۲ عدد جعبه مخفی لجندری (Secret Cache) ویژه کاربران وباستور رسمی کالاف دیوتی موبایل؛ قابل دریافت یک‌بار در هر روز.',
    };
  }

  if (category === 'cp') {
    if (isFPO) {
      return {
        titleFa: `بسته ${totalCp.toLocaleString('fa-IR')} سی‌پی (پیشنهاد ۲ برابر خرید اول)`,
        subtitleFa: `${baseCp.toLocaleString('fa-IR')} سی‌پی پایه + ${bonusCp.toLocaleString('fa-IR')} سی‌پی بونوس رایگان (۱۰۰٪ بونوس)`,
        descriptionFa: `پیشنهاد انحصاری اولین خرید در وباستور: دریافت ${baseCp.toLocaleString('fa-IR')} سی‌پی پایه به همراه ${bonusCp.toLocaleString('fa-IR')} سی‌پی هدیه (مجموعاً ${totalCp.toLocaleString('fa-IR')} سی‌پی با ۲ برابر شارژ).`,
      };
    }

    const bonusText =
      bonusCp > 0
        ? `${baseCp.toLocaleString('fa-IR')} سی‌پی پایه + ${bonusCp.toLocaleString('fa-IR')} سی‌پی بونوس وباستور (${bonusPercent.toLocaleString('fa-IR')}٪ بونوس)`
        : `${totalCp.toLocaleString('fa-IR')} سی‌پی خالص`;

    const discountText =
      isFPD && discountPercent > 0
        ? ` به همراه ${discountPercent.toLocaleString('fa-IR')}٪ تخفیف ویژه اولین خرید در وباستور`
        : '';

    return {
      titleFa: `بسته ${totalCp.toLocaleString('fa-IR')} سی‌پی کالاف دیوتی موبایل`,
      subtitleFa: bonusText,
      descriptionFa: `شامل ${baseCp.toLocaleString('fa-IR')} سی‌پی پایه به علاوه ${bonusCp.toLocaleString('fa-IR')} سی‌پی بونوس انحصاری خرید از وباستور رسمی اکتیویژن${discountText}.`,
    };
  }

  // Specific known bundles & event offers
  if (upperTitle.includes('5,400 CP') && upperSub.includes('FANGS OUT')) {
    return {
      titleFa: 'باندل ۵,۴۰۰ سی‌پی + پکیج Fangs Out',
      subtitleFa: '۵,۴۰۰ سی‌پی + اسکین سلاح و چاقوی Fangs Out به عنوان بونوس',
      descriptionFa:
        'پکیج ویژه هالووین شامل ۵,۴۰۰ سی‌پی به همراه باندل انحصاری Fangs Out (اسکین سلاح + اسکین چاقو) به عنوان هدیه وباستور.',
    };
  }

  if (upperTitle.includes('460 CP') && upperTitle.includes('PARACHUTE')) {
    return {
      titleFa: 'باندل ۴۶۰ سی‌پی + چتر نجات هالووین',
      subtitleFa: '۴۶۰ سی‌پی + اسکین چتر نجات هالووین به عنوان بونوس',
      descriptionFa:
        'شامل ۴۶۰ سی‌پی کالاف دیوتی موبایل به همراه اسکین چتر نجات ویژه هالووین (Halloween Parachute) به عنوان آیتم بونوس وباستور.',
    };
  }

  if (upperTitle.includes('HALLOWEEN BUNDLE') && upperTitle.includes('BONUS WEAPON')) {
    return {
      titleFa: 'باندل ویژه هالووین + سلاح اپیک M4LMG',
      subtitleFa: '۲,۰۰۰ سی‌پی + ۲۰۰ کارت XP سلاح + اسکین اپیک M4LMG Silk Spinner',
      descriptionFa:
        'باندل کامل هالووین شامل ۲,۰۰۰ سی‌پی، ۲۰۰ کارت ارتقای سطح سلاح (Weapon XP Cards) و بلوپرینت اپیک سلاح M4LMG - Silk Spinner.',
    };
  }

  if (upperTitle.includes('HONKAI AVATAR')) {
    return {
      titleFa: 'بسته ۱۶۰ سی‌پی دوبل + آواتار Honkai Impact',
      subtitleFa: '۸۰+۸۰ سی‌پی دوبل انحصاری وباستور + آواتار ویژه All Hail Homu',
      descriptionFa:
        'پیشنهاد انحصاری رویداد Honkai Impact 3rd شامل ۸۰ سی‌پی پایه + ۸۰ سی‌پی بونوس رایگان به همراه آواتار پروفایل All Hail Homu.',
    };
  }

  if (upperTitle.includes('HONKAI POINTS')) {
    const xpMatch = upperTitle.match(/(\d[\d,]*)\s*WEAPON XP/i);
    const honkaiMatch = upperTitle.match(/(\d[\d,]*)\s*HONKAI POINTS/i);
    const xpFa = xpMatch ? parseInt(xpMatch[1].replace(/,/g, ''), 10).toLocaleString('fa-IR') : '';
    const hpFa = honkaiMatch ? parseInt(honkaiMatch[1].replace(/,/g, ''), 10).toLocaleString('fa-IR') : '';
    return {
      titleFa: `${xpFa} کارت XP سلاح + ${hpFa} امتیاز Honkai`,
      subtitleFa: 'پیشنهاد انحصاری وباستور ویژه رویداد Honkai Impact 3rd',
      descriptionFa: `شامل ${xpFa} کارت ارتقای تجربه سلاح (Weapon XP) به همراه ${hpFa} امتیاز ویژه رویداد Honkai قابل استفاده در بخش Herrscher's Armory.`,
    };
  }

  if (upperTitle.includes('CRATES AS BONUS') || upperSub.includes('GHOST TOWN')) {
    const cpValFa = totalCp > 0 ? totalCp.toLocaleString('fa-IR') : '';
    const cratesMatch = upperTitle.match(/(\d[\d,]*)\s*CRATES/i);
    const cratesFa = cratesMatch ? parseInt(cratesMatch[1].replace(/,/g, ''), 10).toLocaleString('fa-IR') : '';
    return {
      titleFa: `باندل ${cpValFa} سی‌پی + ${cratesFa} جعبه Ghost Town`,
      subtitleFa: `${cpValFa} سی‌پی + ${cratesFa} کریت شانس Ghost Town به عنوان بونوس`,
      descriptionFa: `پیشنهاد ویژه رویداد Day of the Dead شامل ${cpValFa} سی‌پی کالاف دیوتی موبایل به همراه ${cratesFa} عدد جعبه شانس (Crate) مجموعه Ghost Town.`,
    };
  }

  // Generic dynamic translation for future bundles/events
  if (totalCp > 0) {
    return {
      titleFa: `پکیج ویژه ${totalCp.toLocaleString('fa-IR')} سی‌پی + آیتم بونوس`,
      subtitleFa: subtitle || title,
      descriptionFa: `پیشنهاد محدود وباستور رسمی کالاف دیوتی موبایل شامل ${totalCp.toLocaleString('fa-IR')} سی‌پی به همراه آیتم‌های بونوس اختصاصی (${subtitle || title}).`,
    };
  }

  return {
    titleFa: title,
    subtitleFa: subtitle,
    descriptionFa: `پیشنهاد انحصاری وباستور رسمی کالاف دیوتی موبایل: ${subtitle ? `${title} (${subtitle})` : title}.`,
  };
}

function normalizeValidEndTime(rawEndTime?: string | null): string | null {
  if (!rawEndTime || typeof rawEndTime !== 'string' || !rawEndTime.trim()) return null;
  const parsed = new Date(rawEndTime);
  if (Number.isNaN(parsed.getTime())) return null;
  // Filter out placeholder year 2300 timestamps used by Codashop for non-expiring limits
  if (parsed.getUTCFullYear() >= 2100) return null;
  return parsed.toISOString();
}

function parseCodmProductPinia(
  productState: any,
  shopLang: any,
  regionConfig: CodmRegionConfig,
  sourceUrl: string,
  isFallback = false,
): CodmStoreData {
  const currency = shopLang?.currency || regionConfig.currency;
  const currencySymbol = shopLang?.currencySymbol || regionConfig.currencySymbol;

  const rawCategories: any[] = Array.isArray(productState?.skuCategories)
    ? productState.skuCategories
    : [];
  const rawThemes: any[] = Array.isArray(productState?.themeDetails)
    ? productState.themeDetails
    : [];
  const rawBanners: any[] = Array.isArray(productState?.banners)
    ? productState.banners
    : [];
  const rawSkus: any[] = Array.isArray(productState?.skus)
    ? productState.skus
    : [];

  const themeMap = new Map<string, any>();
  for (const t of rawThemes) {
    if (t?.id) themeMap.set(String(t.id), t);
  }

  const sectionMap = new Map<number, CodmStoreSection>();
  for (const cat of rawCategories) {
    const id = typeof cat?.id === 'number' ? cat.id : Number(cat?.id ?? 0);
    const rawName = String(cat?.title || cat?.name || 'OFFERS').trim();
    const lowerName = rawName.toLowerCase();
    const theme = cat?.themeId ? themeMap.get(String(cat.themeId)) : null;

    sectionMap.set(id, {
      id,
      uuid: String(cat?.uuid || `cat-${id}`),
      name: rawName,
      nameFa: SECTION_NAME_FA_MAP[lowerName] || rawName,
      description: stripHtml(cat?.description),
      descriptionFa: SECTION_DESC_FA_MAP[lowerName] || stripHtml(cat?.description),
      imageUrl: cat?.imageUrl || null,
      themeBgImageUrl: theme?.categoryBannerConfig?.bgImgUrl || null,
      themeHeadlineColor: theme?.categoryBannerConfig?.headlineTextColor || null,
      themeSupportColor: theme?.categoryBannerConfig?.supportTextColor || null,
      sortOrder: typeof cat?.sortOrder === 'number' ? cat.sortOrder : 99,
      offers: [],
    });
  }

  const allOffers: CodmStoreOffer[] = [];

  for (let i = 0; i < rawSkus.length; i++) {
    const sku = rawSkus[i];
    if (!sku || sku.status !== 'ACTIVE' || sku.isDisabled) continue;

    const id = String(sku.displayId || `codm-sku-${i}`);
    const title = String(sku.title || sku.details?.title || 'COD:M Offer').trim();
    const subtitle = sku.subtitle ? String(sku.subtitle).trim() : null;
    const sectionId = typeof sku.categoryId === 'number' ? sku.categoryId : Number(sku.categoryId ?? 0);

    let section = sectionMap.get(sectionId);
    if (!section) {
      section = {
        id: sectionId,
        uuid: String(sku.categoryUuid || `cat-${sectionId}`),
        name: sectionId === 0 ? 'CP' : 'SPECIAL OFFERS',
        nameFa: sectionId === 0 ? SECTION_NAME_FA_MAP['cp'] : 'پیشنهادهای ویژه وباستور',
        description: null,
        descriptionFa: null,
        imageUrl: null,
        themeBgImageUrl: null,
        themeHeadlineColor: null,
        themeSupportColor: null,
        sortOrder: sectionId === 0 ? 10 : 5,
        offers: [],
      };
      sectionMap.set(sectionId, section);
    }

    const isFreebie = Boolean(sku.isFreebieSku || sku.pricingScheme === 'FREEBIE' || sectionId === 3);
    const rawPackageItems: any[] = Array.isArray(sku.packageInfo?.packageItemList)
      ? sku.packageInfo.packageItemList
      : [];
    const isPackage = Boolean(sku.isPackage || rawPackageItems.length > 0);

    let category: Exclude<CodmFilterCategory, 'all'> = 'event';
    let categoryFa = 'پیشنهاد رویداد';
    if (isFreebie) {
      category = 'freebie';
      categoryFa = 'هدیه رایگان';
    } else if (sectionId === 0) {
      category = 'cp';
      categoryFa = 'بسته سی‌پی (CP)';
    } else if (isPackage || /bundle/i.test(title)) {
      category = 'bundle';
      categoryFa = 'باندل ویژه';
    }

    const { baseCp, bonusCp, totalCp, bonusPercent } = parseCpAmounts(title, subtitle, id);

    const pricePoints: any[] = Array.isArray(sku.pricePoints) ? sku.pricePoints : [];
    const activePoint = pricePoints.find(p => p?.isEnabled && p?.paymentChannelStatus === 'ACTIVE') || pricePoints[0];

    const price = isFreebie ? 0 : Number(activePoint?.price ?? sku.strikethroughPrice ?? 0);
    const regularPrice = isFreebie
      ? 0
      : Number(sku.strikethroughPrice ?? activePoint?.publisherPrice ?? price);
    const discountAmount = Math.max(0, Number((regularPrice - price).toFixed(2)));
    const discountPercent =
      Number(sku.strikethroughPricePercentage) > 0
        ? Number(sku.strikethroughPricePercentage)
        : regularPrice > price && regularPrice > 0
          ? Math.round(((regularPrice - price) / regularPrice) * 100)
          : 0;

    const tags: string[] = Array.isArray(sku.tags) ? sku.tags.map(String) : [];
    const isPopular = Boolean(sku.isPopular || tags.includes('POPULAR'));
    const isFirstPurchaseOffer = Boolean(sku.isFPO);
    const isFirstPurchaseDiscount = Boolean(sku.isFPD || (tags.includes('PromoFPD') && discountPercent > 0));
    const isHighlighted = Boolean(sku.isHighlighted);
    const webStoreExclusive = Boolean(
      sku.webStoreExclusive ||
      category === 'bundle' ||
      category === 'event' ||
      category === 'freebie' ||
      bonusCp > 0 ||
      (subtitle && /web\s*(exclusive|bonus)/i.test(subtitle)),
    );

    const packageItems: CodmPackageItem[] = rawPackageItems.map((item, idx) => {
      const rawItemTitle = String(item?.title || `Item ${idx + 1}`).trim();
      const translated = translatePackageItem(rawItemTitle, item?.description);
      return {
        id: `${id}-pkg-${idx}`,
        title: rawItemTitle,
        titleFa: translated.titleFa,
        description: stripHtml(item?.description),
        descriptionFa: translated.descriptionFa,
        image: item?.iconUrl || null,
        itemTypeFa: translated.itemTypeFa,
      };
    });

    const { titleFa, subtitleFa, descriptionFa } = buildPersianOfferCopy({
      title,
      subtitle,
      category,
      baseCp,
      bonusCp,
      totalCp,
      bonusPercent,
      discountPercent,
      isFPO: isFirstPurchaseOffer,
      isFPD: isFirstPurchaseDiscount,
    });

    const rawLimit = sku.purchaseLimit;
    const purchaseLimit: CodmPurchaseLimit | null = rawLimit
      ? {
          limit: rawLimit.limit ? Number(rawLimit.limit) : null,
          remaining: rawLimit.remaining ? Number(rawLimit.remaining) : null,
          refreshType: rawLimit.refreshType || null,
          refreshTime: normalizeValidEndTime(rawLimit.refreshTime),
          endTime: normalizeValidEndTime(rawLimit.endTime),
        }
      : null;

    const sortOrderArr = Array.isArray(sku.sortOrderId) ? sku.sortOrderId : [];
    const sortOrder = typeof sortOrderArr[0] === 'number' ? sortOrderArr[0] : i + 1;

    const offer: CodmStoreOffer = {
      id,
      title,
      titleFa,
      subtitle,
      subtitleFa,
      descriptionFa,
      image:
        sku.imageUrl ||
        sku.details?.imageUrl ||
        '/images/products/Molten-Gold-Lightning-King.webp',
      bannerImage: sku.bannerImageUrl || null,
      category,
      categoryFa,
      sectionId,
      sectionName: section.name,
      sectionNameFa: section.nameFa,
      baseCp,
      bonusCp,
      totalCp,
      bonusPercent,
      price,
      regularPrice,
      discountAmount,
      discountPercent,
      currency: sku.currency || currency,
      currencySymbol,
      formattedPrice: formatRegionalPrice(price, sku.currency || currency, currencySymbol),
      formattedRegularPrice:
        regularPrice > price
          ? formatRegionalPrice(regularPrice, sku.currency || currency, currencySymbol)
          : null,
      isFreebie,
      isPackage,
      packageItems,
      isPopular,
      isHighlighted,
      isFirstPurchaseOffer,
      isFirstPurchaseDiscount,
      webStoreExclusive,
      purchaseLimit,
      sortOrder,
    };

    section.offers.push(offer);
    allOffers.push(offer);
  }

  // Sort offers within each section by sortOrder
  const sections = Array.from(sectionMap.values())
    .filter(s => s.offers.length > 0)
    .map(s => ({
      ...s,
      offers: s.offers.sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    // Put CP section first or order by official sortOrder
    .sort((a, b) => {
      if (a.id === 0 && b.id !== 0) return -1;
      if (b.id === 0 && a.id !== 0) return 1;
      return a.sortOrder - b.sortOrder;
    });

  const cpPacksCount = allOffers.filter(o => o.category === 'cp').length;
  const bundlesCount = allOffers.filter(o => o.category === 'bundle' || o.category === 'event').length;
  const freebiesCount = allOffers.filter(o => o.category === 'freebie').length;
  const maxBonusPercent = allOffers.reduce((max, o) => Math.max(max, o.bonusPercent), 0);
  const maxDiscountPercent = allOffers.reduce((max, o) => Math.max(max, o.discountPercent), 0);

  const primaryBanner = rawBanners[0];
  const featuredBannerUrl = primaryBanner?.style?.bgImageUrl || null;
  const featuredSkuId = primaryBanner?.target?.skuId || null;

  const nowIso = new Date().toISOString();
  const nextRevalidateAt = new Date(Date.now() + CODM_REVALIDATE_SECONDS * 1000).toISOString();

  return {
    fetchedAt: nowIso,
    nextRevalidateAt,
    region: regionConfig.key,
    regionNameEn: shopLang?.enName || regionConfig.nameEn,
    regionNameFa: regionConfig.nameFa,
    currency,
    currencySymbol,
    sourceUrl,
    isFallback,
    totalOffers: allOffers.length,
    cpPacksCount,
    bundlesCount,
    freebiesCount,
    maxBonusPercent,
    maxDiscountPercent,
    featuredBannerUrl,
    featuredSkuId,
    sections,
    offers: allOffers,
  };
}

// Fallback snapshot from the official US store so the page remains resilient if upstream times out
const FALLBACK_US_PRODUCT_STATE = {
  skuCategories: [
    { id: 0, uuid: '0a355da0-823d-4d9f-910a-24d643f81358', name: 'CP', title: 'CP', sortOrder: 1 },
    { id: 1, uuid: 'f0ae724d-9607-4c0d-a758-c077d037bd1b', name: 'HALLOWEEN', title: 'HALLOWEEN', sortOrder: 2 },
    {
      id: 2,
      uuid: '1e70718d-69df-43a0-b56c-811172249361',
      name: 'HONKAI IMPACT 3RD',
      title: 'HONKAI IMPACT 3RD',
      sortOrder: 3,
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_category/1789982608819_83364916-1df8-48c6-9c06-a709c0a6cf28.png',
      description: '<p>Honkai Points can be used in Herrscher&#39;s Armory. <br>Event runs Sept 25 to Nov 11.</p>',
    },
    { id: 4, uuid: '5647ae27-81de-4f97-a052-900bf4d638f5', name: 'DAY OF THE DEAD', title: 'DAY OF THE DEAD', sortOrder: 4 },
    { id: 3, uuid: '22373c84-a770-4d61-b6ce-9f65a6ac61d7', name: 'GIFTS', title: 'GIFTS', sortOrder: 5 },
  ],
  banners: [
    {
      sortOrder: 1,
      target: { skuId: 'com.activision.callofduty.webstore_21_0_0' },
      style: { bgImageUrl: 'https://cdn1.codashop.com/images/promotion/494/94d68871-c990-4f68-bd01-017b833356d4.webp' },
    },
  ],
  skus: [
    {
      displayId: 'CODMSTORE-80-10_88_8',
      status: 'ACTIVE',
      categoryId: 0,
      title: '88 CP',
      subtitle: '80 + 8 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811549842_b8324e36-3e0a-4dbe-89ed-cc0c37105f63.webp',
      isPackage: false,
      sortOrderId: [1],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 0.99, publisherPrice: 0.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      strikethroughPrice: 0.99,
      strikethroughPricePercentage: 0,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-80-100_160_80',
      status: 'ACTIVE',
      categoryId: 0,
      title: '160 CP',
      subtitle: '80 + 80 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811694706_8ca19ffe-8afd-4003-a0fb-d65a53f633ba.webp',
      isPackage: false,
      sortOrderId: [2],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 0.99, publisherPrice: 0.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1' },
      tags: ['PromoFPD'],
      strikethroughPrice: 0.99,
      strikethroughPricePercentage: 0,
      isFPO: true,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-420-15_460_60',
      status: 'ACTIVE',
      categoryId: 0,
      title: '460 CP',
      subtitle: '400 + 60 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811566428_245a0bdf-f1c0-4a22-95ac-9ee2d5644552.webp',
      isPackage: false,
      sortOrderId: [4],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 3.24, publisherPrice: 4.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1' },
      tags: ['PromoFPD'],
      strikethroughPrice: 4.99,
      strikethroughPricePercentage: 35,
      isFPD: true,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-880-20_960_160',
      status: 'ACTIVE',
      categoryId: 0,
      title: '960 CP',
      subtitle: '800 + 160 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811585740_8d44faac-2e67-4cc4-8d04-ec0be12d2c06.webp',
      isPackage: false,
      sortOrderId: [6],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 6.49, publisherPrice: 9.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1' },
      tags: ['PromoFPD'],
      strikethroughPrice: 9.99,
      strikethroughPricePercentage: 35,
      isFPD: true,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-2400-30_2600_600',
      status: 'ACTIVE',
      categoryId: 0,
      title: '2600 CP',
      subtitle: '2000 + 600 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811602017_f0992426-ca2c-4b71-a63b-ae4bbafdbee5.webp',
      isPackage: false,
      sortOrderId: [8],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 16.24, publisherPrice: 24.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1' },
      tags: ['PromoFPD'],
      strikethroughPrice: 24.99,
      strikethroughPricePercentage: 35,
      isFPD: true,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-5000-35_5400_1400',
      status: 'ACTIVE',
      categoryId: 0,
      title: '5400 CP',
      subtitle: '4000 + 1400 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811618124_319bc347-59cd-4b79-90de-8cc9eeaf5617.webp',
      isPackage: false,
      sortOrderId: [10],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 32.49, publisherPrice: 49.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1' },
      tags: ['PromoFPD'],
      strikethroughPrice: 49.99,
      strikethroughPricePercentage: 35,
      isFPD: true,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-10800-45_11600_3600',
      status: 'ACTIVE',
      categoryId: 0,
      title: '11600 CP',
      subtitle: '8000 + 3600 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811633819_bc045ad8-8bc6-463f-8e91-3855770d4cf0.webp',
      isPackage: false,
      sortOrderId: [12],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 99.99, publisherPrice: 99.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      tags: ['POPULAR'],
      isPopular: true,
      strikethroughPrice: 99.99,
      strikethroughPricePercentage: 0,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-21600-45_23200_7200',
      status: 'ACTIVE',
      categoryId: 0,
      title: '23200 CP',
      subtitle: '16000 + 7200 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811648179_2507ed04-91c5-410b-a79b-cdc37e12844f.webp',
      isPackage: false,
      sortOrderId: [13],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 199.99, publisherPrice: 199.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      strikethroughPrice: 199.99,
      strikethroughPricePercentage: 0,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-32400-45_34800_10800',
      status: 'ACTIVE',
      categoryId: 0,
      title: '34800 CP',
      subtitle: '24000 + 10800 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811663609_aa1a9856-22cf-473d-9f4a-4c61cd244fc9.webp',
      isPackage: false,
      sortOrderId: [14],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 299.99, publisherPrice: 299.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      strikethroughPrice: 299.99,
      strikethroughPricePercentage: 0,
      currency: 'USD',
    },
    {
      displayId: 'CODMSTORE-54000-45_58000_18000',
      status: 'ACTIVE',
      categoryId: 0,
      title: '58000 CP',
      subtitle: '40000 + 18000 WEB BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1759811678954_c60f3089-ead9-42d1-9cac-85b2bf72caab.webp',
      isPackage: false,
      sortOrderId: [15],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 499.99, publisherPrice: 499.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      strikethroughPrice: 499.99,
      strikethroughPricePercentage: 0,
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.webstore_41_0_0',
      status: 'ACTIVE',
      categoryId: 3,
      title: 'DAILY GIFT',
      subtitle: '2X Legendary Secret Cache',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_image/c564244a5e2632863f3c8df689ca8bda.webp',
      isPackage: false,
      sortOrderId: [16],
      pricingScheme: 'FREEBIE',
      isFreebieSku: true,
      pricePoints: [],
      purchaseLimit: { limit: '1', remaining: '1', refreshType: 'DAILY', endTime: '2026-12-31T00:00:00.000Z' },
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.webstore_21_0_0',
      status: 'ACTIVE',
      categoryId: 1,
      title: '5,400 CP + BUNDLE AS BONUS',
      subtitle: '5,400 CP + FANGS OUT BUNDLE AS BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1792043411966_43ca7cab-eaf2-4a12-bd9f-15d89d2cca01.webp',
      bannerImageUrl: 'https://cdn1.codashop.com/images/promotion/494/94d68871-c990-4f68-bd01-017b833356d4.webp',
      isPackage: true,
      isHighlighted: true,
      sortOrderId: [17],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 49.99, publisherPrice: 49.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1', endTime: '2026-11-03T00:00:00.000Z' },
      packageInfo: {
        packageItemList: [
          { title: 'FANGS OUT GUN', iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/sku/halloween_fangsout_gun.webp' },
          { title: 'FANGS OUT KNIFE', iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/sku/halloween_fangsout_knife.webp' },
          { title: '5,400 CP', iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/sku/halloween_5400.webp' },
        ],
      },
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.webstore_35_0_0',
      status: 'ACTIVE',
      categoryId: 1,
      title: '460 CP + BONUS PARACHUTE',
      subtitle: '460 CP + HALLOWEEN PARACHUTE AS BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1792043425290_e2d6782f-2c8c-44ae-a4eb-d6d92c8cf34b.webp',
      isPackage: true,
      sortOrderId: [21],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 4.99, publisherPrice: 4.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1', endTime: '2026-11-03T00:00:00.000Z' },
      packageInfo: {
        packageItemList: [
          { title: 'BONUS PARACHUTE', iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/sku/halloween_parachute.webp' },
          { title: '460 CP', iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/sku/halloween_460.webp' },
        ],
      },
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.weekotov2_1p_0_0',
      status: 'ACTIVE',
      categoryId: 1,
      title: 'HALLOWEEN BUNDLE + BONUS WEAPON',
      subtitle: '2,000 CP + 200 WEAPON XP CARDS + EPIC M4LMG SILK SPINNER AS BONUS',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1792043443530_c2a09cf5-df09-49a4-8c00-af36238240e6.webp',
      isPackage: true,
      sortOrderId: [23],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 24.99, publisherPrice: 24.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1', endTime: '2026-11-03T00:00:00.000Z' },
      packageInfo: {
        packageItemList: [
          { title: 'BONUS EPIC M4LMG SILK SPINNER', iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/sku/halloween_silk.webp' },
          { title: '200 WEAPON XP CARDS', iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/sku/halloween_weaponxp.webp' },
          { title: '2,000 CP', iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/sku/halloween_2000.webp' },
        ],
      },
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.webstore_50_0_0',
      status: 'ACTIVE',
      categoryId: 2,
      title: '80CP + 80CP AND HONKAI AVATAR AS BONUS',
      subtitle: 'Web Exclusive Double CP',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_image/b796f6522ac23005b82437eb4c1b6d82.webp',
      isPackage: true,
      sortOrderId: [19],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 0.99, publisherPrice: 0.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1', endTime: '2026-11-08T00:00:00.000Z' },
      packageInfo: {
        packageItemList: [
          {
            title: 'HONKAI AVATAR',
            iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/honkai_avatar.webp',
            description: 'All Hail Homu! - Avatar with All Hail Homu! design',
          },
          {
            title: '80CP + 80CP',
            iconUrl: 'https://cdn1.codashop.com/S/content/webstore/codm/images/honkai_80_80.webp',
            description: 'Purchase COD Points in the store and use them to buy the Premium Pass or other items in the store',
          },
        ],
      },
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.webstore_46_0_0',
      status: 'ACTIVE',
      categoryId: 2,
      title: '10 WEAPON XP CARDS + 200 HONKAI POINTS AS BONUS',
      subtitle: 'Web Exclusive',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_product/1788928414926_eafe56a6-500d-402c-984f-b93f5b3823bf.webp',
      isPackage: false,
      sortOrderId: [20],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 0.99, publisherPrice: 0.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1', endTime: '2026-11-08T00:00:00.000Z' },
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.webstore_20_0_0',
      status: 'ACTIVE',
      categoryId: 2,
      title: '30 WEAPON XP CARDS + 1,000 HONKAI POINTS AS BONUS',
      subtitle: 'Web Exclusive',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_image/93b729465d68598f4fc8643de07bb322.webp',
      isPackage: false,
      sortOrderId: [22],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 7.99, publisherPrice: 7.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1', endTime: '2026-11-08T00:00:00.000Z' },
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.webstore_47_0_0',
      status: 'ACTIVE',
      categoryId: 4,
      title: '2,000 CP + 15 CRATES AS BONUS',
      subtitle: 'GHOST TOWN CRATES',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_image/224c76c77f0af57c2dde18ca97b7c027.webp',
      isPackage: false,
      sortOrderId: [24],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 24.99, publisherPrice: 24.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1', endTime: '2026-11-08T00:00:00.000Z' },
      currency: 'USD',
    },
    {
      displayId: 'com.activision.callofduty.webstore_36_0_0',
      status: 'ACTIVE',
      categoryId: 4,
      title: '4,000 CP + 30 CRATES AS BONUS',
      subtitle: 'GHOST TOWN CRATES',
      imageUrl: 'https://cdn1.codashop.com/images/869_d08bedee-afea-4a82-b99b-84221fd8b462_b0a195e241f7b719a62141da9feb8757_image/7d795841f04582b89703eca7de910fef.webp',
      isPackage: false,
      sortOrderId: [26],
      pricingScheme: 'PAID_CURRENCY',
      pricePoints: [{ price: 49.99, publisherPrice: 49.99, isEnabled: true, paymentChannelStatus: 'ACTIVE' }],
      purchaseLimit: { limit: '1', remaining: '1', endTime: '2026-11-08T00:00:00.000Z' },
      currency: 'USD',
    },
  ],
};

const regionMemoryCache = new Map<CodmRegionKey, { data: CodmStoreData; expiresAt: number }>();

const FORCE_FRESH_MIN_INTERVAL_MS = 60_000;
let lastForcedFetchAt = 0;

export async function getCodmStoreOffers(
  regionInput?: string | null,
  forceFresh = false,
): Promise<CodmStoreData> {
  const regionConfig = resolveCodmRegion(regionInput);
  const now = Date.now();

  if (forceFresh) {
    if (now - lastForcedFetchAt < FORCE_FRESH_MIN_INTERVAL_MS) {
      forceFresh = false;
    } else {
      lastForcedFetchAt = now;
    }
  }

  const cached = regionMemoryCache.get(regionConfig.key);
  if (!forceFresh && cached && cached.expiresAt > now) {
    return cached.data;
  }

  const sourceUrl = `https://store.callofdutymobile.com/${regionConfig.pathSlug}/codm`;

  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = forceFresh
    ? {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    : {
        next: {
          revalidate: CODM_REVALIDATE_SECONDS,
          tags: ['codm-store', `codm-store-${regionConfig.key}`],
        },
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      };

  try {
    const res = await fetch(sourceUrl, fetchOptions);
    if (res.ok) {
      const html = await res.text();
      const nuxtMatch = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
      if (nuxtMatch?.[1]) {
        const rawArray = JSON.parse(nuxtMatch[1]);
        const root = unflattenNuxtPayload(rawArray);
        const productState = root?.pinia?.product;
        const shopLang = root?.pinia?.locale?.shopLang;

        if (productState && Array.isArray(productState.skus) && productState.skus.length > 0) {
          const parsed = parseCodmProductPinia(productState, shopLang, regionConfig, sourceUrl, false);
          if (parsed.totalOffers > 0) {
            regionMemoryCache.set(regionConfig.key, {
              data: parsed,
              expiresAt: now + CODM_REVALIDATE_SECONDS * 1000,
            });
            return parsed;
          }
        }
      }
    }
  } catch {
    // Proceed to cached or fallback snapshot on upstream timeout/network failure
  }

  if (cached?.data) {
    return cached.data;
  }

  return parseCodmProductPinia(
    FALLBACK_US_PRODUCT_STATE,
    { enName: 'United States (Global)', currency: 'USD', currencySymbol: '$' },
    CODM_REGIONS[0],
    'https://store.callofdutymobile.com/en-us/codm',
    true,
  );
}
