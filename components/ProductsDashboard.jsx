'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { deleteProduct, getCategories, getProducts } from '../lib/api/products';
import { applyLocalChanges, getAddedProducts, saveProductDeletion } from '../lib/local-products';

const pageSizes = [10, 20, 50];
const sortFields = ['', 'title', 'price', 'rating'];

function safeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function titleCase(value) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-5" aria-label="Loading products">
      {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
    </div>
  );
}

function ProductImage({ product }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
      {product.thumbnail && <img src={product.thumbnail} alt="" className="h-full w-full object-cover" />}
    </div>
  );
}

function ProductActions({ product, onDelete }) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap text-sm font-medium">
      <Link href={`/products/${product.id}`} className="text-indigo-600 hover:text-indigo-800">View</Link>
      <Link href={`/products/${product.id}/edit`} className="text-slate-600 hover:text-slate-900">Edit</Link>
      <button type="button" onClick={() => onDelete(product)} className="text-rose-600 hover:text-rose-800">Delete</button>
    </div>
  );
}

function ProductTable({ products, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr><th className="px-6 py-4">Product</th><th className="px-4 py-4">Category</th><th className="px-4 py-4">Price</th><th className="px-4 py-4">Rating</th><th className="px-4 py-4">Stock</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><ProductImage product={product} /><div><p className="font-semibold text-slate-800">{product.title}</p><p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-slate-500">{product.description}</p></div></div></td>
                <td className="px-4 py-4 text-slate-600">{titleCase(product.category || 'Uncategorized')}</td>
                <td className="px-4 py-4 font-medium text-slate-800">${Number(product.price || 0).toFixed(2)}</td>
                <td className="px-4 py-4 text-amber-600">★ {Number(product.rating || 0).toFixed(1)}</td>
                <td className="px-4 py-4"><span className={product.stock > 10 ? 'text-emerald-700' : 'text-amber-700'}>{product.stock ?? 0}</span></td>
                <td className="px-6 py-4"><div className="flex justify-end"><ProductActions product={product} onDelete={onDelete} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y md:hidden">
        {products.map((product) => (
          <article key={product.id} className="p-4">
            <div className="flex gap-3"><ProductImage product={product} /><div className="min-w-0 flex-1"><h2 className="truncate font-semibold text-slate-800">{product.title}</h2><p className="mt-1 text-xs text-slate-500">{titleCase(product.category || 'Uncategorized')}</p></div><span className="font-semibold text-slate-800">${Number(product.price || 0).toFixed(2)}</span></div>
            <div className="mt-4 flex items-center justify-between"><span className="text-sm text-amber-600">★ {Number(product.rating || 0).toFixed(1)} · <span className="text-slate-500">{product.stock ?? 0} in stock</span></span><ProductActions product={product} onDelete={onDelete} /></div>
          </article>
        ))}
      </div>
    </>
  );
}

function Pagination({ page, pageCount, pageSize, total, onPage, onPageSize }) {
  // Show at most five nearby page numbers. This is clearer on mobile.
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4));
  const lastPage = Math.min(pageCount, firstPage + 4);
  const pages = Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-3 text-sm text-slate-600"><span>Showing {from}–{to} of {total}</span><label className="flex items-center gap-2">Rows <select aria-label="Rows per page" value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))} className="rounded-lg border bg-white px-2 py-1 text-sm">{pageSizes.map((size) => <option key={size}>{size}</option>)}</select></label></div>
      <div className="flex items-center gap-1">
        <button type="button" className="button-secondary px-3 py-2 text-xs" onClick={() => onPage(page - 1)} disabled={page <= 1}>Previous</button>
        <div className="hidden items-center gap-1 sm:flex">{pages.map((item) => <button key={item} type="button" onClick={() => onPage(item)} aria-current={page === item ? 'page' : undefined} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${page === item ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{item}</button>)}</div>
        <button type="button" className="button-secondary px-3 py-2 text-xs" onClick={() => onPage(page + 1)} disabled={page >= pageCount}>Next</button>
      </div>
    </div>
  );
}

function DeleteDialog({ product, onCancel, onConfirm, isDeleting }) {
  if (!product) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><h2 id="delete-title" className="text-lg font-bold text-slate-900">Delete product?</h2><p className="mt-2 text-sm leading-6 text-slate-600">“{product.title}” will be removed from this dashboard. DummyJSON simulates this change, so it is kept locally for this browser.</p><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" onClick={onCancel} disabled={isDeleting}>Cancel</button><button type="button" className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Deleting…' : 'Delete'}</button></div></div></div>;
}

