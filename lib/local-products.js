const STORAGE_KEY = 'product-admin-local-mutations';

const emptyState = () => ({ added: [], updates: {}, deleted: [] });

function readState() {
  if (typeof window === 'undefined') return emptyState();
  try {
    return { ...emptyState(), ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return emptyState();
  }
}

function writeState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveAddedProduct(product) {
  const state = readState();
  state.added = [product, ...state.added.filter((item) => item.id !== product.id)];
  writeState(state);
}

export function saveProductUpdate(product) {
  const state = readState();
  state.updates[product.id] = { ...(state.updates[product.id] || {}), ...product };
  writeState(state);
}

export function saveProductDeletion(id) {
  const state = readState();
  state.deleted = [...new Set([...state.deleted, id])];
  state.added = state.added.filter((product) => product.id !== id);
  writeState(state);
}

export function getLocalProduct(id) {
  const state = readState();
  if (state.deleted.includes(Number(id))) return null;
  return state.added.find((product) => product.id === Number(id)) || state.updates[Number(id)];
}

export function applyLocalChanges(products) {
  const state = readState();
  return products
    .filter((product) => !state.deleted.includes(product.id))
    .map((product) => ({ ...product, ...(state.updates[product.id] || {}) }));
}

export function getAddedProducts() {
  return readState().added;
}
