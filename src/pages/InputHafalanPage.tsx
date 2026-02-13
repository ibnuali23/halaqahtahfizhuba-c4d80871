import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSantri } from '@/hooks/useSantriData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CheckCircle, Plus, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const suratList = [
  'Al-Fatihah', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Maidah',
  'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Taubah', 'Yunus',
  'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan',
  'Asy-Syu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba\'', 'Fatir',
  'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Asy-Syura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jasiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Az-Zariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadalah', 'Al-Hasyr', 'Al-Mumtahanah',
  'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddassir', 'Al-Qiyamah',
  'Al-Insan', 'Al-Mursalat', 'An-Naba\'', 'An-Nazi\'at', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Insyiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-A\'la', 'Al-Gasyiyah', 'Al-Fajr', 'Al-Balad',
  'Asy-Syams', 'Al-Lail', 'Ad-Duha', 'Asy-Syarh', 'At-Tin',
  'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
  'Al-Qari\'ah', 'At-Takasur', 'Al-Asr', 'Al-Humazah', 'Al-Fil',
  'Quraisy', 'Al-Ma\'un', 'Al-Kausar', 'Al-Kafirun', 'An-Nasr',
  'Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
];

const bulanList = [
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
];

export default function InputHafalanPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: santriList, isLoading: loadingSantri } = useSantri();

  const [formData, setFormData] = useState({
    santriId: '',
    surat: '',
    ayatMulai: '',
    ayatAkhir: '',
    jumlahHalaman: '',
    bulan: '',
    tahun: new Date().getFullYear().toString(),
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
    totalJuz: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const addSetoranMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('setoran_hafalan')
        .insert({
          santri_id: data.santriId,
          bulan: data.bulan,
          tahun: parseInt(data.tahun),
          jumlah_halaman: parseFloat(data.jumlahHalaman),
          surat: data.surat,
          ayat: `${data.ayatMulai}-${data.ayatAkhir}`,
          tanggal: data.tanggal,
          keterangan: data.keterangan || null,
          recorded_by: user?.id,
        });

      if (error) throw error;

      // Update total juz in hafalan_summary if provided
      if (data.totalJuz) {
        const { error: summaryError } = await supabase
          .from('hafalan_summary')
          .upsert({
            santri_id: data.santriId,
            tahun: parseInt(data.tahun),
            total_hafalan: parseFloat(data.totalJuz)
          }, { onConflict: 'santri_id, tahun' });

        if (summaryError) {
          console.error('Error updating summary:', summaryError);
        }
      }
    },
    onSuccess: () => {
      toast.success('Setoran hafalan berhasil disimpan!');
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['setoran_hafalan'] });
      queryClient.invalidateQueries({ queryKey: ['hafalan_summary'] });
      queryClient.invalidateQueries({ queryKey: ['rekap_hafalan'] });

      setTimeout(() => {
        setFormData({
          santriId: '',
          surat: '',
          ayatMulai: '',
          ayatAkhir: '',
          jumlahHalaman: '',
          bulan: '',
          tahun: new Date().getFullYear().toString(),
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: '',
          totalJuz: '',
        });
        setShowSuccess(false);
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(`Gagal menyimpan: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.santriId || !formData.surat || !formData.jumlahHalaman || !formData.bulan) {
      toast.error('Lengkapi semua field yang wajib');
      return;
    }

    addSetoranMutation.mutate(formData);
  };

  const selectedSantri = santriList?.find((s) => s.id === formData.santriId);

  if (showSuccess) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh]"
        >
          <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-center">
            Setoran Berhasil Disimpan!
          </h2>
          <p className="text-muted-foreground mt-2">
            Data hafalan telah tercatat dalam sistem.
          </p>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Input Hafalan Baru
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'admin'
              ? 'Tambahkan setoran hafalan santri ke dalam sistem'
              : `Tambahkan setoran hafalan untuk halaqah ${user?.musyrifNama || ''}`
            }
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6 shadow-md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Santri Selection */}
            <div className="space-y-2">
              <Label htmlFor="santri">Nama Santri *</Label>
              {loadingSantri ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat data santri...
                </div>
              ) : (
                <Select
                  value={formData.santriId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, santriId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih santri" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {(santriList || []).map((santri) => (
                      <SelectItem key={santri.id} value={santri.id}>
                        {santri.nama} - {santri.kelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedSantri && (
                <p className="text-sm text-muted-foreground">
                  Musyrif: {selectedSantri.musyrif}
                </p>
              )}
            </div>

            {/* Bulan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulan">Bulan *</Label>
                <Select
                  value={formData.bulan}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bulan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {bulanList.map((bulan) => (
                      <SelectItem key={bulan} value={bulan}>
                        {bulan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun">Tahun *</Label>
                <Input
                  id="tahun"
                  type="number"
                  value={formData.tahun}
                  onChange={(e) =>
                    setFormData({ ...formData, tahun: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Surat */}
            <div className="space-y-2">
              <Label htmlFor="surat">Surat *</Label>
              <Select
                value={formData.surat}
                onValueChange={(value) =>
                  setFormData({ ...formData, surat: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih surat" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {suratList.map((surat) => (
                    <SelectItem key={surat} value={surat}>
                      {surat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ayat Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ayatMulai">Ayat Mulai</Label>
                <Input
                  id="ayatMulai"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.ayatMulai}
                  onChange={(e) =>
                    setFormData({ ...formData, ayatMulai: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ayatAkhir">Ayat Akhir</Label>
                <Input
                  id="ayatAkhir"
                  type="number"
                  min="1"
                  placeholder="10"
                  value={formData.ayatAkhir}
                  onChange={(e) =>
                    setFormData({ ...formData, ayatAkhir: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Jumlah Halaman */}
            <div className="space-y-2">
              <Label htmlFor="jumlahHalaman">Jumlah Halaman *</Label>
              <Input
                id="jumlahHalaman"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Contoh: 2.5"
                value={formData.jumlahHalaman}
                onChange={(e) =>
                  setFormData({ ...formData, jumlahHalaman: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Berdasarkan mushaf Madinah
              </p>
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal Setoran</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
              />
            </div>

            {/* Total Hafalan (Juz) */}
            <div className="space-y-2">
              <Label htmlFor="totalJuz">Update Total Hafalan (Juz) - Opsional</Label>
              <Input
                id="totalJuz"
                type="number"
                min="0"
                step="0.1"
                placeholder="Contoh: 15.5"
                value={formData.totalJuz}
                onChange={(e) =>
                  setFormData({ ...formData, totalJuz: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Isi jika ingin memperbarui total juz santri saat ini (Sinkron ke Rekap/Laporan)
              </p>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
              <Textarea
                id="keterangan"
                placeholder="Catatan tambahan..."
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={addSetoranMutation.isPending}
            >
              {addSetoranMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Simpan Setoran
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Help Text */}
        <div className="rounded-lg bg-accent border p-4">
          <h3 className="font-semibold text-sm mb-2">Panduan Input</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Pilih nama santri yang akan menyetor hafalan</li>
            <li>• Masukkan surat dan rentang ayat yang dihafalkan</li>
            <li>• Jumlah halaman berdasarkan mushaf Madinah</li>
            <li>• Pilih bulan untuk periode pencatatan</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
