'use client';

import React from 'react';

import styles from '@/app/(dashboard)/tournaments/[slug]/bracket/page.module.css';
import type { BracketRound, Match, Participant } from '@/lib/api/types';
import { faNumber, initials } from '@/lib/format';

function TeamRow({ match, participant, score }: { match: Match; participant: Participant | null; score: number | null }) {
  const isWinner = participant !== null && match.winnerId === participant.id;
  const showScore = match.status === 'completed' || match.status === 'live';
  return (
    <div className={`${styles.teamRow} ${isWinner ? styles.winner : ''}`}>
      <div className={styles.teamName}>
        <div className={styles.teamIcon}>{participant ? initials(participant.name) : '?'}</div>
        {participant ? participant.name : match.status === 'bye' ? 'استراحت (بای)' : 'در انتظار'}
      </div>
      <div className={styles.score}>{showScore && score !== null ? faNumber(score) : '-'}</div>
    </div>
  );
}

/** Single-elimination bracket: one column per round, final last. */
export function BracketView({ rounds }: { rounds: BracketRound[] }) {
  return (
    <div className={styles.bracketContainer}>
      {rounds.map((round, index) => {
        const isFinal = index === rounds.length - 1;
        return (
          <div
            key={round.round}
            className={styles.round}
            style={{ justifyContent: isFinal ? 'center' : index > 0 ? 'space-around' : undefined }}
          >
            <div
              className={styles.roundTitle}
              style={
                isFinal ? { color: 'gold', borderColor: 'rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.05)' } : undefined
              }
            >
              {round.name}
            </div>
            {round.matches.map(match => (
              <div
                key={match.id}
                className={`${styles.match} ${match.status === 'live' ? styles.liveMatch : ''} ${isFinal ? styles.finalMatch : ''}`}
                style={match.isMine ? { outline: '1px solid var(--red)' } : undefined}
              >
                {!isFinal && (
                  <div
                    className={`${styles.matchConnector} ${match.position % 2 === 0 ? styles.connectorTop : styles.connectorBottom}`}
                  ></div>
                )}
                {match.status === 'live' && <div className={styles.liveBadge}>LIVE</div>}
                <TeamRow match={match} participant={match.participantA} score={match.scoreA} />
                <TeamRow match={match} participant={match.participantB} score={match.scoreB} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
