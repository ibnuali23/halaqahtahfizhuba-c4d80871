import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DataHafalanPage from "./pages/DataHafalanPage";
import InputHafalanPage from "./pages/InputHafalanPage";
import LaporanPage from "./pages/LaporanPage";
import SantriPage from "./pages/SantriPage";
import PengaturanPage from "./pages/PengaturanPage";
import ManageGuruPage from "./pages/ManageGuruPage";
import AbsensiPage from "./pages/AbsensiPage";
import AdminAbsensiPage from "./pages/AdminAbsensiPage";
import RekapBulananPage from "./pages/RekapBulananPage";
import WaliSantriDashboard from "./pages/WaliSantriDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect wali_santri away from protected edit pages to read-only rekap
  // Only redirect if they are NOT already trying to access rekap-hafalan
  if (user?.role === 'wali_santri' && location.pathname !== '/rekap-hafalan') {
    return <Navigate to="/rekap-hafalan" replace />;
  }

  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Wali Santri Route - only accessible by wali_santri role
function WaliSantriRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'wali_santri') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  // Determine redirect destination based on role
  const getHomeRoute = () => {
    if (!isAuthenticated) return "/login";
    if (user?.role === 'wali_santri') return "/rekap-hafalan";
    return "/dashboard";
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <LoginPage />}
      />
      {/* Redirect /register to /login - registration is disabled */}
      <Route
        path="/register"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={<Navigate to={getHomeRoute()} replace />}
      />
      {/* Wali Santri Dashboard */}
      <Route
        path="/wali-santri"
        element={<Navigate to="/rekap-hafalan" replace />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data-hafalan"
        element={
          <ProtectedRoute>
            <DataHafalanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/input-hafalan"
        element={
          <ProtectedRoute>
            <InputHafalanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laporan"
        element={
          <ProtectedRoute>
            <LaporanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/absensi"
        element={
          <ProtectedRoute>
            <AbsensiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/santri"
        element={
          <AdminRoute>
            <SantriPage />
          </AdminRoute>
        }
      />
      <Route
        path="/kelola-guru"
        element={
          <AdminRoute>
            <ManageGuruPage />
          </AdminRoute>
        }
      />
      <Route
        path="/pengaturan"
        element={
          <AdminRoute>
            <PengaturanPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin-absensi"
        element={
          <AdminRoute>
            <AdminAbsensiPage />
          </AdminRoute>
        }
      />
      <Route
        path="/rekap-hafalan"
        element={
          <ProtectedRoute>
            {user?.role === 'wali_santri' ? <WaliSantriDashboard /> : <RekapBulananPage />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/data-hafalan"
        element={<Navigate to="/rekap-hafalan" replace />}
      />
      <Route
        path="/rekap-bulanan"
        element={<Navigate to="/rekap-hafalan" replace />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
