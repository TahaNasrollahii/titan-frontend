'use client';

import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

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
  system: '/icons/notif.webp',
  tournament: '/icons/tournament.webp',
  team_invite: '/icons/team.webp',
  team: '/icons/team.webp',
  friend_request: '/icons/team.webp',
  order: '/icons/cart.webp',
  payment: '/icons/cart.webp',
};

/** Where clicking a notification should take the user, based on its action payload. */
function targetOf(notification: Notification): string | null {
  const { data } = notification;
  if (data.tournamentSlug) return `/tournaments/${data.tournamentSlug}`;
  if (data.orderNumber) return `/dashboard/orders/${data.orderNumber}`;
  if (data.teamId && notification.kind !== 'team_invite') return `/teams/${data.teamId}`;
  return null;
}

function invitationIdOf(notification: Notification): number | null {
  const raw = notification.data.invitationId ?? notification.data.invitation_id;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function friendshipIdOf(notification: Notification): number | null {
  const raw = notification.data.friendshipId ?? notification.data.friendship_id;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function NotificationsTab() {
  const router = useRouter();
  const { addToast, refreshUnread } = useAppContext();
  const notifications = useApi(notificationsApi.list);
  const teamInvitations = useApi(meApi.teamInvitations);
  const friendRequests = useApi(meApi.friendRequests);
  const [busyId, setBusyId] = useState<number | null>(null);

  const pendingInvitationIds = useMemo(
    () => (teamInvitations.data ? new Set(teamInvitations.data.map(inv => inv.id)) : null),
    [teamInvitations.data],
  );

  const pendingFriendshipIds = useMemo(
    () => (friendRequests.data ? new Set(friendRequests.data.map(req => req.id)) : null),
    [friendRequests.data],
  );

  const actionable = (n: Notification) => {
    if (n.kind === 'team_invite') {
      const invitationId = invitationIdOf(n);
      if (!invitationId) return false;
      return pendingInvitationIds ? pendingInvitationIds.has(invitationId) : !n.isRead;
    }
    if (n.kind === 'friend_request') {
      const friendshipId = friendshipIdOf(n);
      if (!friendshipId) return false;
      return pendingFriendshipIds ? pendingFriendshipIds.has(friendshipId) : !n.isRead;
    }
    return false;
  };

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
    if (actionable(notification)) return;
    if (!notification.isRead) {
      await notificationsApi.markRead(notification.id).catch(() => undefined);
      markLocallyRead([notification.id]);
      void refreshUnread();
    }
    const target = targetOf(notification);
    if (target) router.push(target);
  };

  const respond = async (notification: Notification, accept: boolean) => {
    if (busyId === notification.id) return;
    setBusyId(notification.id);
    try {
      const invitationId = invitationIdOf(notification);
      const friendshipId = friendshipIdOf(notification);
      if (notification.kind === 'team_invite' && invitationId) {
        await (accept ? meApi.acceptTeamInvitation(invitationId) : meApi.declineTeamInvitation(invitationId));
        teamInvitations.setData(current => current?.filter(inv => inv.id !== invitationId));
      } else if (friendshipId) {
        await (accept ? meApi.acceptFriend(friendshipId) : meApi.declineFriend(friendshipId));
        friendRequests.setData(current => current?.filter(req => req.id !== friendshipId));
      }
      markLocallyRead([notification.id]);
      addToast({ title: accept ? 'پذیرفته شد' : 'رد شد', icon: 'notif', tone: accept ? 'success' : 'info' });
    } catch (error) {
      addToast({ title: 'خطا', text: errorMessage(error), icon: 'notif', tone: 'error' });
    } finally {
      setBusyId(null);
    }
    // The backend marks the action notification read once it is handled.
    await Promise.all([
      notifications.reload(),
      notification.kind === 'team_invite' ? teamInvitations.reload() : friendRequests.reload(),
    ]);
    void refreshUnread();
  };

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
      {notifications.data?.results.map(notification => {
        const isActionable = actionable(notification);
        const canOpen = !isActionable && Boolean(targetOf(notification) || !notification.isRead);
        const isBusy = busyId === notification.id;
        return (
          <div
            key={notification.id}
            className={`${styles.listItem} ${notification.isRead ? '' : styles.unread}`}
            style={{ cursor: canOpen ? 'pointer' : 'default' }}
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
            {isActionable ? (
              <div className={styles.itemActions} onClick={event => event.stopPropagation()}>
                <button
                  className={styles.btnPrimary}
                  style={{ padding: '6px 12px' }}
                  disabled={isBusy}
                  onClick={() => void respond(notification, true)}
                >
                  قبول
                </button>
                <button
                  className={styles.btnSecondary}
                  style={{ padding: '6px 12px' }}
                  disabled={isBusy}
                  onClick={() => void respond(notification, false)}
                >
                  رد
                </button>
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{timeAgo(notification.createdAt)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
