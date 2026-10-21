import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'نتیجه پرداخت',
  description: 'مشاهده وضعیت پرداخت و پیگیری سفارش در تایتان.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function PaymentResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
