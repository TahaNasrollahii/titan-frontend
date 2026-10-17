import type { EventData } from '@/components/SpecialEventBracket';
import { DEFAULT_FIFA_EVENT } from '@/components/SpecialEventBracket';
import type { BracketRound, Match, Tournament } from './api/types';
import { faNumber, jalaliDateTime, prize, TOURNAMENT_STATUS_LABELS } from './format';

/**
 * =============================================================================
 * رجیستری مسابقات ویژه با جدول حذفی شیشه‌ای (Special Event Knockout Brackets)
 * =============================================================================
 */

export const SAMPLE_CUSTOM_EVENT: EventData = {
  badge: '★ جام طلایی تایتان',
  title: 'جدول حذفی — مسابقات قهرمانان',
  sub: '۱۶ تیم برتر تایتان · رقابت حذفی مستقیم · پخش زنده',
  status: 'در حال برگزاری',
  finalWhen: 'شنبه ۲۱:۳۰',
  prize: '۱۰۰٬۰۰۰٬۰۰۰ تومان',
  viewers: '۸٬۵۰۰ نفر',
  teams: {
    T1: ['Titan Alpha', '#ff5a35', '#7a1f16'],
    T2: ['Phoenix Squad', '#f2b24a', '#8a5a14'],
    T3: ['Cyber Knights', '#6fa8dc', '#1c4a7a'],
    T4: ['Dark Nemesis', '#a97bd6', '#5a2b6e'],
    T5: ['Iron Wolves', '#7fd6ff', '#1c6f99'],
    T6: ['Golden Lions', '#f0c866', '#a67c1e'],
    T7: ['Shadow Strikers', '#4ad0a0', '#1a6b52'],
    T8: ['Viper Strike', '#ff9a4a', '#9a4a14'],
    T9: ['Neon Phantoms', '#8aa0ff', '#2a3a8a'],
    T10: ['Storm Breakers', '#e06fb0', '#7a2358'],
    T11: ['Ghost Warriors', '#9aa0ac', '#3a3e48'],
    T12: ['Apex Predators', '#5fd07a', '#1a6b3a'],
    T13: ['Blaze Legion', '#ff6b48', '#c23a1d'],
    T14: ['Frost Giants', '#7b7fe0', '#2a2c6e'],
    T15: ['Dragon Claws', '#c07bff', '#4a1f7a'],
    T16: ['Vortex Elite', '#6b7080', '#22252c'],
  },
  r16L: [
    ['T1', 2, 'T2', 0],
    ['T3', 1, 'T4', 2],
    ['T5', 3, 'T6', 1],
    ['T7', 0, 'T8', 2],
  ],
  qfL: [
    ['T1', 3, 'T4', 1],
    ['T5', 2, 'T8', 0],
  ],
  sfL: [
    ['T1', 2, 'T5', 1],
  ],
  r16R: [
    ['T9', 2, 'T10', 1],
    ['T11', 0, 'T12', 3],
    ['T13', 3, 'T14', 2],
    ['T15', 1, 'T16', 2],
  ],
  qfR: [
    ['T9', 1, 'T12', 2],
    ['T13', 2, 'T16', 0],
  ],
  sfR: [
    ['T12', 3, 'T13', 1],
  ],
  final: ['T1', 3, 'T12', 2],
};

export const SPECIAL_EVENTS_REGISTRY: Record<string, EventData> = {
  fifa: DEFAULT_FIFA_EVENT,
  'fifa-cup': DEFAULT_FIFA_EVENT,
  'ea-fc': DEFAULT_FIFA_EVENT,
  'custom-cup': SAMPLE_CUSTOM_EVENT,
};

const TEAM_COLOR_PALETTES: [string, string][] = [
  ['#ff5a35', '#7a1f16'],
  ['#a97bd6', '#5a2b6e'],
  ['#6fa8dc', '#1c4a7a'],
  ['#4ad0a0', '#1a6b52'],
  ['#f0c866', '#8a5a14'],
  ['#7fd6ff', '#1c6f99'],
  ['#e06fb0', '#7a2358'],
  ['#8aa0ff', '#2a3a8a'],
  ['#5fd07a', '#1a6b3a'],
  ['#ff9a4a', '#9a4a14'],
  ['#c07bff', '#4a1f7a'],
  ['#7b7fe0', '#2a2c6e'],
  ['#9aa0ac', '#3a3e48'],
  ['#6b7080', '#22252c'],
  ['#ff6b48', '#c23a1d'],
  ['#e0a94a', '#6f4a14'],
];

/**
 * تبدیل خودکار مسابقات دیتابیس جنگو به فرمت جدول شیشه‌ای (SpecialEventBracket)
 */
