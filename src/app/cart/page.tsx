import type { Metadata } from 'next';
import React from 'react';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'سبد خرید',
  description: 'مشاهده و مدیریت سبد خرید محصولات و آیتم‌های گیمینگ در تایتان.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/cart',
  },
};

export default function CartPage() {
  return (
    <>
      <h1 className="sr-only">سبد خرید تایتان</h1>
      <CartClient />
    </>
  );
}
