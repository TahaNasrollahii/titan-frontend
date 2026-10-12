'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import { supportApi } from '@/lib/api/endpoints';
import type { SupportMessage, SupportStatus, VisitorConversation, VisitorSync } from '@/lib/api/types';

import { chime, newClientId, storage } from './shared';

const TOKEN_KEY = 'titan.support';
const SOUND_KEY = 'titan.support.sound';

/** Poll faster while the visitor is looking at the chat, slower otherwise. */
const POLL_OPEN_MS = 2000;
const POLL_CLOSED_MS = 8000;
const POLL_HIDDEN_MS = 30000;
const POLL_ENDED_MS = 60000;
const STATUS_POLL_MS = 60000;
const MAX_BACKOFF_MS = 30000;
const TYPING_EVERY_MS = 3000;

interface StoredChat {
  token: string;
  /** The account that started it, so another user on this browser never sees it. */
  userId: number | null;
}

export interface PendingMessage {
  clientId: string;
  body: string;
  file: File | null;
  previewUrl: string | null;
  createdAt: string;
  status: 'sending' | 'failed';
  error?: string;
  /** Bumped on every retry. */
  attempt: number;
}

export type ChatView = 'welcome' | 'chat' | 'rate' | 'done';

interface State {
  token: string | null;
  conversation: VisitorConversation | null;
  messages: SupportMessage[];
  pending: PendingMessage[];
  support: SupportStatus | null;
  view: ChatView;
  online: boolean;
  /** Highest message id the visitor has seen in this browser. */
  seenId: number;
}

type Action =
  | { type: 'restore'; token: string | null }
  | { type: 'synced'; data: VisitorSync; token: string }
  | { type: 'support'; support: SupportStatus }
  | { type: 'conversation'; conversation: VisitorConversation }
  | { type: 'queue'; message: PendingMessage }
  | { type: 'sent'; message: SupportMessage }
  | { type: 'failed'; clientId: string; error: string }
  | { type: 'retry'; clientId: string }
  | { type: 'discard'; clientId: string }
  | { type: 'connection'; online: boolean }
  | { type: 'seen'; id: number }
  | { type: 'view'; view: ChatView }
  | { type: 'forget' };

const initialState: State = {
  token: null,
  conversation: null,
  messages: [],
  pending: [],
  support: null,
  view: 'welcome',
  online: true,
  seenId: 0,
};

/** Merge by id (sync and send responses can overlap) and drop optimistic copies that have arrived. */
function merge(state: State, incoming: SupportMessage[]): Pick<State, 'messages' | 'pending'> {
  if (!incoming.length) return { messages: state.messages, pending: state.pending };
  const byId = new Map(state.messages.map(m => [m.id, m]));
  for (const message of incoming) byId.set(message.id, message);
  const arrived = new Set(incoming.map(m => m.clientId).filter(Boolean));
  const pending = state.pending.filter(p => {
    if (!arrived.has(p.clientId)) return true;
    if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
    return false;
  });
  return { messages: [...byId.values()].sort((a, b) => a.id - b.id), pending };
}

function viewFor(conversation: VisitorConversation, current: ChatView): ChatView {
  if (conversation.status === 'open') return 'chat';
  // A closed conversation stays readable in the chat view until the visitor moves on.
  if (current === 'welcome') return conversation.rating == null ? 'chat' : 'done';
  return current;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'restore':
      return { ...initialState, support: state.support, token: action.token };
    case 'synced': {
      if (action.token !== state.token) return state; // a response for a chat that was since replaced
      return {
        ...state,
        ...merge(state, action.data.messages),
        conversation: action.data.conversation,
        support: action.data.support,
        view: viewFor(action.data.conversation, state.view),
        online: true,
        seenId: Math.max(state.seenId, action.data.conversation.visitorReadId),
      };
    }
    case 'support':
      return { ...state, support: action.support };
    case 'conversation':
      return { ...state, conversation: action.conversation };
    case 'queue':
      return { ...state, pending: [...state.pending, action.message] };
    case 'sent':
      return { ...state, ...merge(state, [action.message]), seenId: Math.max(state.seenId, action.message.id) };
    case 'failed':
      return {
        ...state,
        pending: state.pending.map(p => (p.clientId === action.clientId ? { ...p, status: 'failed', error: action.error } : p)),
      };
    case 'retry':
      return {
        ...state,
        pending: state.pending.map(p =>
          p.clientId === action.clientId ? { ...p, status: 'sending', error: undefined, attempt: p.attempt + 1 } : p,
        ),
      };
    case 'discard':
      return {
        ...state,
        pending: state.pending.filter(p => {
          if (p.clientId !== action.clientId) return true;
          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
          return false;
        }),
      };
    case 'connection':
      return state.online === action.online ? state : { ...state, online: action.online };
    case 'seen':
      return action.id > state.seenId ? { ...state, seenId: action.id } : state;
    case 'view':
      return { ...state, view: action.view };
    case 'forget':
      state.pending.forEach(p => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
      return { ...initialState, support: state.support };
  }
}

