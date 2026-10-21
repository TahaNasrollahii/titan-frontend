import type { Metadata } from 'next';
import React from 'react';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'تکمیل سفارش و پرداخت',
  description: 'ثبت اطلاعات و پرداخت امن سفارش در فروشگاه گیمینگ تایتان.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/checkout',
  },
};

export default function CheckoutPage() {
  return (
    <>
      <h1 className="sr-only">تکمیل سفارش و پرداخت در تایتان</h1>
      <CheckoutClient />
    </>
  );
}
