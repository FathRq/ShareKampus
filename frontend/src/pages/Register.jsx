import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { campusApi } from "../lib/api";
import { AuthLayout } from "../components/Layout";
import AuthSwitch from "../components/AuthSwitch";
import { PrimaryButton, SelectInput, TextInput } from "../components/ui";
import { ERROR_MESSAGE_ID } from "../lib/format";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSwitch = location.state?.fromSwitch === true;
  const [locations, setLocations] = useState([]);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", campus_location_id: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const loadLocations = () => {
    setLocLoading(true);
    setLocError(null);
    campusApi
      .listLocations()
      .then((locs) => setLocations(Array.isArray(locs) ? locs : []))
      .catch((e) => {
        setLocations([]);
        setLocError(e);
      })
      .finally(() => setLocLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLocations();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await register(form);
      navigate("/katalog", { replace: true });
    } catch (e2) {
      setErr(e2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Daftar dengan email kampus"
      subtitle="Satu akun untuk pinjam & barter di sekitar kampusmu."
      card={
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Alur verifikasi</p>
          <ol className="mt-3 space-y-3 text-sm text-gray-600">
            <li><span className="font-bold text-gray-900">1.</span> Isi nama lengkap</li>
            <li><span className="font-bold text-gray-900">2.</span> Isi email kampus resmi</li>
            <li><span className="font-bold text-gray-900">3.</span> Pilih lokasi kampus fisik terdekat</li>
            <li><span className="font-bold text-gray-900">4.</span> Langsung masuk & mulai cari barang</li>
          </ol>
        </div>
      }
    >
      <div className="mb-6">
        <AuthSwitch
          isLogin={false}
          initial={fromSwitch ? { x: 0 } : false}
          onChange={(v) => {
            if (v) navigate("/login", { state: { fromSwitch: true } });
          }}
        />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <TextInput
          label="Nama lengkap"
          required
          placeholder="Dian Pratama"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <TextInput
          label="Email kampus"
          type="email"
          required
          placeholder="NIM@mhs.unesa.ac.id"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div className="relative">
          <TextInput
            label="Kata sandi (min. 8 karakter)"
            type={showPw ? "text" : "password"}
            required
            minLength={8}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={showPw}
            className="absolute right-2 bottom-2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <SelectInput
          label="Lokasi kampus"
          required
          value={form.campus_location_id}
          onChange={(e) => setForm({ ...form, campus_location_id: e.target.value })}
        >
          <option value="">
            {locLoading ? "Memuat kampus..." : "Pilih lokasi kampus..."}
          </option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.campus_name} — {l.name}
            </option>
          ))}
        </SelectInput>
        {locError && (
          <p className="rounded-lg bg-warning-bg px-3 py-2 text-[13px] font-medium text-warning-text">
            Gagal memuat daftar kampus ({locError.message || "network error"}). Pastikan backend di{" "}
            {import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"} berjalan.{" "}
            <button type="button" onClick={loadLocations} className="font-bold underline">
              Coba lagi
            </button>
          </p>
        )}
        {!locLoading && !locError && locations.length === 0 && (
          <p className="rounded-lg bg-warning-bg px-3 py-2 text-[13px] font-medium text-warning-text">
            Daftar kampus kosong — database backend belum di-seed. Hubungi tim backend.
          </p>
        )}
        {err && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger-text">
            {ERROR_MESSAGE_ID[err.code] || err.message}
          </p>
        )}
        <PrimaryButton type="submit" isLoading={loading} className="w-full">
          Daftar
        </PrimaryButton>
        <p className="text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-primary-dark hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
