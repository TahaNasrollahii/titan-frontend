import type { Metadata } from 'next';
import React from 'react';

import { AboutView } from './AboutView';

export const metadata: Metadata = {
  title: 'درباره ما | تایتان',
  description: 'تایتان؛ فروشگاه، تورنومنت و جامعه‌ی گیمرهای ایرانی',
};

export default function AboutPage() {
  return <AboutView />;
}
