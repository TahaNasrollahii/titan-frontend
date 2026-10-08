/**
 * Copy for the About page. Edit freely; the page reads everything from here.
 * The team members are placeholders: replace names, roles, bios and tags with the real team.
 * `icon` is a file name from /public/icons (the site's own icon set), without `.png`.
 */

export const hero = {
  badge: 'درباره تایتان',
  titleStart: 'جایی که گیمرها',
  titleAccent: 'تایتان',
  titleEnd: 'می‌شوند',
  text:
    'تایتان خانه‌ی گیمرهای ایرانیه؛ از شارژ و آیتم بازی گرفته تا تورنومنت‌های جدی با جایزه‌ی واقعی. ' +
    'ما همه‌چیز رو یه جا جمع کردیم تا تو فقط به یه چیز فکر کنی: بازی.',
  primary: { label: 'ورود به میدان', href: '/tournament' },
  secondary: { label: 'سر بزن به فروشگاه', href: '/store' },
};

/** Words light up one by one as this paragraph scrolls into view. */
export const manifesto =
  'تایتان از یه سؤال ساده شروع شد: چرا گیمر ایرانی باید برای یه شارژ ساده یا یه تورنومنت درست‌وحسابی ' +
  'این‌همه دردسر بکشه؟ پس ساختیمش؛ جایی که خرید در چند ثانیه انجام می‌شه، رقابت منصفانه‌ست ' +
  'و هر بازیکنی، از تازه‌کار تا حرفه‌ای، می‌تونه اسمش رو بالای جدول ببینه.';

/** Words of the manifesto that get the accent colour. */
export const manifestoHighlights = ['تایتان', 'چند', 'ثانیه', 'منصفانه‌ست', 'بالای', 'جدول'];

export const pillars = [
  {
    icon: 'store',
    title: 'فروشگاه دیجیتال',
    text: 'شارژ، گیفت‌کارت و آیتم بازی‌های محبوب؛ با تحویل سریع و قیمت شفاف.',
    href: '/store',
    cta: 'فروشگاه',
  },
  {
    icon: 'tournament',
    title: 'تورنومنت‌ها',
    text: 'براکت زنده، نتایج لحظه‌ای و جایزه‌ای که واقعاً به دست برنده می‌رسه.',
    href: '/tournament',
    cta: 'تورنومنت‌ها',
  },
  {
    icon: 'team',
    title: 'تیم‌سازی',
    text: 'تیمت رو بساز، با یه لینک هم‌تیمی دعوت کن و با هم وارد رقابت شید.',
    href: '/dashboard',
    cta: 'تیم من',
  },
  {
    icon: 'dashboard',
    title: 'کیف پول',
    text: 'شارژ یک‌باره، پرداخت با یه کلیک و جایزه‌هایی که مستقیم به کیف پولت میان.',
    href: '/dashboard',
    cta: 'کیف پول',
  },
];

export const values = [
  {
    icon: 'about-us',
    title: 'شفافیت',
    text: 'قیمت‌ها، قوانین تورنومنت‌ها و وضعیت سفارش‌ها همیشه جلوی چشمته. بدون هزینه‌ی پنهان.',
  },
  {
    icon: 'clock',
    title: 'سرعت',
    text: 'از پرداخت تا تحویل، از ثبت‌نام تا شروع مسابقه؛ هر ثانیه برای ما مهمه.',
  },
  {
    icon: 'tournament',
    title: 'رقابت منصفانه',
    text: 'براکت‌ها، داوری و تقسیم جوایز طوری طراحی شده که فقط مهارت تعیین‌کننده باشه.',
  },
  {
    icon: 'contact-us',
    title: 'پشتیبانی واقعی',
    text: 'پشت تایتان آدم‌های واقعی‌ان که خودشون گیمرن و زبونت رو می‌فهمن.',
  },
];

/** Placeholder team: replace with the real people. `seed` picks the generated avatar. */
export const team = [
  { name: 'نام بنیان‌گذار', role: 'بنیان‌گذار و مدیرعامل', tag: 'founder', bio: 'یک خط درباره‌ی این عضو تیم.', seed: 3 },
  { name: 'نام عضو تیم', role: 'مدیر فنی', tag: 'cto', bio: 'یک خط درباره‌ی این عضو تیم.', seed: 8 },
  { name: 'نام عضو تیم', role: 'مدیر تورنومنت‌ها', tag: 'esports', bio: 'یک خط درباره‌ی این عضو تیم.', seed: 13 },
  { name: 'نام عضو تیم', role: 'پشتیبانی و جامعه', tag: 'community', bio: 'یک خط درباره‌ی این عضو تیم.', seed: 22 },
];

export const finalCta = {
  title: 'آماده‌ای وارد میدون بشی؟',
  text: 'همین حالا حسابت رو بساز، تیمت رو جمع کن و اولین تورنومنتت رو شروع کن.',
  primary: { label: 'شروع کن', href: '/tournament' },
  secondary: { label: 'ارتباط با ما', href: '/contact' },
};
