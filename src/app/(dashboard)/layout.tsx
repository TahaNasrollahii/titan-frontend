import React from 'react';
import dashboardStyles from '@/app/(dashboard)/dashboard/page.module.css';
import { DashboardSidebarWrapper } from '@/components/DashboardSidebarWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <DashboardSidebarWrapper />
      <main className={dashboardStyles.contentArea}>
        {children}
      </main>
    </div>
  );
}
