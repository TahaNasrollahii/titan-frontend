'use client';

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { TeamInput } from '@/lib/api/endpoints';
import { initials } from '@/lib/format';

import styles from './[id]/manage/page.module.css';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

interface TeamFormProps {
  initial: Omit<TeamInput, 'logo'> & { logoUrl?: string | null };
  submitLabel: string;
  submitting: boolean;
  onSubmit: (data: TeamInput) => void;
  errors?: Record<string, string[]>;
}

/** Name and logo — shared by "create team" and "manage team". */
export function TeamForm({ initial, submitLabel, submitting, onSubmit, errors = {} }: TeamFormProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial.name);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoError, setLogoError] = useState('');

  const logoUrl = useMemo(() => (logo ? URL.createObjectURL(logo) : null), [logo]);
  useEffect(() => () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
  }, [logoUrl]);
  const preview = logoUrl ?? initial.logoUrl ?? null;

  const pickLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError('حداکثر حجم لوگو ۲ مگابایت است.');
      return;
    }
    setLogoError('');
    setLogo(file);
  };

  const fieldError = (key: string) =>
    errors[key] ? <small style={{ color: '#ff8a80' }}>{errors[key][0]}</small> : null;

  return (
    <>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            overflow: 'hidden',
            background: preview ? 'transparent' : 'rgba(255,255,255,0.05)',
            border: preview ? 'none' : '2px dashed rgba(255,255,255,0.2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--muted)',
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : name.trim() ? (
            initials(name)
          ) : (
            <Icon name="plus" />
          )}
        </div>
        <div>
          <button type="button" className={styles.btnSecondary} style={{ marginBottom: '8px' }} onClick={() => fileInput.current?.click()}>
            آپلود لوگوی تیم
          </button>
          <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickLogo} />
          <p style={{ fontSize: '13px', color: logoError ? '#ff8a80' : 'var(--muted)' }}>
            {logoError || 'حداکثر حجم: ۲ مگابایت (PNG یا JPG)'}
          </p>
          {fieldError('logo')}
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>نام تیم</label>
          <input
            type="text"
            className={styles.input}
            placeholder="مثلا: Titan Slayers"
            maxLength={40}
            value={name}
            onChange={e => setName(e.target.value)}
          />
          {fieldError('name')}
        </div>
      </div>
      <div style={{ marginTop: '32px' }}>
        <button
          type="button"
          className={styles.btnPrimary}
          disabled={submitting || !name.trim()}
          onClick={() => onSubmit({ name: name.trim(), logo })}
        >
          {submitting ? 'لطفاً صبر کنید...' : submitLabel}
        </button>
      </div>
    </>
  );
}
