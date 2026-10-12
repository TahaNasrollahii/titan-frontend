/** Helpers shared by the visitor widget and the staff desk. */

import { toEnglishDigits } from '@/lib/format';

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/** A UUID v4 for idempotent sends. ``crypto.randomUUID`` only exists on HTTPS and localhost. */
export function newClientId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Why a file cannot be attached, or ``null`` when it is fine. */
export function imageProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'فقط تصویر PNG، JPG یا WebP می‌تونی بفرستی.';
  if (file.size > MAX_IMAGE_BYTES) return 'حجم تصویر نباید بیشتر از ۲ مگابایت باشه.';
  return null;
}

const timeFormat = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long' });

export const clockTime = (iso: string) => timeFormat.format(new Date(iso));

/** "امروز", "دیروز" or the Jalali date, for day separators. */
export function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return `امروز · ${dayFormat.format(date)}`;
  if (date.toDateString() === yesterday.toDateString()) return `دیروز · ${dayFormat.format(date)}`;
  return dayFormat.format(date);
}

export const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export const faDigits = (value: string | number) => String(value).replace(/\d/g, d => FA_DIGITS[Number(d)]);

/** Mirrors the server's rule: 09xxxxxxxxx, also accepting +98 / 0098 / 9… and Persian digits. */
export function normalizePhone(value: string): string {
  let digits = toEnglishDigits(value).replace(/\D/g, '');
  if (digits.startsWith('0098')) digits = digits.slice(4);
  else if (digits.startsWith('98') && digits.length === 12) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('9')) digits = `0${digits}`;
  return digits.slice(0, 11);
}

export const isValidPhone = (value: string) => /^09\d{9}$/.test(normalizePhone(value));

/** "۰۹۱۲ ۳۴۵ ۶۷۸۹" */
export function formatPhone(value: string): string {
  const digits = normalizePhone(value);
  return faDigits([digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 11)].filter(Boolean).join(' '));
}

export const isValidName = (value: string) => /^\p{L}[\p{L}\s‌'-]*$/u.test(value.trim()) && value.trim().length >= 2;

/** "۱ دقیقه و ۴۰ ثانیه" style wait, rounded for display. */
export function waitLabel(seconds: number): string {
  if (seconds < 60) return 'کمتر از ۱ دقیقه';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `حدود ${faDigits(minutes)} دقیقه`;
  return `حدود ${faDigits(Math.round(minutes / 60))} ساعت`;
}

/** "۰۱:۴۰" mm:ss (or h:mm:ss) since ``iso``. */
export function elapsed(iso: string, now: number): string {
  const total = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return faDigits(h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
}

// ------------------------------------------------------------------ sound
let audio: AudioContext | null = null;
let unlocked = false;

if (typeof window !== 'undefined') {
  // Browsers only allow sound after the user has interacted with the page.
  const unlock = () => {
    unlocked = true;
  };
  window.addEventListener('pointerdown', unlock, { once: true, capture: true });
  window.addEventListener('keydown', unlock, { once: true, capture: true });
}

/** A short two-note chime. Silently does nothing before the first user interaction. */
export function chime(high = false): void {
  if (!unlocked) return;
  try {
    audio ??= new AudioContext();
    const start = audio.currentTime;
    const notes: [number, number][] = high ? [[988, 0], [1480, 0.08]] : [[880, 0], [1320, 0.09]];
    for (const [frequency, delay] of notes) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start + delay);
      gain.gain.linearRampToValueAtTime(0.08, start + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + delay + 0.35);
      osc.connect(gain).connect(audio.destination);
      osc.start(start + delay);
      osc.stop(start + delay + 0.4);
    }
  } catch {
    // No audio on this device.
  }
}

/** Read/write a small preference without ever throwing (private mode, blocked storage). */
export const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null): void {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch {
      // Storage unavailable; the chat still works for this page view.
    }
  },
};
