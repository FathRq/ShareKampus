import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";

export function ProtectedRoute() {
  const { isAuthed, booting } = useAuth();
  const location = useLocation();
  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud text-sm font-medium text-slate-gray">
        Memuat sesi...
      </div>
    );
  }
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-cloud text-ink-navy">
      <TopBar />
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 md:pb-12">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

/** Two-column auth layout: form left, product card + blob right (blob only here). */
export function AuthLayout({ title, subtitle, children, card }) {
  return (
    <div className="relative mx-auto grid w-full max-w-[1000px] items-stretch gap-8 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden md:hidden"
      >
        <div className="absolute -top-10 -right-16 h-56 w-56 rounded-full bg-coral-magenta/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-sky-cyan/20 blur-3xl" />
      </div>
      <div className="relative grid md:grid-cols-2 md:overflow-hidden md:rounded-3xl md:border md:border-hairline md:bg-paper md:shadow-card">
        <div className="rounded-2xl border border-hairline bg-paper p-6 shadow-linkcard md:rounded-none md:border-0 md:shadow-none">
          <h1 className="text-[28px] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-slate-gray">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <div className="relative hidden overflow-hidden bg-pebble p-8 md:block">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-coral-magenta/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-sky-cyan/30 blur-3xl"
          />
          <div className="relative flex h-full flex-col justify-center">{card}</div>
        </div>
      </div>
    </div>
  );
}
