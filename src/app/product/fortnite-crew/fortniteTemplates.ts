import { faNumber } from '@/lib/format';
import type { Product, ProductVariant } from '@/lib/api/types';
import {
  CREW_ACTIVATION_CONTENT,
  CREW_BENEFIT_BLOCKS,
  CREW_BENEFITS_HEADER,
  CREW_COMPARISON_CONTENT,
  CREW_COMPARISON_ROWS,
  CREW_COMPARISON_TOTAL,
  CREW_DELIVERY_TIME,
  CREW_DISCOUNT_PERCENT,
  CREW_FAQ_HEADER,
  CREW_FAQ_ITEMS,
  CREW_FINAL_CTA_CONTENT,
  CREW_HERO_CONTENT,
  CREW_INTRO_CONTENT,
  CREW_ORIGINAL_PRICE_TOMAN,
  CREW_PRICE_DELIVERY_CONTENT,
  CREW_PRICE_TOMAN,
  CREW_RELATED_HEADER,
  CREW_RELATED_LINKS,
  CREW_SUPPORT_CONTENT,
  type CrewBenefitBlock,
  type CrewComparisonRow,
  type CrewFaqItem,
  type CrewRelatedLink,
} from './content';

export interface FortniteProductTemplate {
  slugs: string[];
  defaultPriceToman: number;
  defaultOriginalPriceToman: number;
  defaultDiscountPercent: number;
  deliveryTime: string;
  readMoreSub: string;
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    factChips: readonly string[];
    ctaLabel: string;
    carouselHint: string;
  };
  intro: {
    kicker: string;
    title: string;
    p1BeforeLink: string;
    p1LinkLabel: string;
    p1LinkHref: string;
    p1AfterLink: string;
    p2: string;
    p3: string;
  };
  benefitsHeader: {
    kicker: string;
    title: string;
  };
  benefitBlocks: CrewBenefitBlock[];
  activation: {
    kicker: string;
    title: string;
    subtitle: string;
    steps: [
      { num: string; title: string; text: string },
      {
        num: string;
        title: string;
        consoleBeforeLink: string;
        consoleLinkLabel: string;
        consoleLinkHref: string;
        consoleAfterLink: string;
      },
      { num: string; title: string; text: string },
      { num: string; title: string; text: string },
    ];
  };
  priceDelivery: {
    kicker: string;
    title: string;
    subtitle: string;
    tile1Label: string;
    tile1SubWhenNoDiscount?: string;
    tile2Label: string;
    tile2Sub: string;
    tile3Label: string;
    tile3Value: string;
    tile3Sub: string;
    guideBeforeLink: string;
    guideLinkLabel: string;
    guideLinkHref: string;
    guideAfterLink: string;
  };
  comparison: {
    kicker: string;
    title: string;
    p1: string;
    p2BeforeLink1: string;
    p2Link1Label: string;
    p2Link1Href: string;
    p2BetweenLinks: string;
    p2EpicLabel: string;
    p2EpicHref: string;
    p2AfterEpic: string;
    tableHeading: string;
    rows: CrewComparisonRow[];
    total: CrewComparisonRow;
  };
  support: {
    kicker: string;
    title: string;
    beforeLink: string;
    linkLabel: string;
    linkHref: string;
    afterLink: string;
  };
  relatedHeader: {
    kicker: string;
    title: string;
  };
  relatedLinks: CrewRelatedLink[];
  faqHeader: {
    kicker: string;
    title: string;
    beforeContact: string;
    contactLabel: string;
    contactHref: string;
    betweenLinks: string;
    faqLabel: string;
    faqHref: string;
    afterFaq: string;
  };
  faqItems: CrewFaqItem[];
  finalCta: {
    title: string;
    subtitle?: string;
    ctaLabel: string;
    ctaHref: string;
  };
}

export interface ResolvedFortnitePricing {
  priceToman: number;
  originalPriceToman: number;
  discountPercent: number;
  hasDiscount: boolean;
  priceFormatted: string;
  originalPriceFormatted: string;
  discountFormatted: string;
  deliveryTime: string;
  tile1Label: string;
  tile1Sub: string;
  ctaSubtitle: string;
}

function formatFaThousands(value: number): string {
  return faNumber(value).replace(/,/g, '٬');
}

export function resolveFortniteTemplatePricing(
  template: FortniteProductTemplate,
  product?: Product | null,
  selectedVariant?: ProductVariant | null
): ResolvedFortnitePricing {
  const isCrew =
    template.slugs.includes('fortnite-crew') ||
    product?.slug === 'fortnite-crew' ||
    product?.slug === 'fortnite-crew-pack';

  const variantPrice =
    typeof selectedVariant?.price === 'number' && selectedVariant.price > 0
      ? selectedVariant.price
      : null;

  const priceToman =
    variantPrice ??
    (typeof product?.price === 'number' && product.price > 0
      ? product.price
      : template.defaultPriceToman);

  const rawOriginal =
    selectedVariant?.originalPrice ??
    product?.originalPrice ??
    (isCrew ? template.defaultOriginalPriceToman : null);

  const originalPriceToman =
    typeof rawOriginal === 'number' && rawOriginal > priceToman
      ? rawOriginal
      : template.defaultOriginalPriceToman > priceToman
      ? template.defaultOriginalPriceToman
      : priceToman;

  const hasDiscount = originalPriceToman > priceToman;

  const discountPercent = hasDiscount
    ? typeof selectedVariant?.discountPercent === 'number' &&
      selectedVariant.discountPercent > 0
      ? selectedVariant.discountPercent
      : typeof product?.discountPercent === 'number' &&
        product.discountPercent > 0
      ? product.discountPercent
      : Math.max(
          1,
          Math.round(
            ((originalPriceToman - priceToman) / originalPriceToman) * 100
          )
        )
    : template.defaultDiscountPercent;

  const priceFormatted = `${formatFaThousands(priceToman)} تومان`;
  const originalPriceFormatted = `${formatFaThousands(originalPriceToman)} تومان`;
  const discountFormatted = `${formatFaThousands(discountPercent)}٪`;

  const tile1Label =
    selectedVariant && product?.variants && product.variants.length > 1
      ? `قیمت بسته (${selectedVariant.label})`
      : template.priceDelivery.tile1Label;

  const tile1Sub = hasDiscount
    ? `با ${discountFormatted} تخفیف نسبت به قیمت پایه ${originalPriceFormatted}`
    : template.priceDelivery.tile1SubWhenNoDiscount ||
      'پرداخت امن ریالی با کارت‌های عضو شتاب و تحویل مستقیم روی اکانت';

  const ctaSubtitle =
    isCrew && template.finalCta.subtitle
      ? template.finalCta.subtitle
      : `${priceFormatted}، تحویل ${template.deliveryTime} و پشتیبانی ۲۴ ساعته.`;

  return {
    priceToman,
    originalPriceToman,
    discountPercent,
    hasDiscount,
    priceFormatted,
    originalPriceFormatted,
    discountFormatted,
    deliveryTime: template.deliveryTime,
    tile1Label,
    tile1Sub,
    ctaSubtitle,
  };
}

/* ==========================================================================
   1. FORTNITE CREW (/product/fortnite-crew, /product/fortnite-crew-pack)
   ========================================================================== */
