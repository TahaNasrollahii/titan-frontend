'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { RequireAuth } from '@/components/RequireAuth';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { ApiError, errorMessage } from '@/lib/api/client';
import { teamsApi } from '@/lib/api/endpoints';

import '../../checkout/checkout.css';

/** Landing page for team invite links (``/invite/<code>``): joins the team, then opens it. */
function JoinTeam() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { addToast } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    teamsApi
      .join(code)
      .then(team => {
        addToast({ title: 'به تیم پیوستید', text: team.name, icon: 'users' });
        router.replace(`/teams/${team.id}`);
      })
      .catch(err => setError(err instanceof ApiError && err.code === 'already_member' ? err.detail : errorMessage(err)));
  }, [code, router, addToast]);

  if (!error) return <Loading label="در حال پیوستن به تیم..." />;

  return (
    <div className="checkout-page">
      <div className="checkout-empty">
        <Icon name="users" />
        <h2>پیوستن به تیم انجام نشد</h2>
        <p style={{ color: 'var(--muted)' }}>{error}</p>
        <Link href="/dashboard?tab=teams" className="chk-btn primary">
          تیم‌های من
        </Link>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <RequireAuth>
      <JoinTeam />
    </RequireAuth>
  );
}
