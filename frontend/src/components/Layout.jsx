import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import { PageBackground } from "./PageBackground";

export function ProtectedRoute() {
  const { isAuthed, booting } = useAuth();
  const location = useLocation();
  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-medium text-gray-600">
        Memuat sesi...
      </div>
    );
  }
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthed, booting } = useAuth();
  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-medium text-gray-600">
        Memuat sesi...
      </div>
    );
  }
  if (isAuthed) return <Navigate to="/katalog" replace />;
  return <Outlet />;
}

export function AppLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900">
      <PageBackground />
      <div className="relative flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-12">
          <Outlet />
        </main>
        <Footer />
        <BottomNav />
      </div>
    </div>
  );
}

export function AuthShell() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900">
      <PageBackground />
      <TopBar variant="auth" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

/** Two-column auth layout: form left, product card + blob right. Used inside AuthShell (centered). */
export function AuthLayout({ title, subtitle, children, card }) {
  return (
    <div className="flex w-full max-w-[1000px] items-center justify-center">
      <div className="grid w-full md:grid-cols-2 md:overflow-hidden md:rounded-3xl md:border md:border-gray-200 md:bg-white md:shadow-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:rounded-none md:border-0 md:shadow-none">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-gray-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <div className="relative hidden overflow-hidden bg-indigo-50/60 p-8 md:block">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-200/60 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl"
          />
          <div className="relative flex h-full flex-col justify-center">{card}</div>
        </div>
      </div>
    </div>
  );
}
