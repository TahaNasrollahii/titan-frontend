'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Icon } from '@/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { ApiError, errorMessage } from '@/lib/api/client';
import { TeamInput, teamsApi } from '@/lib/api/endpoints';

import styles from '../[id]/manage/page.module.css';
import { TeamForm } from '../TeamForm';

export default function CreateTeamPage() {
  const router = useRouter();
  const { addToast } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const create = async (data: TeamInput) => {
    setSubmitting(true);
    setErrors({});
    try {
      const team = await teamsApi.create(data);
      addToast({ title: 'تیم ساخته شد', text: 'لینک دعوت را برای هم‌تیمی‌ها بفرستید', icon: 'team', tone: 'success' });
      router.push(`/teams/${team.id}/manage`);
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.errors);
      addToast({ title: 'ساخت تیم', text: errorMessage(error), icon: 'team', tone: 'error' });
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.manageWrapper}>
      <div className={styles.pageHeader}>
        <h1>ساخت تیم جدید</h1>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Icon name="users" /> مشخصات اولیه تیم
        </div>
        <TeamForm
          initial={{ name: '', tag: '', game: '', region: 'me' }}
          submitLabel="ایجاد تیم و دریافت لینک دعوت"
          submitting={submitting}
          onSubmit={create}
          errors={errors}
        />
      </div>
    </div>
  );
}
