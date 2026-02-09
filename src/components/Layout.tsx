import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  FilePlus,
  FileText,
  Settings,
  LogOut,
  Users,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/data-hafalan', label: 'Data Hafalan', icon: BookOpen },
  { path: '/input-hafalan', label: 'Input Hafalan', icon: FilePlus },
  { path: '/rekap-bulanan', label: 'Rekap Bulanan', icon: FileText },
  { path: '/rekap-hafalan', label: 'Rekap Hafalan', icon: BookOpen, waliOnly: true },
  { path: '/laporan', label: 'Laporan', icon: FileText },
  { path: '/absensi', label: 'Absensi Saya', icon: Clock, guruOnly: true },
  { path: '/admin-absensi', label: 'Laporan Absensi', icon: Clock, adminOnly: true },
  { path: '/santri', label: 'Data Santri', icon: Users, adminOnly: true },
  { path: '/kelola-guru', label: 'Kelola Pengguna', icon: Users, adminOnly: true },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings, adminOnly: true },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter((item) => {
    // Hide admin-only items from non-admin
    if (item.adminOnly && user?.role !== 'admin') return false;
    // Hide guru-only items from admin (admin has separate absensi management)
    if (item.guruOnly && user?.role === 'admin') return false;
    // Hide wali-only items from non-wali
    if (item.waliOnly && user?.role !== 'wali_santri') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-accent rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif text-lg font-bold">م</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-serif text-lg font-bold text-primary leading-tight">
                  Ma'had Tahfizh
                </h1>
                <p className="text-xs text-muted-foreground">Utsman bin Affan</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.nama}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role === 'admin' ? 'Kasi Tahfizh' : user?.role === 'wali_santri' ? 'Wali Santri' : 'Guru Halaqah'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden fixed inset-x-0 top-16 z-40 bg-card border-b shadow-lg"
        >
          <nav className="container py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="container py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container py-6 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Ma'had Tahfizh Utsman bin Affan Bangkinang Kota
          </p>
        </div>
      </footer>
    </div>
  );
}
