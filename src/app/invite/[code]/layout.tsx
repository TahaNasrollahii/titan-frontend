import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'دعوت به تیم',
  description: 'پیوستن به تیم در پلتفرم مسابقات گیمینگ تایتان.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
