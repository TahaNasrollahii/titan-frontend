import type { OrderStatus } from '@/lib/api/types';

import styles from '../page.module.css';

export function orderBadgeClass(status: OrderStatus): string {
  if (status === 'completed') return styles.badgeSuccess;
  if (status === 'paid' || status === 'processing' || status === 'pending_payment') return styles.badgeWarning;
  if (status === 'refunded') return styles.badgeNeutral;
  return styles.badgeDanger;
}
