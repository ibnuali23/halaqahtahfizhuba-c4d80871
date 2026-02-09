import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Loader2 } from 'lucide-react';
import { usePengaturanSistem, PengaturanSistem } from '@/hooks/usePengaturanSistem';

interface SystemSettingsSectionProps {
  onSettingsChange: (settings: Partial<PengaturanSistem>) => void;
  localSettings: Partial<PengaturanSistem>;
}

export function SystemSettingsSection({ onSettingsChange, localSettings }: SystemSettingsSectionProps) {
  const { settings, isLoading, toggleLaporanMingguan, togglePeringatanTarget } = usePengaturanSistem();

  const [targetHafalan, setTargetHafalan] = useState<string>('12');
  const [semesterAktif, setSemesterAktif] = useState<string>('Ganjil 2025/2026');

  useEffect(() => {
    if (settings) {
      setTargetHafalan(String(settings.target_hafalan_bulanan));
      setSemesterAktif(settings.semester_aktif);
    }
  }, [settings]);

  useEffect(() => {
    if (localSettings.target_hafalan_bulanan !== undefined) {
      setTargetHafalan(String(localSettings.target_hafalan_bulanan));
    }
    if (localSettings.semester_aktif) {
      setSemesterAktif(localSettings.semester_aktif);
    }
  }, [localSettings]);

  const handleTargetChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setTargetHafalan(value);
    onSettingsChange({ target_hafalan_bulanan: numValue });
  };

  const handleSemesterChange = (value: string) => {
    setSemesterAktif(value);
    onSettingsChange({ semester_aktif: value });
  };

  const handleLaporanToggle = async (checked: boolean) => {
    await toggleLaporanMingguan(checked);
  };

  const handlePeringatanToggle = async (checked: boolean) => {
    await togglePeringatanTarget(checked);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border bg-card p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Pengaturan Sistem</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="target-setting">Target Hafalan Bulanan</Label>
            <p className="text-sm text-muted-foreground">
              Jumlah halaman target per bulan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="target-setting"
              type="number"
              min="1"
              max="100"
              value={targetHafalan}
              onChange={(e) => handleTargetChange(e.target.value)}
              className="w-20 text-right"
            />
            <span className="text-sm text-muted-foreground">halaman</span>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="semester">Semester Aktif</Label>
            <p className="text-sm text-muted-foreground">
              Periode semester saat ini
            </p>
          </div>
          <Select value={semesterAktif} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ganjil 2025/2026">Ganjil 2025/2026</SelectItem>
              <SelectItem value="Genap 2025/2026">Genap 2025/2026</SelectItem>
              <SelectItem value="Ganjil 2026/2027">Ganjil 2026/2027</SelectItem>
              <SelectItem value="Genap 2026/2027">Genap 2026/2027</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="report-notif">Laporan Mingguan</Label>
            <p className="text-sm text-muted-foreground">
              Kirim ringkasan hafalan setiap minggu
            </p>
          </div>
          <Switch
            id="report-notif"
            checked={localSettings.laporan_mingguan ?? settings?.laporan_mingguan ?? true}
            onCheckedChange={handleLaporanToggle}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="target-notif">Peringatan Target</Label>
            <p className="text-sm text-muted-foreground">
              Notifikasi jika santri belum mencapai target
            </p>
          </div>
          <Switch
            id="target-notif"
            checked={localSettings.peringatan_target ?? settings?.peringatan_target ?? false}
            onCheckedChange={handlePeringatanToggle}
          />
        </div>
      </div>
    </motion.div>
  );
}
