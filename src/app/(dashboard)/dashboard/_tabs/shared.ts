import type { OrderStatus } from '@/lib/api/types';

import styles from '../page.module.css';

export function orderBadgeClass(status: OrderStatus): string {
  if (status === 'completed' || status === 'paid') return styles.badgeSuccess;
  if (status === 'processing' || status === 'pending_payment') return styles.badgeWarning;
  if (status === 'refunded') return styles.badgeNeutral;
  return styles.badgeDanger;
}
