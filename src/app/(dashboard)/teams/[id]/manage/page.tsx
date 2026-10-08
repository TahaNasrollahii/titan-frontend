'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { ApiError, errorMessage } from '@/lib/api/client';
import { TeamInput, teamsApi } from '@/lib/api/endpoints';
import type { TeamMember } from '@/lib/api/types';
import { ROLE_LABELS } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import { TeamForm } from '../../TeamForm';
import styles from './page.module.css';

export default function TeamManagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useAppContext();
  const team = useApi(() => teamsApi.get(id), [id]);
  const isCaptain = team.data?.myRole === 'captain';
  const invitations = useApi(isCaptain ? () => teamsApi.invitations(Number(id)) : null, [id, isCaptain]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [inviteName, setInviteName] = useState('');

  // Only the captain can manage; other members see the public team page.
  useEffect(() => {
    if (team.data && !isCaptain) router.replace(`/teams/${id}`);
  }, [team.data, isCaptain, id, router]);

  if (team.loading) return <Loading />;
  const data = team.data;
  if (!data) return <ErrorState error={team.error} onRetry={team.reload} />;
  if (!isCaptain) return <Loading />;

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      addToast({ title: success, icon: 'check', tone: 'success' });
      await team.reload();
    } catch (error) {
      addToast({ title: 'خطا', text: errorMessage(error), icon: 'info', tone: 'error' });
    }
  };

  const save = async (input: TeamInput) => {
    setSaving(true);
    setErrors({});
    try {
      team.setData(await teamsApi.update(data.id, input));
      addToast({ title: 'تغییرات ذخیره شد', icon: 'check', tone: 'success' });
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.errors);
      addToast({ title: 'خطا', text: errorMessage(error), icon: 'info', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const copyInvite = async () => {
    if (!data.inviteUrl) return;
    await navigator.clipboard?.writeText(data.inviteUrl);
    addToast({ title: 'لینک دعوت کپی شد', icon: 'copy', tone: 'success' });
  };

  const invite = async () => {
    if (!inviteName.trim()) return;
    try {
      await teamsApi.invite(data.id, inviteName.trim());
      setInviteName('');
      addToast({ title: 'دعوت‌نامه ارسال شد', icon: 'users', tone: 'success' });
      await invitations.reload();
    } catch (error) {
      addToast({ title: 'دعوت بازیکن', text: errorMessage(error), icon: 'info', tone: 'error' });
    }
  };

  const kick = (member: TeamMember) => {
    if (!window.confirm(`${member.user.displayName} از تیم اخراج شود؟`)) return;
    void run(() => teamsApi.removeMember(data.id, member.user.id), 'عضو اخراج شد');
  };

  const promote = (member: TeamMember) => {
    if (!window.confirm(`کاپیتانی به ${member.user.displayName} واگذار شود؟`)) return;
    void run(() => teamsApi.promote(data.id, member.user.id), 'کاپیتانی واگذار شد');
  };

  const leave = async () => {
    if (!user || !window.confirm('از تیم خارج می‌شوید؟')) return;
    try {
      await teamsApi.removeMember(data.id, user.id);
      router.push('/dashboard?tab=teams');
    } catch (error) {
      addToast({ title: 'خروج از تیم', text: errorMessage(error), icon: 'info', tone: 'error' });
    }
  };

  const dissolve = async () => {
    if (!window.confirm('تیم برای همیشه منحل شود؟ این کار قابل بازگشت نیست.')) return;
    try {
      await teamsApi.dissolve(data.id);
      addToast({ title: 'تیم منحل شد', icon: 'users', tone: 'info' });
      router.push('/dashboard?tab=teams');
    } catch (error) {
      addToast({ title: 'انحلال تیم', text: errorMessage(error), icon: 'info', tone: 'error' });
    }
  };

  return (
    <div className={styles.manageWrapper}>
      <div className={styles.pageHeader}>
        <h1>تنظیمات تیم {data.name}</h1>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Icon name="settings" /> اطلاعات پایه‌ای تیم
        </div>
        <TeamForm
          initial={{ name: data.name, tag: data.tag, game: data.game.slug, region: data.region, logoUrl: data.logo }}
          submitLabel="ذخیره تغییرات اطلاعات"
          submitting={saving}
          onSubmit={save}
          errors={errors}
        />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Icon name="users" /> مدیریت اعضای تیم
        </div>

        <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
          <label>لینک دعوت اعضا (ارسال برای بازیکنان جدید)</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" className={styles.input} value={data.inviteUrl ?? ''} readOnly dir="ltr" style={{ flex: 1 }} />
            <button className={styles.btnSecondary} onClick={copyInvite}>
              کپی لینک
            </button>
            <button
              className={styles.btnSecondary}
              aria-label="ساخت لینک جدید"
              title="ساخت لینک جدید (لینک قبلی باطل می‌شود)"
              onClick={() => run(() => teamsApi.regenerateInvite(data.id), 'لینک جدید ساخته شد')}
            >
              <Icon name="refresh" />
            </button>
          </div>
        </div>

        <div className={styles.formGroup} style={{ marginBottom: '32px' }}>
          <label>دعوت مستقیم با شناسه بازی (Game ID)</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className={styles.input}
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              placeholder="مثلا: ShadowHunter"
              dir="ltr"
              style={{ flex: 1 }}
            />
            <button className={styles.btnPrimary} onClick={invite} disabled={!inviteName.trim()}>
              ارسال دعوت
            </button>
          </div>
          {invitations.data && invitations.data.length > 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
              در انتظار پاسخ: {invitations.data.map(i => i.invitedUser.displayName).join('، ')}
            </p>
          )}
        </div>

        <div className={styles.memberList}>
          {data.members.map(member => {
            const isMe = member.user.id === user?.id;
            return (
              <div key={member.user.id} className={styles.memberItem}>
                <div className={styles.memberInfo}>
                  <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                    <ProfileAvatar seed={member.user.avatarSeed} score={member.user.points} image={member.user.avatar} />
                  </div>
                  <div>
                    <div className={styles.memberName}>
                      {member.user.displayName}
                      {isMe && ' (شما)'}
                    </div>
                    <div className={styles.memberRole}>{ROLE_LABELS[member.role]}</div>
                  </div>
                </div>
                {!isMe && (
                  <div className={styles.memberActions}>
                    <button
                      className={styles.btnSecondary}
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => promote(member)}
                    >
                      ارتقا به کاپیتان
                    </button>
                    <button
                      className={styles.btnDanger}
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => kick(member)}
                    >
                      اخراج
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.panel} style={{ borderColor: 'rgba(226, 69, 63, 0.3)' }}>
        <div className={styles.panelTitle} style={{ color: '#ff6a6a' }}>
          <Icon name="alert-triangle" /> منطقه خطر
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.6' }}>
          برای ترک تیم ابتدا کاپیتانی را به عضو دیگری واگذار کنید. با انحلال تیم، لیست اعضا و دعوت‌نامه‌ها حذف می‌شوند و
          تیم دیگر قابل استفاده نخواهد بود.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className={styles.btnSecondary} onClick={leave}>
            خروج از تیم
          </button>
          <button className={styles.btnDanger} onClick={dissolve}>
            انحلال کامل تیم
          </button>
        </div>
      </div>
    </div>
  );
}
