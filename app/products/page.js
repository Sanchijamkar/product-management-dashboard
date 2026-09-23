import AppHeader from '../../components/AppHeader';
import ProductsDashboard from '../../components/ProductsDashboard';
import RequireAuth from '../../components/RequireAuth';
import { Suspense } from 'react';

export default function ProductsPage() {
  return <RequireAuth><AppHeader /><Suspense fallback={<main className="mx-auto max-w-7xl px-4 py-12 text-sm text-slate-500">Loading products…</main>}><ProductsDashboard /></Suspense></RequireAuth>;
}
