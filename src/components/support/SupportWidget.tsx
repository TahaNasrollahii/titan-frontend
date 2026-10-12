'use client';

import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import type { SupportAgent, SupportMessage, VisitorConversation } from '@/lib/api/types';

import {
  clockTime,
  dayLabel,
  faDigits,
  formatPhone,
  imageProblem,
  isValidName,
  isValidPhone,
  normalizePhone,
  sameDay,
  waitLabel,
} from './shared';
import {
  BellIcon,
  CheckIcon,
  ChevronDown,
  ClipIcon,
  ClockIcon,
  DoubleCheckIcon,
  EndIcon,
  Gem,
  HashIcon,
  ImageIcon,
  LockIcon,
  MoonIcon,
  MoreIcon,
  SendIcon,
  XIcon,
} from './SupportIcons';
import styles from './SupportWidget.module.css';
import { chime, soundPreference, useSupportChat, type PendingMessage, type StartInput } from './useSupportChat';

export const SUPPORT_OPEN_EVENT = 'titan:support-open';
export const SUPPORT_TOGGLE_EVENT = 'titan:support-toggle';

/** Open the chat from anywhere (e.g. the "live chat" card on the contact page). */
export function openSupportChat() {
  window.dispatchEvent(new Event(SUPPORT_OPEN_EVENT));
}

/** Toggle the chat open/closed from the navigation bar or floating button. */
export function toggleSupportChat() {
  window.dispatchEvent(new Event(SUPPORT_TOGGLE_EVENT));
}

const NUDGE_SEEN_KEY = 'titan.support.nudged';
const PEEK_MS = 12000;
const RATING_LABELS = ['', 'خیلی بد بود', 'راضی نبودم', 'معمولی بود', 'خوب بود', 'عالی بود!'];

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');

