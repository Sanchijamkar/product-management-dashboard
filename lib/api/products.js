import api from './client';

export async function getCategories(signal) {
  const { data } = await api.get('/products/categories', { signal });
  return data;
}

export async function getProducts({ query, category, limit, skip, sortBy, order, signal }) {
  const params = { limit, skip, ...(sortBy ? { sortBy, order } : {}) };
  const path = query
    ? '/products/search'
    : category
      ? `/products/category/${encodeURIComponent(category)}`
      : '/products';
  if (query) params.q = query;
  const { data } = await api.get(path, { params, signal });
  return data;
}

export async function getProduct(id, signal) {
  const { data } = await api.get(`/products/${id}`, { signal });
  return data;
}

export async function addProduct(product) {
  const { data } = await api.post('/products/add', product);
  return data;
}

export async function updateProduct(id, product) {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}
