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
    if (user?.role === 'admin') {
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

      // Send MINIMAL payload. No last_updated_at, no last_updated_by.
      // If a trigger is trying to use NEW.updated_at, it might fail regardless,
      // but let's see if simplifying the update helps.
      const payload = { ...updates };

      const { data, error } = settings?.id
        ? await query.update(payload).eq('id', settings.id).select().maybeSingle()
        : await query.upsert({ ...payload, tahun_ajaran: '2025/2026' }).select().maybeSingle();

      if (error) {
        console.error('Error updating settings:', error);
        toast.error('Gagal menyimpan pengaturan: ' + error.message);
        return false;
      }

      if (data) {
        setSettings(data);
      } else {
        fetchSettings();
      }
      return true;
    } catch (error: any) {
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
