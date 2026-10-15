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
};

export default function CartPage() {
  return <CartClient />;
}
