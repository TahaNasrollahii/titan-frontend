import type { Metadata } from 'next';
import React from 'react';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'تکمیل سفارش و پرداخت',
  description: 'ثبت اطلاعات و پرداخت امن سفارش در فروشگاه گیمینگ تایتان.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
