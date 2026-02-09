import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } else {
      toast.error('Email atau password salah');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background islamic-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto h-20 w-20 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg"
          >
            <BookOpen className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="font-serif text-3xl font-bold text-primary">
            Ma'had Tahfizh
          </h1>
          <p className="text-xl font-serif text-secondary mt-1">
            Utsman bin Affan
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Bangkinang Kota
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl border shadow-xl p-8">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-semibold text-center">
              Masuk ke Sistem
            </h2>
            <p className="text-muted-foreground text-center text-sm mt-1">
              Sistem Manajemen Hafalan Al-Quran
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@mahad.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Pendaftaran ditutup. Hubungi Admin Ma'had untuk mendapatkan akses.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          © 2025 Ma'had Tahfizh Utsman bin Affan
        </p>
      </motion.div>
    </div>
  );
}
