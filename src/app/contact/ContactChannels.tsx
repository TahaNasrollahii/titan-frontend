'use client';

import React from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { contentApi } from '@/lib/api/endpoints';
import type { ContactChannel } from '@/lib/api/types';
import { useApi } from '@/lib/hooks/useApi';

import styles from './page.module.css';

const KIND_CLASS: Record<ContactChannel['kind'], string> = {
  discord: styles.discord,
  telegram_channel: styles.teleChannel,
  telegram_support: styles.teleSupport,
  live_chat: styles.onlineSupport,
  email: styles.email,
  phone: styles.phone,
};

/** Phone numbers and emails open natively; everything else opens in a new tab. */
const isExternal = (url: string) => /^https?:/.test(url);

function ChannelCard({ channel }: { channel: ContactChannel }) {
  const content = (
    <>
      {channel.icon && (
        <div className={styles.iconWrap}>
          <img src={channel.icon} alt="" />
        </div>
      )}
      <div className={styles.textWrap}>
        <h3>
          {channel.title}
          {channel.isOnline && (
            <span className={styles.liveBadge}>
              <span className={styles.dot}></span> آنلاین
            </span>
          )}
        </h3>
        <p>{channel.description}</p>
      </div>
    </>
  );

  return (
    <a
      href={channel.url}
      className={`${styles.glitchCard} ${KIND_CLASS[channel.kind] ?? ''}`}
      {...(isExternal(channel.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <div className={styles.cardHighlight}></div>
      <div className={styles.cardContent}>
        {channel.isPrimary ? (
          <>
            <div className={styles.rightContent}>{content}</div>
            {channel.actionLabel && (
              <div className={styles.actionBtn}>
                <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> {channel.actionLabel}
              </div>
            )}
          </>
        ) : (
          content
        )}
      </div>
    </a>
  );
}

function pairs<T>(items: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += 2) result.push(items.slice(i, i + 2));
  return result;
}

/** The whole contact panel: one request feeds both the online badge and the channel cards. */
export function ContactPanel() {
  const contact = useApi(contentApi.contact);

  const channels = contact.data?.channels ?? [];
  const primary = channels.filter(c => c.isPrimary);
  // The phone line reads best as a full-width card at the end, like the original design.
  const phone = channels.filter(c => !c.isPrimary && c.kind === 'phone');
  const rest = channels.filter(c => !c.isPrimary && c.kind !== 'phone');

  return (
    <div className={`reveal ${styles.contactPanel}`} style={{ '--d': 1 } as React.CSSProperties}>
      <div className={styles.topSection}>
        <div className={styles.headerContent}>
          {contact.data && (
            <div className={styles.onlineBadge}>
              <span className={styles.dot}></span>
              {contact.data.supportOnline ? 'تیم پشتیبانی آنلاین است' : 'پشتیبانی در حال حاضر آفلاین است'}
            </div>
          )}
          <h2>
            ارتباط <span>مستقیم</span> با تایتان
          </h2>
          <p>تایتان فقط یک پلتفرم نیست؛ یک خانواده است. از طریق کانال‌های زیر همیشه در کنار ما باشید.</p>
        </div>
        <div className={styles.robotImageWrapper}>
          <div className={styles.robotBackglow}></div>
          <div className={styles.spinRing}></div>
          <div className={styles.floatParticle1}></div>
          <div className={styles.floatParticle2}></div>
          <img src="/images/support-robot.png" alt="پشتیبانی تایتان" className={styles.robotImage} />
        </div>
      </div>

      {contact.loading ? (
        <Loading />
      ) : (
        <div className={styles.cardContainer}>
          {primary.map(channel => (
            <ChannelCard key={channel.kind + channel.url} channel={channel} />
          ))}
          {pairs(rest).map(row => (
            <div key={row.map(c => c.kind).join('-')} className={styles.dualGrid}>
              {row.map(channel => (
                <ChannelCard key={channel.kind + channel.url} channel={channel} />
              ))}
            </div>
          ))}
          {phone.map(channel => (
            <ChannelCard key={channel.kind + channel.url} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
}
