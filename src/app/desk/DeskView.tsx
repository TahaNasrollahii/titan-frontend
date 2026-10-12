'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { chime, clockTime, dayLabel, elapsed, faDigits, formatPhone, imageProblem, newClientId, sameDay, storage } from '@/components/support/shared';
import {
  BellIcon,
  BoltIcon,
  CheckIcon,
  ClipIcon,
  CopyIcon,
  DoubleCheckIcon,
  EndIcon,
  Gem,
  LockIcon,
  NoteIcon,
  SearchIcon,
  SendIcon,
  TransferIcon,
  UserIcon,
  XIcon,
} from '@/components/support/SupportIcons';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import { deskApi } from '@/lib/api/endpoints';
import type {
  CannedReply,
  DeskConversation,
  DeskCustomer,
  DeskMe,
  DeskQueueItem,
  DeskSync,
  SupportAgent,
  SupportMessage,
} from '@/lib/api/types';
import { jalaliDate, toman } from '@/lib/format';

import styles from './desk.module.css';

const POLL_MS = 2500;
const POLL_HIDDEN_MS = 15000;
const MAX_BACKOFF_MS = 30000;
const TYPING_EVERY_MS = 3000;
const SOUND_KEY = 'titan.desk.sound';
const BASE_TITLE = 'میز پشتیبانی | تایتان';

type Tab = 'waiting' | 'mine' | 'all' | 'archive';

/** Unsent text per conversation, kept while switching between conversations. */
const drafts = new Map<number, string>();

/** True at most once per ``ms`` for the given timestamp holder. */
function every(last: { current: number }, ms: number) {
  const now = Date.now();
  if (now - last.current < ms) return false;
  last.current = now;
  return true;
}

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');

// ------------------------------------------------------------------ a shared one-second clock
let nowValue = 0;
const nowListeners = new Set<() => void>();
let nowTimer: number | undefined;
function subscribeNow(listener: () => void) {
  nowListeners.add(listener);
  if (nowTimer === undefined) {
    nowValue = Date.now();
    nowTimer = window.setInterval(() => {
      nowValue = Date.now();
      nowListeners.forEach(l => l());
    }, 1000);
  }
  return () => {
    nowListeners.delete(listener);
    if (!nowListeners.size) {
      window.clearInterval(nowTimer);
      nowTimer = undefined;
    }
  };
}
const useNow = () => useSyncExternalStore(subscribeNow, () => nowValue || Date.now(), () => 0);

