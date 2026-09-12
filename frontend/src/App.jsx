import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout, ProtectedRoute } from "./components/Layout";

const LoginPage = lazy(() => import("./pages/Login").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/Register").then((m) => ({ default: m.RegisterPage })));
const HomePage = lazy(() => import("./pages/Home").then((m) => ({ default: m.HomePage })));
const AddItemPage = lazy(() => import("./pages/AddItem").then((m) => ({ default: m.AddItemPage })));
const TransactionsPage = lazy(() =>
  import("./pages/Transactions").then((m) => ({ default: m.TransactionsPage }))
);
const TransactionDetailPage = lazy(() =>
  import("./pages/TransactionDetail").then((m) => ({ default: m.TransactionDetailPage }))
);
const ProfilePage = lazy(() => import("./pages/Profile").then((m) => ({ default: m.ProfilePage })));

function PageFallback() {
  return (
    <div className="mx-auto max-w-[640px] space-y-3 py-10">
      <div className="h-6 w-48 animate-pulse rounded bg-pebble" />
      <div className="rounded-2xl border border-hairline bg-paper p-6 shadow-linkcard">
        <div className="h-4 w-2/3 animate-pulse rounded bg-pebble" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-pebble" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route index element={<HomePage />} />
                <Route path="/tambah" element={<AddItemPage />} />
                <Route path="/transaksi" element={<TransactionsPage />} />
                <Route path="/transaksi/:id" element={<TransactionDetailPage />} />
                <Route path="/profil" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
