'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addProduct, getCategories, getProduct, updateProduct } from '../lib/api/products';
import { getLocalProduct, saveAddedProduct, saveProductUpdate } from '../lib/local-products';

const initialValues = { title: '', description: '', category: '', price: '', stock: '', thumbnail: '' };

function titleCase(value) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function validate(values) {
  const errors = {};
  if (values.title.trim().length < 2) errors.title = 'Enter at least 2 characters.';
  if (values.description.trim().length < 5) errors.description = 'Enter at least 5 characters.';
  if (!values.category) errors.category = 'Select a category.';
  if (values.price === '' || Number(values.price) < 0) errors.price = 'Enter a price of 0 or more.';
  if (values.stock === '' || !Number.isInteger(Number(values.stock)) || Number(values.stock) < 0) errors.stock = 'Enter a whole stock amount of 0 or more.';
  if (values.thumbnail && !/^https?:\/\//i.test(values.thumbnail)) errors.thumbnail = 'Enter a valid http(s) URL.';
  return errors;
}

function FormField({ label, name, errors, children }) {
  return <div><label htmlFor={name} className="label">{label}</label>{children}{errors[name] && <p className="mt-1 text-xs font-medium text-rose-600">{errors[name]}</p>}</div>;
}

export default function ProductForm({ mode }) {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = mode === 'edit';
  const [values, setValues] = useState(initialValues);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState('');
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [original, setOriginal] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal).then(setCategories).catch(() => setPageError('Could not load product categories. You can retry the page.'));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    if (!/^\d+$/.test(String(id))) {
      setPageError('Product not found.');
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    const local = getLocalProduct(id);
    if (local?.id >= 195) {
      setOriginal(local);
      setValues({ ...initialValues, ...local, price: String(local.price ?? ''), stock: String(local.stock ?? '') });
      setIsLoading(false);
      return () => controller.abort();
    }
    getProduct(id, controller.signal).then((product) => {
      const patch = getLocalProduct(id);
      if (patch === null) throw new Error('Product not found.');
      const merged = { ...product, ...(patch || {}) };
      setOriginal(merged);
      setValues({ ...initialValues, ...merged, price: String(merged.price ?? ''), stock: String(merged.stock ?? '') });
    }).catch((requestError) => {
      if (!controller.signal.aborted) setPageError(requestError.message || 'Could not load product.');
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [id, isEdit]);

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (isSaving) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setPageError('');
    setIsSaving(true);
    const payload = { title: values.title.trim(), description: values.description.trim(), category: values.category, price: Number(values.price), stock: Number(values.stock), ...(values.thumbnail ? { thumbnail: values.thumbnail, images: [values.thumbnail] } : {}) };
    try {
      if (isEdit) {
        const saved = await updateProduct(id, payload);
        const updated = { ...original, ...payload, ...saved, id: Number(id) };
        saveProductUpdate(updated);
        router.replace(`/products/${id}`);
      } else {
        const saved = await addProduct(payload);
        const added = { ...payload, ...saved, thumbnail: saved.thumbnail || payload.thumbnail, images: saved.images?.length ? saved.images : payload.thumbnail ? [payload.thumbnail] : [] };
        saveAddedProduct(added);
        router.replace(`/products/${added.id}`);
      }
    } catch (requestError) {
      setPageError(requestError.message || `Could not ${isEdit ? 'update' : 'add'} product.`);
      setIsSaving(false);
    }
  }

  function inputClass(name) {
    return `field ${errors[name] ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`;
  }

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-4 py-12 text-sm text-slate-500">Loading product form…</main>;
  }

  const backUrl = isEdit ? `/products/${id}` : '/products';

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href={backUrl} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">← Cancel and go back</Link>

      <div className="mt-5">
        <p className="text-sm font-semibold text-indigo-600">Catalogue</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{isEdit ? 'Edit product' : 'Add product'}</h1>
        <p className="mt-2 text-sm text-slate-500">{isEdit ? 'Update the product details below.' : 'Create a new product in your local catalogue.'}</p>
      </div>

      <form onSubmit={onSubmit} className="panel mt-7 space-y-5 p-5 sm:p-7" noValidate>
        <FormField label="Title" name="title" errors={errors}>
          <input id="title" className={inputClass('title')} value={values.title} onChange={(event) => setField('title', event.target.value)} />
        </FormField>

        <FormField label="Description" name="description" errors={errors}>
          <textarea id="description" rows="4" className={inputClass('description')} value={values.description} onChange={(event) => setField('description', event.target.value)} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Category" name="category" errors={errors}>
            <select id="category" className={inputClass('category')} value={values.category} onChange={(event) => setField('category', event.target.value)}>
              <option value="">Select category</option>
              {categories.map((item) => <option key={item.slug || item} value={item.slug || item}>{item.name || titleCase(item)}</option>)}
            </select>
          </FormField>

          <FormField label="Image URL (optional)" name="thumbnail" errors={errors}>
            <input id="thumbnail" type="url" className={inputClass('thumbnail')} placeholder="https://…" value={values.thumbnail} onChange={(event) => setField('thumbnail', event.target.value)} />
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Price (USD)" name="price" errors={errors}>
            <input id="price" type="number" min="0" step="0.01" className={inputClass('price')} value={values.price} onChange={(event) => setField('price', event.target.value)} />
          </FormField>

          <FormField label="Stock" name="stock" errors={errors}>
            <input id="stock" type="number" min="0" step="1" className={inputClass('stock')} value={values.stock} onChange={(event) => setField('stock', event.target.value)} />
          </FormField>
        </div>

        {pageError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{pageError}</p>}

        <div className="flex justify-end gap-3 border-t pt-5">
          <Link href={backUrl} className="button-secondary">Cancel</Link>
          <button className="button-primary" disabled={isSaving}>{isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}</button>
        </div>
      </form>
    </main>
  );
}
