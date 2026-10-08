'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { errorMessage } from '@/lib/api/client';
import { ordersApi } from '@/lib/api/endpoints';
import type { Order } from '@/lib/api/types';
import { faNumber, ORDER_STATUS_LABELS, timeAgo, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from '../page.module.css';
import { orderBadgeClass } from './shared';

function OrderDetails({ order }: { order: Order }) {
  return (
    <div className={styles.orderDetailsWrapper}>
      <div className={styles.orderItemsList}>
        {order.items.map(item => {
          const ItemWrapper: React.ElementType = item.product ? Link : 'div';
          const wrapperProps = item.product ? { href: `/product/${item.product}`, className: styles.orderItemRow } : { className: styles.orderItemRow };

          return (
            <ItemWrapper key={item.id} {...wrapperProps}>
              <div className={styles.orderItemInfo}>
                <div className={styles.orderItemImage}>
                  {item.image ? <img src={item.image} alt={item.title} /> : <Icon name="cart" />}
                </div>
                <div className={styles.orderItemMeta}>
                  <h4>{item.title}</h4>
                  {item.variantLabel && <p className={styles.itemVariant}>{item.variantLabel}</p>}
                  {item.deliveredCode && (
                    <div className={styles.deliveryCode}>
                      <span className={styles.codeLabel}>کد تحویل:</span>
                      <span className={styles.codeBox}>{item.deliveredCode}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.orderItemPricing}>
                <span className={styles.itemQty}>{faNumber(item.quantity)} عدد</span>
                <span className={styles.itemTotal}>{toman(item.lineTotal)}</span>
              </div>
            </ItemWrapper>
          );
        })}
      </div>

      <div className={styles.orderSummary}>
        {order.gameAccountUsername && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>اکانت بازی:</span>
            <span className={styles.summaryValue}>
              {order.gameAccountTitle} <span className={styles.usernameHighlight}>({order.gameAccountUsername})</span>
            </span>
          </div>
        )}
        
        {order.discount > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>تخفیف:</span>
            <span className={styles.summaryValueDiscount}>{toman(order.discount)}</span>
          </div>
        )}
        
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span className={styles.summaryLabel}>مبلغ کل سفارش:</span>
          <span className={styles.summaryValueTotal}>{toman(order.total)}</span>
        </div>
      </div>
      
      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <Link href={`/dashboard/orders/${order.number}`} className={styles.btnSecondary} style={{ width: '100%' }}>
          مشاهده جزئیات کامل سفارش
        </Link>
      </div>
    </div>
  );
}

export function OrdersTab() {
  const { addToast } = useAppContext();
  const orders = useApi(ordersApi.list);
  const [expanded, setExpanded] = useState<string | null>(null);

  const cancel = async (order: Order) => {
    try {
      const updated = await ordersApi.cancel(order.number);
      orders.setData(current =>
        current && { ...current, results: current.results.map(o => (o.number === updated.number ? updated : o)) },
      );
    } catch (error) {
      addToast({ title: 'لغو سفارش', text: errorMessage(error), icon: 'cart', tone: 'error' });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>سفارش‌های من</h3>
      </div>
      {orders.loading && <Loading />}
      {orders.data?.results.length === 0 && (
        <div className={styles.emptyState}>
          <Icon name="cart" />
          <p>هنوز سفارشی ثبت نکرده‌اید.</p>
          <Link href="/store" className={styles.btnPrimary}>
            مشاهده فروشگاه
          </Link>
        </div>
      )}
      {orders.data?.results.map(order => (
        <React.Fragment key={order.number}>
          <div
            className={styles.listItem}
            style={{ cursor: 'pointer' }}
            onClick={() => setExpanded(expanded === order.number ? null : order.number)}
          >
            <div className={styles.listItemInfo}>
              <div className={styles.itemThumb}>
                {order.items[0]?.image ? <img src={order.items[0].image} alt="" /> : <Icon name="cart" />}
              </div>
              <div className={styles.itemDetails}>
                <h4>
                  {order.items[0]?.title}
                  {order.items.length > 1 && ` و ${faNumber(order.items.length - 1)} مورد دیگر`}
                </h4>
                <p>
                  کد سفارش: {order.number} • تاریخ: {timeAgo(order.createdAt)}
                </p>
              </div>
            </div>
            <div className={styles.itemActions}>
              {(order.status === 'pending_payment' || order.status === 'failed') && (
                <button
                  className={`${styles.btnSecondary} ${styles.dangerBtn}`}
                  style={{ padding: '6px 12px' }}
                  onClick={event => {
                    event.stopPropagation();
                    void cancel(order);
                  }}
                >
                  لغو
                </button>
              )}
              <span className={`${styles.badge} ${orderBadgeClass(order.status)}`}>{ORDER_STATUS_LABELS[order.status]}</span>
            </div>
          </div>
          {expanded === order.number && <OrderDetails order={order} />}
        </React.Fragment>
      ))}
    </div>
  );
}
