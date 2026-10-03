'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { ReactNode, Suspense, useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';

import { Loading } from './ui/State';

function Guard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status !== 'anonymous') return;
    const query = searchParams.toString();
    const next = encodeURIComponent(query ? `${pathname}?${query}` : pathname);
    router.replace(`/login?next=${next}`);
  }, [status, pathname, searchParams, router]);

  if (status !== 'authenticated') return <Loading />;
  return <>{children}</>;
}

/** Renders ``children`` only for logged-in users; everyone else is sent to the login page. */
export function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
