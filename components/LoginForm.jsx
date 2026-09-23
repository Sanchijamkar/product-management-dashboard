'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '../lib/api/auth';
import { saveSession } from '../lib/session';
import { BRAND } from '../lib/brand';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(BRAND.adminUsername);
  const [password, setPassword] = useState(BRAND.adminPassword);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login({ username, password });
      saveSession(user);
      const next = searchParams.get('next');
      router.replace(next?.startsWith('/') ? next : '/products');
    } catch (requestError) {
      setError(requestError.message || 'Unable to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-3 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-black/30 lg:grid-cols-[.9fr_1.1fr] sm:min-h-[calc(100vh-3rem)]">
        <section className="relative flex items-center justify-center overflow-hidden bg-white px-5 py-12 sm:px-10 lg:px-14">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-cyan-400 to-rose-400" />
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-black tracking-tighter text-white shadow-lg shadow-violet-200">NG</span>
              <p className="text-lg font-bold tracking-tight text-slate-900"><span className="text-violet-700">Nex</span>gensis</p>
            </div>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Operations portal</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Welcome to your product command center.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">Manage inventory, discover product insights and keep your catalogue moving forward.</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div>
                <label className="label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="field"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="field"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
              <button className="button-primary w-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Log in'}
              </button>
            </form>
            <p className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-3.5 text-xs leading-5 text-violet-900">
              Nexgensis demo access is prefilled: <strong className="font-semibold">{BRAND.adminUsername} / {BRAND.adminPassword}</strong>
            </p>
          </div>
        </section>
        <aside className="relative hidden min-h-[620px] overflow-hidden lg:block">
          <img src="/assets/nexgensis-login-visual.png" alt="Abstract Nexgensis technology visual" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <div className="mb-5 h-px w-16 bg-cyan-300" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Nexgensis intelligence</p>
            <p className="mt-3 max-w-md text-3xl font-semibold leading-tight">Where product operations meet what’s next.</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-200">A focused workspace built for clear decisions, faster actions and growing catalogues.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
