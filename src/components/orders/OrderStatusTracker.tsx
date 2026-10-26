'use client';

import Link from 'next/link';
import React from 'react';

import { Icon } from '@/components/Icons';
import type { Order } from '@/lib/api/types';
import { jalaliDateTime, ORDER_STATUS_LABELS, toman } from '@/lib/format';

import styles from './OrderStatusTracker.module.css';

interface OrderStatusTrackerProps {
  order: Order;
  compact?: boolean;
}

export function OrderStatusTracker({ order, compact = false }: OrderStatusTrackerProps) {
  const { status } = order;
  const isCancelled = status === 'cancelled' || status === 'refunded';
  const isFailed = status === 'failed';

  // Step 1: تایید سفارش (Order Confirmed / Paid)
  const isStep1Done = status === 'paid' || status === 'processing' || status === 'completed';
  const isStep1Active = status === 'pending_payment';

  // Step 2: در حال انجام (In Progress / Processing)
  const isStep2Done = status === 'completed';
  const isStep2Active = status === 'paid' || status === 'processing';

  // Step 3: انجام شده (Completed)
  const isStep3Done = status === 'completed';

  // Header status description
  const getStatusDesc = () => {
    switch (status) {
      case 'pending_payment':
        return 'سفارش ثبت شد و در انتظار پرداخت است. پس از پرداخت، سفارش تایید شده و به وضعیت «در حال انجام» تغییر می‌یابد.';
      case 'paid':
      case 'processing':
        return 'سفارش شما با موفقیت تایید شد و هم‌اکنون توسط تیم پشتیبانی تایتان در حال انجام و آماده‌سازی است.';
      case 'completed':
        return 'سفارش شما با موفقیت انجام و تکمیل شد. جزئیات تحویل در بخش اقلام سفارش قابل مشاهده است.';
      case 'cancelled':
      case 'refunded':
        return 'این سفارش لغو شده است. مبلغ سفارش به کیف پول حساب کاربری شما بازگردانده شده است.';
      case 'failed':
        return 'پرداخت این سفارش با خطا مواجه شد و ناموفق بود.';
      default:
        return 'وضعیت سفارش شما در حال پیگیری است.';
    }
  };

  return (
    <div className={`${styles.trackerCard} ${compact ? styles.trackerCardCompact : ''}`}>
      <div className={styles.glowAmbient} />

      {/* Header */}
      <div className={`${styles.headerRow} ${compact ? styles.headerRowCompact : ''}`}>
        <div className={styles.headerLeft}>
          <h4 className={`${styles.headerTitle} ${compact ? styles.headerTitleCompact : ''}`}>
            <Icon name="sliders" style={{ color: 'var(--red, #e2453f)' }} />
            <span>وضعیت سفارش</span>
          </h4>
          <span
            style={{
              fontSize: compact ? '11px' : '12px',
              padding: compact ? '2px 8px' : '4px 10px',
              borderRadius: '8px',
              fontWeight: 700,
              background:
                status === 'completed'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : status === 'processing' || status === 'paid'
                  ? 'rgba(245, 158, 11, 0.2)'
                  : isCancelled || isFailed
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(148, 163, 184, 0.2)',
              color:
                status === 'completed'
                  ? '#34d399'
                  : status === 'processing' || status === 'paid'
                  ? '#fbbf24'
                  : isCancelled || isFailed
                  ? '#f87171'
                  : '#cbd5e1',
              border: '1px solid currentColor',
            }}
          >
            {ORDER_STATUS_LABELS[status] || status}
          </span>
        </div>
        <p className={styles.statusDesc}>{getStatusDesc()}</p>
      </div>

      {/* Cancelled or Refunded Banner */}
      {isCancelled ? (
        <div className={`${styles.cancelledCard} ${compact ? styles.cancelledCardCompact : ''}`}>
          <div className={styles.cancelledInfo}>
            <div className={styles.cancelledIcon}>
              <Icon name="x" />
            </div>
            <div className={styles.cancelledText}>
              <h4>سفارش لغو شده</h4>
              <p>
                {order.total > 0 ? (
                  <>
                    مبلغ سفارش به حساب شما بازگشت داده شد:
                    <span className={styles.cancelledAmount}>{toman(order.total)}</span>
                  </>
                ) : (
                  'این سفارش پیش از پرداخت لغو گردید.'
                )}
              </p>
            </div>
          </div>
          {order.total > 0 && (
            <Link href="/dashboard" className={styles.walletBtn}>
              <Icon name="wallet" />
              <span>مشاهده کیف پول</span>
            </Link>
          )}
        </div>
      ) : (
        /* The 3-Step Visual Stepper */
        <div className={styles.stepper}>
          {/* Step 1: تایید سفارش */}
          <div
            className={`${styles.stepNode} ${
              isStep1Done ? styles.stepCompleted : isStep1Active ? styles.stepActive : styles.stepPending
            }`}
          >
            <div className={`${styles.iconCircle} ${compact ? styles.iconCircleCompact : ''}`}>
              {isStep1Done ? <Icon name="check" /> : <Icon name="cart" />}
            </div>
            <div className={styles.stepMeta}>
              <h5 className={`${styles.stepTitle} ${compact ? styles.stepTitleCompact : ''}`}>تایید سفارش</h5>
              <p className={`${styles.stepSubtitle} ${compact ? styles.stepSubtitleCompact : ''}`}>
                {isStep1Done
                  ? order.paidAt
                    ? `تایید در ${jalaliDateTime(order.paidAt)}`
                    : 'تایید و ثبت نهایی شد'
                  : 'در انتظار پرداخت'}
              </p>
            </div>
          </div>

          {/* Track Bar 1 -> 2 */}
          <div className={`${styles.trackBar} ${compact ? styles.trackBarCompact : ''}`}>
            <div
              className={`${styles.barFill} ${isStep2Active ? styles.barFillActive : ''}`}
              style={{ width: isStep1Done ? '100%' : '0%' }}
            />
          </div>

          {/* Step 2: در حال انجام */}
          <div
            className={`${styles.stepNode} ${
              isStep2Done ? styles.stepCompleted : isStep2Active ? styles.stepActive : styles.stepPending
            }`}
          >
            <div className={`${styles.iconCircle} ${compact ? styles.iconCircleCompact : ''}`}>
              {isStep2Done ? (
                <Icon name="check" />
              ) : isStep2Active ? (
                <Icon name="refresh" style={{ animation: 'spin 3s linear infinite' }} />
              ) : (
                <Icon name="clock" />
              )}
            </div>
            <div className={styles.stepMeta}>
              <h5 className={`${styles.stepTitle} ${compact ? styles.stepTitleCompact : ''}`}>در حال انجام</h5>
              <p className={`${styles.stepSubtitle} ${compact ? styles.stepSubtitleCompact : ''}`}>
                {isStep2Done
                  ? 'انجام شد'
                  : isStep2Active
                  ? 'در حال آماده‌سازی و ارسال'
                  : 'آماده‌سازی سفارش'}
              </p>
            </div>
          </div>

          {/* Track Bar 2 -> 3 */}
          <div className={`${styles.trackBar} ${compact ? styles.trackBarCompact : ''}`}>
            <div
              className={`${styles.barFill} ${isStep3Done ? styles.barFill : ''}`}
              style={{ width: isStep3Done ? '100%' : '0%' }}
            />
          </div>

          {/* Step 3: انجام شده */}
          <div
            className={`${styles.stepNode} ${
              isStep3Done ? styles.stepCompleted : styles.stepPending
            }`}
          >
            <div className={`${styles.iconCircle} ${compact ? styles.iconCircleCompact : ''}`}>
              {isStep3Done ? <Icon name="check" /> : <Icon name="trophy" />}
            </div>
            <div className={styles.stepMeta}>
              <h5 className={`${styles.stepTitle} ${compact ? styles.stepTitleCompact : ''}`}>انجام شده</h5>
              <p className={`${styles.stepSubtitle} ${compact ? styles.stepSubtitleCompact : ''}`}>
                {isStep3Done
                  ? order.completedAt
                    ? `تکمیل در ${jalaliDateTime(order.completedAt)}`
                    : 'سفارش با موفقیت تحویل شد'
                  : 'تحویل کامل به کاربر'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
