import type { Metadata } from 'next';
import React from 'react';

import { RequireAuth } from '@/components/RequireAuth';

import { DeskView } from './DeskView';

export const metadata: Metadata = {
  title: 'میز پشتیبانی | تایتان',
  robots: { index: false, follow: false },
};

export default function DeskPage() {
  return (
    <RequireAuth>
      <DeskView />
    </RequireAuth>
  );
}
