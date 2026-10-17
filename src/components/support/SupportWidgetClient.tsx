'use client';

import dynamic from 'next/dynamic';

const SupportWidget = dynamic(
  () => import('./SupportWidget').then((mod) => mod.SupportWidget),
  { ssr: false }
);

export function SupportWidgetClient() {
  return <SupportWidget />;
}

