import type { Metadata } from 'next';
import React from 'react';

import { ContactPanel } from './ContactChannels';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'ارتباط با ما | تایتان',
  description: 'راه‌های ارتباطی با تیم تایتان',
};

export default function ContactPage() {
  return (
    <main className={`main ${styles.contactMain}`}>
      <ContactPanel />
    </main>
  );
}
