import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucket = import.meta.env.VITE_ITEM_PHOTO_BUCKET || "item-photos";

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

let client = null;
export function getSupabase() {
  if (!client) {
    if (!isSupabaseConfigured()) throw new Error("Supabase belum dikonfigurasi (.env)");
    client = createClient(url, anonKey);
  }
  return client;
}

/** Upload 1 file gambar -> { url, path }. Path dipakai untuk cleanup bila submit gagal. */
export async function uploadItemPhoto(file) {
  const supabase = getSupabase();
  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Hapus file yang sudah terupload (best-effort, agar tidak jadi orphan). */
export async function cleanupUploadedPhotos(paths) {
  if (!paths || paths.length === 0) return;
  try {
    await getSupabase().storage.from(bucket).remove(paths);
  } catch {
    // best-effort — abaikan
  }
}
