import type { Metadata } from 'next';
import React from 'react';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'ورود یا ثبت‌نام',
  description: 'ورود به حساب کاربری پلتفرم گیمینگ تایتان با شماره موبایل و کد تأیید.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
