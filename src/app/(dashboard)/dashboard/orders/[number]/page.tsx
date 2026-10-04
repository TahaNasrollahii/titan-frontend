'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { ordersApi } from '@/lib/api/endpoints';
import { faNumber, jalaliDateTime, ORDER_STATUS_LABELS, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from '../../page.module.css';
import { orderBadgeClass } from '../../_tabs/shared';

export default function OrderDetailsPage() {
  const params = useParams();
  const number = params?.number as string;
  const router = useRouter();
  const orderApi = useApi(number ? () => ordersApi.get(number) : null, [number]);

  if (orderApi.loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <div className={styles.contentArea}>
          <div className={styles.panel}>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  const order = orderApi.data;

  if (!order) {
    return (
      <div className={styles.dashboardWrapper}>
        <div className={styles.contentArea}>
          <div className={styles.panel}>
            <div className={styles.emptyState}>
              <Icon name="info" />
              <p>سفارش یافت نشد.</p>
              <button onClick={() => router.back()} className={styles.btnSecondary}>
                بازگشت
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.contentArea}>
        <div className={styles.panel}>
          <div className={styles.panelHeader} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => router.back()} 
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '24px', display: 'flex' }}
              >
                &rarr;
              </button>
              <h3 style={{ margin: 0 }}>جزئیات سفارش #{order.number}</h3>
            </div>
            <span className={`${styles.badge} ${orderBadgeClass(order.status)}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '16px' }}>
            <div className={styles.statCard} style={{ cursor: 'auto', transform: 'none' }}>
              <span className={styles.statLabel}>تاریخ ثبت سفارش</span>
              <span className={styles.statValue} style={{ fontSize: '18px' }}>
                {jalaliDateTime(order.createdAt)}
              </span>
            </div>
            {order.gameAccountUsername && (
              <div className={styles.statCard} style={{ cursor: 'auto', transform: 'none' }}>
                <span className={styles.statLabel}>اکانت بازی متصل</span>
                <span className={styles.statValue} style={{ fontSize: '18px' }}>
                  {order.gameAccountTitle} <span style={{ color: 'var(--muted)' }}>({order.gameAccountUsername})</span>
                </span>
              </div>
            )}
          </div>

          <div className={styles.sectionTitle} style={{ marginTop: '32px', fontSize: '20px', fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '24px' }}>
            محصولات سفارش
          </div>
          
          <div className={styles.orderItemsList}>
            {order.items.map(item => {
              const ItemWrapper = item.product ? Link : 'div';
              const wrapperProps = item.product ? { href: `/product/${item.product}`, className: styles.orderItemRow } : { className: styles.orderItemRow };

              return (
                <ItemWrapper key={item.id} {...wrapperProps} style={{ padding: '24px', background: 'rgba(0,0,0,0.2)' }}>
                  <div className={styles.orderItemInfo}>
                    <div className={styles.orderItemImage} style={{ width: '80px', height: '80px', borderRadius: '18px' }}>
                      {item.image ? <img src={item.image} alt={item.title} /> : <Icon name="cart" />}
                    </div>
                    <div className={styles.orderItemMeta}>
                      <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>{item.title}</h4>
                      {item.variantLabel && <p className={styles.itemVariant} style={{ fontSize: '14px' }}>{item.variantLabel}</p>}
                      {item.deliveredCode && (
                        <div className={styles.deliveryCode} style={{ marginTop: '8px' }}>
                          <span className={styles.codeLabel}>کد تحویل:</span>
                          <span className={styles.codeBox} style={{ fontSize: '16px', padding: '6px 16px' }}>{item.deliveredCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.orderItemPricing}>
                    <span className={styles.itemQty} style={{ fontSize: '15px', padding: '6px 14px' }}>{faNumber(item.quantity)} عدد</span>
                    <span className={styles.itemTotal} style={{ fontSize: '20px' }}>{toman(item.lineTotal)}</span>
                  </div>
                </ItemWrapper>
              );
            })}
          </div>

          <div className={styles.orderSummary} style={{ marginTop: '40px', padding: '32px', background: 'linear-gradient(160deg, rgba(63, 17, 25, 0.4) 0%, rgba(30, 7, 12, 0.6) 100%)', borderRadius: '24px', border: '1px solid rgba(226, 69, 63, 0.1)' }}>
            <div className={styles.summaryRow} style={{ marginBottom: '16px' }}>
              <span className={styles.summaryLabel} style={{ fontSize: '16px' }}>جمع مبلغ محصولات:</span>
              <span className={styles.summaryValue} style={{ fontSize: '18px' }}>{toman(order.subtotal)}</span>
            </div>
            
            {order.discount > 0 && (
              <div className={styles.summaryRow} style={{ marginBottom: '16px' }}>
                <span className={styles.summaryLabel} style={{ fontSize: '16px' }}>تخفیف:</span>
                <span className={styles.summaryValueDiscount} style={{ fontSize: '18px' }}>{toman(order.discount)}</span>
              </div>
            )}
            
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`} style={{ paddingTop: '24px', marginTop: '16px' }}>
              <span className={styles.summaryLabel} style={{ fontSize: '20px' }}>مبلغ نهایی پرداخت شده:</span>
              <span className={styles.summaryValueTotal} style={{ fontSize: '32px' }}>{toman(order.total)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