export const FORTNITE_CREW_TEMPLATE: FortniteProductTemplate = {
  slugs: ['fortnite-crew', 'fortnite-crew-pack'],
  defaultPriceToman: CREW_PRICE_TOMAN,
  defaultOriginalPriceToman: CREW_ORIGINAL_PRICE_TOMAN,
  defaultDiscountPercent: CREW_DISCOUNT_PERCENT,
  deliveryTime: CREW_DELIVERY_TIME,
  readMoreSub: 'مشاهده ۷ مزیت، مراحل فعال‌سازی و سؤالات متداول',
  hero: CREW_HERO_CONTENT,
  intro: CREW_INTRO_CONTENT,
  benefitsHeader: CREW_BENEFITS_HEADER,
  benefitBlocks: CREW_BENEFIT_BLOCKS,
  activation: {
    kicker: CREW_ACTIVATION_CONTENT.kicker,
    title: CREW_ACTIVATION_CONTENT.title,
    subtitle: CREW_ACTIVATION_CONTENT.subtitle,
    steps: [
      CREW_ACTIVATION_CONTENT.steps[0],
      CREW_ACTIVATION_CONTENT.steps[1],
      CREW_ACTIVATION_CONTENT.steps[2],
      CREW_ACTIVATION_CONTENT.steps[3],
    ],
  },
  priceDelivery: {
    kicker: CREW_PRICE_DELIVERY_CONTENT.kicker,
    title: CREW_PRICE_DELIVERY_CONTENT.title,
    subtitle: CREW_PRICE_DELIVERY_CONTENT.subtitle,
    tile1Label: 'قیمت اشتراک یک‌ماهه',
    tile2Label: 'زمان تحویل',
    tile2Sub: 'پس از ثبت نهایی سفارش، در ساعات کاری',
    tile3Label: 'روش تحویل',
    tile3Value: 'فعال‌سازی مستقیم روی اکانت',
    tile3Sub: 'قابل استفاده روی PC، PS4، PS5، Xbox، Nintendo Switch و موبایل',
    guideBeforeLink: CREW_PRICE_DELIVERY_CONTENT.guideBeforeLink,
    guideLinkLabel: CREW_PRICE_DELIVERY_CONTENT.guideLinkLabel,
    guideLinkHref: CREW_PRICE_DELIVERY_CONTENT.guideLinkHref,
    guideAfterLink: CREW_PRICE_DELIVERY_CONTENT.guideAfterLink,
  },
  comparison: {
    kicker: CREW_COMPARISON_CONTENT.kicker,
    title: CREW_COMPARISON_CONTENT.title,
    p1: CREW_COMPARISON_CONTENT.p1,
    p2BeforeLink1: CREW_COMPARISON_CONTENT.p2BeforeVbucks,
    p2Link1Label: CREW_COMPARISON_CONTENT.p2VbucksLabel,
    p2Link1Href: CREW_COMPARISON_CONTENT.p2VbucksHref,
    p2BetweenLinks: CREW_COMPARISON_CONTENT.p2BetweenLinks,
    p2EpicLabel: CREW_COMPARISON_CONTENT.p2EpicLabel,
    p2EpicHref: CREW_COMPARISON_CONTENT.p2EpicHref,
    p2AfterEpic: CREW_COMPARISON_CONTENT.p2AfterEpic,
    tableHeading: CREW_COMPARISON_CONTENT.tableHeading,
    rows: CREW_COMPARISON_ROWS,
    total: CREW_COMPARISON_TOTAL,
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: CREW_RELATED_HEADER,
  relatedLinks: CREW_RELATED_LINKS,
  faqHeader: CREW_FAQ_HEADER,
  faqItems: CREW_FAQ_ITEMS,
  finalCta: {
    title: CREW_FINAL_CTA_CONTENT.title,
    subtitle: CREW_FINAL_CTA_CONTENT.subtitle,
    ctaLabel: CREW_FINAL_CTA_CONTENT.ctaLabel,
    ctaHref: CREW_FINAL_CTA_CONTENT.ctaHref,
  },
};

/* ==========================================================================
   2. FORTNITE V-BUCKS (/product/fortnite-vbucks)
   ========================================================================== */
export const FORTNITE_VBUCKS_TEMPLATE: FortniteProductTemplate = {
  slugs: ['fortnite-vbucks'],
  defaultPriceToman: 1150000,
  defaultOriginalPriceToman: 1290000,
  defaultDiscountPercent: 11,
  deliveryTime: '۱۵ دقیقه تا ۲ ساعت',
  readMoreSub: 'مشاهده ۷ کاربرد و بسته وی‌باکس، مراحل شارژ و سؤالات متداول',
  hero: {
    eyebrow: 'ارز رسمی درون‌بازی Fortnite V-Bucks',
    title: 'خرید وی‌باکس فورتنایت',
    lead: 'با خرید وی‌باکس فورتنایت از تایتان، حساب اپیک گیمز خود را به‌صورت مستقیم و با پرداخت ریالی شارژ کنید. از بسته‌های اقتصادی تا پک‌های حرفه‌ای حاوی وی‌باکس جایزه (Bonus) را انتخاب کرده و اسکین‌های آیتم‌شاپ روزانه، ایموت‌ها و پس‌های فورتنایت را روی تمام پلتفرم‌ها باز نمایید.',
    factChips: [
      'بسته‌های متنوع وی‌باکس',
      'شارژ مستقیم روی اکانت',
      'کیف پول مشترک پلتفرم‌ها',
      'قابلیت گیفت در آیتم‌شاپ',
      'تحویل ۱۵ دقیقه تا ۲ ساعت',
    ],
    ctaLabel: 'افزودن به سبد خرید',
    carouselHint: 'کارت‌ها را ورق بزنید؛ روی کارت وسط کلیک کنید تا به توضیحاتش بروید.',
  },
  intro: {
    kicker: 'وی‌باکس چیست؟',
    title: 'وی‌باکس فورتنایت (V-Bucks) چیست و چطور بین پلتفرم‌ها مشترک می‌شود؟',
    p1BeforeLink:
      'وی‌باکس (V-Bucks یا Vindertech Bucks) ارز رسمی درون‌برنامه‌ای بازی Fortnite است که ساختار و بسته‌های رسمی آن در ',
    p1LinkLabel: 'صفحه رسمی V-Bucks در سایت Fortnite',
    p1LinkHref: 'https://www.fortnite.com/vbucks',
    p1AfterLink:
      ' معرفی شده است. تمامی اسکین‌های روزانه، باندل‌های همکاری مارول و انیمه، پیک‌اکس‌ها، گلایدرها، ایموت‌ها، ترک‌های موسیقی فستیوال و پس‌های فصلی تنها با وی‌باکس قابل تهیه هستند.',
    p2: 'به لطف سیستم کیف پول مشترک اپیک گیمز (Fortnite Shared Wallet)، وی‌باکسی که روی اکانت شما شارژ می‌شود به حساب Epic Games شما متصل است و هم‌زمان روی PC، PlayStation 4، PlayStation 5، Xbox، اندروید و کلود گیمینگ قابل مشاهده و خرج کردن است.',
    p3: 'وی‌باکس‌های خریداری‌شده هیچ تاریخ انقضایی ندارند و تا هر زمان که بخواهید در اکانت شما باقی می‌مانند. همچنین در بسته‌های بزرگ‌تر، درصدی وی‌باکس اضافه (Bonus V-Bucks) دریافت می‌کنید که هزینه تمام‌شده هر ۱٬۰۰۰ وی‌باکس را به‌طور محسوسی کاهش می‌دهد.',
  },
  benefitsHeader: {
    kicker: 'کاربردها و بسته‌ها',
    title: 'با خرید وی‌باکس فورتنایت چه امکانات و بسته‌هایی در اختیار دارید؟',
  },
  benefitBlocks: [
    {
      id: 'b-0',
      kicker: 'خرید از فروشگاه بازی',
      title: 'خرید اسکین، ایموت و باندل از آیتم‌شاپ روزانه',
      tag: 'آیتم‌شاپ روزانه',
      p1: 'آیتم‌شاپ فورتنایت هر شب ساعت ۰۳:۳۰ بامداد به وقت ایران بروزرسانی می‌شود و اسکین‌های اورجینال، کاراکترهای سینمایی، بازیگران، خوانندگان (Icon Series) و ایموت‌های جدید را عرضه می‌کند.',
      p2: 'با داشتن موجودی وی‌باکس آماده در اکانت، هر زمان اسکین یا باندل کمیاب موردعلاقه‌تان وارد شاپ شد، پیش از خروج آن از فروشگاه می‌توانید بلافاصله آن را به لاکر خود اضافه کنید.',
      link: 'مشاهده آیتم‌شاپ امروز',
      href: '/fortnite-shop',
      link2: 'همه محصولات فورتنایت',
      href2: '/store/fortnite',
      grad: 'linear-gradient(150deg,#1b2c4a,#0a0f1a 70%)',
      glow: 'rgba(120,180,255,.35)',
      ink: '#9fc6ff',
      icon: 'coin',
    },
    {
      id: 'b-1',
      kicker: 'باز کردن جوایز فصل',
      title: 'فعال‌سازی بتل‌پس، OG Pass، LEGO Pass و Music Pass',
      tag: 'آنلاک پس‌ها',
      p1: 'با موجودی وی‌باکس خود می‌توانید مستقیماً داخل بازی، بتل‌پس اصلی فصل (۱٬۰۰۰ وی‌باکس)، پس کلاسیک OG Pass (۱٬۰۰۰ وی‌باکس)، لگو پس (۱٬۴۰۰ وی‌باکس) یا موزیک پس فستیوال (۱٬۴۰۰ وی‌باکس) را فعال کنید.',
      p2: 'نکته جذاب اینجاست که با تکمیل صفحات بتل‌پس اصلی در طول فصل، تا ۱٬۵۰۰ وی‌باکس دوباره به موجودی اکانت شما برمی‌گردد.',
      link: 'خرید بتل‌پس فورتنایت',
      href: '/product/fortnite-battle-pass',
      link2: 'خرید کروپک فورتنایت',
      href2: '/product/fortnite-crew',
      grad: 'linear-gradient(150deg,#4a2a10,#1a0e06 70%)',
      glow: 'rgba(255,160,70,.35)',
      ink: '#ffb866',
      icon: 'medal',
    },
    {
      id: 'b-2',
      kicker: 'ارسال هدیه درون‌بازی',
      title: 'گیفت کردن (Gift) اسکین و آیتم به دوستان',
      tag: 'گیفت به دوستان',
      p1: 'یکی از محبوب‌ترین قابلیت‌های وی‌باکس شارژشده روی اکانت، امکان استفاده از سیستم Gifting در آیتم‌شاپ است. شما می‌توانید هر اسکین، دنس یا باندل موجود در شاپ را با وی‌باکس اکانت خودتان برای دوستانتان در لیست Friends به صورت هدیه بفرستید.',
      p2: 'تنها کافی است تایید دومرحله‌ای (2FA) اکانت اپیک گیمز شما فعال باشد و حداقل ۴۸ ساعت از دوستی شما با بازیکن مقصد در فورتنایت گذشته باشد.',
      link: 'آموزش فعال‌سازی 2FA اپیک',
      href: '/guides',
      link2: 'آیتم‌شاپ روزانه',
      href2: '/fortnite-shop',
      grad: 'linear-gradient(150deg,#4a1626,#1a0910 70%)',
      glow: 'rgba(242,184,75,.35)',
      ink: '#f2b84b',
      icon: 'gift',
    },
    {
      id: 'b-3',
      kicker: 'بسته پایه و اقتصادی',
      title: 'بسته ۸۰۰ و ۱٬۰۰۰ وی‌باکس؛ مناسب بتل‌پس و ایموت',
      tag: 'بسته اقتصادی',
      p1: 'کوچک‌ترین بسته وی‌باکس فورتنایت بهترین گزینه برای بازیکنانی است که می‌خواهند با کمترین هزینه، کسری موجودی اکانت خود را جبران کنند، بتل‌پس فصل جدید را بخرند یا یک اسکین ۸۰۰ وی‌باکسی و ایموت از شاپ تهیه نمایند.',
      p2: 'اگر علاوه بر ۱٬۰۰۰ وی‌باکس به دنبال اسکین ماهانه و باز شدن هم‌زمان همه پس‌ها هستید، پیشنهاد می‌کنیم صفحه کروپک فورتنایت را هم بررسی کنید.',
      link: 'مقایسه با کروپک فورتنایت',
      href: '/product/fortnite-crew',
      link2: 'خرید استارتر پک فورتنایت',
      href2: '/product/fortnite-starter-pack',
      grad: 'linear-gradient(150deg,#14382f,#08130f 70%)',
      glow: 'rgba(90,220,170,.3)',
      ink: '#7be0c3',
      icon: 'bolt',
    },
    {
      id: 'b-4',
      kicker: 'پرفروش‌ترین بسته میان‌رده',
      title: 'بسته‌های ۱٬۶۰۰ و ۲٬۴۰۰ تا ۲٬۸۰۰ وی‌باکس؛ مناسب اسکین‌های شاپ',
      tag: 'بسته میان‌رده',
      p1: 'بیشتر اسکین‌های محبوب فورتنایت، کاراکترهای انیمه، مارول و باندل‌های تک‌کاراکتر بین ۱٬۵۰۰ تا ۲٬۴۰۰ وی‌باکس قیمت دارند. به همین دلیل بسته‌های ۱٬۶۰۰ و ۲٬۴۰۰ تا ۲٬۸۰۰ وی‌باکسی پرفروش‌ترین گزینه‌ها برای خرید مستقیم از آیتم‌شاپ هستند.',
      p2: 'با انتخاب این بسته‌ها از منوی بالای صفحه، موجودی کافی برای خرید یک اسکین کامل به همراه پیک‌اکس یا ایموت ست آن را در اختیار خواهید داشت.',
      link: 'بررسی قیمت اسکین‌ها در شاپ',
      href: '/fortnite-shop',
      link2: 'راهنمای خرید وی‌باکس',
      href2: '/guides',
      grad: 'linear-gradient(150deg,#4a1a3a,#170a13 70%)',
      glow: 'rgba(255,110,190,.3)',
      ink: '#ff9fd6',
      icon: 'sun',
    },
    {
      id: 'b-5',
      kicker: 'مناسب باندل‌های کامل و مگا پک‌ها',
      title: 'بسته‌های ۴٬۵۰۰ تا ۱۳٬۵۰۰ وی‌باکس؛ بیشترین وی‌باکس جایزه',
      tag: 'بسته حرفه‌ای',
      p1: 'برای گیمرهایی که قصد خرید باندل‌های کامل همکاری (Full Bundles)، اسکین‌های تیمی، آیتم‌های مود لگو و ماشین‌های اسپرت شاپ را دارند، بسته‌های ۴٬۵۰۰/۵٬۰۰۰ و ۱۲٬۵۰۰/۱۳٬۵۰۰ وی‌باکس بالاترین صرفه اقتصادی را ارائه می‌دهند.',
      p2: 'در این بسته‌ها درصد قابل توجهی وی‌باکس رایگان (Bonus) روی پک لحاظ شده است تا به ازای هر تومان پرداختی، بیشترین مقدار وی‌باکس را دریافت کنید.',
      link: 'فروشگاه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'ارتباط با پشتیبانی',
      href2: '/contact',
      grad: 'linear-gradient(150deg,#2f1a4a,#100a1a 70%)',
      glow: 'rgba(180,140,255,.35)',
      ink: '#c9a7ff',
      icon: 'cube',
    },
    {
      id: 'b-6',
      kicker: 'سازگاری کامل پلتفرم‌ها',
      title: 'کیف پول یکپارچه روی PC، پلی‌استیشن، ایکس‌باکس و موبایل',
      tag: 'Shared Wallet',
      p1: 'شارژ وی‌باکس در تایتان از طریق درگاه رسمی روی اکانت متصل شما انجام می‌شود. به محض تکمیل سفارش، موجودی وی‌باکس در حساب Epic Games، کنسول‌های PlayStation 4/5، کنسول‌های Xbox و نسخه موبایل شما همگام‌سازی می‌گردد.',
      p2: 'کافی است اکانت کنسول شما به حساب اپیک گیمزتان لینک باشد تا در هر پلتفرمی که بازی را اجرا می‌کنید، به کل موجودی وی‌باکس و آیتم‌های خریداری‌شده دسترسی داشته باشید.',
      link: 'آموزش اتصال کنسول به اپیک',
      href: '/guides',
      link2: 'سوالات متداول',
      href2: '/faq',
      grad: 'linear-gradient(150deg,#15304a,#08121a 70%)',
      glow: 'rgba(80,200,255,.3)',
      ink: '#78d4ff',
      icon: 'note',
    },
  ],
  activation: {
    kicker: 'مراحل شارژ',
    title: 'نحوه شارژ و تحویل وی‌باکس فورتنایت در تایتان',
    subtitle:
      'شارژ وی‌باکس به‌صورت مستقیم و رسمی روی اکانت شما انجام می‌شود و تنها چهار مرحله ساده دارد.',
    steps: [
      {
        num: '۱',
        title: 'انتخاب بسته و پرداخت ریالی',
        text: 'از بالای صفحه مقدار وی‌باکس دلخواه خود را انتخاب کرده، روی «افزودن به سبد خرید» بزنید و با کارت شتاب یا کیف پول تایتان پرداخت کنید.',
      },
      {
        num: '۲',
        title: 'ثبت اطلاعات اکانت بازی',
        consoleBeforeLink:
          'اگر روی پلی‌استیشن یا ایکس‌باکس بازی می‌کنید و حساب کنسول‌تان هنوز به اپیک گیمز متصل نیست، از بخش اتصال حساب‌ها در ',
        consoleLinkLabel: 'Epic Games',
        consoleLinkHref: 'https://www.epicgames.com',
        consoleAfterLink: ' آن را متصل نمایید.',
      },
      {
        num: '۳',
        title: 'شارژ رسمی از طریق استور',
        text: 'کارشناسان تایتان بسته وی‌باکس انتخابی شما را از طریق استور رسمی و با رسید معتبر روی حساب شما شارژ می‌کنند.',
      },
      {
        num: '۴',
        title: 'تحویل و بررسی موجودی در بازی',
        text: 'پس از تکمیل سفارش، پیامک و اعلان تحویل برایتان ارسال می‌شود و موجودی وی‌باکس بلافاصله در بالای صفحه بازی قابل استفاده است.',
      },
    ],
  },
  priceDelivery: {
    kicker: 'قیمت و تحویل',
    title: 'قیمت بسته‌های وی‌باکس فورتنایت، روش پرداخت و زمان تحویل',
    subtitle:
      'در تایتان نیازی به گیفت کارت دلاری یا تغییر ریجن دستی ندارید؛ هر بسته وی‌باکس را با پرداخت ریالی سفارش دهید.',
    tile1Label: 'قیمت بسته انتخابی',
    tile1SubWhenNoDiscount:
      'بسته دلخواه خود را از منوی انتخاب گزینه در بالای صفحه تغییر دهید',
    tile2Label: 'زمان تحویل',
    tile2Sub: 'پس از ثبت نهایی سفارش، در ساعات کاری',
    tile3Label: 'روش تحویل',
    tile3Value: 'شارژ مستقیم روی اکانت',
    tile3Sub: 'همگام‌سازی خودکار روی PC، PS4، PS5، Xbox و موبایل',
    guideBeforeLink: 'برای آشنایی گام‌به‌گام با پیش‌نیازهای اکانت قبل از خرید، ',
    guideLinkLabel: 'مرکز آموزش و راهنمای خرید فورتنایت در تایتان',
    guideLinkHref: '/guides',
    guideAfterLink: ' را مطالعه کنید.',
  },
  comparison: {
    kicker: 'راهنمای انتخاب بسته',
    title: 'چقدر وی‌باکس برای خرید آیتم‌های فورتنایت نیاز دارید؟',
    p1: 'قیمت آیتم‌ها در فروشگاه فورتنایت بر اساس کمیابی و نوع باندل متفاوت است. جدول مقابل به شما کمک می‌کند قبل از انتخاب بسته وی‌باکس، بدانید هر آیتم در بازی چند وی‌باکس هزینه دارد تا دقیقاً بسته متناسب با نیازتان را تهیه کنید.',
    p2BeforeLink1:
      'اگر قصد دارید در کنار ۱٬۰۰۰ وی‌باکس، بتل‌پس فصل و همه پس‌های دیگر را یک‌جا باز کنید، ',
    p2Link1Label: 'خرید کروپک فورتنایت',
    p2Link1Href: '/product/fortnite-crew',
    p2BetweenLinks:
      ' انتخاب اقتصادی‌تری است. همچنین قوانین کیف پول مشترک فورتنایت را در ',
    p2EpicLabel: 'مرکز راهنمای Epic Games',
    p2EpicHref: 'https://www.epicgames.com',
    p2AfterEpic: ' می‌توانید مشاهده کنید.',
    tableHeading: 'تعرفه رایج آیتم‌ها در داخل بازی فورتنایت (به وی‌باکس)',
    rows: [
      { label: 'ایموت‌ها و دنس‌های آیتم‌شاپ', value: '۳۰۰ تا ۵۰۰ وی‌باکس' },
      { label: 'بتل‌پس اصلی یا OG Pass فورتنایت', value: '۱٬۰۰۰ وی‌باکس' },
      { label: 'لگو پس (LEGO) یا موزیک پس (Festival)', value: '۱٬۴۰۰ وی‌باکس' },
      { label: 'اسکین‌های استاندارد و همکاری (Icon / Marvel)', value: '۸۰۰ تا ۲٬۰۰۰ وی‌باکس' },
      { label: 'باندل‌های کامل کاراکتر و تجهیزات ست', value: '۲٬۲۰۰ تا ۳٬۵۰۰ وی‌باکس' },
    ],
    total: {
      label: 'پیشنهاد پرفروش برای خرید باندل کامل شاپ',
      value: 'بسته ۲٬۴۰۰ تا ۴٬۵۰۰ وی‌باکس',
    },
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: {
    kicker: 'ادامه مسیر',
    title: 'سایر محصولات و صفحات پرکاربرد فورتنایت',
  },
  relatedLinks: [
    { href: '/product/fortnite-crew', label: 'خرید کروپک فورتنایت' },
    { href: '/product/fortnite-battle-pass', label: 'خرید بتل‌پس فورتنایت' },
    { href: '/product/fortnite-starter-pack', label: 'خرید استارتر پک فورتنایت' },
    { href: '/fortnite-shop', label: 'آیتم‌شاپ امروز فورتنایت' },
    { href: '/store/fortnite', label: 'همه محصولات فورتنایت' },
    { href: '/guides', label: 'آموزش‌ها و راهنمای خرید' },
    { href: '/faq', label: 'سوالات متداول' },
    { href: '/contact', label: 'ارتباط با پشتیبانی' },
  ],
  faqHeader: {
    kicker: 'پرسش‌ها',
    title: 'سوالات متداول درباره خرید وی‌باکس فورتنایت',
    beforeContact: CREW_FAQ_HEADER.beforeContact,
    contactLabel: CREW_FAQ_HEADER.contactLabel,
    contactHref: CREW_FAQ_HEADER.contactHref,
    betweenLinks: CREW_FAQ_HEADER.betweenLinks,
    faqLabel: CREW_FAQ_HEADER.faqLabel,
    faqHref: CREW_FAQ_HEADER.faqHref,
    afterFaq: CREW_FAQ_HEADER.afterFaq,
  },
  faqItems: [
    {
      question: 'شارژ وی‌باکس فورتنایت در تایتان چقدر طول می‌کشد؟',
      answer:
        'تمامی سفارش‌های وی‌باکس بین ۱۵ دقیقه تا حداکثر ۲ ساعت پس از ثبت نهایی سفارش در ساعات کاری روی اکانت شما شارژ می‌شوند و وضعیت سفارش از پنل کاربری قابل پیگیری است.',
    },
    {
      question: 'آیا خرید وی‌باکس از تایتان قانونی است و خطر بن شدن یا منفی شدن دارد؟',
      answer:
        'بله؛ شارژ وی‌باکس در تایتان از طریق استور رسمی و با پرداخت معتبر انجام می‌شود، بنابراین هیچ‌گونه خطر منفی شدن موجودی وی‌باکس یا محدودیت برای اکانت شما وجود ندارد.',
    },
    {
      question: 'آیا وی‌باکس شارژشده روی پلی‌استیشن، ایکس‌باکس، PC و موبایل مشترک است؟',
      answer:
        'بله؛ به لطف سیستم Shared Wallet فورتنایت، اگر کنسول یا موبایل شما به همان حساب Epic Games متصل باشد، موجودی وی‌باکس روی PC، PS4، PS5، Xbox و موبایل یکسان و قابل استفاده خواهد بود.',
    },
    {
      question: 'آیا با این وی‌باکس‌ها می‌توانم به دوستانم اسکین گیفت (Gift) کنم؟',
      answer:
        'بله؛ وی‌باکس شارژشده روی اکانت هیچ تفاوتی با خرید مستقیم درون‌بازی ندارد و در صورت فعال بودن تایید دومرحله‌ای (2FA) و گذشتن ۴۸ ساعت از دوستی با فرد مقابل، می‌توانید هر آیتم شاپ را گیفت کنید.',
    },
    {
      question: 'آیا وی‌باکس‌های فورتنایت تاریخ انقضا دارند؟',
      answer:
        'خیر؛ وی‌باکس‌های اضافه‌شده به حساب شما دائمی هستند و پایان فصل یا شروع چپتر جدید هیچ تاثیری روی موجودی وی‌باکس شما ندارد.',
    },
    {
      question: 'کدام بسته وی‌باکس برای خرید بتل‌پس و اسکین به‌صرفه‌تر است؟',
      answer:
        'برای خرید تکی بتل‌پس بسته ۱٬۰۰۰ وی‌باکسی کافی است، اما برای خرید اسکین‌ها و باندل‌های آیتم‌شاپ، بسته‌های ۲٬۴۰۰/۲٬۸۰۰ و ۴٬۵۰۰/۵٬۰۰۰ وی‌باکس به دلیل داشتن وی‌باکس جایزه (Bonus) ارزش خرید بسیار بالاتری دارند.',
    },
    {
      question: 'فرق خرید وی‌باکس با خرید اشتراک کروپک فورتنایت چیست؟',
      answer:
        'وی‌باکس ارز خالص بازی است که به هر میزان دلخواه می‌خرید؛ اما کروپک یک اشتراک ماهانه است که ۱٬۰۰۰ وی‌باکس، باندل اسکین ماه و دسترسی به ۴ پس فورتنایت را با هم فعال می‌کند.',
      segments: [
        {
          type: 'text',
          value:
            'وی‌باکس ارز خالص بازی است که به هر میزان دلخواه می‌خرید؛ اما ',
        },
        {
          type: 'link',
          label: 'کروپک فورتنایت',
          href: '/product/fortnite-crew',
        },
        {
          type: 'text',
          value:
            ' یک اشتراک ماهانه است که ۱٬۰۰۰ وی‌باکس، باندل اسکین ماه و دسترسی به ۴ پس فورتنایت را با هم فعال می‌کند.',
        },
      ],
    },
    {
      question: 'اگر در فرآیند شارژ وی‌باکس مشکلی پیش بیاید چه می‌شود؟',
      answer:
        'وجه پرداختی شما تحت ضمانت کامل تایتان است و در صورت عدم امکان انجام سفارش، طبق قوانین تایتان به کارت بانکی یا کیف پول شما بازگردانده می‌شود.',
      segments: [
        {
          type: 'text',
          value:
            'وجه پرداختی شما تحت ضمانت کامل تایتان است و در صورت عدم امکان انجام سفارش، طبق ',
        },
        { type: 'link', label: 'قوانین تایتان', href: '/terms' },
        {
          type: 'text',
          value:
            ' به کارت بانکی یا کیف پول شما بازگردانده می‌شود و ',
        },
        { type: 'link', label: 'پشتیبانی ۲۴ ساعته', href: '/contact' },
        { type: 'text', value: ' همراه شماست.' },
      ],
    },
  ],
  finalCta: {
    title: 'آماده شارژ فوری وی‌باکس فورتنایت هستید؟',
    ctaLabel: 'افزودن به سبد خرید',
    ctaHref: '#buy',
  },
};

/* ==========================================================================
   3. FORTNITE BATTLE PASS (/product/fortnite-battle-pass)
   ========================================================================== */
export const FORTNITE_BATTLE_PASS_TEMPLATE: FortniteProductTemplate = {
  slugs: ['fortnite-battle-pass'],
  defaultPriceToman: 1165000,
  defaultOriginalPriceToman: 1290000,
  defaultDiscountPercent: 10,
  deliveryTime: '۱۵ دقیقه تا ۲ ساعت',
  readMoreSub: 'مشاهده ۶ مزیت بتل‌پس، نحوه فعال‌سازی و سؤالات متداول',
  hero: {
    eyebrow: 'پاس فصلی Fortnite Battle Pass',
    title: 'خرید بتل‌پس فورتنایت',
    lead: 'با خرید بتل‌پس فصل جدید فورتنایت از تایتان، قفل بیش از ۱۰۰ جایزه پریمیوم سیزن شامل اسکین‌های داستانی و همکاری ویژه، پیک‌اکس، گلایدر، ایموت و تا ۱٬۵۰۰ وی‌باکس قابل بازگشت را روی اکانت اپیک گیمز خود باز کنید.',
    factChips: [
      'بیش از ۱۰۰ جایزه پریمیوم فصل',
      'بازگشت تا ۱٬۵۰۰ وی‌باکس',
      'باز شدن فوری اسکین اول',
      'پیشرفت XP در تمام مودها',
      'تحویل ۱۵ دقیقه تا ۲ ساعت',
    ],
    ctaLabel: 'افزودن به سبد خرید',
    carouselHint: 'کارت‌ها را ورق بزنید؛ روی کارت وسط کلیک کنید تا به توضیحاتش بروید.',
  },
  intro: {
    kicker: 'بتل‌پس چیست؟',
    title: 'بتل‌پس فورتنایت چیست و چطور تا ۱٬۵۰۰ وی‌باکس به شما برمی‌گرداند؟',
    p1BeforeLink:
      'بتل‌پس فورتنایت (Fortnite Battle Pass) سیستم پاداش فصلی اصلی بازی Fortnite است که در هر سیزن جدید توسط ',
    p1LinkLabel: 'Epic Games',
    p1LinkHref: 'https://www.fortnite.com',
    p1AfterLink:
      ' با تم داستانی تازه، کاراکترهای اورجینال و اسکین‌های همکاری بزرگ عرضه می‌شود. با فعال‌سازی بتل‌پس، تمام صفحات جوایز پریمیوم فصل روی اکانت شما باز شده و با بازی کردن و لول‌آپ شدن می‌توانید همه آن‌ها را به لاکر خود اضافه کنید.',
    p2: 'مهم‌ترین ویژگی اقتصادی بتل‌پس فورتنایت این است که در صفحات مختلف آن مجموعاً تا ۱٬۵۰۰ وی‌باکس جایزه قرار داده شده است؛ یعنی با رساندن لول فصل خود به سطح کامل، نه‌تنها کل هزینه بتل‌پس فصل بعد (۱٬۰۰۰ وی‌باکس) را رایگان به دست می‌آورید، بلکه ۵۰۰ وی‌باکس سود خالص نیز برای خرید از آیتم‌شاپ خواهید داشت.',
    p3: 'تمام اسکین‌ها، استایل‌های Bonus و آیتم‌هایی که از بتل‌پس آزاد می‌کنید برای همیشه در حساب شما باقی می‌مانند و در تمام پلتفرم‌های متصل (PC، پلی‌استیشن، ایکس‌باکس، سوییچ و موبایل) قابل استفاده هستند.',
  },
  benefitsHeader: {
    kicker: 'جوایز و مزایا',
    title: 'با فعال‌سازی بتل‌پس فورتنایت چه آیتم‌هایی دریافت می‌کنید؟',
  },
  benefitBlocks: [
    {
      id: 'b-0',
      kicker: 'گنجینه کامل سیزن',
      title: 'دسترسی به بیش از ۱۰۰ جایزه پریمیوم فصل',
      tag: '+۱۰۰ جایزه فصل',
      p1: 'بتل‌پس هر سیزن فورتنایت شامل ۱۴ صفحه اصلی از جوایز پریمیوم است که شامل ۷ تا ۸ اسکین کامل، بک‌بلینگ، پیک‌اکس، گلایدر، کنتریل، پوشش سلاح (Wrap)، ایموت، بنر و ترک‌های لابی می‌شود.',
      p2: 'تمامی این آیتم‌ها با تم اختصاصی همان سیزن طراحی شده‌اند و پس از پایان فصل دیگر در صفحات بتل‌پس بعدی تکرار نمی‌شوند.',
      link: 'همه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'آیتم‌شاپ امروز فورتنایت',
      href2: '/fortnite-shop',
      grad: 'linear-gradient(150deg,#4a2a10,#1a0e06 70%)',
      glow: 'rgba(255,160,70,.35)',
      ink: '#ffb866',
      icon: 'medal',
    },
    {
      id: 'b-1',
      kicker: 'سرمایه‌گذاری خودگردان',
      title: 'بازگشت تا ۱٬۵۰۰ وی‌باکس در طول فصل',
      tag: '۱٬۵۰۰ وی‌باکس',
      p1: 'در لابه‌لای صفحات بتل‌پس و بخش Bonus Rewards، بسته‌های ۱۰۰ وی‌باکسی قرار دارند که با پیشروی در لول فصل آزاد می‌شوند و در مجموع تا ۱٬۵۰۰ وی‌باکس به موجودی اکانت شما اضافه می‌کنند.',
      p2: 'این وی‌باکس‌ها کاملاً دائمی هستند؛ می‌توانید ۱٬۰۰۰ وی‌باکس آن را برای بتل‌پس سیزن بعدی نگه دارید یا در آیتم‌شاپ روزانه فورتنایت خرج کنید.',
      link: 'خرید وی‌باکس اضافه',
      href: '/product/fortnite-vbucks',
      link2: 'مشاهده آیتم‌شاپ امروز',
      href2: '/fortnite-shop',
      grad: 'linear-gradient(150deg,#1b2c4a,#0a0f1a 70%)',
      glow: 'rgba(120,180,255,.35)',
      ink: '#9fc6ff',
      icon: 'coin',
    },
    {
      id: 'b-2',
      kicker: 'پاداش لحظه خرید',
      title: 'باز شدن فوری اسکین اول به محض فعال‌سازی',
      tag: 'اسکین فوری',
      p1: 'به محض اینکه بتل‌پس فصل جاری روی اکانت شما فعال شود، حتی در لول ۱ و پیش از انجام اولین مسابقه، اسکین شاخص صفحه اول بتل‌پس (به همراه نسخه LEGO Style آن) بلافاصله در لاکر شما آنلاک می‌گردد.',
      p2: 'اگر هم قبل از خرید بتل‌پس در طول فصل بازی کرده و لول خود را بالا برده باشید، تمام جوایز صفحات قبلی به‌صورت یک‌جا برایتان قابل دریافت می‌شوند.',
      link: 'خرید کروپک فورتنایت',
      href: '/product/fortnite-crew',
      link2: 'خرید استارتر پک',
      href2: '/product/fortnite-starter-pack',
      grad: 'linear-gradient(150deg,#4a1626,#1a0910 70%)',
      glow: 'rgba(242,184,75,.35)',
      ink: '#f2b84b',
      icon: 'gift',
    },
    {
      id: 'b-3',
      kicker: 'جوایز سطح بالا (لول ۱۰۰ به بعد)',
      title: 'استایل‌های Bonus، Super Styles و اسکین مخفی فصل',
      tag: 'Super Styles',
      p1: 'کار بتل‌پس با رسیدن به لول ۱۰۰ تمام نمی‌شود! پس از تکمیل صفحات اصلی، بخش Bonus Rewards و استایل‌های درخشان Superlevel (مانند استایل‌های طلایی، نئونی و کهکشانی) برای کاراکترهای فصل باز می‌شوند.',
      p2: 'همچنین با انجام ماموریت‌های ویژه فصل (Quest Rewards)، اسکین ویژه میانه فصل و ست کامل تجهیزات او را نیز بدون هزینه اضافه دریافت خواهید کرد.',
      link: 'تورنومنت‌های فورتنایت تایتان',
      href: '/tournament',
      link2: 'مرکز آموزش تایتان',
      href2: '/guides',
      grad: 'linear-gradient(150deg,#2f1a4a,#100a1a 70%)',
      glow: 'rgba(180,140,255,.35)',
      ink: '#c9a7ff',
      icon: 'sun',
    },
    {
      id: 'b-4',
      kicker: 'سیستم پیشروی یکپارچه',
      title: 'کسب XP و لول‌آپ از تمام مودهای بازی فورتنایت',
      tag: 'XP مشترک',
      p1: 'در سیستم جدید فورتنایت، فرقی نمی‌کند کدام مود را بازی کنید؛ تجربه (XP) کسب‌شده در Battle Royale، Zero Build، Reload، Fortnite OG، مپ‌های Creative/UEFN، مود LEGO Fortnite، Rocket Racing و Festival مستقیماً لول بتل‌پس شما را بالا می‌برد.',
      p2: 'بنابراین حتی با بازی کردن در مپ‌های تمرینی یا مودهای سرگرمی با دوستانتان، صفحات بتل‌پس شما با سرعت بالا تکمیل می‌شوند.',
      link: 'فروشگاه فورتنایت',
      href: '/store/fortnite',
      link2: 'سوالات متداول',
      href2: '/faq',
      grad: 'linear-gradient(150deg,#14382f,#08130f 70%)',
      glow: 'rgba(90,220,170,.3)',
      ink: '#7be0c3',
      icon: 'bolt',
    },
    {
      id: 'b-5',
      kicker: 'پشتیبانی کامل از مود لگو',
      title: 'شامل نسخه‌های LEGO Style برای اسکین‌های فصل',
      tag: 'LEGO Style',
      p1: 'تمامی اسکین‌های اورجینال موجود در بتل‌پس فورتنایت دارای نسخه طراحی‌شده LEGO Style هستند؛ یعنی با باز کردن هر کاراکتر در بتل‌پس، به طور هم‌زمان کاراکتر لگویی آن را هم برای مود LEGO Fortnite دریافت می‌کنید.',
      p2: 'تمام این اسکین‌ها و آیتم‌ها روی PC، کنسول‌های پلی‌استیشن و ایکس‌باکس، نینتندو سوییچ و موبایل در دسترس شما خواهند بود.',
      link: 'ارتباط با پشتیبانی',
      href: '/contact',
      link2: 'قوانین و شرایط',
      href2: '/terms',
      grad: 'linear-gradient(150deg,#15304a,#08121a 70%)',
      glow: 'rgba(80,200,255,.3)',
      ink: '#78d4ff',
      icon: 'cube',
    },
  ],
  activation: {
    kicker: 'فعال‌سازی',
    title: 'نحوه خرید و فعال‌سازی بتل‌پس فورتنایت در تایتان',
    subtitle:
      'فعال‌سازی بتل‌پس فصل جاری به‌صورت مستقیم روی حساب اپیک گیمز شما انجام می‌شود و چهار مرحله ساده دارد.',
    steps: [
      {
        num: '۱',
        title: 'ثبت سفارش و پرداخت ریالی',
        text: 'روی دکمه «افزودن به سبد خرید» بزنید و هزینه سفارش را با کارت بانکی عضو شتاب یا کیف پول تایتان پرداخت کنید.',
      },
      {
        num: '۲',
        title: 'ثبت اطلاعات اکانت اپیک گیمز',
        consoleBeforeLink:
          'اگر روی کنسول بازی می‌کنید و حساب پلی‌استیشن یا ایکس‌باکس شما به اپیک گیمز متصل نیست، از بخش اتصال حساب‌ها در ',
        consoleLinkLabel: 'Epic Games',
        consoleLinkHref: 'https://www.epicgames.com',
        consoleAfterLink: ' آن را لینک کنید.',
      },
      {
        num: '۳',
        title: 'شارژ و فعال‌سازی بتل‌پس فصل',
        text: 'کارشناسان تایتان بتل‌پس فصل جاری را از طریق شارژ رسمی روی اکانت شما فعال می‌کنند تا تمام صفحات فصل باز شود.',
      },
      {
        num: '۴',
        title: 'ورود به بازی و دریافت جوایز',
        text: 'پس از دریافت اعلان تکمیل سفارش، وارد فورتنایت شوید و اسکین اول و جوایز آنلاک‌شده بر اساس لول فعلی‌تان را دریافت کنید.',
      },
    ],
  },
  priceDelivery: {
    kicker: 'قیمت و تحویل',
    title: 'قیمت بتل‌پس فورتنایت، روش پرداخت و زمان تحویل',
    subtitle:
      'بدون نیاز به خرید دلاری، بتل‌پس سیزن جاری فورتنایت را با کارت شتاب سفارش دهید و روی اکانت خود تحویل بگیرید.',
    tile1Label: 'قیمت بتل‌پس فصل جاری',
    tile1SubWhenNoDiscount:
      'شامل بازگشت تا ۱٬۵۰۰ وی‌باکس با تکمیل صفحات بتل‌پس در طول سیزن',
    tile2Label: 'زمان تحویل',
    tile2Sub: 'پس از ثبت نهایی سفارش، در ساعات کاری',
    tile3Label: 'روش تحویل',
    tile3Value: 'فعال‌سازی مستقیم روی اکانت',
    tile3Sub: 'قابل استفاده روی PC، PS4، PS5، Xbox، Nintendo Switch و موبایل',
    guideBeforeLink: 'برای مطالعه نکات تکمیلی درباره تفاوت بتل‌پس و کروپک، ',
    guideLinkLabel: 'راهنمای خرید بتل‌پس و کروپک فورتنایت',
    guideLinkHref: '/guides',
    guideAfterLink: ' را ببینید.',
  },
  comparison: {
    kicker: 'مقایسه ارزش خرید',
    title: 'خرید بتل‌پس تکی بهتر است یا اشتراک کروپک فورتنایت؟',
    p1: 'بتل‌پس اصلی فورتنایت ۱٬۰۰۰ وی‌باکس ارزش دارد و با تکمیل آن تا ۱٬۵۰۰ وی‌باکس و بیش از ۱۰۰ آیتم فصل را دریافت می‌کنید. اما اگر علاوه بر بتل‌پس اصلی، به ۱٬۰۰۰ وی‌باکس نقدی، اسکین ماهانه و باز شدن هم‌زمان OG Pass، LEGO Pass و Music Pass هم علاقه دارید، اشتراک Fortnite Crew ارزش خرید فوق‌العاده‌ای دارد.',
    p2BeforeLink1:
      'بنابراین پیش از خرید پیشنهاد می‌کنیم مزایای ',
    p2Link1Label: 'خرید کروپک فورتنایت',
    p2Link1Href: '/product/fortnite-crew',
    p2BetweenLinks:
      ' را نیز بررسی کنید. جزئیات رسمی سیزن جاری و قوانین بتل‌پس در ',
    p2EpicLabel: 'سایت رسمی Epic Games',
    p2EpicHref: 'https://www.epicgames.com',
    p2AfterEpic: ' در دسترس است.',
    tableHeading: 'محتویات دریافتی با فعال‌سازی بتل‌پس فصل',
    rows: [
      { label: 'هزینه پایه داخل بازی', value: '۱٬۰۰۰ وی‌باکس' },
      { label: 'وی‌باکس قابل بازگشت در طول فصل', value: 'تا ۱٬۵۰۰ وی‌باکس' },
      { label: 'تعداد اسکین‌های پریمیوم فصل', value: '۷ تا ۸ اسکین + LEGO Style' },
      { label: 'جوایز Bonus و Superlevel Styles', value: 'شامل می‌شود' },
      { label: 'تعداد کل آیتم‌های تزئینی فصل', value: 'بیش از ۱۰۰ آیتم دائمی' },
    ],
    total: {
      label: 'سود خالص وی‌باکس پس از تکمیل فصل',
      value: '+۵۰۰ وی‌باکس اضافه + تمام اسکین‌ها',
    },
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: {
    kicker: 'ادامه مسیر',
    title: 'قبل از خرید این صفحات را ببینید',
  },
  relatedLinks: [
    { href: '/product/fortnite-crew', label: 'خرید کروپک فورتنایت' },
    { href: '/product/fortnite-vbucks', label: 'خرید وی‌باکس فورتنایت' },
    { href: '/product/fortnite-starter-pack', label: 'خرید استارتر پک فورتنایت' },
    { href: '/fortnite-shop', label: 'آیتم‌شاپ امروز فورتنایت' },
    { href: '/store/fortnite', label: 'همه محصولات فورتنایت' },
    { href: '/guides', label: 'آموزش‌ها و راهنمای خرید' },
    { href: '/faq', label: 'سوالات متداول' },
    { href: '/contact', label: 'ارتباط با پشتیبانی' },
  ],
  faqHeader: {
    kicker: 'پرسش‌ها',
    title: 'سوالات متداول درباره خرید بتل‌پس فورتنایت',
    beforeContact: CREW_FAQ_HEADER.beforeContact,
    contactLabel: CREW_FAQ_HEADER.contactLabel,
    contactHref: CREW_FAQ_HEADER.contactHref,
    betweenLinks: CREW_FAQ_HEADER.betweenLinks,
    faqLabel: CREW_FAQ_HEADER.faqLabel,
    faqHref: CREW_FAQ_HEADER.faqHref,
    afterFaq: CREW_FAQ_HEADER.afterFaq,
  },
  faqItems: [
    {
      question: 'اگر در اواسط یا اواخر فصل بتل‌پس را بخرم، جوایز لول‌های قبلی را می‌گیرم؟',
      answer:
        'بله! تمام لول‌ها و XPهایی که از ابتدای فصل کسب کرده‌اید محفوظ است و به محض فعال شدن بتل‌پس، تمام جوایز صفحات قبلی متناسب با لول فعلی شما یک‌جا باز می‌شوند.',
    },
    {
      question: 'با تکمیل بتل‌پس فورتنایت چند وی‌باکس گیرم می‌آید؟',
      answer:
        'با باز کردن تمام صفحات اصلی و صفحات Bonus بتل‌پس، در مجموع تا ۱٬۵۰۰ وی‌باکس دریافت می‌کنید که برای خرید بتل‌پس فصل بعدی (۱٬۰۰۰ وی‌باکس) به علاوه ۵۰۰ وی‌باکس ذخیره کاملاً کافی است.',
    },
    {
      question: 'آیا اسکین‌ها و آیتم‌های بتل‌پس بعد از پایان سیزن در اکانتم می‌مانند؟',
      answer:
        'بله؛ هر اسکین، پیک‌اکس، گلایدر، ایموت و وی‌باکسی که در طول فصل از بتل‌پس آنلاک کنید برای همیشه در لاکر اکانت شما باقی می‌ماند.',
    },
    {
      question: 'فعال‌سازی بتل‌پس فورتنایت در تایتان چقدر زمان می‌برد؟',
      answer:
        'سفارش بتل‌پس بین ۱۵ دقیقه تا حداکثر ۲ ساعت پس از ثبت نهایی در ساعات کاری روی اکانت شما فعال می‌شود.',
    },
    {
      question: 'برای بالا بردن لول بتل‌پس به چه لولی باید برسم تا همه ۱۵۰۰ وی‌باکس را بگیرم؟',
      answer:
        '۱٬۰۰۰ وی‌باکس اول در ۱۴ صفحه اصلی (تا لول ۱۰۰) قرار دارد و ۵۰۰ وی‌باکس باقی‌مانده در صفحات اولیه بخش Bonus Rewards (حدود لول ۱۴۰ تا ۱۵۰) آزاد می‌شود.',
    },
    {
      question: 'آیا بتل‌پس روی پلی‌استیشن، ایکس‌باکس، PC و موبایل هم‌زمان فعال می‌شود؟',
      answer:
        'بله؛ چون بتل‌پس روی حساب Epic Games شما فعال می‌گردد، در تمامی پلتفرم‌های متصل به همان اکانت به صورت هم‌زمان فعال و قابل پیشرفت است.',
    },
    {
      question: 'بتل‌پس تکی بخرم یا کروپک فورتنایت؟',
      answer:
        'اگر فقط بتل‌پس Battle Royale را می‌خواهید این محصول مناسب است؛ اما کروپک فورتنایت علاوه بر بتل‌پس اصلی، ۱٬۰۰۰ وی‌باکس، اسکین ماهانه، OG Pass، LEGO Pass و Music Pass را هم باز می‌کند.',
      segments: [
        {
          type: 'text',
          value:
            'اگر فقط بتل‌پس Battle Royale را می‌خواهید این محصول مناسب است؛ اما ',
        },
        {
          type: 'link',
          label: 'کروپک فورتنایت',
          href: '/product/fortnite-crew',
        },
        {
          type: 'text',
          value:
            ' علاوه بر بتل‌پس اصلی، ۱٬۰۰۰ وی‌باکس، اسکین ماهانه، OG Pass، LEGO Pass و Music Pass را هم باز می‌کند.',
        },
      ],
    },
    {
      question: 'اگر سفارش بتل‌پس به هر دلیل فنی فعال نشود چه می‌شود؟',
      answer:
        'مبلغ پرداختی شما طبق قوانین تایتان به صورت کامل به کارت بانکی یا کیف پول شما بازگردانده می‌شود و پشتیبانی ۲۴ ساعته پاسخگوی شماست.',
      segments: [
        { type: 'text', value: 'مبلغ پرداختی شما طبق ' },
        { type: 'link', label: 'قوانین تایتان', href: '/terms' },
        {
          type: 'text',
          value:
            ' به صورت کامل به کارت بانکی یا کیف پول شما بازگردانده می‌شود و ',
        },
        { type: 'link', label: 'پشتیبانی ۲۴ ساعته', href: '/contact' },
        { type: 'text', value: ' پاسخگوی شماست.' },
      ],
    },
  ],
  finalCta: {
    title: 'آماده باز کردن جوایز بتل‌پس این فصل هستید؟',
    ctaLabel: 'افزودن به سبد خرید',
    ctaHref: '#buy',
  },
};

/* ==========================================================================
   4. FORTNITE STARTER PACK (/product/fortnite-starter-pack)
   ========================================================================== */
export const FORTNITE_STARTER_PACK_TEMPLATE: FortniteProductTemplate = {
  slugs: ['fortnite-starter-pack'],
  defaultPriceToman: 1165000,
  defaultOriginalPriceToman: 1290000,
  defaultDiscountPercent: 10,
  deliveryTime: 'کمتر از ۳۰ دقیقه',
  readMoreSub: 'مشاهده ۶ آیتم و مزیت استارتر پک، مراحل تحویل و سؤالات متداول',
  hero: {
    eyebrow: 'بسته اقتصادی فصل Fortnite Starter Pack',
    title: 'خرید استارتر پک فورتنایت',
    lead: 'استارتر پک فورتنایت به‌صرفه‌ترین پکیج فصلی بازی است که در هر سیزن تنها یک‌بار منتشر می‌شود: دریافت فوری ۶۰۰ وی‌باکس نقدی به همراه یک اسکین انحصاری فصل، استایل لگو، بک‌بلینگ و پیک‌اکس ست با پرداخت ریالی و فعال‌سازی مستقیم روی اکانت شما.',
    factChips: [
      '۶۰۰ وی‌باکس نقدی فوری',
      'اسکین اختصاصی فصل',
      'بک‌بلینگ + پیک‌اکس ست',
      'دارای نسخه LEGO Style',
      'تحویل سریع زیر ۳۰ دقیقه',
    ],
    ctaLabel: 'افزودن به سبد خرید',
    carouselHint: 'کارت‌ها را ورق بزنید؛ روی کارت وسط کلیک کنید تا به توضیحاتش بروید.',
  },
  intro: {
    kicker: 'استارتر پک چیست؟',
    title: 'استارتر پک فورتنایت چیست و چرا با وی‌باکس داخل بازی قابل خرید نیست؟',
    p1BeforeLink:
      'استارتر پک فورتنایت (Fortnite Starter Pack) یک باندل رسمی است که در ابتدای هر فصل جدید توسط ',
    p1LinkLabel: 'Epic Games',
    p1LinkHref: 'https://www.fortnite.com',
    p1AfterLink:
      ' در بخش پیشنهادهای ویژه فروشگاه بازی عرضه می‌شود. برخلاف اسکین‌های معمولی آیتم‌شاپ، این پک با وی‌باکس قابل خرید نیست و تنها با پرداخت مستقیم دلاری در استور فعال می‌گردد.',
    p2: 'دلیل محبوبیت بالای استارتر پک در میان بازیکنان حرفه‌ای و تازه‌وارد این است که با قیمتی بسیار اقتصادی، هم ۶۰۰ وی‌باکس نقدی به حساب شما اضافه می‌کند و هم یک ست کامل اسکین کلکسیونی به همراه بک‌بلینگ و پیک‌اکس به شما هدیه می‌دهد.',
    p3: 'هر استارتر پک فقط تا پایان همان فصل در فروشگاه باقی می‌ماند و با شروع فصل جدید با پک تازه‌ای جایگزین می‌شود؛ اما آیتم‌ها و ۶۰۰ وی‌باکسی که دریافت کرده‌اید برای همیشه در لاکر اکانت شما ماندگار خواهند بود.',
  },
  benefitsHeader: {
    kicker: 'محتویات پکیج',
    title: 'با خرید استارتر پک فورتنایت چه چیزهایی دریافت می‌کنید؟',
  },
  benefitBlocks: [
    {
      id: 'b-0',
      kicker: 'اعتبار نقدی درون‌بازی',
      title: '۶۰۰ وی‌باکس (V-Bucks) فوری و قابل خرج در شاپ',
      tag: '۶۰۰ وی‌باکس',
      p1: 'بلافاصله پس از فعال‌سازی استارتر پک روی اکانت شما، ۶۰۰ عدد وی‌باکس به موجودی حسابتان اضافه می‌شود. این وی‌باکس‌ها دقیقاً مانند وی‌باکس‌های معمولی هستند و برای خرید بتل‌پس، اسکین، ایموت یا گیفت کردن به دوستان کاربرد دارند.',
      p2: 'اگر ۴۰۰ وی‌باکس از فصل‌های قبل در اکانت خود داشته باشید، با همین ۶۰۰ وی‌باکس استارتر پک می‌توانید مستقیماً بتل‌پس ۱٬۰۰۰ وی‌باکسی فصل را فعال کنید.',
      link: 'مشاهده آیتم‌شاپ امروز',
      href: '/fortnite-shop',
      link2: 'خرید وی‌باکس بیشتر',
      href2: '/product/fortnite-vbucks',
      grad: 'linear-gradient(150deg,#1b2c4a,#0a0f1a 70%)',
      glow: 'rgba(120,180,255,.35)',
      ink: '#9fc6ff',
      icon: 'coin',
    },
    {
      id: 'b-1',
      kicker: 'کاراکتر کلکسیونی سیزن',
      title: 'اسکین (Outfit) اختصاصی استارتر پک فصل',
      tag: 'اسکین اختصاصی',
      p1: 'هر استارتر پک شامل یک کاراکتر منحصر‌به‌فرد با طراحی ویژه همان فصل است. از آنجا که استارتر پک‌ها پس از پایان فصل از فروشگاه خارج می‌شوند، اسکین‌های آن‌ها به مرور زمان جزو آیتم‌های خاص و کلکسیونی لاکر بازیکنان محسوب می‌شوند.',
      p2: 'این اسکین بلافاصله پس از فعال‌سازی پک، بدون نیاز به انجام هیچ چالش یا لول‌آپی در لاکر شما باز و آماده استفاده در مسابقه است.',
      link: 'همه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'خرید باندل فاینال رکونینگ',
      href2: '/product/fortnite-final-reckoning-pack',
      grad: 'linear-gradient(150deg,#4a1626,#1a0910 70%)',
      glow: 'rgba(242,184,75,.35)',
      ink: '#f2b84b',
      icon: 'gift',
    },
    {
      id: 'b-2',
      kicker: 'مخصوص مود لگو فورتنایت',
      title: 'نسخه استایل لگو (LEGO Style) اسکین',
      tag: 'LEGO Style',
      p1: 'علاوه بر استایل اصلی Battle Royale، اسکین استارتر پک دارای نسخه کامل LEGO Style است تا در دنیاهای Survival و Sandbox مود LEGO Fortnite نیز با همان کاراکتر اختصاصی بازی کنید.',
      p2: 'هر دو استایل به صورت هم‌زمان و خودکار به محض فعال‌سازی بسته به حساب شما اضافه می‌شوند.',
      link: 'خرید کروپک فورتنایت',
      href: '/product/fortnite-crew',
      link2: 'خرید بتل‌پس فورتنایت',
      href2: '/product/fortnite-battle-pass',
      grad: 'linear-gradient(150deg,#4a2a10,#1a0e06 70%)',
      glow: 'rgba(255,160,70,.35)',
      ink: '#ffb866',
      icon: 'cube',
    },
    {
      id: 'b-3',
      kicker: 'تجهیزات پشت کاراکتر',
      title: 'بک‌بلینگ (Back Bling) هماهنگ با تم اسکین',
      tag: 'بک‌بلینگ ست',
      p1: 'همراه با اسکین اصلی، یک بک‌بلینگ اختصاصی با رنگ‌بندی و جزئیات هماهنگ در پکیج قرار دارد که روی تمام اسکین‌های دیگر لاکر شما نیز قابل نصب و ترکیب کردن است.',
      p2: 'در آیتم‌شاپ فورتنایت، خرید جداگانه یک اسکین و بک‌بلینگ معمولاً حداقل ۱٬۲۰۰ وی‌باکس هزینه دارد که در استارتر پک به همراه ۶۰۰ وی‌باکس یک‌جا عرضه می‌شود.',
      link: 'بررسی آیتم‌شاپ روزانه',
      href: '/fortnite-shop',
      link2: 'راهنمای خرید پک‌های فورتنایت',
      href2: '/guides',
      grad: 'linear-gradient(150deg,#2f1a4a,#100a1a 70%)',
      glow: 'rgba(180,140,255,.35)',
      ink: '#c9a7ff',
      icon: 'medal',
    },
    {
      id: 'b-4',
      kicker: 'ابزار برداشت منابع',
      title: 'پیک‌اکس (Pickaxe) اختصاصی ست فصل',
      tag: 'پیک‌اکس ست',
      p1: 'ست تزئینی استارتر پک با یک پیک‌اکس خوش‌دست و هماهنگ کامل می‌شود تا از لحظه فرود در مپ، کمبوی ظاهری کاراکتر شما بی‌نقص باشد.',
      p2: 'پیک‌اکس‌های استارتر پک به دلیل طراحی جمع‌وجور و افکت صوتی تمیز، در میان پلیرهای رقابتی و شرکت‌کنندگان تورنومنت‌ها بسیار پرطرفدارند.',
      link: 'تورنومنت‌های فورتنایت تایتان',
      href: '/tournament',
      link2: 'فروشگاه تایتان',
      href2: '/store',
      grad: 'linear-gradient(150deg,#14382f,#08130f 70%)',
      glow: 'rgba(90,220,170,.3)',
      ink: '#7be0c3',
      icon: 'bolt',
    },
    {
      id: 'b-5',
      kicker: 'صرفه اقتصادی بی‌رقیب',
      title: 'بالاترین ارزش خرید نسبت به وی‌باکس معمولی',
      tag: 'ارزش خرید بالا',
      p1: 'در استور رسمی اپیک گیمز، قیمت استارتر پک حتی از کوچک‌ترین بسته وی‌باکس هم مناسب‌تر است؛ در حالی که علاوه بر ۶۰۰ وی‌باکس نقدی، یک ست کامل اسکین، بک‌بلینگ و پیک‌اکس دریافت می‌کنید.',
      p2: 'به همین دلیل استارتر پک اولین خرید پیشنهادی در هر سیزن برای تمام بازیکنان فورتنایت است.',
      link: 'ارتباط با پشتیبانی',
      href: '/contact',
      link2: 'قوانین و شرایط',
      href2: '/terms',
      grad: 'linear-gradient(150deg,#15304a,#08121a 70%)',
      glow: 'rgba(80,200,255,.3)',
      ink: '#78d4ff',
      icon: 'sun',
    },
  ],
  activation: {
    kicker: 'فعال‌سازی',
    title: 'نحوه فعال‌سازی و تحویل استارتر پک فورتنایت در تایتان',
    subtitle:
      'استارتر پک فصل جاری مستقیماً از طریق استور رسمی روی حساب اپیک گیمز شما فعال می‌شود.',
    steps: [
      {
        num: '۱',
        title: 'ثبت سفارش و پرداخت',
        text: 'روی «افزودن به سبد خرید» کلیک کنید و مبلغ سفارش را با کارت بانکی عضو شتاب یا کیف پول تایتان بپردازید.',
      },
      {
        num: '۲',
        title: 'ثبت اطلاعات اکانت',
        consoleBeforeLink:
          'اگر حساب کنسول شما هنوز به اپیک گیمز متصل نیست، از بخش اتصال حساب‌ها در ',
        consoleLinkLabel: 'Epic Games',
        consoleLinkHref: 'https://www.epicgames.com',
        consoleAfterLink: ' آن را متصل نمایید.',
      },
      {
        num: '۳',
        title: 'خرید رسمی پکیج روی اکانت',
        text: 'کارشناسان تایتان استارتر پک فصل جاری را به صورت مستقیم و با رسید رسمی روی اکانت شما فعال می‌کنند.',
      },
      {
        num: '۴',
        title: 'دریافت فوری ۶۰۰ وی‌باکس و اسکین',
        text: 'بلافاصله پس از تکمیل سفارش، ۶۰۰ وی‌باکس و ست کامل اسکین، بک‌بلینگ و پیک‌اکس در لاکر شما روی تمام پلتفرم‌ها آماده استفاده است.',
      },
    ],
  },
  priceDelivery: {
    kicker: 'قیمت و تحویل',
    title: 'قیمت استارتر پک فورتنایت، روش پرداخت و زمان تحویل',
    subtitle:
      'بدون نیاز به کارت بانکی بین‌المللی، استارتر پک سیزن جاری را با پرداخت ریالی در سریع‌ترین زمان دریافت کنید.',
    tile1Label: 'قیمت استارتر پک فصل',
    tile1SubWhenNoDiscount:
      'شامل ۶۰۰ وی‌باکس نقدی + اسکین، استایل لگو، بک‌بلینگ و پیک‌اکس اختصاصی',
    tile2Label: 'زمان تحویل',
    tile2Sub: 'تحویل سریع پس از ثبت نهایی سفارش در ساعات کاری',
    tile3Label: 'روش تحویل',
    tile3Value: 'فعال‌سازی مستقیم روی اکانت',
    tile3Sub: 'قابل استفاده روی PC، PS4، PS5، Xbox، Nintendo Switch و موبایل',
    guideBeforeLink: 'برای آشنایی بیشتر با پک‌ها و باندل‌های فورتنایت، ',
    guideLinkLabel: 'راهنمای خرید کروپک، بتل‌پس و باندل‌های فورتنایت',
    guideLinkHref: '/guides',
    guideAfterLink: ' را مطالعه کنید.',
  },
  comparison: {
    kicker: 'مقایسه ارزش خرید',
    title: 'چرا استارتر پک به‌صرفه‌ترین بسته هر فصل فورتنایت است؟',
    p1: 'اگر بخواهید معادل آیتم‌های داخل استارتر پک (یک اسکین ۱۲۰۰ وی‌باکسی همراه با بک‌بلینگ، یک پیک‌اکس ۸۰۰ وی‌باکسی و ۶۰۰ وی‌باکس نقدی) را جداگانه از آیتم‌شاپ تهیه کنید، باید حدود ۲٬۶۰۰ وی‌باکس هزینه کنید؛ اما با خرید استارتر پک، همه آن‌ها را با قیمتی بسیار اقتصادی دریافت می‌کنید.',
    p2BeforeLink1:
      'اگر در این فصل قبلاً استارتر پک را خریده‌اید و به وی‌باکس بیشتری نیاز دارید، صفحه ',
    p2Link1Label: 'خرید وی‌باکس فورتنایت',
    p2Link1Href: '/product/fortnite-vbucks',
    p2BetweenLinks:
      ' یا اشتراک کروپک بهترین گزینه‌های بعدی هستند. اطلاعات رسمی بازی را در ',
    p2EpicLabel: 'سایت رسمی Epic Games',
    p2EpicHref: 'https://www.epicgames.com',
    p2AfterEpic: ' ببینید.',
    tableHeading: 'ارزش معادل محتویات استارتر پک (به وی‌باکس)',
    rows: [
      { label: 'وی‌باکس نقدی داخل پک', value: '۶۰۰ وی‌باکس' },
      { label: 'اسکین اختصاصی فصل + LEGO Style', value: 'معادل ۱٬۲۰۰ وی‌باکس' },
      { label: 'بک‌بلینگ ست کاراکتر', value: 'همراه اسکین' },
      { label: 'پیک‌اکس اختصاصی ست', value: 'معادل ۵۰۰ تا ۸۰۰ وی‌باکس' },
    ],
    total: {
      label: 'مجموع ارزش واقعی پکیج',
      value: 'معادل ۲٬۳۰۰ تا ۲٬۶۰۰ وی‌باکس',
    },
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: {
    kicker: 'ادامه مسیر',
    title: 'سایر پک‌ها و محصولات فورتنایت در تایتان',
  },
  relatedLinks: [
    { href: '/product/fortnite-crew', label: 'خرید کروپک فورتنایت' },
    { href: '/product/fortnite-vbucks', label: 'خرید وی‌باکس فورتنایت' },
    { href: '/product/fortnite-battle-pass', label: 'خرید بتل‌پس فورتنایت' },
    { href: '/product/fortnite-final-reckoning-pack', label: 'باندل فاینال رکونینگ' },
    { href: '/fortnite-shop', label: 'آیتم‌شاپ امروز فورتنایت' },
    { href: '/store/fortnite', label: 'همه محصولات فورتنایت' },
    { href: '/guides', label: 'آموزش‌ها و راهنمای خرید' },
    { href: '/contact', label: 'ارتباط با پشتیبانی' },
  ],
  faqHeader: {
    kicker: 'پرسش‌ها',
    title: 'سوالات متداول درباره خرید استارتر پک فورتنایت',
    beforeContact: CREW_FAQ_HEADER.beforeContact,
    contactLabel: CREW_FAQ_HEADER.contactLabel,
    contactHref: CREW_FAQ_HEADER.contactHref,
    betweenLinks: CREW_FAQ_HEADER.betweenLinks,
    faqLabel: CREW_FAQ_HEADER.faqLabel,
    faqHref: CREW_FAQ_HEADER.faqHref,
    afterFaq: CREW_FAQ_HEADER.afterFaq,
  },
  faqItems: [
    {
      question: 'با خرید استارتر پک فورتنایت دقیقاً چه چیزهایی دریافت می‌کنم؟',
      answer:
        '۶۰۰ عدد وی‌باکس نقدی به همراه یک اسکین اختصاصی فصل، نسخه LEGO Style اسکین، بک‌بلینگ ست و پیک‌اکس هماهنگ.',
    },
    {
      question: 'آیا می‌توانم استارتر پک یک فصل را دو بار روی یک اکانت بخرم؟',
      answer:
        'خیر؛ طبق قوانین اپیک گیمز هر استارتر پک فصلی فقط یک‌بار روی هر اکانت قابل فعال‌سازی است، اما با شروع فصل جدید و عرضه استارتر پک تازه، می‌توانید پک فصل جدید را نیز تهیه کنید.',
    },
    {
      question: 'آیا ۶۰۰ وی‌باکس و اسکین استارتر پک بعد از پایان فصل حذف می‌شوند؟',
      answer:
        'خیر؛ تمام آیتم‌های تزئینی استارتر پک و ۶۰۰ وی‌باکس دریافتی ۱۰۰٪ دائمی هستند و برای همیشه در لاکر اکانت شما باقی می‌مانند.',
    },
    {
      question: 'چرا نمی‌توانم استارتر پک را با وی‌باکس داخل اکانت بخرم؟',
      answer:
        'اپیک گیمز استارتر پک‌ها را فقط به عنوان بسته‌های پولی (Real-Money Bundles) عرضه می‌کند تا خودش حاوی ۶۰۰ وی‌باکس باشد؛ در تایتان ما این پرداخت دلاری را به صورت ریالی روی اکانت شما انجام می‌دهیم.',
    },
    {
      question: 'فعال‌سازی استارتر پک در تایتان چقدر زمان می‌برد؟',
      answer:
        'معمولاً در کمتر از ۳۰ دقیقه (و حداکثر تا ۲ ساعت در ساعات کاری) پس از ثبت سفارش روی اکانت شما فعال می‌گردد.',
    },
    {
      question: 'آیا آیتم‌ها و ۶۰۰ وی‌باکس استارتر پک روی PS4، PS5، Xbox و PC قابل استفاده است؟',
      answer:
        'بله؛ به محض فعال‌سازی روی اکانت اپیک گیمز، اسکین و ۶۰۰ وی‌باکس آن در تمام پلتفرم‌های متصل به همان حساب در دسترس خواهد بود.',
    },
    {
      question: 'اگر علاوه بر استارتر پک به وی‌باکس بیشتری نیاز داشته باشم چه کنم؟',
      answer:
        'می‌توانید از صفحه خرید وی‌باکس فورتنایت یا اشتراک کروپک فورتنایت برای شارژ بیشتر موجودی اکانت خود استفاده کنید.',
      segments: [
        { type: 'text', value: 'می‌توانید از صفحه ' },
        {
          type: 'link',
          label: 'خرید وی‌باکس فورتنایت',
          href: '/product/fortnite-vbucks',
        },
        { type: 'text', value: ' یا ' },
        {
          type: 'link',
          label: 'اشتراک کروپک فورتنایت',
          href: '/product/fortnite-crew',
        },
        {
          type: 'text',
          value: ' برای شارژ بیشتر موجودی اکانت خود استفاده کنید.',
        },
      ],
    },
    {
      question: 'در صورت بروز مشکل در فعال‌سازی سفارش، شرایط بازگشت وجه چگونه است؟',
      answer:
        'وجه پرداختی شما طبق قوانین تایتان به صورت کامل به کارت بانکی یا کیف پول شما بازگردانده می‌شود و پشتیبانی ۲۴ ساعته در کنار شماست.',
      segments: [
        { type: 'text', value: 'وجه پرداختی شما طبق ' },
        { type: 'link', label: 'قوانین تایتان', href: '/terms' },
        {
          type: 'text',
          value:
            ' به صورت کامل به کارت بانکی یا کیف پول شما بازگردانده می‌شود و ',
        },
        { type: 'link', label: 'پشتیبانی ۲۴ ساعته', href: '/contact' },
        { type: 'text', value: ' در کنار شماست.' },
      ],
    },
  ],
  finalCta: {
    title: 'آماده فعال‌سازی استارتر پک این فصل هستید؟',
    ctaLabel: 'افزودن به سبد خرید',
    ctaHref: '#buy',
  },
};

/* ==========================================================================
   5. FORTNITE FINAL RECKONING PACK (/product/fortnite-final-reckoning-pack)
   ========================================================================== */
export const FORTNITE_FINAL_RECKONING_TEMPLATE: FortniteProductTemplate = {
  slugs: ['fortnite-final-reckoning-pack'],
  defaultPriceToman: 1485000,
  defaultOriginalPriceToman: 1845000,
  defaultDiscountPercent: 20,
  deliveryTime: 'کمتر از ۳۰ دقیقه',
  readMoreSub:
    'مشاهده ۶ آیتم باندل فاینال رکونینگ، مراحل فعال‌سازی و سؤالات متداول',
  hero: {
    eyebrow: 'باندل کلکسیونی ۳ اسکینه · THE FINAL RECKONING',
    title: 'خرید باندل فاینال رکونینگ فورتنایت',
    lead: 'باندل The Final Reckoning یکی از محبوب‌ترین و خاص‌ترین پک‌های چنداسکینه تاریخ فورتنایت است: دریافت هم‌زمان ۳ اسکین اپیک (Catrina، Willow و Blacklight) به همراه ۳ بک‌بلینگ اختصاصی و نسخه‌های استایل لگو — با فعال‌سازی مستقیم و دائمی روی اکانت شما.',
    factChips: [
      '۳ اسکین کامل (Catrina، Willow، Blacklight)',
      '۳ بک‌بلینگ اختصاصی ست',
      'شامل ۳ نسخه LEGO Style',
      'استایل قابل تغییر عروسکی Willow',
      'تحویل سریع زیر ۳۰ دقیقه',
    ],
    ctaLabel: 'افزودن به سبد خرید',
    carouselHint: 'کارت‌ها را ورق بزنید؛ روی کارت وسط کلیک کنید تا به توضیحاتش بروید.',
  },
  intro: {
    kicker: 'پک فاینال رکونینگ چیست؟',
    title: 'باندل The Final Reckoning فورتنایت چیست و چرا بین کلکسیونرها محبوب است؟',
    p1BeforeLink:
      'باندل فاینال رکونینگ (Fortnite The Final Reckoning Pack) یک پکیج کلکسیونی با تم تاریک و گوتیک در بازی ',
    p1LinkLabel: 'Fortnite',
    p1LinkHref: 'https://www.fortnite.com',
    p1AfterLink:
      ' است که تنها در بازه‌های زمانی خاص عرضه می‌شود و شامل ۶ آیتم اپیک (۳ اسکین کامل و ۳ بک‌بلینگ اختصاصی) به همراه ۳ استایل لگو است.',
    p2: 'برخلاف باندل‌های معمولی شاپ، این مجموعه یک پک دلاری (Real-Money Pack) است و با وی‌باکس قابل خریداری نیست. طراحی خیره‌کننده کاراکترهای Catrina، Willow (با استایل سر عروسکی) و Blacklight باعث شده این پک در میان پلیرهای حرفه‌ای و استریمرها جایگاه ویژه‌ای داشته باشد.',
    p3: 'با خرید این باندل از فروشگاه تایتان، هر ۶ آیتم تزئینی به صورت مستقیم و دائمی روی حساب اپیک گیمز شما فعال می‌شوند و روی تمام پلتفرم‌های متصل (PC، PS4، PS5، Xbox، سوییچ و موبایل) در دسترس خواهند بود.',
  },
  benefitsHeader: {
    kicker: 'محتویات کامل باندل',
    title: 'در باندل فاینال رکونینگ فورتنایت چه اسکین‌ها و آیتم‌هایی قرار دارد؟',
  },
  benefitBlocks: [
    {
      id: 'b-0',
      kicker: 'کاراکتر اول · الهام‌گرفته از روز مردگان',
      title: 'اسکین Catrina به همراه بک‌بلینگ Mourning Glory',
      tag: 'اسکین Catrina',
      p1: 'اسکین Catrina با طراحی هنری گل‌دار و نقاب سنتی Día de los Muertos یکی از چشم‌نوازترین کاراکترهای این مجموعه است که در بازی جلوه بصری فوق‌العاده‌ای دارد.',
      p2: 'همراه این اسکین، بک‌بلینگ گل‌آرایی‌شده Mourning Glory ارائه می‌شود که به دلیل رنگ‌بندی خاصش با ده‌ها اسکین دیگر لاکر شما نیز به زیبایی ست می‌گردد.',
      link: 'همه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'آیتم‌شاپ امروز فورتنایت',
      href2: '/fortnite-shop',
      grad: 'linear-gradient(150deg,#4a1626,#1a0910 70%)',
      glow: 'rgba(242,184,75,.35)',
      ink: '#f2b84b',
      icon: 'gift',
    },
    {
      id: 'b-1',
      kicker: 'کاراکتر دوم · دارای ۲ استایل قابل تغییر',
      title: 'اسکین Willow به همراه بک‌بلینگ عروسک Dolly',
      tag: 'اسکین Willow',
      p1: 'اسکین ترسناک و پرطرفدار Willow دارای دو استایل انتخابی (چهره روح‌مانند اصلی و استایل سر عروسکی Doll Head) است که از بخش Edit Style در لاکر می‌توانید بین آن‌ها جابه‌جا شوید.',
      p2: 'بک‌بلینگ اختصاصی او یعنی عروسک Dolly یکی از معروف‌ترین بک‌بلینگ‌های کلکسیونی فورتنایت در میان بازیکنان رقابتی است.',
      link: 'خرید وی‌باکس فورتنایت',
      href: '/product/fortnite-vbucks',
      link2: 'خرید استارتر پک فورتنایت',
      href2: '/product/fortnite-starter-pack',
      grad: 'linear-gradient(150deg,#4a1a3a,#170a13 70%)',
      glow: 'rgba(255,110,190,.3)',
      ink: '#ff9fd6',
      icon: 'sun',
    },
    {
      id: 'b-2',
      kicker: 'کاراکتر سوم · تم نئونی و بنفش تیره',
      title: 'اسکین Blacklight به همراه بال‌های Indigo Wings',
      tag: 'اسکین Blacklight',
      p1: 'اسکین Blacklight با رنگ‌های نئونی بنفش و آبی شب‌تاب، استایلی مدرن و تهاجمی برای مسابقات Battle Royale و Reload دارد.',
      p2: 'بک‌بلینگ بال‌های درخشان Indigo Wings که همراه این کاراکتر عرضه می‌شود، یکی از محبوب‌ترین بال‌های تیره و نئونی بازی برای ست کردن با اسکین‌های دارک است.',
      link: 'خرید کروپک فورتنایت',
      href: '/product/fortnite-crew',
      link2: 'تورنومنت‌های فورتنایت',
      href2: '/tournament',
      grad: 'linear-gradient(150deg,#2f1a4a,#100a1a 70%)',
      glow: 'rgba(180,140,255,.35)',
      ink: '#c9a7ff',
      icon: 'bolt',
    },
    {
      id: 'b-3',
      kicker: 'پشتیبانی کامل در مود لگو',
      title: 'شامل ۳ نسخه LEGO Style برای هر سه کاراکتر',
      tag: '۳ استایل لگو',
      p1: 'علاوه بر استایل‌های اصلی Battle Royale، هر سه کاراکتر Catrina، Willow و Blacklight دارای نسخه اختصاصی LEGO Style هستند.',
      p2: 'بنابراین با یک خرید، عملاً ۶ ظاهر کاراکتر (۳ نسخه بتل رویال + ۳ نسخه لگو) و ۳ بک‌بلینگ به لاکر اکانت شما اضافه می‌شود.',
      link: 'خرید بتل‌پس فورتنایت',
      href: '/product/fortnite-battle-pass',
      link2: 'مرکز آموزش تایتان',
      href2: '/guides',
      grad: 'linear-gradient(150deg,#4a2a10,#1a0e06 70%)',
      glow: 'rgba(255,160,70,.35)',
      ink: '#ffb866',
      icon: 'cube',
    },
    {
      id: 'b-4',
      kicker: 'پکیج کمیاب خارج از آیتم‌شاپ عادی',
      title: 'عرضه محدود؛ غیرقابل خرید با وی‌باکس',
      tag: 'باندل کمیاب',
      p1: 'باندل The Final Reckoning در ردیف اسکین‌های وی‌باکسی آیتم‌شاپ روزانه قرار نمی‌گیرد و فقط به صورت پک مستقل عرضه می‌شود؛ به همین دلیل نسبت به اسکین‌های عادی شاپ بسیار خاص‌تر است.',
      p2: 'با فعال‌سازی این پک روی اکانت، تمام ۶ آیتم آن برای همیشه در لاکر شما باقی می‌مانند و در هر فصلی می‌توانید از آن‌ها استفاده کنید.',
      link: 'مشاهده آیتم‌شاپ امروز',
      href: '/fortnite-shop',
      link2: 'سوالات متداول',
      href2: '/faq',
      grad: 'linear-gradient(150deg,#14382f,#08130f 70%)',
      glow: 'rgba(90,220,170,.3)',
      ink: '#7be0c3',
      icon: 'medal',
    },
    {
      id: 'b-5',
      kicker: 'صرفه‌جویی چشمگیر نسبت به خرید تکی',
      title: 'ارزش معادل ۴٬۵۰۰ وی‌باکس در یک باندل یک‌جا',
      tag: 'ارزش ۴٬۵۰۰ وی‌باکس',
      p1: 'در فورتنایت هر اسکین رده Epic (به همراه بک‌بلینگ) ۱٬۵۰۰ وی‌باکس قیمت دارد؛ یعنی خرید جداگانه سه کاراکتر مشابه در آیتم‌شاپ ۴٬۵۰۰ وی‌باکس هزینه می‌برد.',
      p2: 'اما در باندل فاینال رکونینگ، هر سه کاراکتر و سه بک‌بلینگ را با قیمتی بسیار کمتر از خرید ۴٬۵۰۰ وی‌باکس تهیه می‌کنید.',
      link: 'ارتباط با پشتیبانی',
      href: '/contact',
      link2: 'قوانین و شرایط تحویل',
      href2: '/terms',
      grad: 'linear-gradient(150deg,#1b2c4a,#0a0f1a 70%)',
      glow: 'rgba(120,180,255,.35)',
      ink: '#9fc6ff',
      icon: 'coin',
    },
  ],
  activation: {
    kicker: 'فعال‌سازی',
    title: 'نحوه فعال‌سازی باندل فاینال رکونینگ در تایتان',
    subtitle:
      'فعال‌سازی این باندل به‌صورت مستقیم و رسمی روی حساب اپیک گیمز یا کنسول متصل شما انجام می‌شود.',
    steps: [
      {
        num: '۱',
        title: 'ثبت سفارش و پرداخت ریالی',
        text: 'روی «افزودن به سبد خرید» بزنید و مبلغ سفارش را با کارت بانکی عضو شتاب یا کیف پول تایتان پرداخت کنید.',
      },
      {
        num: '۲',
        title: 'ثبت اطلاعات اکانت بازی',
        consoleBeforeLink:
          'اگر حساب کنسول شما هنوز به اپیک گیمز متصل نیست، از بخش اتصال حساب‌ها در ',
        consoleLinkLabel: 'Epic Games',
        consoleLinkHref: 'https://www.epicgames.com',
        consoleAfterLink: ' آن را متصل نمایید.',
      },
      {
        num: '۳',
        title: 'فعال‌سازی رسمی باندل روی اکانت',
        text: 'کارشناسان تایتان باندل The Final Reckoning را از طریق استور رسمی روی حساب شما فعال می‌کنند.',
      },
      {
        num: '۴',
        title: 'اضافه شدن فوری هر ۶ آیتم به لاکر',
        text: 'پس از تکمیل سفارش، هر ۳ اسکین (Catrina، Willow و Blacklight) و ۳ بک‌بلینگ آن‌ها روی تمام پلتفرم‌ها در لاکر شما آماده استفاده هستند.',
      },
    ],
  },
  priceDelivery: {
    kicker: 'قیمت و تحویل',
    title: 'قیمت باندل فاینال رکونینگ، روش پرداخت و زمان تحویل',
    subtitle:
      'این باندل کمیاب را بدون نیاز به پرداخت دلاری، با کارت شتاب سفارش دهید و روی اکانت شخصی خود تحویل بگیرید.',
    tile1Label: 'قیمت باندل کامل (۶ آیتم)',
    tile1SubWhenNoDiscount:
      'شامل ۳ اسکین اپیک + ۳ بک‌بلینگ اختصاصی + ۳ استایل لگو',
    tile2Label: 'زمان تحویل',
    tile2Sub: 'تحویل سریع پس از ثبت نهایی سفارش در ساعات کاری',
    tile3Label: 'روش تحویل',
    tile3Value: 'فعال‌سازی مستقیم روی اکانت',
    tile3Sub: 'قابل استفاده روی PC، PS4، PS5، Xbox، Nintendo Switch و موبایل',
    guideBeforeLink: 'برای آشنایی بیشتر با نحوه تحویل باندل‌های فورتنایت، ',
    guideLinkLabel: 'راهنمای خرید پک‌ها و باندل‌های فورتنایت در تایتان',
    guideLinkHref: '/guides',
    guideAfterLink: ' را بخوانید.',
  },
  comparison: {
    kicker: 'مقایسه ارزش خرید',
    title: 'مقایسه باندل Final Reckoning با خرید اسکین‌های تکی آیتم‌شاپ',
    p1: 'در آیتم‌شاپ فورتنایت، هر اسکین اپیک همراه با بک‌بلینگ ۱٬۵۰۰ وی‌باکس قیمت دارد. بنابراین تهیه ۳ اسکین و ۳ بک‌بلینگ مشابه به صورت جداگانه نیازمند ۴٬۵۰۰ وی‌باکس است؛ در حالی که باندل Final Reckoning هر ۶ آیتم را یک‌جا و با هزینه بسیار کمتری در اختیار شما قرار می‌دهد.',
    p2BeforeLink1:
      'اگر به دنبال پک اقتصادی‌تری همراه با وی‌باکس نقدی هستید، ',
    p2Link1Label: 'خرید استارتر پک فورتنایت',
    p2Link1Href: '/product/fortnite-starter-pack',
    p2BetweenLinks:
      ' یا اشتراک ماهانه کروپک را نیز بررسی کنید. اطلاعات بیشتر در ',
    p2EpicLabel: 'سایت رسمی Epic Games',
    p2EpicHref: 'https://www.epicgames.com',
    p2AfterEpic: ' قابل مشاهده است.',
    tableHeading: 'ارزش معادل آیتم‌های باندل در صورت خرید جداگانه',
    rows: [
      { label: 'اسکین Catrina + بک‌بلینگ Mourning Glory', value: 'معادل ۱٬۵۰۰ وی‌باکس' },
      { label: 'اسکین Willow (۲ استایل) + بک‌بلینگ Dolly', value: 'معادل ۱٬۵۰۰ وی‌باکس' },
      { label: 'اسکین Blacklight + بال‌های Indigo Wings', value: 'معادل ۱٬۵۰۰ وی‌باکس' },
      { label: 'نسخه‌های LEGO Style هر ۳ کاراکتر', value: 'رایگان روی باندل' },
    ],
    total: {
      label: 'مجموع ارزش معادل ۶ آیتم باندل',
      value: 'معادل ۴٬۵۰۰ وی‌باکس',
    },
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: {
    kicker: 'ادامه مسیر',
    title: 'سایر پک‌ها و محصولات فورتنایت در تایتان',
  },
  relatedLinks: [
    { href: '/product/fortnite-crew', label: 'خرید کروپک فورتنایت' },
    { href: '/product/fortnite-starter-pack', label: 'خرید استارتر پک فورتنایت' },
    { href: '/product/fortnite-vbucks', label: 'خرید وی‌باکس فورتنایت' },
    { href: '/product/fortnite-battle-pass', label: 'خرید بتل‌پس فورتنایت' },
    { href: '/fortnite-shop', label: 'آیتم‌شاپ امروز فورتنایت' },
    { href: '/store/fortnite', label: 'همه محصولات فورتنایت' },
    { href: '/guides', label: 'آموزش‌ها و راهنمای خرید' },
    { href: '/contact', label: 'ارتباط با پشتیبانی' },
  ],
  faqHeader: {
    kicker: 'پرسش‌ها',
    title: 'سوالات متداول درباره باندل فاینال رکونینگ فورتنایت',
    beforeContact: CREW_FAQ_HEADER.beforeContact,
    contactLabel: CREW_FAQ_HEADER.contactLabel,
    contactHref: CREW_FAQ_HEADER.contactHref,
    betweenLinks: CREW_FAQ_HEADER.betweenLinks,
    faqLabel: CREW_FAQ_HEADER.faqLabel,
    faqHref: CREW_FAQ_HEADER.faqHref,
    afterFaq: CREW_FAQ_HEADER.afterFaq,
  },
  faqItems: [
    {
      question: 'باندل فاینال رکونینگ فورتنایت شامل چه اسکین‌ها و آیتم‌هایی است؟',
      answer:
        'این باندل شامل ۶ آیتم اپیک است: اسکین Catrina با بک‌بلینگ Mourning Glory، اسکین Willow (دارای ۲ استایل) با بک‌بلینگ Dolly و اسکین Blacklight با بک‌بلینگ بال‌های Indigo Wings، به همراه ۳ استایل LEGO.',
    },
    {
      question: 'آیا باندل Final Reckoning حاوی وی‌باکس هم هست؟',
      answer:
        'خیر؛ تمرکز این باندل روی ارائه ۳ اسکین اپیک کامل و ۳ بک‌بلینگ کلکسیونی (معادل ۴٬۵۰۰ وی‌باکس ارزش آیتم) است. اگر پک حاوی وی‌باکس می‌خواهید، استارتر پک یا کروپک فورتنایت را بررسی کنید.',
    },
    {
      question: 'آیا اسکین‌های این باندل بعد از پایان فصل در اکانتم باقی می‌مانند؟',
      answer:
        'بله؛ هر ۳ اسکین و ۳ بک‌بلینگ باندل فاینال رکونینگ دائمی هستند و برای همیشه در لاکر اکانت شما باقی می‌مانند.',
    },
    {
      question: 'فعال‌سازی باندل فاینال رکونینگ در تایتان چقدر طول می‌کشد؟',
      answer:
        'سفارش شما معمولاً در کمتر از ۳۰ دقیقه (و حداکثر تا ۲ ساعت در ساعات کاری) به صورت مستقیم روی اکانت شما فعال می‌شود.',
    },
    {
      question: 'آیا می‌توانم بک‌بلینگ‌های این پک (مثل بال‌های Indigo Wings یا عروسک Dolly) را روی اسکین‌های دیگرم استفاده کنم؟',
      answer:
        'بله! هر ۳ بک‌بلینگ این مجموعه مستقل هستند و روی تمام اسکین‌های دیگر داخل لاکر شما قابل استفاده می‌باشند.',
    },
    {
      question: 'آیا این باندل روی PS4، PS5، Xbox، PC و موبایل قابل استفاده است؟',
      answer:
        'بله؛ پس از فعال‌سازی روی اکانت اپیک گیمز، تمام اسکین‌ها و بک‌بلینگ‌های باندل روی تمام پلتفرم‌های متصل به همان حساب در دسترس خواهند بود.',
    },
    {
      question: 'اگر بخواهم در کنار این باندل وی‌باکس هم تهیه کنم چه گزینه‌ای بهتر است؟',
      answer:
        'می‌توانید از صفحه خرید وی‌باکس فورتنایت بسته دلخواه خود را انتخاب کنید یا با خرید کروپک فورتنایت ۱٬۰۰۰ وی‌باکس و همه پس‌ها را دریافت نمایید.',
      segments: [
        { type: 'text', value: 'می‌توانید از صفحه ' },
        {
          type: 'link',
          label: 'خرید وی‌باکس فورتنایت',
          href: '/product/fortnite-vbucks',
        },
        { type: 'text', value: ' بسته دلخواه خود را انتخاب کنید یا با خرید ' },
        {
          type: 'link',
          label: 'کروپک فورتنایت',
          href: '/product/fortnite-crew',
        },
        {
          type: 'text',
          value: ' ۱٬۰۰۰ وی‌باکس و همه پس‌ها را دریافت نمایید.',
        },
      ],
    },
    {
      question: 'آیا خرید باندل از تایتان شامل ضمانت بازگشت وجه است؟',
      answer:
        'بله؛ در صورتی که به هر دلیل فنی امکان فعال‌سازی باندل در زمان اعلام‌شده نباشد، مبلغ پرداختی طبق قوانین تایتان به صورت کامل بازگردانده می‌شود.',
      segments: [
        {
          type: 'text',
          value:
            'بله؛ در صورتی که به هر دلیل فنی امکان فعال‌سازی باندل در زمان اعلام‌شده نباشد، مبلغ پرداختی طبق ',
        },
        { type: 'link', label: 'قوانین تایتان', href: '/terms' },
        {
          type: 'text',
          value: ' به صورت کامل بازگردانده می‌شود و ',
        },
        { type: 'link', label: 'پشتیبانی ۲۴ ساعته', href: '/contact' },
        { type: 'text', value: ' همراه شماست.' },
      ],
    },
  ],
  finalCta: {
    title: 'آماده افزودن ۳ اسکین فاینال رکونینگ به لاکر خود هستید؟',
    ctaLabel: 'افزودن به سبد خرید',
    ctaHref: '#buy',
  },
};

export const ALL_FORTNITE_TEMPLATES: FortniteProductTemplate[] = [
  FORTNITE_CREW_TEMPLATE,
  FORTNITE_VBUCKS_TEMPLATE,
  FORTNITE_BATTLE_PASS_TEMPLATE,
  FORTNITE_STARTER_PACK_TEMPLATE,
  FORTNITE_FINAL_RECKONING_TEMPLATE,
];

const FORTNITE_SLUGS_SET = new Set<string>(
  ALL_FORTNITE_TEMPLATES.flatMap((t) => t.slugs)
);

export function isFortniteTemplateProduct(
  slug?: string | null,
  product?: Product | null
): boolean {
  if (slug && FORTNITE_SLUGS_SET.has(slug)) return true;
  if (product?.slug && FORTNITE_SLUGS_SET.has(product.slug)) return true;
  if (
    product?.game?.slug === 'fortnite' &&
    product?.category?.slug !== 'gear'
  ) {
    return true;
  }
  return false;
}

export function buildDynamicFortniteTemplate(
  product: Product
): FortniteProductTemplate {
  const title = product.title || 'محصول فورتنایت';
  return {
    ...FORTNITE_STARTER_PACK_TEMPLATE,
    slugs: [product.slug],
    defaultPriceToman: product.price || 589000,
    defaultOriginalPriceToman:
      product.originalPrice && product.originalPrice > (product.price || 0)
        ? product.originalPrice
        : product.price || 589000,
    defaultDiscountPercent: product.discountPercent || 0,
    deliveryTime: product.deliveryInfo || '۱۵ دقیقه تا ۲ ساعت',
    hero: {
      eyebrow: 'محصول رسمی Fortnite · فروشگاه تایتان',
      title: `خرید ${title}`,
      lead:
        product.subtitle ||
        `خرید و فعال‌سازی مستقیم ${title} روی اکانت اپیک گیمز، پلی‌استیشن، ایکس‌باکس و موبایل با پرداخت امن ریالی و پشتیبانی ۲۴ ساعته در فروشگاه تایتان.`,
      factChips:
        product.tags && product.tags.length > 0
          ? product.tags.slice(0, 5)
          : [
              'فعال‌سازی مستقیم روی اکانت',
              'قابل استفاده در تمام پلتفرم‌ها',
              'پرداخت امن ریالی',
              'تحویل سریع سفارش',
              'پشتیبانی ۲۴ ساعته تایتان',
            ],
      ctaLabel: 'افزودن به سبد خرید',
      carouselHint:
        'کارت‌ها را ورق بزنید؛ روی کارت وسط کلیک کنید تا به توضیحاتش بروید.',
    },
    finalCta: {
      title: `آماده خرید ${title} هستید؟`,
      ctaLabel: 'افزودن به سبد خرید',
      ctaHref: '#buy',
    },
  };
}

export function getFortniteProductTemplate(
  slug?: string | null,
  product?: Product | null
): FortniteProductTemplate {
  const targetSlug = slug || product?.slug || 'fortnite-crew';
  const found = ALL_FORTNITE_TEMPLATES.find((t) =>
    t.slugs.includes(targetSlug)
  );
  if (found) return found;
  if (product) return buildDynamicFortniteTemplate(product);
  return FORTNITE_CREW_TEMPLATE;
}

