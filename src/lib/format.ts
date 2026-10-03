import type { ProductSummary } from '@/lib/api/types';

const numberFormat = new Intl.NumberFormat('fa-IR');
const dateFormat = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('fa-IR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});
const relativeFormat = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });

export const faNumber = (value: number) => numberFormat.format(value);

export const toman = (value: number | null | undefined) => (value == null ? '—' : `${faNumber(value)} تومان`);

export function prize(amount: number, currency: 'IRT' | 'USD') {
  return currency === 'USD' ? `${faNumber(amount)} دلار` : toman(amount);
}

/** "۲۹۹,۰۰۰ تومان" for fixed-price products, "از ۲۹۹,۰۰۰ تومان" for products with options. */
export function productPrice(product: Pick<ProductSummary, 'price' | 'hasVariants' | 'priceMax'>) {
  if (product.price == null) return '—';
  const varied = product.hasVariants && product.priceMax != null && product.priceMax !== product.price;
  return varied ? `از ${toman(product.price)}` : toman(product.price);
}

export const jalaliDate = (iso: string) => dateFormat.format(new Date(iso));
export const jalaliDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "۲ ساعت پیش", "۳ روز دیگر" … */
export function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return relativeFormat.format(0, 'minute');
}

export function countdown(totalSeconds: number) {
  const left = Math.max(0, Math.floor(totalSeconds));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
}

/** Convert Persian/Arabic digits typed by the user into ASCII digits. */
export const toEnglishDigits = (value: string) =>
  value.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

export const TOURNAMENT_STATUS_LABELS: Record<string, string> = {
  upcoming: 'به‌زودی',
  registration_open: 'ثبت‌نام باز',
  registration_closed: 'ثبت‌نام بسته',
  live: 'در جریان',
  completed: 'پایان یافته',
  cancelled: 'لغو شده',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  processing: 'در حال ارسال',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  failed: 'پرداخت ناموفق',
  refunded: 'بازگشت وجه',
};

export const ROLE_LABELS: Record<string, string> = { captain: 'کاپیتان', player: 'بازیکن', substitute: 'ذخیره' };

export const REGION_LABELS: Record<string, string> = {
  me: 'خاورمیانه',
  eu: 'اروپا',
  ir: 'ایران',
  intl: 'بین‌المللی',
};

export const PRODUCT_BADGE_LABELS: Record<string, string> = { bestseller: 'پرفروش', discount: 'تخفیف', new: 'جدید' };
