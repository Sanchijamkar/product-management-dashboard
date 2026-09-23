import LoginForm from '../../components/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading login…</main>}><LoginForm /></Suspense>;
}
