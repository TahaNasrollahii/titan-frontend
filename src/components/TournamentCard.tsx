'use client';

import Link from 'next/link';
import React from 'react';

import type { Participant, TournamentSummary } from '@/lib/api/types';
import { jalaliDateTime, prize, TOURNAMENT_STATUS_LABELS } from '@/lib/format';

import { Icon } from './Icons';

function statusLabel(tournament: TournamentSummary) {
  if (tournament.status === 'registration_open' && tournament.isFull) return 'تکمیل ظرفیت';
  return TOURNAMENT_STATUS_LABELS[tournament.status] ?? tournament.status;
}

function Side({ participant, alt }: { participant: Participant | null; alt?: boolean }) {
  return (
    <div className="mc-team-side">
      <div className={`mc-crest ${alt ? 'crest-alt' : ''}`}>
        {participant ? (participant.tag || participant.name.substring(0, 2)).toUpperCase() : '?'}
      </div>
      <h4>{participant?.name ?? 'TBA'}</h4>
      <span>{participant?.seed ? `سید ${participant.seed.toLocaleString('fa-IR')}` : 'آزاد'}</span>
    </div>
  );
}

/** The "match card" used on the tournament hub and the tournaments list. */
export function TournamentCard({ tournament, index }: { tournament: TournamentSummary; index: number }) {
  const match = tournament.featuredMatch;
  const isOpen = tournament.status === 'registration_open' && !tournament.isFull;

  return (
    <article className="match-card-premium spot spot-track reveal" style={{ '--d': 5 + index } as React.CSSProperties}>
      <div
        className="mc-hero"
        style={tournament.coverImage ? { backgroundImage: `url(${tournament.coverImage})` } : undefined}
      >
        <div className="mc-hero-overlay"></div>

        <div className="mc-status-bar">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="mc-game">{tournament.game.titleEn}</span>
            <span className="mc-type">
              <Icon name={tournament.participantType === 'solo' ? 'user' : 'users'} />{' '}
              {tournament.participantType === 'solo' ? 'تک نفره' : 'تیمی'}
            </span>
          </div>
          <div className={`mc-status ${isOpen ? 'open' : ''}`}>
            <span className="mc-status-dot"></span> {statusLabel(tournament)}
          </div>
        </div>

        <div className="mc-teams">
          <Side participant={match?.participantA ?? null} />
          <div className="mc-vs-badge">VS</div>
          <Side participant={match?.participantB ?? null} alt />
        </div>
      </div>

      <div className="mc-content">
        <div className="mc-info-row">
          <div className="mc-info-item">
            <div className="mc-info-icon">
              <Icon name="clock" />
            </div>
            <div className="mc-info-text">
              <span className="mc-lbl">زمان شروع</span>
              <strong className="mc-val">{jalaliDateTime(tournament.startsAt)}</strong>
            </div>
          </div>
          <div className="mc-info-item">
            <div className="mc-info-icon prize">
              <Icon name="trophy" />
            </div>
            <div className="mc-info-text">
              <span className="mc-lbl">جایزه مسابقه</span>
              <strong className="mc-val text-cream">{prize(tournament.prizePool, tournament.prizeCurrency)}</strong>
            </div>
          </div>
        </div>
        <Link href={`/tournaments/${tournament.slug}`} className="mc-btn-full" style={{ textDecoration: 'none' }}>
          {tournament.title} <Icon name="arrow" />
        </Link>
      </div>
    </article>
  );
}
