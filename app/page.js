'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasSession } from '../lib/session';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasSession() ? '/products' : '/login');
  }, [router]);

  return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Opening dashboard…</main>;
}
