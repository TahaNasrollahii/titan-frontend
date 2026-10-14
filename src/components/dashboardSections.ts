/** Dashboard sections, shared by the desktop sidebar, the phone dashboard menu and the More sheet. */
export interface DashboardSection {
  tab: string;
  label: string;
  /** Shorter label for the phone tiles. */
  short: string;
  icon: string;
  /** One-line description for the phone hub cards. */
  hint: string;
  /** Tint of the section's icon tile, as an "R G B" triplet for rgb(var(--tone) / alpha). */
  tone: string;
  dividerBefore?: boolean;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { tab: 'overview', label: 'پیشخوان', short: 'پیشخوان', icon: '/icons/home.webp', hint: 'خلاصه حساب', tone: '255 99 88' },
  { tab: 'profile', label: 'اطلاعات حساب کاربری', short: 'پروفایل', icon: '/icons/account.webp', hint: 'اطلاعات و امنیت', tone: '139 124 255' },
  { tab: 'accounts', label: 'اکانت‌های من', short: 'اکانت‌ها', icon: '/icons/accounts.webp', hint: 'اکانت‌های بازی', tone: '56 200 232' },
  { tab: 'orders', label: 'سفارش‌های من', short: 'سفارش‌ها', icon: '/icons/cart.webp', hint: 'پیگیری و تحویل', tone: '255 146 64' },
  { tab: 'favorites', label: 'لیست علاقه‌مندی‌ها', short: 'علاقه‌مندی‌ها', icon: '/icons/favorite.webp', hint: 'ذخیره‌شده‌ها', tone: '255 92 138' },
  { tab: 'teams', label: 'تیم‌های من', short: 'تیم‌ها', icon: '/icons/team.webp', hint: 'هم‌تیمی‌ها و دعوت‌ها', tone: '91 140 255', dividerBefore: true },
  { tab: 'tournaments', label: 'تورنومنت‌های من', short: 'تورنومنت‌ها', icon: '/icons/tournament.webp', hint: 'رقابت‌ها و براکت‌ها', tone: '240 193 75' },
  { tab: 'notifications', label: 'پیام‌ها و اعلان‌ها', short: 'اعلان‌ها', icon: '/icons/notif.webp', hint: 'پیام‌های تایتان', tone: '47 210 122' },
];

export interface HubTileItem {
  key: string;
  tab?: string;
  label: string;
  short: string;
  icon: string;
  tone: string;
  isLogout?: boolean;
}

/** 8 tiles for phone hub/sheet: overview is replaced by favorites, and favorites is replaced by logout. */
export const PHONE_HUB_TILES: HubTileItem[] = [
  { key: 'favorites', tab: 'favorites', label: 'لیست علاقه‌مندی‌ها', short: 'علاقه‌مندی‌ها', icon: '/icons/favorite.webp', tone: '255 92 138' },
  { key: 'profile', tab: 'profile', label: 'اطلاعات حساب کاربری', short: 'پروفایل', icon: '/icons/account.webp', tone: '139 124 255' },
  { key: 'accounts', tab: 'accounts', label: 'اکانت‌های من', short: 'اکانت‌ها', icon: '/icons/accounts.webp', tone: '56 200 232' },
  { key: 'orders', tab: 'orders', label: 'سفارش‌های من', short: 'سفارش‌ها', icon: '/icons/cart.webp', tone: '255 146 64' },
  { key: 'logout', label: 'خروج از حساب', short: 'خروج', icon: '/icons/login.webp', tone: '255 90 80', isLogout: true },
  { key: 'teams', tab: 'teams', label: 'تیم‌های من', short: 'تیم‌ها', icon: '/icons/team.webp', tone: '91 140 255' },
  { key: 'tournaments', tab: 'tournaments', label: 'تورنومنت‌های من', short: 'تورنومنت‌ها', icon: '/icons/tournament.webp', tone: '240 193 75' },
  { key: 'notifications', tab: 'notifications', label: 'پیام‌ها و اعلان‌ها', short: 'اعلان‌ها', icon: '/icons/notif.webp', tone: '47 210 122' },
];

export const sectionByTab = (tab: string) => DASHBOARD_SECTIONS.find(section => section.tab === tab) ?? DASHBOARD_SECTIONS[0];

/** Which dashboard section a route belongs to. */
export function activeSection(pathname: string, tabParam: string | null): string {
  if (pathname.startsWith('/teams')) return 'teams';
  if (pathname.startsWith('/tournaments')) return 'tournaments';
  if (pathname.startsWith('/dashboard/orders')) return 'orders';
  return tabParam || 'overview';
}
