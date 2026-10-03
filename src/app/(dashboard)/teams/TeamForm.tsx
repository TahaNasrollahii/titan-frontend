'use client';

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { CustomSelect } from '@/components/CustomSelect';
import { Icon } from '@/components/Icons';
import { catalogApi, TeamInput } from '@/lib/api/endpoints';
import { REGION_LABELS } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from './[id]/manage/page.module.css';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const REGION_OPTIONS = Object.entries(REGION_LABELS).map(([value, label]) => ({ value, label, icon: 'map' }));

interface TeamFormProps {
  initial: Omit<TeamInput, 'logo'> & { logoUrl?: string | null };
  submitLabel: string;
  submitting: boolean;
  onSubmit: (data: TeamInput) => void;
  errors?: Record<string, string[]>;
}

/** Name, tag, game, region and logo — shared by "create team" and "manage team". */
export function TeamForm({ initial, submitLabel, submitting, onSubmit, errors = {} }: TeamFormProps) {
  const games = useApi(() => catalogApi.games());
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial.name);
  const [tag, setTag] = useState(initial.tag);
  const [chosenGame, setGame] = useState(initial.game);
  const [region, setRegion] = useState(initial.region);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoError, setLogoError] = useState('');

  const gameOptions = (games.data ?? [])
    .filter(g => g.kind === 'game')
    .map(g => ({ value: g.slug, label: g.titleEn, image: g.iconImage ?? undefined }));
  // The create form starts empty: default to the first game once the list arrives.
  const game = chosenGame || gameOptions[0]?.value || '';

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
          ) : tag ? (
            tag.toUpperCase()
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
        <div className={styles.formGroup}>
          <label>تگ تیم (کوتاه)</label>
          <input
            type="text"
            className={styles.input}
            placeholder="مثلا: TS"
            maxLength={4}
            dir="ltr"
            value={tag}
            onChange={e => setTag(e.target.value.toUpperCase())}
          />
          {fieldError('tag')}
        </div>
        <div className={styles.formGroup}>
          <label>بازی اصلی</label>
          <CustomSelect value={game} onChange={setGame} options={gameOptions} />
        </div>
        <div className={styles.formGroup}>
          <label>منطقه (Region)</label>
          <CustomSelect value={region} onChange={setRegion} options={REGION_OPTIONS} />
        </div>
      </div>
      <div style={{ marginTop: '32px' }}>
        <button
          type="button"
          className={styles.btnPrimary}
          disabled={submitting || !name.trim() || !tag.trim() || !game}
          onClick={() => onSubmit({ name: name.trim(), tag: tag.trim(), game, region, logo })}
        >
          {submitting ? 'لطفاً صبر کنید...' : submitLabel}
        </button>
      </div>
    </>
  );
}
