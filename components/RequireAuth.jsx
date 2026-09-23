'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasSession } from '../lib/session';

export default function RequireAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasSession()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) {
    return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Checking your session…</main>;
  }

  return children;
}
