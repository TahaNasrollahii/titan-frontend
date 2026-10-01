'use client';

import React from 'react';
import Link from 'next/link';
import { Icon, Avatar } from './Icons';
import { ProfileAvatar } from './ProfileAvatar';

export function Rail() {
  const teams = [
    { n: 'تیم آلفا', s: 'game', g: 'Valorant', seed: 3 },
    { n: 'جوخه سایه', s: 'online', seed: 8 },
    { n: 'مبارزان تاریکی', s: 'away', seed: 14 },
    { n: 'نخبگان', s: 'online', seed: 19 },
    { n: 'عقاب‌های سرخ', s: 'online', seed: 25 },
    { n: 'سندیکا', s: 'away', seed: 30 }
  ];



  const getTip = (f: any) => `${f.n} · ${f.s === 'game' ? 'در بازی — ' + f.g : f.s === 'online' ? 'آنلاین' : 'آفلاین'}`;

  return (
    <aside className="rail" aria-label="تیم‌ها">
      <div className="panel p1 reveal" style={{ '--d': 1 } as any}>
        <Link href="/dashboard" className="me" aria-label="پروفایل شما">
          <ProfileAvatar seed={5} score={0} />
        </Link>
        <i className="rail-ic"><Icon name="users" /></i>
        <div className="list">
          {teams.map((f, i) => (
            <div key={i} className={`av ${f.s === 'game' ? 'game' : ''}`} data-tip={getTip(f)}>
              <div className="face"><Avatar seed={f.seed} /></div>
              <span className={`st ${f.s}`}></span>
              {f.s === 'game' && <span className="ingame">در بازی</span>}
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
