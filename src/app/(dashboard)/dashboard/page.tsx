'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

import { Loading } from '@/components/ui/State';

import { AccountsTab } from './_tabs/AccountsTab';
import { FavoritesTab } from './_tabs/FavoritesTab';
import { NotificationsTab } from './_tabs/NotificationsTab';
import { OrdersTab } from './_tabs/OrdersTab';
import { OverviewTab } from './_tabs/OverviewTab';
import { ProfileTab } from './_tabs/ProfileTab';
import { TeamsTab } from './_tabs/TeamsTab';
import { TournamentsTab } from './_tabs/TournamentsTab';

const TABS: Record<string, React.ComponentType> = {
  overview: OverviewTab,
  profile: ProfileTab,
  accounts: AccountsTab,
  orders: OrdersTab,
  favorites: FavoritesTab,
  teams: TeamsTab,
  tournaments: TournamentsTab,
  notifications: NotificationsTab,
};

function DashboardContent() {
  const tab = useSearchParams().get('tab') ?? 'overview';
  const Tab = TABS[tab] ?? OverviewTab;
  return <Tab key={tab} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
