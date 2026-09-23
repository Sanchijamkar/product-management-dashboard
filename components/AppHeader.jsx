'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getUser } from '../lib/session';
import { BRAND } from '../lib/brand';

export default function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function logout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/products" className="flex items-center gap-3 font-bold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-black tracking-tighter text-white shadow-lg shadow-violet-200">NG</span>
          <span><span className="text-violet-700">Nex</span>gensis <span className="ml-1 hidden text-xs font-medium text-slate-400 sm:inline">Operations</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.firstName || 'Nexgensis'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'Signed in'}</p>
          </div>
          <button type="button" onClick={logout} className="button-secondary px-3 py-2 text-xs">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
