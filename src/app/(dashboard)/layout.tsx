import type { Metadata } from 'next';
import React from 'react';

import dashboardStyles from '@/app/(dashboard)/dashboard/page.module.css';
import { DashboardSidebarWrapper } from '@/components/DashboardSidebarWrapper';
import { RequireAuth } from '@/components/RequireAuth';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className={dashboardStyles.dashboardWrapper}>
        <DashboardSidebarWrapper />
        <main className={dashboardStyles.contentArea}>{children}</main>
      </div>
    </RequireAuth>
  );
}
