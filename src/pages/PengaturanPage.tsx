import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Database, Loader2 } from 'lucide-react';
import { usePengaturanSistem, PengaturanSistem } from '@/hooks/usePengaturanSistem';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { DataExportImport } from '@/components/settings/DataExportImport';
import { SystemSettingsSection } from '@/components/settings/SystemSettingsSection';
import { SantriSettingsSection } from '@/components/settings/SantriSettingsSection';

export default function PengaturanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { settings, isSaving, saveAllSettings } = usePengaturanSistem();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<Partial<PengaturanSistem>>({});

  const handleSettingsChange = (updates: Partial<PengaturanSistem>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (Object.keys(localSettings).length > 0) {
      await saveAllSettings(localSettings);
      setLocalSettings({});
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Pengaturan
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola pengaturan sistem dan akun
          </p>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Profil Pengguna</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div>
                <p className="font-medium">{user?.nama}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                {user?.role === 'admin' ? 'Admin' : user?.role === 'wali_santri' ? 'Wali Santri' : 'Guru Halaqah'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Notifikasi</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notif">Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi via email
                </p>
              </div>
              <Switch id="email-notif" defaultChecked />
            </div>
          </div>
        </motion.div>

        {/* System Settings - Admin Only */}
        {user?.role === 'admin' && (
          <>
            <SystemSettingsSection
              onSettingsChange={handleSettingsChange}
              localSettings={localSettings}
            />

            <SantriSettingsSection />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Data & Backup</h2>
              </div>
              <DataExportImport />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Keamanan</h2>
              </div>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Ubah Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/kelola-guru')}
                >
                  Kelola Pengguna
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Non-admin users can also change their password */}
        {user?.role !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Keamanan</h2>
            </div>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setPasswordDialogOpen(true)}
              >
                Ubah Password
              </Button>
            </div>
          </motion.div>
        )}

        {/* Save Button - Admin Only */}
        {user?.role === 'admin' && (
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              size="lg"
              disabled={isSaving || Object.keys(localSettings).length === 0}
              className="min-w-[180px]"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        )}
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </Layout>
  );
}