export function convertBracketRoundsToEventData(
  rounds: BracketRound[],
  tournament: Tournament
): EventData {
  const teams: Record<string, [string, string, string]> = {};
  let colorIdx = 0;

  function registerParticipant(p: { id: number; name: string } | null, fallbackSeed: number): string {
    if (!p) {
      const code = `BYE_${fallbackSeed}`;
      if (!teams[code]) {
        teams[code] = ['در انتظار حریف', '#555555', '#222222'];
      }
      return code;
    }
    const rawCode = p.name
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3) || `T${p.id}`;

    let uniqueCode = rawCode;
    let suffix = 1;
    while (teams[uniqueCode] && teams[uniqueCode][0] !== p.name) {
      uniqueCode = `${rawCode}${suffix++}`;
    }

    if (!teams[uniqueCode]) {
      const pal = TEAM_COLOR_PALETTES[colorIdx % TEAM_COLOR_PALETTES.length];
      colorIdx++;
      teams[uniqueCode] = [p.name, pal[0], pal[1]];
    }
    return uniqueCode;
  }

  function matchTuple(m: Match | undefined, seedBase: number): [string, number, string, number] {
    if (!m) {
      const tA = registerParticipant(null, seedBase * 2 - 1);
      const tB = registerParticipant(null, seedBase * 2);
      return [tA, 0, tB, 0];
    }
    const tA = registerParticipant(m.participantA, seedBase * 2 - 1);
    const tB = registerParticipant(m.participantB, seedBase * 2);
    return [tA, m.scoreA ?? 0, tB, m.scoreB ?? 0];
  }

  let r16Matches: Match[] = [];
  let qfMatches: Match[] = [];
  let sfMatches: Match[] = [];
  let finalMatch: Match | undefined = undefined;

  if (rounds.length >= 4) {
    r16Matches = rounds[rounds.length - 4]?.matches || [];
    qfMatches = rounds[rounds.length - 3]?.matches || [];
    sfMatches = rounds[rounds.length - 2]?.matches || [];
    finalMatch = rounds[rounds.length - 1]?.matches[0];
  } else if (rounds.length === 3) {
    qfMatches = rounds[rounds.length - 3]?.matches || [];
    sfMatches = rounds[rounds.length - 2]?.matches || [];
    finalMatch = rounds[rounds.length - 1]?.matches[0];
  } else if (rounds.length === 2) {
    sfMatches = rounds[rounds.length - 2]?.matches || [];
    finalMatch = rounds[rounds.length - 1]?.matches[0];
  } else if (rounds.length === 1) {
    finalMatch = rounds[0]?.matches[0];
  }

  const r16L = [
    matchTuple(r16Matches[0], 1),
    matchTuple(r16Matches[1], 2),
    matchTuple(r16Matches[2], 3),
    matchTuple(r16Matches[3], 4),
  ];
  const r16R = [
    matchTuple(r16Matches[4], 5),
    matchTuple(r16Matches[5], 6),
    matchTuple(r16Matches[6], 7),
    matchTuple(r16Matches[7], 8),
  ];

  const qfL = [
    matchTuple(qfMatches[0], 1),
    matchTuple(qfMatches[1], 2),
  ];
  const qfR = [
    matchTuple(qfMatches[2], 3),
    matchTuple(qfMatches[3], 4),
  ];

  const sfL = [
    matchTuple(sfMatches[0], 1),
  ];
  const sfR = [
    matchTuple(sfMatches[1], 2),
  ];

  const final = matchTuple(finalMatch, 1);

  return {
    badge: '★ ' + (tournament.formatLabel || 'جام حذفی'),
    title: 'جدول حذفی — ' + tournament.title,
    sub: `${faNumber(tournament.participantsCount || tournament.maxParticipants)} شرکت‌کننده · حذف مستقیم`,
    status: TOURNAMENT_STATUS_LABELS[tournament.status] || tournament.status,
    finalWhen: jalaliDateTime(tournament.endsAt),
    prize: prize(tournament.prizePool, tournament.prizeCurrency),
    viewers: `${faNumber(tournament.viewerCount || 0)} نفر`,
    teams,
    r16L,
    qfL,
    sfL,
    r16R,
    qfR,
    sfR,
    final,
  };
}

/**
 * دریافت اطلاعات جدول ویژه (از فیلد ادمین پنل، رجیستری یا مقادیر پیش‌فرض)
 */
export function getSpecialEvent(
  slug: string,
  gameSlug?: string,
  tournament?: Tournament | null
): EventData | null {
  // ۱. اگر ادمین مستقیماً در فیلد Rules ادمین پنل جنگو تنظیمات جدول را وارد کرده باشد
  if (tournament?.specialBracket) {
    return tournament.specialBracket as EventData;
  }

  // ۲. رجیستری لوکال
  const cleanSlug = slug.toLowerCase();
  if (SPECIAL_EVENTS_REGISTRY[cleanSlug]) {
    return SPECIAL_EVENTS_REGISTRY[cleanSlug];
  }
  if (cleanSlug.includes('fifa') || cleanSlug.includes('ea-fc')) {
    return DEFAULT_FIFA_EVENT;
  }
  if (gameSlug && /fifa|fc/i.test(gameSlug)) {
    return DEFAULT_FIFA_EVENT;
  }
  return null;
}