// ------------------------------------------------------------------ small pieces
/** A stable hue per visitor, so the same person keeps the same colour. */
const hueFor = (seed: string) => [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

function VisitorAvatar({ name, seed, online = false, small = false }: { name: string; seed: string; online?: boolean; small?: boolean }) {
  return (
    <span className={cx(styles.vav, online && styles.vavOn, small && styles.vavSm)} style={{ '--h': hueFor(seed) } as React.CSSProperties}>
      {name.trim().slice(0, 1) || '؟'}
    </span>
  );
}

function AgentAvatar({ agent, online }: { agent: Pick<SupportAgent, 'name' | 'avatar'> | null; online?: boolean }) {
  return (
    <span className={cx(styles.av, online && styles.avOn)} title={agent?.name}>
      {/* eslint-disable-next-line @next/next/no-img-element -- avatars come from the API host */}
      {agent?.avatar ? <img src={agent.avatar} alt="" /> : (agent?.name ?? '?').slice(0, 1)}
    </span>
  );
}

function WaitChip({ since }: { since: string }) {
  const now = useNow();
  if (!now) return null;
  const minutes = (now - new Date(since).getTime()) / 60000;
  const tone = minutes < 2 ? styles.waitOk : minutes < 5 ? styles.waitWarn : styles.waitHot;
  return <span className={cx(styles.wait, tone)}>{elapsed(since, now)}</span>;
}

function shortTime(iso: string | null) {
  if (!iso) return '';
  return sameDay(iso, new Date().toISOString()) ? clockTime(iso) : jalaliDate(iso);
}

function preview(item: DeskQueueItem, meId: number | undefined) {
  if (item.visitorTyping) return 'در حال نوشتن…';
  const prefix = item.lastKind === 'agent' ? (item.assignee?.id === meId ? 'شما: ' : 'پشتیبان: ') : '';
  if (item.lastHasImage) return `${prefix}🖼 تصویر`;
  return `${prefix}${item.lastBody ?? ''}` || 'هنوز پیامی نفرستاده';
}

const isTransient = (error: unknown) => !(error instanceof ApiError) || error.status === 0 || error.status >= 500;

// ------------------------------------------------------------------ desktop notifications
function notify(title: string, body: string, onClick: () => void) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted' || !document.hidden) return;
  try {
    const notification = new Notification(title, { body, tag: title, icon: '/titan-logo.png' });
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
}

// ------------------------------------------------------------------ thread (open conversation)
interface Thread {
  id: number;
  conversation: DeskConversation;
  customer: DeskCustomer | null;
  messages: SupportMessage[];
}

interface Pending {
  clientId: string;
  conversationId: number;
  body: string;
  file: File | null;
  previewUrl: string | null;
  internal: boolean;
  createdAt: string;
  status: 'sending' | 'failed';
  error?: string;
}

const mergeMessages = (current: SupportMessage[], incoming: SupportMessage[]) => {
  if (!incoming.length) return current;
  const byId = new Map(current.map(m => [m.id, m]));
  incoming.forEach(m => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => a.id - b.id);
};

// ------------------------------------------------------------------ the desk
export function DeskView() {
  const { user } = useAuth();
  if (!user?.isStaff) {
    return (
      <div className={styles.denied}>
        <h2>دسترسی ندارید</h2>
        <p>میز پشتیبانی فقط برای اعضای تیم تایتان باز است.</p>
        <Link href="/" className={styles.btn}>
          بازگشت به خانه
        </Link>
      </div>
    );
  }
  return <Desk meId={user.id} />;
}

function Desk({ meId }: { meId: number }) {
  const [selected, setSelected] = useState<number | null>(() => {
    const c = new URLSearchParams(window.location.search).get('c');
    return c && /^\d+$/.test(c) ? Number(c) : null;
  });
  const [sync, setSync] = useState<DeskSync | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [replies, setReplies] = useState<CannedReply[]>([]);
  const [modal, setModal] = useState<'replies' | 'settings' | 'close' | null>(null);
  const [toast, setToast] = useState<{ text: string; ok?: boolean; id: number } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [sound, setSound] = useState(() => storage.get(SOUND_KEY) !== 'off');
  const [permission, setPermission] = useState(() => (typeof Notification === 'undefined' ? 'denied' : Notification.permission));

  const selectedRef = useRef(selected);
  const threadRef = useRef(thread);
  const soundRef = useRef(sound);
  const pokeRef = useRef<() => void>(() => undefined);
  const knownRef = useRef<Map<number, number> | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
    threadRef.current = thread;
    soundRef.current = sound;
  });

  const showToast = useCallback((text: string, ok = false) => setToast({ text, ok, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const select = useCallback((id: number | null) => {
    setSelected(id);
    setThread(current => (current?.id === id ? current : null));
    setShowInfo(false);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('c', String(id));
    else url.searchParams.delete('c');
    window.history.replaceState(window.history.state, '', url);
    // Let the new selection render, then fetch it right away.
    window.setTimeout(() => pokeRef.current(), 0);
  }, []);

  // ---------------------------------------------------------------- polling
  const alertFor = useCallback(
    (data: DeskSync) => {
      const known = knownRef.current;
      knownRef.current = new Map(data.queue.map(item => [item.id, item.unread]));
      if (!known) return; // first load: nothing is "new"
      for (const item of data.queue) {
        const before = known.get(item.id);
        const mineOrFree = !item.assignee || item.assignee.id === meId;
        const looking = item.id === selectedRef.current && !document.hidden;
        if (before === undefined && item.awaitingSince) {
          if (soundRef.current) chime(true);
          notify(`گفتگوی جدید · ${item.fullName}`, item.lastBody || 'یک کاربر منتظر پاسخ است', () => select(item.id));
        } else if (before !== undefined && item.unread > before && mineOrFree && !looking) {
          if (soundRef.current) chime();
          notify(`پیام از ${item.fullName}`, item.lastHasImage ? 'یک تصویر فرستاد' : item.lastBody || '', () => select(item.id));
        }
      }
    },
    [meId, select],
  );

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    let inFlight = false;
    let failures = 0;

    const tick = async () => {
      if (inFlight || cancelled) return;
      inFlight = true;
      const id = selectedRef.current;
      const current = threadRef.current;
      const after = current && current.id === id ? (current.messages.at(-1)?.id ?? 0) : 0;
      try {
        const data = await deskApi.sync(id, after);
        if (cancelled) return;
        failures = 0;
        setOnline(true);
        setSync(data);
        alertFor(data);
        if (id !== null && selectedRef.current === id) {
          if (!data.conversation) {
            select(null);
          } else {
            const conversation = data.conversation;
            setThread(prev =>
              prev && prev.id === id
                ? { ...prev, conversation, customer: data.customer ?? prev.customer, messages: mergeMessages(prev.messages, data.messages) }
                : after === 0
                  ? { id, conversation, customer: data.customer, messages: data.messages }
                  : prev,
            );
            const arrived = new Set(data.messages.map(m => m.clientId).filter(Boolean));
            if (arrived.size) setPending(list => list.filter(p => !arrived.has(p.clientId)));
          }
        }
      } catch {
        if (cancelled) return;
        failures += 1;
        if (failures >= 2) setOnline(false);
      } finally {
        inFlight = false;
      }
      if (!cancelled) {
        const delay = failures ? Math.min(MAX_BACKOFF_MS, 2000 * 2 ** (failures - 1)) : document.hidden ? POLL_HIDDEN_MS : POLL_MS;
        timer = window.setTimeout(tick, delay);
      }
    };

    pokeRef.current = () => {
      if (inFlight) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, 0);
    };
    const onVisible = () => !document.hidden && pokeRef.current();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);
    void tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
    };
  }, [alertFor, select]);

  useEffect(() => {
    deskApi.cannedReplies().then(setReplies).catch(() => undefined);
  }, []);

  // ---------------------------------------------------------------- read receipts
  const lastVisitorId = useMemo(
    () => thread?.messages.filter(m => m.kind === 'visitor').at(-1)?.id ?? 0,
    [thread?.messages],
  );
  const readSent = useRef(new Map<number, number>());
  useEffect(() => {
    if (!thread || !lastVisitorId) return;
    const markRead = () => {
      if (document.hidden) return;
      const sent = readSent.current.get(thread.id) ?? thread.conversation.agentReadId;
      if (lastVisitorId <= sent) return;
      readSent.current.set(thread.id, lastVisitorId);
      deskApi.read(thread.id, lastVisitorId).catch(() => readSent.current.delete(thread.id));
    };
    markRead();
    document.addEventListener('visibilitychange', markRead);
    return () => document.removeEventListener('visibilitychange', markRead);
  }, [thread, lastVisitorId]);

  // ---------------------------------------------------------------- counts + tab title
  const me = sync?.me ?? null;
  const queue = useMemo(() => sync?.queue ?? [], [sync?.queue]);
  const waiting = queue.filter(item => !item.assignee);
  const mine = queue.filter(item => item.assignee?.id === meId);
  const attention = waiting.length + mine.reduce((sum, item) => sum + (item.unread ? 1 : 0), 0);
  useEffect(() => {
    document.title = attention ? `(${faDigits(attention)}) ${BASE_TITLE}` : BASE_TITLE;
  }, [attention]);
  useEffect(() => () => void (document.title = 'TITAN — پلتفرم گیمینگ و اسپورت'), []);

  // ---------------------------------------------------------------- archive (closed conversations)
  const [archive, setArchive] = useState<{ items: DeskQueueItem[]; next: boolean; page: number } | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const loadArchive = useCallback(async (search: string, page: number) => {
    setArchiveLoading(true);
    try {
      const data = await deskApi.history({ status: 'closed', search: search || undefined, page });
      setArchive(current => ({ items: page === 1 ? data.results : [...(current?.items ?? []), ...data.results], next: Boolean(data.next), page }));
    } catch {
      showToast('بارگذاری آرشیو ممکن نشد.');
    } finally {
      setArchiveLoading(false);
    }
  }, [showToast]);
  useEffect(() => {
    if (tab !== 'archive') return;
    const timer = window.setTimeout(() => void loadArchive(query.trim(), 1), 300);
    return () => window.clearTimeout(timer);
  }, [tab, query, loadArchive]);

  const visible = useMemo(() => {
    if (tab === 'archive') return archive?.items ?? [];
    const base = tab === 'waiting' ? waiting : tab === 'mine' ? mine : queue;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(item => `${item.fullName} ${item.phone} ${item.ticket} ${item.username ?? ''}`.toLowerCase().includes(q));
  }, [tab, archive, waiting, mine, queue, query]);

  // ---------------------------------------------------------------- actions
  const updateMe = async (data: Partial<Pick<DeskMe, 'displayName' | 'isAvailable' | 'smsAlerts'>>) => {
    try {
      const updated = await deskApi.updateMe(data);
      setSync(current => (current ? { ...current, me: updated } : current));
      return true;
    } catch (error) {
      showToast(error instanceof ApiError ? error.firstMessage : 'ذخیره نشد.');
      return false;
    }
  };

  const assign = async (agent: number | null) => {
    if (!thread) return;
    try {
      const conversation = await deskApi.assign(thread.id, agent);
      setThread(current => (current && current.id === conversation.id ? { ...current, conversation } : current));
      pokeRef.current();
    } catch (error) {
      showToast(error instanceof ApiError ? error.firstMessage : 'انجام نشد.');
      pokeRef.current();
    }
  };

  const closeConversation = async () => {
    if (!thread) return;
    setModal(null);
    try {
      const conversation = await deskApi.close(thread.id);
      setThread(current => (current && current.id === conversation.id ? { ...current, conversation } : current));
      showToast('گفتگو بسته شد', true);
      pokeRef.current();
    } catch (error) {
      showToast(error instanceof ApiError ? error.firstMessage : 'بسته نشد.');
    }
  };

  const deliver = useCallback(
    async (entry: Pending) => {
      try {
        const message = await deskApi.send(entry.conversationId, { body: entry.body, image: entry.file, clientId: entry.clientId }, entry.internal);
        setPending(list => list.filter(p => p.clientId !== entry.clientId));
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
        setThread(current => (current && current.id === entry.conversationId ? { ...current, messages: mergeMessages(current.messages, [message]) } : current));
        pokeRef.current();
      } catch (error) {
        const text = isTransient(error) ? 'اتصال برقرار نشد' : (error as ApiError).firstMessage;
        setPending(list => list.map(p => (p.clientId === entry.clientId ? { ...p, status: 'failed', error: text } : p)));
      }
    },
    [],
  );

  const send = async (body: string, file: File | null, internal: boolean) => {
    if (!thread) return;
    const base = { conversationId: thread.id, internal, createdAt: new Date().toISOString(), status: 'sending' as const };
    const entries: Pending[] = [];
    if (file) entries.push({ ...base, clientId: newClientId(), body: '', file, previewUrl: URL.createObjectURL(file) });
    if (body.trim()) entries.push({ ...base, clientId: newClientId(), body: body.trim(), file: null, previewUrl: null });
    setPending(list => [...list, ...entries]);
    // In order: the image first, then its caption.
    for (const entry of entries) await deliver(entry);
  };

  const retry = (entry: Pending) => {
    setPending(list => list.map(p => (p.clientId === entry.clientId ? { ...p, status: 'sending', error: undefined } : p)));
    void deliver(entry);
  };

  const askPermission = async () => {
    if (typeof Notification === 'undefined') return;
    setPermission(await Notification.requestPermission());
  };

  const toggleSound = () => {
    storage.set(SOUND_KEY, sound ? 'off' : 'on');
    setSound(!sound);
  };

  // ---------------------------------------------------------------- render
  const conversation = thread?.conversation ?? null;
  const threadPending = pending.filter(p => p.conversationId === thread?.id);
  const onlineAgents = (sync?.agents ?? []).filter(a => a.isOnline);

  return (
    <div className={cx(styles.desk, selected != null && styles.showChat, showInfo && styles.showInfo)}>
      <header className={styles.bar}>
        <div className={styles.brand}>
          <span className={styles.brandGem}>
            <Gem />
          </span>
          <div>
            <h1>میز پشتیبانی</h1>
            <p>{me ? `${me.name} · ${me.isAvailable ? 'در دسترس برای کاربران' : 'برای کاربران آفلاین هستید'}` : 'در حال اتصال…'}</p>
          </div>
        </div>
        <div className={styles.stats}>
          <span className={cx(styles.stat, waiting.length > 0 && styles.statHot)}>
            منتظر پاسخ <b>{faDigits(waiting.length)}</b>
          </span>
          <span className={styles.stat}>
            گفتگوهای من <b>{faDigits(mine.length)}</b>
          </span>
          <span className={styles.stat}>
            <span className={styles.team}>
              {onlineAgents.slice(0, 4).map(agent => (
                <AgentAvatar key={agent.id} agent={agent} online />
              ))}
            </span>
            آنلاین <b>{faDigits(onlineAgents.length)}</b>
          </span>
        </div>
        {permission === 'default' && (
          <button type="button" className={cx(styles.iconBtn, styles.attention)} title="فعال کردن اعلان دسکتاپ" aria-label="فعال کردن اعلان دسکتاپ" onClick={askPermission}>
            <BellIcon />
          </button>
        )}
        <button type="button" className={cx(styles.iconBtn, sound && styles.iconBtnOn)} title={sound ? 'صدا روشن است' : 'صدا خاموش است'} aria-label="صدای اعلان" aria-pressed={sound} onClick={toggleSound}>
          {sound ? <BellIcon /> : <XIcon />}
        </button>
        <button type="button" className={styles.iconBtn} title="پاسخ‌های آماده" aria-label="پاسخ‌های آماده" onClick={() => setModal('replies')}>
          <BoltIcon />
        </button>
        <button type="button" className={styles.iconBtn} title="تنظیمات من" aria-label="تنظیمات من" onClick={() => setModal('settings')}>
          <UserIcon />
        </button>
        <button
          type="button"
          className={cx(styles.switch, me?.isAvailable && styles.switchOn)}
          role="switch"
          aria-checked={Boolean(me?.isAvailable)}
          disabled={!me}
          onClick={() => me && void updateMe({ isAvailable: !me.isAvailable })}
        >
          {me?.isAvailable ? 'آنلاین' : 'آفلاین'}
          <i />
        </button>
      </header>

      {!online && (
        <div className={styles.offlineBar} role="status">
          <span className={styles.spin} />
          اتصال به سرور قطع شده · در حال تلاش دوباره…
        </div>
      )}

      <div className={styles.grid}>
        {/* ───── queue ───── */}
        <section className={cx(styles.col, styles.listCol)} aria-label="صف گفتگوها">
          <div className={styles.tabs} role="tablist">
            {(
              [
                ['waiting', 'منتظر', waiting.length],
                ['mine', 'من', mine.length],
                ['all', 'همه', queue.length],
                ['archive', 'آرشیو', null],
              ] as [Tab, string, number | null][]
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={cx(styles.tab, tab === key && styles.tabOn, key === 'waiting' && count ? styles.tabHot : null)}
                onClick={() => setTab(key)}
              >
                {label}
                {count ? <em>{faDigits(count)}</em> : null}
              </button>
            ))}
          </div>
          <label className={styles.search}>
            <SearchIcon />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder={tab === 'archive' ? 'جستجوی نام، موبایل یا کد پیگیری' : 'جستجو در صف'} aria-label="جستجو" />
          </label>
          <div className={cx(styles.list, styles.scroll)}>
            {!sync && <div className={styles.emptyList}>در حال بارگذاری…</div>}
            {sync && !visible.length && (
              <div className={styles.emptyList}>
                <Gem />
                {tab === 'waiting' ? 'کسی منتظر نیست. همه‌چیز آرومه.' : tab === 'archive' && archiveLoading ? 'در حال جستجو…' : 'گفتگویی پیدا نشد.'}
              </div>
            )}
            {visible.map(item => (
              <button key={item.id} type="button" className={cx(styles.item, item.id === selected && styles.itemOn)} onClick={() => select(item.id)}>
                <VisitorAvatar name={item.fullName} seed={item.phone} online={item.status === 'open' && item.visitorOnline} />
                <div style={{ minWidth: 0 }}>
                  <div className={styles.itemTop}>
                    <b>{item.fullName}</b>
                    <small>{item.ticket}</small>
                  </div>
                  <div className={cx(styles.preview, item.visitorTyping && styles.previewTyping)}>{preview(item, meId)}</div>
                </div>
                <div className={styles.side}>
                  <time>{shortTime(item.lastMessageAt)}</time>
                  {item.status === 'open' && item.awaitingSince ? <WaitChip since={item.awaitingSince} /> : null}
                  {item.unread > 0 && item.status === 'open' ? <span className={styles.unread}>{faDigits(item.unread)}</span> : null}
                  {item.assignee && item.assignee.id !== meId ? <AgentAvatar agent={item.assignee} /> : null}
                </div>
              </button>
            ))}
            {tab === 'archive' && archive?.next && (
              <button type="button" className={styles.more} disabled={archiveLoading} onClick={() => void loadArchive(query.trim(), archive.page + 1)}>
                موارد بیشتر
              </button>
            )}
          </div>
        </section>

        {/* ───── conversation ───── */}
        <section className={cx(styles.col, styles.chatCol)} aria-label="گفتگو">
          {!selected || !conversation ? (
            <div className={styles.placeholder}>
              {selected ? (
                <span className={styles.spin} />
              ) : (
                <div>
                  <div className={styles.bigGem}>
                    <Gem />
                  </div>
                  <h2>{waiting.length ? `${faDigits(waiting.length)} نفر منتظر پاسخ‌اند` : 'صف خالیه'}</h2>
                  <p>یک گفتگو رو از ستون کناری انتخاب کن. اولین پاسخی که بدی، گفتگو رو به نام تو برمی‌داره.</p>
                </div>
              )}
            </div>
          ) : (
            <ConversationPane
              key={conversation.id}
              thread={thread!}
              pending={threadPending}
              meId={meId}
              agents={sync?.agents ?? []}
              replies={replies}
              draft={drafts.get(conversation.id) ?? ''}
              onDraft={text => drafts.set(conversation.id, text)}
              onBack={() => select(null)}
              onInfo={() => setShowInfo(true)}
              onAssign={assign}
              onClose={() => setModal('close')}
              onSend={send}
              onRetry={retry}
              onDiscard={entry => setPending(list => list.filter(p => p.clientId !== entry.clientId))}
              onImage={setLightbox}
              onError={showToast}
            />
          )}
        </section>

        {/* ───── customer ───── */}
        <aside className={cx(styles.col, styles.infoCol, styles.scroll)} aria-label="اطلاعات مشتری">
          {conversation ? (
            <CustomerPanel conversation={conversation} customer={thread?.customer ?? null} onClose={() => setShowInfo(false)} onCopied={() => showToast('کپی شد', true)} />
          ) : (
            <div className={styles.placeholder}>اطلاعات مشتری اینجا نمایش داده می‌شه.</div>
          )}
        </aside>
      </div>

      {modal === 'replies' && <RepliesModal replies={replies} onChange={setReplies} onClose={() => setModal(null)} onError={showToast} />}
      {modal === 'settings' && me && <SettingsModal me={me} onSave={updateMe} onClose={() => setModal(null)} />}
      {modal === 'close' && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} role="alertdialog" aria-labelledby="desk-close-title" onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 id="desk-close-title">گفتگو بسته شود؟</h3>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: 'var(--muted)', lineHeight: 2, fontSize: 13.5 }}>کاربر پیام «پشتیبانی گفتگو را بست» را می‌بیند و می‌تواند امتیاز بدهد. بعد از بستن، فقط یادداشت داخلی می‌شود گذاشت.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className={cx(styles.btn, styles.primary)} onClick={closeConversation}>
                  بله، ببند
                </button>
                <button type="button" className={styles.btn} onClick={() => setModal(null)} autoFocus>
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)} role="dialog" aria-label="تصویر">
          {/* eslint-disable-next-line @next/next/no-img-element -- user uploads */}
          <img src={lightbox} alt="تصویر ارسالی" />
        </div>
      )}
      {toast && (
        <div key={toast.id} className={cx(styles.toast, toast.ok && styles.toastOk)} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ conversation pane
function ConversationPane({
  thread,
  pending,
  meId,
  agents,
  replies,
  draft,
  onDraft,
  onBack,
  onInfo,
  onAssign,
  onClose,
  onSend,
  onRetry,
  onDiscard,
  onImage,
  onError,
}: {
  thread: Thread;
  pending: Pending[];
  meId: number;
  agents: SupportAgent[];
  replies: CannedReply[];
  draft: string;
  onDraft: (text: string) => void;
  onBack: () => void;
  onInfo: () => void;
  onAssign: (agent: number | null) => Promise<void>;
  onClose: () => void;
  onSend: (body: string, file: File | null, internal: boolean) => Promise<void>;
  onRetry: (entry: Pending) => void;
  onDiscard: (entry: Pending) => void;
  onImage: (src: string) => void;
  onError: (text: string) => void;
}) {
  const { conversation, messages } = thread;
  const [transfer, setTransfer] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const isOpen = conversation.status === 'open';
  const assignedToMe = conversation.assignee?.id === meId;

  // Stick to the bottom as messages arrive, unless the agent scrolled up to read.
  const count = messages.length + pending.length + (conversation.visitorTyping ? 1 : 0);
  useEffect(() => {
    const log = logRef.current;
    if (log && atBottom.current) log.scrollTop = log.scrollHeight;
  }, [count]);

  useEffect(() => {
    if (!transfer) return;
    const close = (event: MouseEvent) => !(event.target as Element).closest('[data-transfer]') && setTransfer(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [transfer]);

  const items = [
    ...messages.map(m => ({ key: `m${m.id}`, message: m, pending: null as Pending | null, createdAt: m.createdAt })),
    ...pending.map(p => ({ key: `p${p.clientId}`, message: null as SupportMessage | null, pending: p, createdAt: p.createdAt })),
  ];
  const senderOf = (item: (typeof items)[number]) => {
    if (item.pending) return item.pending.internal ? `n${meId}` : `t${meId}`;
    const m = item.message!;
    if (m.kind === 'visitor') return 'v';
    if (m.kind === 'system') return 's';
    return `${m.kind === 'note' ? 'n' : 't'}${m.author?.id ?? 0}`;
  };

  return (
    <>
      <div className={styles.convHead}>
        <button type="button" className={cx(styles.iconBtn, styles.back)} aria-label="بازگشت به صف" onClick={onBack}>
          <XIcon />
        </button>
        <VisitorAvatar name={conversation.fullName} seed={conversation.phone} online={isOpen && conversation.visitorOnline} />
        <div className={styles.convTitle}>
          <b>{conversation.fullName}</b>
          <span>
            {conversation.ticket} ·{' '}
            {conversation.visitorTyping ? (
              <em className={styles.typingText}>در حال نوشتن…</em>
            ) : !isOpen ? (
              'بسته شده'
            ) : conversation.visitorOnline ? (
              'در سایت'
            ) : (
              'از صفحه خارج شده'
            )}
            {conversation.assignee && ` · مسئول: ${conversation.assignee.id === meId ? 'شما' : conversation.assignee.name}`}
          </span>
        </div>
        <div className={styles.actions} data-transfer>
          {isOpen && !conversation.assignee && (
            <button type="button" className={cx(styles.btn, styles.primary)} onClick={() => void onAssign(meId)}>
              <CheckIcon />
              برداشتن
            </button>
          )}
          {isOpen && (
            <button type="button" className={styles.btn} aria-haspopup="menu" aria-expanded={transfer} onClick={() => setTransfer(t => !t)}>
              <TransferIcon />
              انتقال
            </button>
          )}
          {isOpen && (
            <button type="button" className={cx(styles.btn, styles.dangerBtn)} onClick={onClose}>
              <EndIcon />
              بستن
            </button>
          )}
          <button type="button" className={cx(styles.iconBtn)} aria-label="اطلاعات مشتری" title="اطلاعات مشتری" onClick={onInfo}>
            <UserIcon />
          </button>
          {transfer && (
            <div className={styles.dropdown} role="menu">
              {agents
                .filter(agent => agent.id !== conversation.assignee?.id)
                .map(agent => (
                  <button
                    key={agent.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setTransfer(false);
                      void onAssign(agent.id);
                    }}
                  >
                    <AgentAvatar agent={agent} online={agent.isOnline} />
                    {agent.id === meId ? 'خودم' : agent.name}
                    <small>{agent.isOnline ? 'آنلاین' : 'آفلاین'}</small>
                  </button>
                ))}
              {conversation.assignee && (
                <>
                  <hr />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setTransfer(false);
                      void onAssign(null);
                    }}
                  >
                    بازگرداندن به صف انتظار
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={cx(styles.log, styles.scroll)}
        ref={logRef}
        onScroll={() => {
          const log = logRef.current;
          if (log) atBottom.current = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
        }}
        role="log"
        aria-live="polite"
      >
        {items.map((item, index) => {
          const previous = items[index - 1];
          const next = items[index + 1];
          const newDay = !previous || !sameDay(previous.createdAt, item.createdAt);
          const sender = senderOf(item);
          const first = newDay || !previous || senderOf(previous) !== sender;
          const last = !next || senderOf(next) !== sender;
          const day = newDay ? <div className={styles.sep}>{dayLabel(item.createdAt)}</div> : null;
          const m = item.message;
          if (m?.kind === 'system') {
            return (
              <React.Fragment key={item.key}>
                {day}
                <div className={styles.sys}>{m.body}</div>
              </React.Fragment>
            );
          }
          if (m?.kind === 'note' && !m.author) {
            return (
              <React.Fragment key={item.key}>
                {day}
                <div className={styles.sysNote}>{m.body}</div>
              </React.Fragment>
            );
          }
          const p = item.pending;
          const fromVisitor = m?.kind === 'visitor';
          const isNote = p ? p.internal : m?.kind === 'note';
          const author = m?.author ?? null;
          const image = p ? p.previewUrl : (m?.image ?? null);
          const body = p ? p.body : (m?.body ?? '');
          const seen = !fromVisitor && !isNote && m && m.id <= conversation.visitorReadId;
          const tick = p ? null : !fromVisitor && !isNote ? seen ? <DoubleCheckIcon className={cx(styles.tick, styles.tickSeen)} /> : <CheckIcon className={styles.tick} /> : null;
          return (
            <React.Fragment key={item.key}>
              {day}
              <div className={cx(styles.msg, fromVisitor ? styles.fromVisitor : styles.fromTeam, first && styles.first, isNote && styles.noteBubble, p?.status === 'sending' && styles.sending, p?.status === 'failed' && styles.failed)}>
                {fromVisitor ? (
                  <span className={last ? undefined : styles.ghostAv}>
                    <VisitorAvatar name={conversation.fullName} seed={conversation.phone} small />
                  </span>
                ) : null}
                <div className={styles.stackCol}>
                  {!fromVisitor && first && author && author.id !== meId && <span className={styles.author}>{author.name}</span>}
                  <div className={cx(styles.bubble, image && styles.img)} dir="auto">
                    {isNote && (
                      <div className={styles.noteTag}>
                        <LockIcon />
                        یادداشت داخلی{author && author.id !== meId ? ` · ${author.name}` : ''}
                      </div>
                    )}
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- user uploads
                      <img src={image} alt="تصویر" onClick={() => onImage(image)} />
                    ) : (
                      <span>{body}</span>
                    )}
                    <div className={styles.meta}>
                      <span>{clockTime(item.createdAt)}</span>
                      {p?.status === 'sending' && <span className={styles.spin} style={{ width: 10, height: 10 }} />}
                      {tick}
                    </div>
                  </div>
                  {p?.status === 'failed' && (
                    <span className={styles.author} style={{ color: '#ff9d94' }}>
                      {p.error} ·{' '}
                      <button type="button" onClick={() => onRetry(p)} style={{ color: 'var(--cream)', textDecoration: 'underline', cursor: 'pointer' }}>
                        دوباره
                      </button>{' '}
                      ·{' '}
                      <button type="button" onClick={() => onDiscard(p)} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                        حذف
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {isOpen && conversation.visitorTyping && (
          <div className={cx(styles.msg, styles.fromVisitor, styles.first)}>
            <VisitorAvatar name={conversation.fullName} seed={conversation.phone} small />
            <div className={cx(styles.bubble, styles.typing)} aria-label="در حال نوشتن">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>

      <DeskComposer
        conversationId={conversation.id}
        open={isOpen}
        canReply={isOpen}
        claimHint={isOpen && !assignedToMe && !conversation.assignee}
        replies={replies}
        initialText={draft}
        onDraft={onDraft}
        onSend={onSend}
        onError={onError}
      />
    </>
  );
}

// ------------------------------------------------------------------ composer with canned replies
function DeskComposer({
  conversationId,
  open,
  canReply,
  claimHint,
  replies,
  initialText,
  onDraft,
  onSend,
  onError,
}: {
  conversationId: number;
  open: boolean;
  canReply: boolean;
  claimHint: boolean;
  replies: CannedReply[];
  initialText: string;
  onDraft: (text: string) => void;
  onSend: (body: string, file: File | null, internal: boolean) => Promise<void>;
  onError: (text: string) => void;
}) {
  const [text, setText] = useState(initialText);
  const [note, setNote] = useState(!canReply);
  const [file, setFile] = useState<{ file: File; url: string } | null>(null);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastTyping = useRef(0);

  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(file.url);
    },
    [file],
  );

  const slash = /^\/(\S*)$/.exec(text);
  const matches = useMemo(() => {
    if (!slash || dismissed) return [];
    const q = slash[1].toLowerCase();
    return replies.filter(r => r.shortcut.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)).slice(0, 8);
  }, [slash, dismissed, replies]);
  const picking = Boolean(slash) && !dismissed;

  const resize = () => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(160, input.scrollHeight)}px`;
  };

  const change = (value: string) => {
    setText(value);
    onDraft(value);
    setDismissed(false);
    setActive(0);
    requestAnimationFrame(resize);
    if (!note && value.trim() && !value.startsWith('/') && every(lastTyping, TYPING_EVERY_MS)) {
      deskApi.typing(conversationId).catch(() => undefined);
    }
  };

  const insert = (reply: CannedReply) => {
    change(reply.body);
    inputRef.current?.focus();
  };

  const submit = () => {
    if (!text.trim() && !file) return;
    void onSend(text, file?.file ?? null, note || !canReply);
    setText('');
    onDraft('');
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
    requestAnimationFrame(resize);
  };

  const take = (candidate: File | undefined | null) => {
    if (!candidate) return;
    const problem = imageProblem(candidate);
    if (problem) onError(problem);
    else setFile({ file: candidate, url: URL.createObjectURL(candidate) });
  };

  const internal = note || !canReply;
  return (
    <div className={styles.composer}>
      {!open && <div className={styles.closedNote}>این گفتگو بسته شده. فقط یادداشت داخلی می‌تونی بذاری.</div>}
      {picking && (
        <div className={cx(styles.canned, styles.scroll)} role="listbox" aria-label="پاسخ‌های آماده">
          {matches.length ? (
            matches.map((reply, index) => (
              <button
                key={reply.id}
                type="button"
                role="option"
                aria-selected={index === active}
                className={cx(styles.cannedItem, index === active && styles.cannedOn)}
                onMouseEnter={() => setActive(index)}
                onMouseDown={event => {
                  event.preventDefault();
                  insert(reply);
                }}
              >
                <code>/{reply.shortcut}</code>
                <b>{reply.title}</b>
                <span>{reply.body}</span>
              </button>
            ))
          ) : (
            <div className={styles.cannedEmpty}>پاسخ آماده‌ای با این عنوان نیست. از دکمه‌ی ⚡ بالای صفحه اضافه کن.</div>
          )}
        </div>
      )}
      {canReply && (
        <div className={styles.mode}>
          <button type="button" className={cx(styles.modeBtn, !note && styles.modeOn)} aria-pressed={!note} onClick={() => setNote(false)}>
            <SendIcon />
            پاسخ به کاربر
          </button>
          <button type="button" className={cx(styles.modeBtn, styles.modeNote, note && styles.modeOn)} aria-pressed={note} onClick={() => setNote(true)}>
            <NoteIcon />
            یادداشت داخلی
          </button>
        </div>
      )}
      {file && (
        <div className={styles.attach}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
          <img src={file.url} alt="" />
          <span>{file.file.name}</span>
          <button type="button" className={styles.iconBtn} aria-label="حذف تصویر" onClick={() => setFile(null)}>
            <XIcon />
          </button>
        </div>
      )}
      <div className={cx(styles.box, internal && styles.boxNote)}>
        <button type="button" className={styles.iconBtn} aria-label="پیوست تصویر" onClick={() => fileRef.current?.click()}>
          <ClipIcon />
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => take(e.target.files?.[0])} />
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          maxLength={2000}
          aria-label={internal ? 'یادداشت داخلی' : 'پاسخ'}
          placeholder={internal ? 'یادداشتی که فقط همکارها می‌بینن…' : claimHint ? 'پاسخ بده تا گفتگو به نام تو ثبت بشه · / برای پاسخ آماده' : 'پاسخت رو بنویس · / برای پاسخ آماده'}
          onChange={e => change(e.target.value)}
          onPaste={e => {
            const image = Array.from(e.clipboardData.files).find(f => f.type.startsWith('image/'));
            if (image) {
              e.preventDefault();
              take(image);
            }
          }}
          onKeyDown={e => {
            if (picking && matches.length) {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                setActive(i => (i + (e.key === 'ArrowDown' ? 1 : matches.length - 1)) % matches.length);
                return;
              }
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insert(matches[active] ?? matches[0]);
                return;
              }
            }
            if (picking && e.key === 'Escape') {
              e.preventDefault();
              setDismissed(true);
              return;
            }
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button type="button" className={cx(styles.send, internal && styles.sendNote)} disabled={!text.trim() && !file} onClick={submit}>
          {internal ? 'ثبت یادداشت' : 'ارسال'}
          <SendIcon />
        </button>
      </div>
      <div className={styles.hint}>
        <kbd>Enter</kbd> ارسال · <kbd>Shift</kbd>+<kbd>Enter</kbd> خط جدید · <kbd>/</kbd> پاسخ آماده · تصویر رو paste کن
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ customer panel
function CustomerPanel({
  conversation,
  customer,
  onClose,
  onCopied,
}: {
  conversation: DeskConversation;
  customer: DeskCustomer | null;
  onClose: () => void;
  onCopied: () => void;
}) {
  const copy = (value: string) => navigator.clipboard?.writeText(value).then(onCopied, () => undefined);
  return (
    <div className={styles.info}>
      <button type="button" className={styles.iconBtn} aria-label="بستن" onClick={onClose} style={{ alignSelf: 'flex-end' }}>
        <XIcon />
      </button>
      <div className={styles.who}>
        <VisitorAvatar name={conversation.fullName} seed={conversation.phone} online={conversation.status === 'open' && conversation.visitorOnline} />
        <b>{conversation.fullName}</b>
        <small>{conversation.username ? `@${conversation.username}` : 'کاربر مهمان'}</small>
      </div>

      <div className={styles.card}>
        <h4>تماس</h4>
        <div className={styles.kv}>
          <span>موبایل</span>
          <button type="button" onClick={() => copy(conversation.phone)} dir="ltr">
            <CopyIcon />
            {formatPhone(conversation.phone)}
          </button>
        </div>
        <div className={styles.kv}>
          <span>کد پیگیری</span>
          <button type="button" onClick={() => copy(conversation.ticket)}>
            <CopyIcon />
            {conversation.ticket}
          </button>
        </div>
        <div className={styles.kv}>
          <span>شروع از صفحه</span>
          <b dir="ltr">{conversation.pageUrl || '—'}</b>
        </div>
        <div className={styles.kv}>
          <span>شروع گفتگو</span>
          <b>{shortTime(conversation.createdAt)}</b>
        </div>
      </div>

      {customer?.userId ? (
        <div className={styles.card}>
          <h4>حساب کاربری</h4>
          <div className={styles.kv}>
            <span>عضویت</span>
            <b>{customer.dateJoined ? jalaliDate(customer.dateJoined) : '—'}</b>
          </div>
          <div className={styles.kv}>
            <span>کیف پول</span>
            <b>{toman(customer.walletBalance)}</b>
          </div>
          <div className={styles.kv}>
            <span>سفارش‌ها</span>
            <b>{faDigits(customer.ordersCount)}</b>
          </div>
          {customer.recentOrders.map(order => (
            <div key={order.number} className={styles.order}>
              <code>{order.number}</code>
              <em>{order.statusLabel}</em>
              <span>{toman(order.total)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.card}>
          <h4>حساب کاربری</h4>
          <p className={styles.guest}>این کاربر بدون ورود به حساب چت را شروع کرده. اگر شماره‌اش در سایت ثبت باشد، از بخش کاربران ادمین پیدا می‌شود.</p>
        </div>
      )}

      {customer && customer.previousConversations > 0 && (
        <div className={styles.card}>
          <h4>سابقه</h4>
          <div className={styles.kv}>
            <span>گفتگوهای قبلی با این شماره</span>
            <b>{faDigits(customer.previousConversations)}</b>
          </div>
        </div>
      )}

      {conversation.rating != null && (
        <div className={styles.card}>
          <h4>امتیاز کاربر</h4>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map(n => (
              <Gem key={n} className={n <= (conversation.rating ?? 0) ? undefined : styles.dim} />
            ))}
          </div>
          {conversation.ratingComment && <p className={styles.quote}>{conversation.ratingComment}</p>}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ modals
function RepliesModal({
  replies,
  onChange,
  onClose,
  onError,
}: {
  replies: CannedReply[];
  onChange: (replies: CannedReply[]) => void;
  onClose: () => void;
  onError: (text: string) => void;
}) {
  const [form, setForm] = useState({ shortcut: '', title: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await deskApi.addCannedReply({ ...form, shortcut: form.shortcut.replace(/^\//, '').trim() });
      onChange([...replies, created]);
      setForm({ shortcut: '', title: '', body: '' });
    } catch (err) {
      setError(err instanceof ApiError ? err.firstMessage : 'ذخیره نشد.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (reply: CannedReply) => {
    try {
      await deskApi.deleteCannedReply(reply.id);
      onChange(replies.filter(r => r.id !== reply.id));
    } catch {
      onError('حذف نشد.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-labelledby="desk-replies-title" onClick={e => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h3 id="desk-replies-title">پاسخ‌های آماده</h3>
          <button type="button" className={styles.iconBtn} aria-label="بستن" onClick={onClose}>
            <XIcon />
          </button>
        </div>
        <div className={cx(styles.modalBody, styles.scroll)}>
          {replies.length === 0 && <p className={styles.guest}>هنوز پاسخ آماده‌ای نیست. با اولین مورد شروع کن؛ بعد در چت فقط کافیه / و میان‌برش رو بنویسی.</p>}
          {replies.map(reply => (
            <div key={reply.id} className={styles.replyRow}>
              <code>/{reply.shortcut}</code>
              <div>
                <b>{reply.title}</b>
                <span>{reply.body}</span>
              </div>
              <button type="button" className={styles.iconBtn} aria-label={`حذف ${reply.title}`} onClick={() => void remove(reply)}>
                <XIcon />
              </button>
            </div>
          ))}
          <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            <div className={styles.formRow}>
              <label className={styles.label}>
                میان‌بر
                <input className={styles.input} dir="ltr" value={form.shortcut} onChange={e => setForm({ ...form, shortcut: e.target.value })} placeholder="refund" required maxLength={30} />
              </label>
              <label className={styles.label}>
                عنوان
                <input className={styles.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="بازگشت وجه" required maxLength={80} />
              </label>
            </div>
            <label className={styles.label}>
              متن پاسخ
              <textarea className={styles.textarea} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required maxLength={2000} />
            </label>
            {error && <div className={styles.formError}>{error}</div>}
            <button type="submit" className={cx(styles.btn, styles.primary)} disabled={busy} style={{ alignSelf: 'flex-start' }}>
              افزودن پاسخ آماده
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ me, onSave, onClose }: { me: DeskMe; onSave: (data: Partial<DeskMe>) => Promise<boolean>; onClose: () => void }) {
  const [displayName, setDisplayName] = useState(me.displayName);
  const [smsAlerts, setSmsAlerts] = useState(me.smsAlerts);
  const [busy, setBusy] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    if (await onSave({ displayName: displayName.trim(), smsAlerts })) onClose();
    else setBusy(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form className={styles.modal} role="dialog" aria-labelledby="desk-settings-title" onClick={e => e.stopPropagation()} onSubmit={save}>
        <div className={styles.modalHead}>
          <h3 id="desk-settings-title">تنظیمات من</h3>
          <button type="button" className={styles.iconBtn} aria-label="بستن" onClick={onClose}>
            <XIcon />
          </button>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.label}>
            نامی که کاربران می‌بینند
            <input className={styles.input} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={me.name} maxLength={40} />
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={smsAlerts} onChange={e => setSmsAlerts(e.target.checked)} />
            وقتی هیچ پشتیبانی آنلاین نیست و کاربری پیام می‌دهد، برایم پیامک بفرست
          </label>
          <button type="submit" className={cx(styles.btn, styles.primary)} disabled={busy} style={{ alignSelf: 'flex-start' }}>
            ذخیره
          </button>
        </div>
      </form>
    </div>
  );
}
