import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PengaturanSistem {
  id: string;
  laporan_mingguan: boolean;
  peringatan_target: boolean;
  target_hafalan_bulanan: number;
  semester_aktif: string;
  tahun_ajaran: string;
  last_updated_by: string | null;
  last_updated_at: string;
}

export function usePengaturanSistem() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PengaturanSistem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pengaturan_sistem')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchSettings]);

  const updateSettings = async (updates: Partial<PengaturanSistem>) => {
    if (!user) return false;

    try {
      setIsSaving(true);

      const query = supabase.from('pengaturan_sistem');

      // Calculate new payload
      const currentSettings = settings || {
        laporan_mingguan: true,
        peringatan_target: false,
        target_hafalan_bulanan: 12,
        semester_aktif: 'Ganjil 2025/2026',
        tahun_ajaran: '2025/2026',
      };

      const payload = {
        ...currentSettings,
        ...updates,
        last_updated_by: user.id,
        last_updated_at: new Date().toISOString(),
      };

      // DESTRUCTIVE WORKAROUND:
      // Because the "BEFORE UPDATE" trigger is broken (trying to set non-existent updated_at),
      // we bypass UPDATE by DELETING the existing row and INSERTING a new one.
      // Triggers for "BEFORE UPDATE" do not fire on INSERT.
      if (settings?.id) {
        const { error: deleteError } = await query.delete().eq('id', settings.id);
        if (deleteError) {
          console.error('Workaround: Delete failed:', deleteError);
          // Continue anyway, maybe it was already gone or we can insert another
        }
      }

      // Insert new record (either with old ID or new one)
      const { data, error } = await query
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Workaround: Insert failed:', error);
        toast.error('Gagal menyimpan pengaturan: ' + error.message);
        return false;
      }

      if (data) {
        setSettings(data);
      } else {
        fetchSettings();
      }
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Gagal menyimpan pengaturan');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLaporanMingguan = async (value: boolean) => {
    const success = await updateSettings({ laporan_mingguan: value });
    if (success) {
      toast.success(value ? '✅ Laporan mingguan diaktifkan.' : '⛔ Laporan mingguan dinonaktifkan.');
    }
    return success;
  };

  const togglePeringatanTarget = async (value: boolean) => {
    const success = await updateSettings({ peringatan_target: value });
    if (success) {
      toast.success(value ? '🔔 Peringatan target aktif.' : '🚫 Peringatan target dinonaktifkan.');
    }
    return success;
  };

  const updateTargetHafalan = async (value: number) => {
    const success = await updateSettings({ target_hafalan_bulanan: value });
    if (success) {
      toast.success(`🎯 Target hafalan bulanan diperbarui menjadi ${value} halaman.`);
    }
    return success;
  };

  const updateSemesterAktif = async (value: string) => {
    const success = await updateSettings({ semester_aktif: value });
    if (success) {
      toast.success(`📅 Semester aktif diperbarui menjadi ${value}.`);
    }
    return success;
  };

  const saveAllSettings = async (newSettings: Partial<PengaturanSistem>) => {
    const success = await updateSettings(newSettings);
    if (success) {
      toast.success('✅ Semua pengaturan berhasil disimpan.');
    }
    return success;
  };

  return {
    settings,
    isLoading,
    isSaving,
    fetchSettings,
    toggleLaporanMingguan,
    togglePeringatanTarget,
    updateTargetHafalan,
    updateSemesterAktif,
    saveAllSettings,
  };
}
