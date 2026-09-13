import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Loader2, LocateFixed, X } from "lucide-react";
import { campusApi, itemApi } from "../lib/api";
import { cleanupUploadedPhotos, isSupabaseConfigured, uploadItemPhoto } from "../lib/supabase";
import { useGeolocation } from "../hooks/useGeolocation";
import { PrimaryButton, SelectInput, TextArea, TextInput } from "../components/ui";
import { ERROR_MESSAGE_ID } from "../lib/format";

const CATEGORIES = [
  { value: "buku", label: "Buku" },
  { value: "alat_lab", label: "Alat Lab" },
  { value: "elektronik", label: "Elektronik" },
  { value: "lainnya", label: "Lainnya" },
];

const TX_TYPES = [
  { value: "pinjam", label: "Pinjam" },
  { value: "barter", label: "Barter" },
  { value: "keduanya", label: "Pinjam / Barter" },
];

const FALLBACK_UNESA = { lat: -7.314146, lng: 112.726428 };

export function AddItemPage() {
  const storageReady = isSupabaseConfigured();
  const { coords, status: geoStatus, request: requestGeo, setCoords } = useGeolocation();
  const [locations, setLocations] = useState([]);
  const [campusId, setCampusId] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "buku",
    transaction_type: "pinjam",
    market_price: "",
    max_loan_days: "7",
    latitude: "",
    longitude: "",
  });
  const [files, setFiles] = useState([]); // File[] — wajib ≥1, maks 3
  const [previews, setPreviews] = useState([]); // object URLs

  const [sending, setSending] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [err, setErr] = useState(null);
  const [doneId, setDoneId] = useState(null);

  useEffect(() => {
    campusApi
      .listLocations()
      .then((locs) => {
        setLocations(locs);
        const first = locs[0];
        const fallback = first ? { lat: first.latitude, lng: first.longitude } : FALLBACK_UNESA;
        if (first) setCampusId(first.id);
        requestGeo(fallback);
      })
      .catch(() => requestGeo(FALLBACK_UNESA));
  }, [requestGeo]);

  // Sync coords -> form once (user can still edit manually)
  useEffect(() => {
    if (coords) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((f) => ({
        ...f,
        latitude: f.latitude || String(coords.lat),
        longitude: f.longitude || String(coords.lng),
      }));
    }
  }, [coords]);

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const pickFiles = (e) => {
    const list = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    const kept = [...files, ...list].slice(0, 3);
    setFiles(kept);
    setPreviews(kept.map((f) => URL.createObjectURL(f)));
  };

  const useCampusPoint = () => {
    const loc = locations.find((l) => l.id === campusId) || locations[0];
    if (!loc) return;
    setCoords({ lat: loc.latitude, lng: loc.longitude });
    setForm({ ...form, latitude: String(loc.latitude), longitude: String(loc.longitude) });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErr(null);
    setUploadNote("");
    try {
      const lat = Number(String(form.latitude).replace(",", "."));
      const lng = Number(String(form.longitude).replace(",", "."));
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw { code: "VALIDATION_ERROR", message: "Latitude & longitude harus angka valid" };
      }
      const price = Number(form.market_price);
      if (!Number.isFinite(price) || price < 0) {
        throw { code: "VALIDATION_ERROR", message: "Harga pasar harus angka ≥ 0" };
      }
      if (!storageReady) {
        throw { code: "VALIDATION_ERROR", message: "Upload foto belum terkonfigurasi (Supabase .env kosong)" };
      }
      if (files.length === 0) {
        throw { code: "VALIDATION_ERROR", message: "Tambahkan minimal 1 foto barang" };
      }

      setUploadNote(`Mengunggah ${files.length} foto...`);
      const uploadedPaths = [];
      const urls = [];
      try {
        for (const f of files) {
          if (f.size > 2 * 1024 * 1024) {
            throw { code: "VALIDATION_ERROR", message: `File ${f.name} > 2MB, kecilkan dulu` };
          }
          const { url, path } = await uploadItemPhoto(f);
          urls.push(url);
          uploadedPaths.push(path);
        }
      } catch (uploadErr) {
        // Bersihkan file yang sudah terupload agar bucket tidak kotor (orphan)
        await cleanupUploadedPhotos(uploadedPaths);
        throw uploadErr?.code ? uploadErr : { code: "UPLOAD_FAILED", message: `Gagal mengunggah foto: ${uploadErr?.message || "unknown error"}` };
      }
      const photo_urls = urls;
      setUploadNote("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        transaction_type: form.transaction_type,
        market_price: price,
        photo_urls,
        latitude: lat,
        longitude: lng,
        max_loan_days: Number(form.max_loan_days) || 7,
      };
      const data = await itemApi.create(payload);
      setDoneId(data?.item_id || "ok");
    } catch (e2) {
      setUploadNote("");
      setErr(e2?.code ? e2 : { code: "UNKNOWN", message: String(e2?.message || e2) });
    } finally {
      setSending(false);
    }
  };

  if (doneId) {
    return (
      <div className="mx-auto max-w-[560px] py-12 text-center">
        <div className="rounded-2xl border border-hairline bg-paper p-8 shadow-card">
          <p className="text-4xl">🎉</p>
          <h1 className="mt-3 text-2xl font-bold">Barang berhasil dibagikan!</h1>
          <p className="mt-2 text-sm text-slate-gray">
            ID: <code className="rounded bg-pebble px-1.5 py-0.5">{doneId}</code> — sudah muncul di
            katalog dalam radius kampus.
          </p>
          <div className="mt-6 flex gap-2">
            <Link
              to="/"
              className="flex-1 rounded-lg bg-signal-blue px-4 py-2.5 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 focus-visible:ring-offset-2"
            >
              Lihat katalog
            </Link>
            <button
              onClick={() => {
                setDoneId(null);
                setForm({
                  title: "",
                  description: "",
                  category: "buku",
                  transaction_type: "pinjam",
                  market_price: "",
                  max_loan_days: "7",
                  latitude: "",
                  longitude: "",
                });
                setFiles([]);
                setPreviews([]);
              }}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-ink-navy transition-all duration-150 hover:bg-pebble active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 focus-visible:ring-offset-2"
            >
              Tambah lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <h1 className="text-3xl font-bold">Bagikan barang</h1>
      <p className="mt-2 text-[15px] text-slate-gray">
        Lengkapi detail di bawah. Barang langsung tampil di katalog nearby setelah tersimpan.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-hairline bg-paper p-5 shadow-linkcard sm:p-6">
        <TextInput label="Judul barang *" required placeholder="Jas lab ukuran M" value={form.title} onChange={set("title")} />

        <TextArea
          label="Deskripsi"
          value={form.description}
          onChange={set("description")}
          placeholder="Kondisi, ukuran, kelengkapan..."
        />

        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <SelectInput label="Kategori *" value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </SelectInput>
          <SelectInput label="Tipe transaksi *" value={form.transaction_type} onChange={set("transaction_type")}>
            {TX_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </SelectInput>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <TextInput
            label="Harga pasar (Rp) *"
            required
            inputMode="numeric"
            placeholder="150000"
            value={form.market_price}
            onChange={set("market_price")}
          />
          <TextInput
            label="Maks. hari pinjam"
            inputMode="numeric"
            placeholder="7"
            value={form.max_loan_days}
            onChange={set("max_loan_days")}
          />
        </div>

        {/* FOTO — upload-only via Supabase Storage, wajib ≥1 */}
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-navy">
            Foto barang * (wajib 1–3)
          </span>
          {!storageReady ? (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-text">
              Upload foto belum terkonfigurasi (Supabase .env kosong). Hubungi tim backend.
            </p>
          ) : (
            <>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-hairline bg-pebble px-4 py-6 text-sm font-semibold text-slate-gray transition-all duration-150 hover:border-signal-blue hover:text-signal-blue focus-within:border-signal-blue focus-within:ring-2 focus-within:ring-signal-blue/25 active:scale-[0.99]">
                <ImagePlus size={18} />
                {files.length === 0 ? "Pilih foto dari HP (jpg/png, maks 2MB/file)" : "Tambah foto lagi"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={pickFiles} />
              </label>
              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {previews.map((u, i) => (
                    <div key={u} className="relative overflow-hidden rounded-xl border border-hairline">
                      <img src={u} alt={`preview ${i + 1}`} className="aspect-square w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFiles(files.filter((_, j) => j !== i));
                          setPreviews(previews.filter((_, j) => j !== i));
                        }}
                        className="absolute right-1 top-1 rounded-full bg-ink-navy/70 p-1 text-white"
                        aria-label="Hapus foto"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* LOKASI */}
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-navy">Lokasi barang *</span>
          <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
            <TextInput required placeholder="-7.314" value={form.latitude} onChange={set("latitude")} />
            <TextInput required placeholder="112.726" value={form.longitude} onChange={set("longitude")} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="rounded-full bg-pebble px-2.5 py-1 font-semibold text-slate-gray">
              {geoStatus === "loading" ? "Mencari GPS..." : coords ? "GPS aktif" : "Titik kampus"}
            </span>
            {locations.length > 0 && (
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="max-w-full rounded-full border border-hairline bg-pebble px-2.5 py-1 font-semibold outline-none transition-all duration-150 hover:border-mist-gray focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/25"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.campus_name} — {l.name}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={useCampusPoint}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-signal-blue transition-all duration-150 hover:bg-pebble active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/40"
            >
              <LocateFixed size={14} /> Pakai titik kampus
            </button>
          </div>
        </div>

        {uploadNote && <p className="flex items-center gap-2 text-sm text-slate-gray"><Loader2 size={15} className="animate-spin" />{uploadNote}</p>}
        {err && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger-text">
            {ERROR_MESSAGE_ID[err.code] || err.message}
          </p>
        )}
        <PrimaryButton type="submit" isLoading={sending} disabled={files.length === 0} className="w-full">
          {files.length === 0 ? "Pilih foto dulu" : "Bagikan barang"}
        </PrimaryButton>
      </form>
    </div>
  );
}
