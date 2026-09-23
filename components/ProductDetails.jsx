'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProduct } from '../lib/api/products';
import { getLocalProduct } from '../lib/local-products';

function titleCase(value) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProductDetails() {
  const { id } = useParams();
  const validId = /^\d+$/.test(String(id));
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState(validId ? 'loading' : 'not-found');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!validId) return;
    const localProduct = getLocalProduct(id);
    if (localProduct && localProduct.id >= 195) {
      setProduct(localProduct);
      setStatus('ready');
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    getProduct(id, controller.signal)
      .then((apiProduct) => {
        const patch = getLocalProduct(id);
        if (patch === null) {
          setStatus('not-found');
          return;
        }
        setProduct({ ...apiProduct, ...(patch || {}) });
        setStatus('ready');
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        if (/not found|status code 404/i.test(requestError.message)) setStatus('not-found');
        else {
          setError(requestError.message || 'Could not load this product.');
          setStatus('error');
        }
      });
    return () => controller.abort();
  }, [id, validId, reloadKey]);

  if (status === 'loading') return <main className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">Loading product…</main>;
  if (status === 'not-found') return <main className="mx-auto max-w-6xl px-4 py-16 text-center"><p className="text-sm font-semibold text-indigo-600">404</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Product not found</h1><p className="mt-3 text-slate-500">This product does not exist or was deleted in this browser.</p><Link href="/products" className="button-primary mt-6">Back to products</Link></main>;
  if (status === 'error') return <main className="mx-auto max-w-6xl px-4 py-16 text-center"><h1 className="text-xl font-bold text-rose-700">Unable to load product</h1><p className="mt-2 text-slate-500">{error}</p><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="button-primary mt-6">Retry</button></main>;

  const images = product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">← All products</Link>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section className="panel overflow-hidden p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((image, index) => <div key={`${image}-${index}`} className="aspect-square overflow-hidden rounded-xl bg-slate-100"><img src={image} alt={`${product.title} ${index + 1}`} className="h-full w-full object-contain" /></div>)}
            {!images.length && <div className="grid aspect-square place-items-center rounded-xl bg-slate-100 text-sm text-slate-400">No image available</div>}
          </div>
        </section>
        <section className="py-2">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-600">{titleCase(product.category || 'Uncategorized')}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{product.title}</h1></div><Link href={`/products/${product.id}/edit`} className="button-secondary">Edit</Link></div>
          <p className="mt-5 leading-7 text-slate-600">{product.description || 'No description has been provided.'}</p>
          <div className="mt-7 grid grid-cols-3 gap-3"><div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</p><p className="mt-1 text-xl font-bold text-slate-900">${Number(product.price || 0).toFixed(2)}</p></div><div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rating</p><p className="mt-1 text-xl font-bold text-amber-600">★ {Number(product.rating || 0).toFixed(1)}</p></div><div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Stock</p><p className="mt-1 text-xl font-bold text-slate-900">{product.stock ?? 0}</p></div></div>
        </section>
      </div>
      <section className="panel mt-8 p-5 sm:p-6"><h2 className="text-xl font-bold text-slate-900">Reviews</h2>{product.reviews?.length ? <div className="mt-5 divide-y">{product.reviews.map((review, index) => <article key={`${review.reviewerEmail || review.reviewerName}-${index}`} className="py-4 first:pt-0"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-800">{review.reviewerName}</p><span className="text-sm text-amber-600">★ {review.rating}/5</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p></article>)}</div> : <p className="mt-3 text-sm text-slate-500">There are no reviews for this product.</p>}</section>
    </main>
  );
}
