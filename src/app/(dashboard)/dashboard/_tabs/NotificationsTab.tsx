'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { errorMessage } from '@/lib/api/client';
import { meApi, notificationsApi } from '@/lib/api/endpoints';
import type { Notification } from '@/lib/api/types';
import { timeAgo } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from '../page.module.css';

const KIND_ICONS: Record<Notification['kind'], string> = {
  system: '/icons/notif.png',
  tournament: '/icons/tournament.png',
  team_invite: '/icons/team.png',
  team: '/icons/team.png',
  friend_request: '/icons/team.png',
  order: '/icons/cart.png',
  payment: '/icons/cart.png',
};

/** Where clicking a notification should take the user, based on its action payload. */
function targetOf(notification: Notification): string | null {
  const { data } = notification;
  if (data.tournamentSlug) return `/tournaments/${data.tournamentSlug}`;
  if (data.orderNumber) return '/dashboard?tab=orders';
  if (data.teamId && notification.kind !== 'team_invite') return `/teams/${data.teamId}`;
  return null;
}

export function NotificationsTab() {
  const router = useRouter();
  const { addToast, refreshUnread } = useAppContext();
  const notifications = useApi(notificationsApi.list);

  const markLocallyRead = (ids: number[] | 'all') =>
    notifications.setData(
      current =>
        current && {
          ...current,
          results: current.results.map(n => (ids === 'all' || ids.includes(n.id) ? { ...n, isRead: true } : n)),
        },
    );

  const readAll = async () => {
    await notificationsApi.markAllRead();
    markLocallyRead('all');
    void refreshUnread();
  };

  const open = async (notification: Notification) => {
    if (!notification.isRead) {
      await notificationsApi.markRead(notification.id).catch(() => undefined);
      markLocallyRead([notification.id]);
      void refreshUnread();
    }
    const target = targetOf(notification);
    if (target) router.push(target);
  };

  const respond = async (notification: Notification, accept: boolean) => {
    try {
      const invitationId = Number(notification.data.invitationId);
      const friendshipId = Number(notification.data.friendshipId);
      if (notification.kind === 'team_invite') {
        await (accept ? meApi.acceptTeamInvitation(invitationId) : meApi.declineTeamInvitation(invitationId));
      } else {
        await (accept ? meApi.acceptFriend(friendshipId) : meApi.declineFriend(friendshipId));
      }
      addToast({ title: accept ? 'پذیرفته شد' : 'رد شد', icon: 'notif', tone: accept ? 'success' : 'info' });
    } catch (error) {
      addToast({ title: 'خطا', text: errorMessage(error), icon: 'notif', tone: 'error' });
    }
    // The backend marks the action notification read once it is handled.
    await notifications.reload();
    void refreshUnread();
  };

  const actionable = (n: Notification) =>
    !n.isRead && ((n.kind === 'team_invite' && n.data.invitationId) || (n.kind === 'friend_request' && n.data.friendshipId));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>پیام‌ها و اعلان‌ها</h3>
        <button className={styles.btnSecondary} style={{ padding: '6px 12px' }} onClick={readAll}>
          خواندن همه
        </button>
      </div>

      {notifications.loading && <Loading />}
      {notifications.data?.results.length === 0 && (
        <div className={styles.emptyState}>
          <Icon name="bell" />
          <p>اعلان جدیدی ندارید.</p>
        </div>
      )}
      {notifications.data?.results.map(notification => (
        <div
          key={notification.id}
          className={`${styles.listItem} ${notification.isRead ? '' : styles.unread}`}
          style={{ cursor: 'pointer' }}
          onClick={() => void open(notification)}
        >
          <div className={styles.listItemInfo}>
            <div className={styles.itemIcon} style={{ background: 'rgba(165, 198, 255, 0.1)' }}>
              <img src={KIND_ICONS[notification.kind]} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
            <div className={styles.itemDetails}>
              <h4>{notification.title}</h4>
              <p>{notification.body}</p>
            </div>
          </div>
          {actionable(notification) ? (
            <div className={styles.itemActions} onClick={event => event.stopPropagation()}>
              <button className={styles.btnPrimary} style={{ padding: '6px 12px' }} onClick={() => respond(notification, true)}>
                قبول
              </button>
              <button className={styles.btnSecondary} style={{ padding: '6px 12px' }} onClick={() => respond(notification, false)}>
                رد
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{timeAgo(notification.createdAt)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
