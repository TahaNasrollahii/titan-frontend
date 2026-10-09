/** Dashboard sections, shared by the desktop sidebar, the phone dashboard menu and the More sheet. */
export interface DashboardSection {
  tab: string;
  label: string;
  /** Shorter label for the phone tiles. */
  short: string;
  icon: string;
  /** Tint of the section's icon tile, as an "R G B" triplet for rgb(var(--tone) / alpha). */
  tone: string;
  dividerBefore?: boolean;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { tab: 'overview', label: 'پیشخوان', short: 'پیشخوان', icon: '/icons/home.png', tone: '255 99 88' },
  { tab: 'profile', label: 'اطلاعات حساب کاربری', short: 'پروفایل', icon: '/icons/account.png', tone: '139 124 255' },
  { tab: 'accounts', label: 'اکانت‌های من', short: 'اکانت‌ها', icon: '/icons/accounts.png', tone: '56 200 232' },
  { tab: 'orders', label: 'سفارش‌های من', short: 'سفارش‌ها', icon: '/icons/cart.png', tone: '255 146 64' },
  { tab: 'favorites', label: 'لیست علاقه‌مندی‌ها', short: 'علاقه‌مندی‌ها', icon: '/icons/favorite.png', tone: '255 92 138' },
  { tab: 'teams', label: 'تیم‌های من', short: 'تیم‌ها', icon: '/icons/team.png', tone: '91 140 255', dividerBefore: true },
  { tab: 'tournaments', label: 'تورنومنت‌های من', short: 'تورنومنت‌ها', icon: '/icons/tournament.png', tone: '240 193 75' },
  { tab: 'notifications', label: 'پیام‌ها و اعلان‌ها', short: 'اعلان‌ها', icon: '/icons/notif.png', tone: '47 210 122' },
];

export const sectionByTab = (tab: string) => DASHBOARD_SECTIONS.find(section => section.tab === tab) ?? DASHBOARD_SECTIONS[0];

/** Which dashboard section a route belongs to. */
export function activeSection(pathname: string, tabParam: string | null): string {
  if (pathname.startsWith('/teams')) return 'teams';
  if (pathname.startsWith('/tournaments')) return 'tournaments';
  if (pathname.startsWith('/dashboard/orders')) return 'orders';
  return tabParam || 'overview';
}
