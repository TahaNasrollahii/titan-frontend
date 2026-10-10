'use client';

import Link from 'next/link';
import React from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { errorMessage } from '@/lib/api/client';
import { meApi } from '@/lib/api/endpoints';
import { faNumber, initials, ROLE_LABELS } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from '../page.module.css';

export function TeamsTab() {
  const { addToast } = useAppContext();
  const teams = useApi(meApi.teams);
  const invitations = useApi(meApi.teamInvitations);

  const respond = async (id: number, accept: boolean) => {
    try {
      if (accept) await meApi.acceptTeamInvitation(id);
      else await meApi.declineTeamInvitation(id);
      addToast({ title: accept ? 'به تیم پیوستید' : 'دعوت رد شد', icon: 'team', tone: accept ? 'success' : 'info' });
      await Promise.all([teams.reload(), invitations.reload()]);
    } catch (error) {
      addToast({ title: 'دعوت تیم', text: errorMessage(error), icon: 'team', tone: 'error' });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>تیم‌های من</h3>
        <Link href="/teams/create" className={styles.btnPrimary} style={{ padding: '8px 16px', textDecoration: 'none' }}>
          <Icon name="plus" /> ساخت تیم
        </Link>
      </div>

      {(invitations.data?.length ?? 0) > 0 && (
        <>
          <h4 className={styles.sectionTitle}>دعوت‌نامه‌ها</h4>
          {invitations.data!.map(invitation => (
            <div key={invitation.id} className={styles.listItem}>
              <div className={styles.listItemInfo}>
                <div className={styles.itemIcon} style={{ background: 'linear-gradient(135deg, #1f2937, #111827)', color: '#fff' }}>
                  {initials(invitation.team.name)}
                </div>
                <div className={styles.itemDetails}>
                  <h4>{invitation.team.name}</h4>
                  <p>دعوت از طرف {invitation.invitedBy.displayName}</p>
                </div>
              </div>
              <div className={styles.itemActions}>
                <button className={styles.btnPrimary} style={{ padding: '6px 12px' }} onClick={() => respond(invitation.id, true)}>
                  قبول
                </button>
                <button className={styles.btnSecondary} style={{ padding: '6px 12px' }} onClick={() => respond(invitation.id, false)}>
                  رد
                </button>
              </div>
            </div>
          ))}
          <h4 className={styles.sectionTitle}>تیم‌ها</h4>
        </>
      )}

      {teams.loading && <Loading />}
      {teams.data?.length === 0 && (
        <div className={styles.emptyState}>
          <Icon name="users" />
          <p>هنوز عضو هیچ تیمی نیستید.</p>
        </div>
      )}
      {teams.data?.map(team => (
        <div key={team.id} className={styles.listItem}>
          <div className={styles.listItemInfo}>
            <div className={styles.itemIcon} style={{ background: 'linear-gradient(135deg, #1f2937, #111827)', color: '#fff' }}>
              {team.logo ? <img src={team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(team.name)}
            </div>
            <div className={styles.itemDetails}>
              <h4>{team.name}</h4>
              <p>
                {faNumber(team.memberCount)} عضو • نقش: {team.myRole ? ROLE_LABELS[team.myRole] : '—'}
              </p>
            </div>
          </div>
          <Link
            href={team.myRole === 'captain' ? `/teams/${team.id}/manage` : `/teams/${team.id}`}
            className={styles.btnSecondary}
            style={{ textDecoration: 'none' }}
          >
            {team.myRole === 'captain' ? 'مدیریت تیم' : 'مشاهده'}
          </Link>
        </div>
      ))}
    </div>
  );
}