function readStored(): StoredChat | null {
  const raw = storage.get(TOKEN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredChat;
    return typeof parsed.token === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

/** Network trouble (worth retrying) as opposed to the server rejecting the request. */
const isTransient = (error: unknown) =>
  !(error instanceof ApiError) || error.status === 0 || error.status === 429 || error.status >= 500;

const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

export interface StartInput {
  firstName: string;
  lastName: string;
  phone: string;
}

/**
 * The visitor side of live chat: restores the conversation from this browser, polls for changes,
 * sends messages in order with retries (each carries a client id, so a retry is never stored twice)
 * and reports read receipts and typing.
 */
export function useSupportChat({ open, onIncoming }: { open: boolean; onIncoming: (message: SupportMessage) => void }) {
  const { user, status: authStatus } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  const openRef = useRef(open);
  const onIncomingRef = useRef(onIncoming);
  const pokeRef = useRef<() => void>(() => undefined);
  const notifiedRef = useRef<number | null>(null);
  const lastTypingRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
    openRef.current = open;
    onIncomingRef.current = onIncoming;
  });

  // ---------------------------------------------------------------- token: restore, forget, other tabs
  useEffect(() => {
    dispatch({ type: 'restore', token: readStored()?.token ?? null });
    const onStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_KEY) return;
      const token = readStored()?.token ?? null;
      if (token !== stateRef.current.token) {
        notifiedRef.current = null;
        dispatch({ type: 'restore', token });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const forget = useCallback(() => {
    storage.set(TOKEN_KEY, null);
    notifiedRef.current = null;
    dispatch({ type: 'forget' });
  }, []);

  // A chat started while logged in belongs to that account: hide it after logout or a switch.
  useEffect(() => {
    if (authStatus === 'loading') return;
    const stored = readStored();
    if (stored?.userId != null && stored.userId !== (user?.id ?? null)) forget();
  }, [authStatus, user?.id, forget]);

  // ---------------------------------------------------------------- polling
  const token = state.token;
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let timer: number | undefined;
    let inFlight = false;
    let failures = 0;

    const delay = () => {
      if (failures) return Math.min(MAX_BACKOFF_MS, 2000 * 2 ** (failures - 1));
      if (stateRef.current.conversation?.status === 'closed') return POLL_ENDED_MS;
      if (document.hidden) return POLL_HIDDEN_MS;
      return openRef.current ? POLL_OPEN_MS : POLL_CLOSED_MS;
    };
    const schedule = () => {
      window.clearTimeout(timer);
      if (!cancelled) timer = window.setTimeout(tick, delay());
    };
    const tick = async () => {
      if (inFlight || cancelled) return;
      inFlight = true;
      const after = stateRef.current.messages.at(-1)?.id ?? 0;
      try {
        const data = await supportApi.sync(token, after);
        if (cancelled) return;
        failures = 0;
        dispatch({ type: 'synced', data, token });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.code === 'conversation_not_found') {
          forget();
          return;
        }
        failures += 1;
        if (failures >= 2) dispatch({ type: 'connection', online: false });
      } finally {
        inFlight = false;
      }
      schedule();
    };

    pokeRef.current = () => {
      if (inFlight) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, 0);
    };
    const onVisible = () => !document.hidden && pokeRef.current();
    const onOnline = () => {
      failures = 0;
      pokeRef.current();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    void tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      pokeRef.current = () => undefined;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [token, forget]);

  // Opening the panel should feel instant, not wait for the slow closed-panel poll.
  useEffect(() => {
    if (open) pokeRef.current();
  }, [open]);

  // Without a conversation, only the launcher's online state is needed.
  useEffect(() => {
    if (token) return;
    let cancelled = false;
    const load = () => {
      if (document.hidden) return;
      supportApi
        .status()
        .then(support => !cancelled && dispatch({ type: 'support', support }))
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, STATUS_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [token]);

  // ---------------------------------------------------------------- incoming: notify, then mark read
  const lastServerId = state.messages.at(-1)?.id ?? 0;
  useEffect(() => {
    if (!state.conversation) return;
    // The first sync after loading restores history; only messages after it count as "new".
    if (notifiedRef.current === null) {
      notifiedRef.current = lastServerId;
      return;
    }
    const fresh = state.messages.filter(m => m.id > (notifiedRef.current ?? 0) && m.kind === 'agent');
    notifiedRef.current = Math.max(notifiedRef.current, lastServerId);
    if (fresh.length) onIncomingRef.current(fresh[fresh.length - 1]);
  }, [lastServerId, state.conversation, state.messages]);

  const lookingAtChat = open && state.view === 'chat';
  useEffect(() => {
    if (!token || !lookingAtChat || !lastServerId) return;
    const markRead = () => {
      if (document.hidden) return;
      dispatch({ type: 'seen', id: lastServerId });
      if (lastServerId > (stateRef.current.conversation?.visitorReadId ?? 0)) {
        supportApi.read(token, lastServerId).catch(() => undefined);
      }
    };
    markRead();
    document.addEventListener('visibilitychange', markRead);
    return () => document.removeEventListener('visibilitychange', markRead);
  }, [token, lookingAtChat, lastServerId]);

  // ---------------------------------------------------------------- sending, strictly in order
  const sendingRef = useRef(false);
  const flush = useCallback(async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    let failures = 0;
    // Settled in this run; the state mirror can lag a render behind, so never pick these up twice.
    const settled = new Set<string>();
    try {
      for (;;) {
        const { token: current, pending } = stateRef.current;
        const next = pending.find(p => p.status === 'sending' && !settled.has(`${p.clientId}:${p.attempt}`));
        if (!current || !next) break;
        // An earlier failed message blocks nothing: the visitor decides to retry or discard it.
        try {
          const message = await supportApi.send(current, { body: next.body, image: next.file, clientId: next.clientId });
          failures = 0;
          settled.add(`${next.clientId}:${next.attempt}`);
          dispatch({ type: 'sent', message });
          dispatch({ type: 'connection', online: true });
        } catch (error) {
          if (stateRef.current.token !== current) break;
          if (isTransient(error)) {
            failures += 1;
            if (failures >= 2) dispatch({ type: 'connection', online: false });
            await sleep(Math.min(MAX_BACKOFF_MS, 1500 * 2 ** (failures - 1)));
            continue;
          }
          const apiError = error as ApiError;
          settled.add(`${next.clientId}:${next.attempt}`);
          dispatch({ type: 'failed', clientId: next.clientId, error: apiError.firstMessage });
          if (apiError.code === 'conversation_closed') pokeRef.current();
          if (apiError.code === 'conversation_not_found') forget();
        }
      }
    } finally {
      sendingRef.current = false;
    }
  }, [forget]);

  useEffect(() => {
    if (state.pending.some(p => p.status === 'sending')) void flush();
  }, [state.pending, flush]);

  // ---------------------------------------------------------------- actions
  const start = useCallback(
    async (input: StartInput) => {
      const data = await supportApi.start({ ...input, pageUrl: window.location.pathname });
      storage.set(TOKEN_KEY, JSON.stringify({ token: data.token, userId: user?.id ?? null } satisfies StoredChat));
      notifiedRef.current = null;
      dispatch({ type: 'restore', token: data.token });
      dispatch({ type: 'synced', data, token: data.token });
    },
    [user?.id],
  );

  const send = useCallback((body: string, file: File | null) => {
    const text = body.trim();
    if (!text && !file) return;
    const createdAt = new Date().toISOString();
    // An image and its caption go as two messages, so each arrives (or fails) on its own.
    if (file) {
      dispatch({
        type: 'queue',
        message: { clientId: newClientId(), body: '', file, previewUrl: URL.createObjectURL(file), createdAt, status: 'sending', attempt: 0 },
      });
    }
    if (text) {
      dispatch({ type: 'queue', message: { clientId: newClientId(), body: text, file: null, previewUrl: null, createdAt, status: 'sending', attempt: 0 } });
    }
    lastTypingRef.current = 0;
  }, []);

  const typing = useCallback(() => {
    const current = stateRef.current.token;
    const now = Date.now();
    if (!current || now - lastTypingRef.current < TYPING_EVERY_MS) return;
    lastTypingRef.current = now;
    supportApi.typing(current).catch(() => undefined);
  }, []);

  const close = useCallback(async () => {
    const current = stateRef.current.token;
    if (!current) return;
    const conversation = await supportApi.close(current);
    dispatch({ type: 'conversation', conversation });
    dispatch({ type: 'view', view: 'rate' });
    pokeRef.current();
  }, []);

  const rate = useCallback(async (rating: number, comment: string) => {
    const current = stateRef.current.token;
    if (!current) return;
    try {
      dispatch({ type: 'conversation', conversation: await supportApi.rate(current, rating, comment) });
    } catch (error) {
      // Already rated (e.g. from another tab) is as good as done.
      if (!(error instanceof ApiError && error.code === 'already_rated')) throw error;
    }
    dispatch({ type: 'view', view: 'done' });
  }, []);

  const setView = useCallback((view: ChatView) => dispatch({ type: 'view', view }), []);
  const retry = useCallback((clientId: string) => dispatch({ type: 'retry', clientId }), []);
  const discard = useCallback((clientId: string) => dispatch({ type: 'discard', clientId }), []);

  // ---------------------------------------------------------------- derived
  const unread = useMemo(() => {
    const readUpTo = Math.max(state.seenId, state.conversation?.visitorReadId ?? 0);
    return state.messages.filter(m => m.kind === 'agent' && m.id > readUpTo).length;
  }, [state.messages, state.seenId, state.conversation?.visitorReadId]);

  return {
    ...state,
    unread,
    start,
    send,
    typing,
    close,
    rate,
    retry,
    discard,
    setView,
    newChat: forget,
  };
}

export const soundPreference = {
  get: () => storage.get(SOUND_KEY) !== 'off',
  set: (on: boolean) => storage.set(SOUND_KEY, on ? 'on' : 'off'),
};

export { chime };
