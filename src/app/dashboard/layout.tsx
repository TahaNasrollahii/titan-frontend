import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'داشبورد کاربری | TITAN',
  description: 'مدیریت حساب کاربری، تیم‌ها و تورنومنت‌ها در تایتان'
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