// ------------------------------------------------------------------ small pieces
export function AgentAvatar({
  agent,
  large = false,
  online = false,
  alt = false,
  className,
}: {
  agent: Pick<SupportAgent, 'name' | 'avatar'> | null;
  large?: boolean;
  online?: boolean;
  alt?: boolean;
  className?: string;
}) {
  return (
    <span className={cx(styles.av, large && styles.avLg, online && styles.avOn, alt && styles.avAlt, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- avatars come from the API host */}
      {agent?.avatar ? <img src={agent.avatar} alt="" /> : (agent?.name ?? 'ت').slice(0, 1)}
    </span>
  );
}

function Ticks({ state }: { state: 'pending' | 'sent' | 'seen' }) {
  if (state === 'pending') return <ClockIcon className={cx(styles.tick, styles.tickPending)} />;
  if (state === 'seen') return <DoubleCheckIcon className={cx(styles.tick, styles.tickSeen)} />;
  return <CheckIcon className={styles.tick} />;
}

// ------------------------------------------------------------------ welcome / pre-chat form
function WelcomeView({
  defaults,
  online,
  agents,
  avgSeconds,
  onStart,
  autoFocus,
}: {
  defaults: StartInput;
  online: boolean;
  agents: SupportAgent[];
  avgSeconds: number | null;
  onStart: (input: StartInput) => Promise<void>;
  autoFocus: boolean;
}) {
  const [values, setValues] = useState<StartInput>(defaults);
  const [errors, setErrors] = useState<Partial<Record<keyof StartInput, string>>>({});
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 420);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  const checks: Record<keyof StartInput, (value: string) => string | undefined> = {
    firstName: v => (isValidName(v) ? undefined : 'نام رو درست وارد کن'),
    lastName: v => (isValidName(v) ? undefined : 'نام خانوادگی رو درست وارد کن'),
    phone: v => (isValidPhone(v) ? undefined : 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع بشه'),
  };

  const update = (key: keyof StartInput, value: string) => {
    const next = key === 'phone' ? normalizePhone(value) : value;
    setValues(current => ({ ...current, [key]: next }));
    if (errors[key] && !checks[key](next)) setErrors(current => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = Object.fromEntries(
      (Object.keys(checks) as (keyof StartInput)[]).map(key => [key, checks[key](values[key])]),
    ) as typeof errors;
    setErrors(found);
    const firstBad = (Object.keys(found) as (keyof StartInput)[]).find(key => found[key]);
    if (firstBad) {
      setShake(n => n + 1);
      document.getElementById(`support-${firstBad}`)?.focus();
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      await onStart({ firstName: values.firstName.trim(), lastName: values.lastName.trim(), phone: values.phone });
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.errors).length) {
        const fieldErrors: typeof errors = {};
        for (const key of Object.keys(checks) as (keyof StartInput)[]) fieldErrors[key] = error.errors[key]?.[0];
        setErrors(fieldErrors);
      }
      setFormError(error instanceof ApiError ? error.firstMessage : 'ارتباط برقرار نشد. دوباره تلاش کن.');
      setBusy(false);
    }
  };

  const field = (key: keyof StartInput, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => {
    const value = key === 'phone' ? formatPhone(values.phone) : values[key];
    const valid = !checks[key](values[key]);
    return (
      <div
        className={cx(styles.field, valid && styles.valid, errors[key] && styles.bad)}
        key={errors[key] ? `${key}-${shake}` : key}
      >
        <input
          id={`support-${key}`}
          ref={key === 'firstName' ? firstRef : undefined}
          value={value}
          onChange={event => update(key, event.target.value)}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `support-${key}-error` : undefined}
          required
          {...props}
        />
        <label htmlFor={`support-${key}`}>{label}</label>
        <CheckIcon className={styles.check} />
        {errors[key] && (
          <div className={styles.err} id={`support-${key}-error`}>
            {errors[key]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cx(styles.view, styles.welcome, styles.scroll)}>
      <div className={styles.hello}>
        <h2>سلام! کارت رو راه بندازیم؟</h2>
        <p>سفارش، پرداخت، کد تحویلی یا ثبت‌نام تورنمنت؛ تیم پشتیبانی تایتان همین‌جا کنارته.</p>
        {online && (
          <div className={styles.chips}>
            {avgSeconds != null && (
              <span className={styles.chip}>
                <ClockIcon />
                زمان پاسخ معمولاً <b>{waitLabel(avgSeconds)}</b>
              </span>
            )}
            <span className={styles.chip}>
              <span className={styles.dot} />
              <b>{faDigits(agents.length)}</b> پشتیبان آنلاین
            </span>
          </div>
        )}
      </div>

      {!online && (
        <div className={styles.offlineCard} role="note">
          <MoonIcon />
          <span>الان پشتیبان‌ها آنلاین نیستن. پیامت رو بذار؛ به محض آنلاین شدن جواب می‌دیم و با پیامک خبرت می‌کنیم.</span>
        </div>
      )}

      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.formTitle}>برای شروع گفتگو خودت رو معرفی کن</div>
        <div className={styles.row2}>
          {field('firstName', 'نام', { autoComplete: 'given-name', placeholder: 'مثلاً طاها', maxLength: 40 })}
          {field('lastName', 'نام خانوادگی', { autoComplete: 'family-name', placeholder: 'مثلاً رضایی', maxLength: 60 })}
        </div>
        {field('phone', 'شماره موبایل', {
          dir: 'ltr',
          inputMode: 'numeric',
          autoComplete: 'tel',
          placeholder: '۰۹۱۲ ۳۴۵ ۶۷۸۹',
        })}
        <button className={styles.cta} type="submit" aria-busy={busy}>
          <span>شروع گفتگو</span>
          <span className={styles.spin} />
        </button>
        {formError && (
          <div className={styles.formError} role="alert">
            {formError}
          </div>
        )}
        <div className={styles.privacy}>
          <LockIcon />
          شماره‌ات فقط برای پیگیری همین گفتگو استفاده می‌شه.
        </div>
      </form>
    </div>
  );
}

// ------------------------------------------------------------------ chat log
type Row =
  | { type: 'day'; key: string; label: string }
  | { type: 'system'; key: string; message: SupportMessage }
  | {
      type: 'message';
      key: string;
      mine: boolean;
      body: string;
      image: string | null;
      createdAt: string;
      agent: SupportAgent | null;
      first: boolean;
      last: boolean;
      ticks?: 'pending' | 'sent' | 'seen';
      pending?: PendingMessage;
    };

function buildRows(messages: SupportMessage[], pending: PendingMessage[], conversation: VisitorConversation | null): Row[] {
  type Item = { key: string; sender: string; createdAt: string; message?: SupportMessage; pending?: PendingMessage };
  const items: Item[] = [
    ...messages.map(m => ({
      key: `m${m.id}`,
      sender: m.kind === 'visitor' ? 'me' : m.kind === 'agent' ? `a${m.author?.id ?? 0}` : 'sys',
      createdAt: m.createdAt,
      message: m,
    })),
    ...pending.map(p => ({ key: `p${p.clientId}`, sender: 'me', createdAt: p.createdAt, pending: p })),
  ];
  const rows: Row[] = [];
  items.forEach((item, index) => {
    const previous = items[index - 1];
    const next = items[index + 1];
    const newDay = !previous || !sameDay(previous.createdAt, item.createdAt);
    if (newDay) rows.push({ type: 'day', key: `d${item.key}`, label: dayLabel(item.createdAt) });
    if (item.sender === 'sys' && item.message) {
      rows.push({ type: 'system', key: item.key, message: item.message });
      return;
    }
    const first = newDay || previous?.sender !== item.sender;
    const last = !next || next.sender !== item.sender || !sameDay(next.createdAt, item.createdAt);
    if (item.pending) {
      const p = item.pending;
      rows.push({
        type: 'message',
        key: item.key,
        mine: true,
        body: p.body,
        image: p.previewUrl,
        createdAt: p.createdAt,
        agent: null,
        first,
        last,
        ticks: p.status === 'sending' ? 'pending' : undefined,
        pending: p,
      });
      return;
    }
    const m = item.message!;
    const mine = m.kind === 'visitor';
    rows.push({
      type: 'message',
      key: item.key,
      mine,
      body: m.body,
      image: m.image,
      createdAt: m.createdAt,
      agent: m.author,
      first,
      last,
      ticks: mine ? (m.id <= (conversation?.agentReadId ?? 0) ? 'seen' : 'sent') : undefined,
    });
  });
  return rows;
}

function ChatLog({
  rows,
  typingAgent,
  onImage,
  onRetry,
  onDiscard,
}: {
  rows: Row[];
  typingAgent: SupportAgent | null;
  onImage: (src: string) => void;
  onRetry: (clientId: string) => void;
  onDiscard: (clientId: string) => void;
}) {
  const logRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const lastKeyRef = useRef<string | null>(null);
  const [jump, setJump] = useState(false);

  const scrollToBottom = (smooth: boolean) => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  // Follow new messages when the visitor is at the bottom (or wrote them); otherwise offer a jump.
  const lastRow = rows.at(-1);
  const lastKey = lastRow?.key ?? null;
  useLayoutEffect(() => {
    const firstPaint = lastKeyRef.current === null;
    if (lastKey === lastKeyRef.current) return;
    lastKeyRef.current = lastKey;
    const mine = lastRow?.type === 'message' && lastRow.mine;
    if (firstPaint || mine || atBottomRef.current) scrollToBottom(!firstPaint);
    else setJump(true);
  }, [lastKey, lastRow]);

  useLayoutEffect(() => {
    if (typingAgent && atBottomRef.current) scrollToBottom(true);
  }, [typingAgent]);

  const onScroll = () => {
    const log = logRef.current;
    if (!log) return;
    atBottomRef.current = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
    if (atBottomRef.current && jump) setJump(false);
  };

  return (
    <div className={styles.logWrap}>
      <div className={cx(styles.log, styles.scroll)} ref={logRef} onScroll={onScroll} role="log" aria-live="polite" aria-label="گفتگو">
        {rows.map(row => {
          if (row.type === 'day') {
            return (
              <div key={row.key} className={styles.sep}>
                {row.label}
              </div>
            );
          }
          if (row.type === 'system') {
            return (
              <div key={row.key} className={styles.sys}>
                {row.message.body}
              </div>
            );
          }
          const failed = row.pending?.status === 'failed';
          return (
            <React.Fragment key={row.key}>
              <div
                className={cx(
                  styles.msg,
                  row.mine ? styles.mine : styles.agent,
                  row.first && styles.first,
                  row.last && styles.last,
                  failed && styles.failedBubble,
                )}
              >
                {!row.mine && <AgentAvatar agent={row.agent} className={row.last ? undefined : styles.ghostAv} />}
                {row.image ? (
                  <div className={cx(styles.bubble, styles.imgBubble)}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- user uploads, any host */}
                    <img src={row.image} alt="تصویر ارسالی" onClick={() => onImage(row.image!)} />
                    {row.ticks === 'pending' && (
                      <div className={styles.uploading}>
                        <span className={styles.spin} />
                      </div>
                    )}
                    <div className={styles.meta}>
                      <span>{clockTime(row.createdAt)}</span>
                      {row.ticks && <Ticks state={row.ticks} />}
                    </div>
                  </div>
                ) : (
                  <div className={styles.bubble} dir="auto">
                    <span>{row.body}</span>
                    <div className={styles.meta}>
                      <span>{clockTime(row.createdAt)}</span>
                      {row.ticks && <Ticks state={row.ticks} />}
                    </div>
                  </div>
                )}
              </div>
              {failed && row.pending && (
                <div className={styles.failedRow} role="alert">
                  <span>{row.pending.error ?? 'ارسال نشد'}</span>
                  <button type="button" onClick={() => onRetry(row.pending!.clientId)}>
                    دوباره بفرست
                  </button>
                  <button type="button" onClick={() => onDiscard(row.pending!.clientId)}>
                    حذف
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
        {typingAgent && (
          <div className={cx(styles.msg, styles.agent, styles.first, styles.last)}>
            <AgentAvatar agent={typingAgent} />
            <div className={cx(styles.bubble, styles.typing)} aria-label={`${typingAgent.name} در حال نوشتن است`}>
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>
      {jump && (
        <button
          type="button"
          className={styles.jump}
          onClick={() => {
            scrollToBottom(true);
            setJump(false);
          }}
        >
          <ChevronDown />
          پیام جدید
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ composer
function Composer({
  onSend,
  onTyping,
  onError,
  autoFocus,
}: {
  onSend: (body: string, file: File | null) => void;
  onTyping: () => void;
  onError: (message: string) => void;
  autoFocus: boolean;
}) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<{ file: File; url: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 420);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  // The preview URL lives as long as the preview.
  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(file.url);
    },
    [file],
  );

  const resize = () => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(120, input.scrollHeight)}px`;
  };

  const take = (candidate: File | undefined | null) => {
    if (!candidate) return;
    const problem = imageProblem(candidate);
    if (problem) {
      onError(problem);
      return;
    }
    setFile({ file: candidate, url: URL.createObjectURL(candidate) });
    inputRef.current?.focus();
  };

  const submit = () => {
    if (!text.trim() && !file) return;
    onSend(text, file?.file ?? null);
    setText('');
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
    requestAnimationFrame(resize);
    inputRef.current?.focus();
  };

  return (
    <div
      className={styles.composer}
      onDragEnter={event => {
        if (!event.dataTransfer.types.includes('Files')) return;
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setDragging(false);
      }}
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        take(event.dataTransfer.files[0]);
      }}
    >
      {file && (
        <div className={styles.attachPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
          <img src={file.url} alt="" />
          <span>{file.file.name}</span>
          <button type="button" className={styles.iconBtn} aria-label="حذف تصویر" onClick={() => setFile(null)}>
            <XIcon />
          </button>
        </div>
      )}
      <div className={styles.box}>
        <button type="button" className={styles.iconBtn} aria-label="پیوست تصویر" title="ارسال تصویر" onClick={() => fileRef.current?.click()}>
          <ClipIcon />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={event => take(event.target.files?.[0])}
        />
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          maxLength={2000}
          placeholder="پیامت رو بنویس…"
          aria-label="پیام"
          onChange={event => {
            setText(event.target.value);
            resize();
            if (event.target.value.trim()) onTyping();
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          onPaste={event => {
            const image = Array.from(event.clipboardData.files).find(f => f.type.startsWith('image/'));
            if (image) {
              event.preventDefault();
              take(image);
            }
          }}
        />
        <button type="button" className={styles.send} aria-label="ارسال" disabled={!text.trim() && !file} onClick={submit}>
          <SendIcon />
        </button>
      </div>
      <div className={styles.hint}>
        <kbd>Enter</kbd> ارسال · <kbd>Shift</kbd>+<kbd>Enter</kbd> خط جدید · تصویر رو می‌تونی بکشی و رها کنی
      </div>
      {dragging && (
        <div className={styles.drop}>
          <div>
            <ImageIcon />
            تصویر رو اینجا رها کن
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ rating
function RateView({ agentName, onRate, onSkip }: { agentName: string | null; onRate: (rating: number, comment: string) => Promise<void>; onSkip: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [burst, setBurst] = useState<{ index: number; id: number } | null>(null);
  const shown = hover || rating;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await onRate(rating, comment.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.firstMessage : 'ثبت نشد. دوباره تلاش کن.');
      setBusy(false);
    }
  };

  return (
    <div className={cx(styles.view, styles.rate, styles.scroll)}>
      <div className={styles.emblem}>
        <Gem className={styles.gem} />
      </div>
      <h3>{agentName ? `گفتگو با ${agentName} چطور بود؟` : 'تجربه‌ات از پشتیبانی چطور بود؟'}</h3>
      <p>امتیازت مستقیم به تیم پشتیبانی می‌رسه.</p>
      <div className={styles.gems} role="radiogroup" aria-label="امتیاز" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${faDigits(n)} از ۵ · ${RATING_LABELS[n]}`}
            className={cx(n <= shown && styles.lit)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => {
              setRating(n);
              setBurst({ index: n, id: Date.now() });
            }}
          >
            <Gem className={styles.gem} />
            {burst?.index === n &&
              Array.from({ length: 10 }, (_, k) => {
                const angle = (Math.PI * 2 * k) / 10;
                const radius = 30 + (k % 3) * 8;
                return (
                  <i
                    key={`${burst.id}-${k}`}
                    className={styles.spark}
                    style={{ '--dx': `${Math.cos(angle) * radius}px`, '--dy': `${Math.sin(angle) * radius}px` } as React.CSSProperties}
                  />
                );
              })}
          </button>
        ))}
      </div>
      <div className={styles.rateLabel} aria-live="polite">
        {RATING_LABELS[shown]}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="اگه نکته‌ای داری بنویس (اختیاری)" aria-label="نظر" maxLength={500} />
      {error && (
        <div className={styles.formError} role="alert">
          {error}
        </div>
      )}
      <button type="button" className={styles.cta} disabled={!rating} aria-busy={busy} onClick={submit}>
        <span>ثبت امتیاز</span>
        <span className={styles.spin} />
      </button>
      <button type="button" className={styles.linkBtn} onClick={onSkip}>
        رد شدن
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ the widget
export function SupportWidget() {
  const pathname = usePathname();
  // Staff answer from the desk; a second chat bubble there would only get in the way.
  if (pathname?.startsWith('/desk')) return null;
  return <Widget />;
}

function Widget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState<SupportMessage | null>(null);
  const [nudge, setNudge] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok?: boolean; id: number } | null>(null);
  const [sound, setSound] = useState(() => typeof window === 'undefined' || soundPreference.get());
  const [wasOnline, setWasOnline] = useState(true);
  const [reconnected, setReconnected] = useState(false);
  const [lastVisitor, setLastVisitor] = useState<StartInput | null>(null);
  const openRef = useRef(open);
  const soundRef = useRef(sound);
  const orbRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    openRef.current = open;
    soundRef.current = sound;
  });

  const onIncoming = useCallback((message: SupportMessage) => {
    if (!openRef.current || document.hidden) setPeek(message);
    if (soundRef.current) chime();
  }, []);

  const chat = useSupportChat({ open, onIncoming });
  const online = chat.support?.online ?? false;
  const agents = chat.support?.agents ?? [];

  const showToast = useCallback((text: string, ok = false) => setToast({ text, ok, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Connection banner: shown while offline, then a brief confirmation once back.
  if (wasOnline !== chat.online) {
    setWasOnline(chat.online);
    setReconnected(chat.online);
  }
  useEffect(() => {
    if (!reconnected) return;
    const timer = window.setTimeout(() => setReconnected(false), 2200);
    return () => window.clearTimeout(timer);
  }, [reconnected]);
  const banner = !chat.online ? 'warn' : reconnected ? 'ok' : null;

  useEffect(() => {
    if (!peek) return;
    const timer = window.setTimeout(() => setPeek(null), PEEK_MS);
    return () => window.clearTimeout(timer);
  }, [peek]);

  // A one-time hint on the first visit of the session.
  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(NUDGE_SEEN_KEY) === '1';
      window.sessionStorage.setItem(NUDGE_SEEN_KEY, '1');
    } catch {
      // private mode: show it anyway
    }
    if (seen) return;
    const show = window.setTimeout(() => setNudge(true), 2500);
    const hide = window.setTimeout(() => setNudge(false), 7500);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  const openPanel = useCallback(() => {
    setOpen(true);
    setPeek(null);
    setNudge(false);
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    setMenu(false);
    setConfirmEnd(false);
    setLightbox(null);
    orbRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const toggle = () => (open ? closePanel() : openPanel());
    window.addEventListener(SUPPORT_OPEN_EVENT, openPanel);
    window.addEventListener(SUPPORT_TOGGLE_EVENT, toggle);
    return () => {
      window.removeEventListener(SUPPORT_OPEN_EVENT, openPanel);
      window.removeEventListener(SUPPORT_TOGGLE_EVENT, toggle);
    };
  }, [open, openPanel, closePanel]);

  // Esc peels one layer at a time.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (lightbox) setLightbox(null);
      else if (confirmEnd) setConfirmEnd(false);
      else if (menu) setMenu(false);
      else closePanel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, lightbox, confirmEnd, menu, closePanel]);

  // Phones: full-screen sheet that follows the on-screen keyboard and freezes the page behind it.
  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 560px)').matches) return;
    const panel = panelRef.current;
    const viewport = window.visualViewport;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const fit = () => {
      if (!panel || !viewport) return;
      panel.style.setProperty('--vvh', `${viewport.height}px`);
      panel.style.transform = `translateY(${viewport.offsetTop}px)`;
    };
    fit();
    viewport?.addEventListener('resize', fit);
    viewport?.addEventListener('scroll', fit);
    return () => {
      document.body.style.overflow = previousOverflow;
      viewport?.removeEventListener('resize', fit);
      viewport?.removeEventListener('scroll', fit);
      panel?.style.removeProperty('--vvh');
      if (panel) panel.style.transform = '';
    };
  }, [open]);

  useEffect(() => {
    if (!menu) return;
    const close = (event: MouseEvent) => {
      if (!(event.target as Element).closest(`.${styles.menu}, [data-support-menu]`)) setMenu(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menu]);

  const conversation = chat.conversation;
  const rows = useMemo(() => buildRows(chat.messages, chat.pending, conversation), [chat.messages, chat.pending, conversation]);
  const typingAgent = conversation?.agentTyping ? conversation.agent : null;
  const view = chat.token ? chat.view : 'welcome';

  const defaults: StartInput = useMemo(() => {
    if (lastVisitor) return lastVisitor;
    const [first = '', ...rest] = (user?.fullName ?? '').trim().split(/\s+/);
    return { firstName: first, lastName: rest.join(' '), phone: user?.phone ?? '' };
  }, [lastVisitor, user?.fullName, user?.phone]);

  const status = (() => {
    if (typingAgent) return `${typingAgent.name} در حال نوشتن…`;
    if (conversation?.status === 'closed') return 'گفتگو بسته شده';
    if (!online) return 'آفلاین · پیام بذار، با پیامک خبرت می‌کنیم';
    const wait = chat.support?.avgResponseSeconds;
    return wait != null ? `آنلاین · معمولاً ${waitLabel(wait)} پاسخ می‌دیم` : 'آنلاین · آماده‌ی پاسخ‌گویی';
  })();

  const newChat = () => {
    if (conversation) setLastVisitor({ firstName: conversation.firstName, lastName: conversation.lastName, phone: conversation.phone });
    chat.newChat();
  };

  const endChat = async () => {
    setConfirmEnd(false);
    try {
      await chat.close();
    } catch (error) {
      showToast(error instanceof ApiError ? error.firstMessage : 'بسته نشد. دوباره تلاش کن.');
    }
  };

  const copyTicket = () => {
    setMenu(false);
    if (!conversation) return;
    navigator.clipboard?.writeText(conversation.ticket).then(
      () => showToast('کد پیگیری کپی شد', true),
      () => showToast(`کد پیگیری: ${conversation.ticket}`, true),
    );
  };

  const toggleSound = () => {
    soundPreference.set(!sound);
    setSound(!sound);
  };

  const unread = chat.unread;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('titan:support-unread', { detail: unread }));
  }, [unread]);

  const orbLabel = unread ? `پشتیبانی آنلاین، ${faDigits(unread)} پیام خوانده‌نشده` : 'پشتیبانی آنلاین';

  return (
    <div className={cx(styles.root, open && styles.isOpen, !online && styles.offline)}>
      <div className={cx(styles.nudge, nudge && !open && styles.nudgeOn)} aria-hidden="true">
        <span className={styles.dot} />
        {online ? 'سؤالی داری؟ ما آنلاینیم' : 'پیام بذار، خبرت می‌کنیم'}
      </div>

      {peek && !open && (
        <div className={styles.peek} role="button" tabIndex={0} aria-label="باز کردن پیام پشتیبان" onClick={openPanel} onKeyDown={e => e.key === 'Enter' && openPanel()}>
          <AgentAvatar agent={peek.author} online />
          <div>
            <div className={styles.peekWho}>
              <b>{peek.author?.name ?? 'پشتیبانی'}</b> · پشتیبانی تایتان
            </div>
            <p className={styles.peekText}>{peek.body || 'یک تصویر فرستاد'}</p>
          </div>
          <button
            type="button"
            className={styles.peekClose}
            aria-label="بستن پیش‌نمایش"
            onClick={event => {
              event.stopPropagation();
              setPeek(null);
            }}
          >
            <XIcon />
          </button>
        </div>
      )}

      <button
        ref={orbRef}
        type="button"
        className={styles.orb}
        aria-expanded={open}
        aria-controls="support-panel"
        aria-label={orbLabel}
        onClick={() => (open ? closePanel() : openPanel())}
        onMouseEnter={() => setNudge(true)}
        onMouseLeave={() => setNudge(false)}
      >
        <span className={styles.ring} />
        <span className={styles.pulse} />
        <span className={styles.pulse} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/support.svg" alt="پشتیبانی" className={cx(styles.orbIcon, styles.orbHeadset)} />
        <XIcon className={cx(styles.orbIcon, styles.orbClose)} />
        {unread > 0 && !open && <span className={styles.badge}>{faDigits(unread > 9 ? '9+' : unread)}</span>}
      </button>

      <section ref={panelRef} id="support-panel" className={styles.panel} role="dialog" aria-label="پشتیبانی آنلاین تایتان" aria-hidden={!open}>
        <div className={styles.aurora}>
          <i />
          <i />
          <i />
        </div>
        <div className={styles.grain} />

        <header className={cx(styles.head, styles.reveal)}>
          <div className={styles.emblem}>
            <Gem className={styles.gem} />
            <span className={styles.dot} />
          </div>
          <div className={styles.title}>
            <b>پشتیبانی تایتان</b>
            <span>{status}</span>
          </div>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="گزینه‌ها"
            aria-haspopup="menu"
            aria-expanded={menu}
            data-support-menu
            onClick={() => setMenu(m => !m)}
          >
            <MoreIcon />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="کوچک کردن" onClick={closePanel}>
            <ChevronDown />
          </button>
          {menu && (
            <div className={styles.menu} role="menu">
              <button type="button" role="menuitemcheckbox" aria-checked={sound} onClick={toggleSound}>
                <BellIcon />
                صدای اعلان<em>{sound ? 'روشن' : 'خاموش'}</em>
              </button>
              {conversation && (
                <button type="button" role="menuitem" onClick={copyTicket}>
                  <HashIcon />
                  کد پیگیری<em>{faDigits(conversation.ticket)}</em>
                </button>
              )}
              {conversation?.status === 'open' && (
                <>
                  <hr />
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.danger}
                    onClick={() => {
                      setMenu(false);
                      setConfirmEnd(true);
                    }}
                  >
                    <EndIcon />
                    پایان گفتگو
                  </button>
                </>
              )}
            </div>
          )}
        </header>

        {banner && chat.token && (
          <div className={cx(styles.banner, banner === 'warn' ? styles.bannerWarn : styles.bannerOk)} role="status">
            {banner === 'warn' ? (
              <>
                <span className={styles.spin} />
                اتصال برقرار نیست · در حال تلاش دوباره…
              </>
            ) : (
              'اتصال برقرار شد'
            )}
          </div>
        )}

        <div className={cx(styles.views, styles.reveal, styles.revealLate)}>
          {view === 'welcome' && (
            <WelcomeView
              key={`${user?.id ?? 'guest'}-${lastVisitor?.phone ?? ''}`}
              defaults={defaults}
              online={online}
              agents={agents}
              avgSeconds={chat.support?.avgResponseSeconds ?? null}
              onStart={chat.start}
              autoFocus={open}
            />
          )}

          {view === 'chat' && conversation && (
            <div className={styles.view}>
              <ChatLog rows={rows} typingAgent={typingAgent} onImage={setLightbox} onRetry={chat.retry} onDiscard={chat.discard} />
              {conversation.status === 'open' ? (
                <>
                  {!online && !chat.messages.some(m => m.kind === 'agent') && (
                    <div className={cx(styles.sys, styles.note)} style={{ margin: '0 12px' }}>
                      پشتیبان‌ها الان آنلاین نیستن. پیامت ثبت می‌شه و با پیامک به {formatPhone(conversation.phone)} خبرت می‌کنیم.
                    </div>
                  )}
                  <Composer onSend={chat.send} onTyping={chat.typing} onError={showToast} autoFocus={open} />
                </>
              ) : (
                <div className={styles.closedBar}>
                  این گفتگو بسته شد. ممنون که با ما در تماس بودی.
                  <div className={styles.btns}>
                    {conversation.rating == null ? (
                      <button type="button" className={styles.cta} onClick={() => chat.setView('rate')}>
                        <span>امتیاز بده</span>
                      </button>
                    ) : null}
                    <button type="button" className={cx(styles.cta, styles.ghost)} onClick={newChat} style={conversation.rating == null ? undefined : { gridColumn: '1 / -1' }}>
                      <span>گفتگوی جدید</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'rate' && (
            <RateView agentName={conversation?.agent?.name ?? null} onRate={chat.rate} onSkip={() => chat.setView('done')} />
          )}

          {view === 'done' && (
            <div className={cx(styles.view, styles.rate, styles.done)}>
              <div className={styles.emblem}>
                <Gem className={styles.gem} />
              </div>
              <h3>{conversation ? `ممنون ${conversation.firstName}!` : 'ممنون!'}</h3>
              <p>گفتگو بسته شد. هر وقت کاری داشتی، همین گوشه منتظرتیم.</p>
              <button type="button" className={cx(styles.cta, styles.ghost)} style={{ maxWidth: 240 }} onClick={newChat}>
                <span>شروع گفتگوی جدید</span>
              </button>
            </div>
          )}

          {confirmEnd && (
            <>
              <div className={styles.scrim} onClick={() => setConfirmEnd(false)} />
              <div className={styles.sheet} role="alertdialog" aria-labelledby="support-end-title">
                <h3 id="support-end-title">گفتگو تموم بشه؟</h3>
                <p>بعد از پایان، دیگه نمی‌تونی توی همین گفتگو پیام بدی. برای سؤال بعدی یک گفتگوی جدید باز می‌شه.</p>
                <div className={styles.btns}>
                  <button type="button" className={styles.cta} onClick={endChat}>
                    <span>بله، تمومش کن</span>
                  </button>
                  <button type="button" className={cx(styles.cta, styles.ghost)} onClick={() => setConfirmEnd(false)} autoFocus>
                    <span>ادامه گفتگو</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {lightbox && (
            <div className={styles.lightbox} onClick={() => setLightbox(null)} role="dialog" aria-label="تصویر">
              {/* eslint-disable-next-line @next/next/no-img-element -- user uploads */}
              <img src={lightbox} alt="تصویر ارسالی" />
            </div>
          )}

          {toast && (
            <div key={toast.id} className={cx(styles.toast, toast.ok && styles.toastOk)} role="alert">
              {toast.text}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
