/**
 * Wishlist lokal (frontend-only): ID barang favorit tersimpan di
 * localStorage("sk-wishlist"). Beri tahu pendengar via event
 * "sk:wishlist-changed" agar daftar katalog ikut segar.
 */

const KEY = "sk-wishlist";
export const WISHLIST_EVENT = "sk:wishlist-changed";

export function readWishlist() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* abaikan — mode privat */
  }
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: ids }));
}

export function isFav(id) {
  return readWishlist().includes(id);
}

/** Toggle favorit; mengembalikan array ID terbaru. */
export function toggleFav(id) {
  const ids = readWishlist();
  const next = ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id];
  writeWishlist(next);
  return next;
}
