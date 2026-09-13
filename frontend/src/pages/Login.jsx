import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/Layout";
import AuthSwitch from "../components/AuthSwitch";
import { PrimaryButton, TextInput } from "../components/ui";
import { ERROR_MESSAGE_ID } from "../lib/format";

function AuthSideCard() {
  return (
    <div className="rounded-2xl border border-hairline bg-paper p-6 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-gray">Kenapa ShareKampus?</p>
      <h2 className="mt-2 text-2xl font-bold leading-snug">
        Pinjam alat kuliah dari teman sekampus, tanpa beli baru.
      </h2>
      <ul className="mt-4 space-y-2.5 text-sm text-slate-gray">
        <li>✓ Verifikasi email kampus resmi</li>
        <li>✓ Radius 10 km dari kampus</li>
        <li>✓ Trust Score transparan tiap pemilik</li>
      </ul>
      <div className="mt-5 rounded-xl bg-pebble p-4">
        <p className="text-sm font-semibold text-ink-navy">Jas lab, kalkulator, buku semester</p>
        <p className="text-[13px] text-slate-gray">Semua idle asset kampus ada di sini.</p>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const fromSwitch = location.state?.fromSwitch === true;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await login(form);
      navigate(location.state?.from || "/", { replace: true });
    } catch (e2) {
      setErr(e2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk dengan email kampus untuk mulai meminjam."
      card={<AuthSideCard />}
    >
      <div className="mb-6">
        <AuthSwitch
          isLogin={true}
          initial={fromSwitch ? { x: "100%" } : false}
          onChange={(v) => {
            if (!v) navigate("/register", { state: { ...location.state, fromSwitch: true } });
          }}
        />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <TextInput
          label="Email kampus"
          type="email"
          required
          placeholder="NIM@mhs.unesa.ac.id"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextInput
          label="Kata sandi"
          type="password"
          required
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {err && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger-text">
            {ERROR_MESSAGE_ID[err.code] || err.message}
          </p>
        )}
        <PrimaryButton type="submit" isLoading={loading} className="w-full">
          Masuk
        </PrimaryButton>
        <p className="text-center text-sm text-slate-gray">
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-signal-blue hover:underline">
            Daftar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
