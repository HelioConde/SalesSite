const PREFIX = 'salessite:v2:';
const canStore = () => {
  try { return window.localStorage; }
  catch (_) { return null; }
};
function read(key, fallback) {
  try {
    const raw = canStore()?.getItem(PREFIX + key);
    return raw === null || raw === undefined ? fallback : JSON.parse(raw);
  } catch (_) { return fallback; }
}
function write(key, value) {
  try { canStore()?.setItem(PREFIX + key, JSON.stringify(value)); }
  catch (_) { /* Modo privado ou quota cheia: compras continuam só nesta sessão. */ }
}
const validId = id => typeof id === 'string' && /^[a-z0-9-]+$/.test(id);
function normalizeCart(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id,qty]) =>
    validId(id) && Number.isInteger(qty) && qty > 0 && qty <= 99));
}
let cart = normalizeCart(read('cart', {}));
let favorites = new Set((Array.isArray(read('favorites', [])) ? read('favorites', []) : []).filter(validId));
export const getCart = () => ({ ...cart });
export const getFavorites = () => new Set(favorites);
export function cartCount() { return Object.values(cart).reduce((sum, n) => sum + n, 0); }
export function setQuantity(id, quantity) {
  if (!validId(id)) return;
  const n = Number(quantity);
  if (!Number.isInteger(n)) return;
  if (n <= 0) delete cart[id];
  else cart[id] = Math.min(99, n);
  write('cart', cart);
}
export function addToCart(id) { setQuantity(id, (cart[id] || 0) + 1); }
export function clearCart() { cart = {}; write('cart', cart); }
export function toggleFavorite(id) {
  if (!validId(id)) return false;
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  write('favorites', [...favorites]);
  return favorites.has(id);
}