export default function ProductsDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();
  const page = safeInteger(searchParams.get('page'), 1);
  const pageSize = pageSizes.includes(Number(searchParams.get('size'))) ? Number(searchParams.get('size')) : 20;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sortBy = sortFields.includes(searchParams.get('sort')) ? searchParams.get('sort') : '';
  const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const [searchText, setSearchText] = useState(query);
  const debouncedSearch = useDebouncedValue(searchText, 400);
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function updateUrl(changes) {
    const next = new URLSearchParams(paramsString);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ''}`);
  }

  useEffect(() => setSearchText(query), [query]);

  useEffect(() => {
    if (debouncedSearch === query) return;
    updateUrl({ q: debouncedSearch.trim() || null, page: null });
  // updateUrl deliberately reads current URL at request time; only debounce changes should trigger this effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal).then(setCategories).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let ignoreResult = false;

    async function loadProducts() {
      setIsLoading(true);
      setError('');
      try {
        const data = await getProducts({ query, category, limit: pageSize, skip: (page - 1) * pageSize, sortBy, order, signal: controller.signal });
        if (ignoreResult) return;
        const pageCount = Math.max(1, Math.ceil(data.total / pageSize));
        if (page > pageCount) {
          updateUrl({ page: pageCount === 1 ? null : pageCount });
          return;
        }
        setResult(data);
      } catch (requestError) {
        if (ignoreResult) return;
        setError(requestError.message || 'Could not load products.');
        setResult(null);
      } finally {
        if (!ignoreResult) setIsLoading(false);
      }
    }

    loadProducts();
    return () => {
      // This prevents an old, slow search from replacing a newer result.
      ignoreResult = true;
      controller.abort();
    };
  // URL values and explicit retry are the complete fetch inputs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, page, pageSize, sortBy, order, reloadKey]);

  const rawProducts = result?.products || [];
  const additions = !query && !category && page === 1 ? getAddedProducts() : [];
  const products = [...additions, ...applyLocalChanges(rawProducts).filter((item) => !additions.some((addition) => addition.id === item.id))].slice(0, pageSize);
  const total = result ? Math.max(0, result.total + additions.length) : 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  async function confirmDeletion() {
    if (!pendingDeletion || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProduct(pendingDeletion.id);
      saveProductDeletion(pendingDeletion.id);
      setPendingDeletion(null);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || 'Could not delete product.');
      setPendingDeletion(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-violet-600">Nexgensis operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Product intelligence</h1><p className="mt-2 text-sm text-slate-500">Browse, update and organise your product inventory.</p></div><Link href="/products/new" className="button-primary bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-100 hover:from-violet-700 hover:to-indigo-700">+ Add product</Link></div>
      <section className="panel overflow-hidden">
        <div className="grid gap-3 border-b p-4 lg:grid-cols-[minmax(230px,1fr)_190px_155px_125px] lg:p-5">
          <div><label className="sr-only" htmlFor="search">Search products</label><input id="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search products…" className="field mt-0" /></div>
          <select aria-label="Filter by category" value={category} onChange={(event) => { setSearchText(''); updateUrl({ category: event.target.value || null, q: null, page: null }); }} className="field mt-0"><option value="">All categories</option>{categories.map((item) => <option key={item.slug || item} value={item.slug || item}>{item.name || titleCase(item)}</option>)}</select>
          <select aria-label="Sort products" value={sortBy} onChange={(event) => updateUrl({ sort: event.target.value || null, page: null })} className="field mt-0"><option value="">Default order</option><option value="title">Title</option><option value="price">Price</option><option value="rating">Rating</option></select>
          <select aria-label="Sort direction" value={order} onChange={(event) => updateUrl({ order: event.target.value, page: null })} className="field mt-0"><option value="asc">Ascending</option><option value="desc">Descending</option></select>
        </div>
        {query && <p className="border-b bg-indigo-50 px-5 py-2 text-xs text-indigo-800">Searching takes precedence over category filtering, because DummyJSON does not support both in one paginated request.</p>}
        {isLoading ? <LoadingRows /> : error ? <div className="p-10 text-center"><p className="font-semibold text-rose-700">Couldn’t load products</p><p className="mt-2 text-sm text-slate-500">{error}</p><button type="button" className="button-primary mt-5" onClick={() => setReloadKey((value) => value + 1)}>Retry</button></div> : products.length === 0 ? <div className="p-12 text-center"><p className="font-semibold text-slate-800">No products found</p><p className="mt-2 text-sm text-slate-500">Try changing your search or filters.</p></div> : <><ProductTable products={products} onDelete={setPendingDeletion} /><Pagination page={page} pageCount={pageCount} pageSize={pageSize} total={total} onPage={(nextPage) => updateUrl({ page: nextPage === 1 ? null : nextPage })} onPageSize={(nextSize) => updateUrl({ size: nextSize === 20 ? null : nextSize, page: null })} /></>}
      </section>
      <DeleteDialog product={pendingDeletion} onCancel={() => setPendingDeletion(null)} onConfirm={confirmDeletion} isDeleting={isDeleting} />
    </main>
  );
}
