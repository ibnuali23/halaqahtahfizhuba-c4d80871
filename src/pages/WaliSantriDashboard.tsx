import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, LogOut, Calendar, FileText } from 'lucide-react';
import { format, getMonth, getYear, startOfMonth, endOfMonth } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const BULAN_OPTIONS = [
  { value: '0', label: 'Januari' },
  { value: '1', label: 'Februari' },
  { value: '2', label: 'Maret' },
  { value: '3', label: 'April' },
  { value: '4', label: 'Mei' },
  { value: '5', label: 'Juni' },
  { value: '6', label: 'Juli' },
  { value: '7', label: 'Agustus' },
  { value: '8', label: 'September' },
  { value: '9', label: 'Oktober' },
  { value: '10', label: 'November' },
  { value: '11', label: 'Desember' },
];

const TAHUN_OPTIONS = ['2024', '2025', '2026'];

interface SetoranDetail {
  id: string;
  tanggal: string;
  surat: string;
  ayat: string;
  jumlah_halaman: number;
  catatan?: string;
  santri?: {
    nama: string;
    kelas: string;
    musyrif: string;
  };
}

export default function WaliSantriDashboard() {
  const { user, logout } = useAuth();
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(String(getMonth(now)));
  const [selectedTahun, setSelectedTahun] = useState(String(getYear(now)));
  const [selectedSetoran, setSelectedSetoran] = useState<SetoranDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch setoran data for the selected month
  const { data: setoranList, isLoading } = useQuery({
    queryKey: ['wali-setoran-bulanan', selectedBulan, selectedTahun],
    queryFn: async () => {
      const bulanInt = parseInt(selectedBulan);
      const tahunInt = parseInt(selectedTahun);
      const startDate = startOfMonth(new Date(tahunInt, bulanInt, 1));
      const endDate = endOfMonth(new Date(tahunInt, bulanInt, 1));

      const { data, error } = await supabase
        .from('setoran_hafalan')
        .select(`
          *,
          santri:santri_id (
            nama,
            kelas,
            musyrif
          )
        `)
        .gte('tanggal', format(startDate, 'yyyy-MM-dd'))
        .lte('tanggal', format(endDate, 'yyyy-MM-dd'))
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return data as SetoranDetail[];
    },
  });

  // Calculate total pages for the month
  const totalHalaman = setoranList?.reduce((acc, s) => acc + (s.jumlah_halaman || 0), 0) || 0;
  const totalSetoran = setoranList?.length || 0;

  const handleLogout = async () => {
    await logout();
  };

  const handleRowClick = (setoran: SetoranDetail) => {
    setSelectedSetoran(setoran);
    setIsDetailOpen(true);
  };

  const selectedBulanLabel = BULAN_OPTIONS.find(b => b.value === selectedBulan)?.label || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold text-primary">
                  Ma'had Tahfizh Utsman bin Affan
                </h1>
                <p className="text-sm text-muted-foreground">Portal Wali Santri</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut size={16} />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            📘 Rekap Setoran Hafalan Bulanan
          </h2>
          <p className="text-muted-foreground mt-1">
            Lihat semua setoran hafalan santri untuk bulan yang dipilih
          </p>
        </motion.div>

        {/* Month/Year Filter & Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pilih Periode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="space-y-1">
                <label className="text-sm font-medium">Bulan</label>
                <Select value={selectedBulan} onValueChange={setSelectedBulan}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BULAN_OPTIONS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tahun</label>
                <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAHUN_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1" />
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{totalSetoran}</p>
                  <p className="text-xs text-muted-foreground">Total Setoran</p>
                </div>
                <div className="text-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalHalaman.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Total Halaman</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setoran Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">
              Daftar Setoran - {selectedBulanLabel} {selectedTahun}
            </CardTitle>
            <CardDescription>
              Klik baris untuk melihat detail setoran
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Santri</TableHead>
                    <TableHead>Surat</TableHead>
                    <TableHead>Ayat</TableHead>
                    <TableHead>Halaman</TableHead>
                    <TableHead>Guru Pembimbing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : setoranList?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada setoran di bulan {selectedBulanLabel} {selectedTahun}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    setoranList?.map((setoran) => (
                      <TableRow
                        key={setoran.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(setoran)}
                      >
                        <TableCell>
                          {format(new Date(setoran.tanggal), 'dd MMM yyyy', { locale: localeId })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {setoran.santri?.nama || '-'}
                        </TableCell>
                        <TableCell>{setoran.surat || '-'}</TableCell>
                        <TableCell>{setoran.ayat || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{setoran.jumlah_halaman}</Badge>
                        </TableCell>
                        <TableCell>{setoran.santri?.musyrif || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Footer */}
        {setoranList && setoranList.length > 0 && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg text-center">
            <p className="text-lg font-medium">
              📊 Total Hafalan Bulan {selectedBulanLabel}: <span className="text-primary font-bold">{totalHalaman.toFixed(1)} Halaman</span>
            </p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Detail Setoran Hafalan</DialogTitle>
          </DialogHeader>
          {selectedSetoran && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">📅 Tanggal Setor</p>
                  <p className="font-medium">
                    {format(new Date(selectedSetoran.tanggal), 'dd MMMM yyyy', { locale: localeId })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">👤 Nama Santri</p>
                  <p className="font-medium">{selectedSetoran.santri?.nama || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">📖 Surat</p>
                  <p className="font-medium">{selectedSetoran.surat || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">📝 Ayat</p>
                  <p className="font-medium">{selectedSetoran.ayat || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">📄 Jumlah Halaman</p>
                  <p className="font-medium text-lg text-primary">{selectedSetoran.jumlah_halaman}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">👨‍🏫 Guru Halaqah</p>
                  <p className="font-medium">{selectedSetoran.santri?.musyrif || '-'}</p>
                </div>
              </div>
              {selectedSetoran.catatan && (
                <div>
                  <p className="text-sm text-muted-foreground">💬 Catatan</p>
                  <p className="font-medium">{selectedSetoran.catatan}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2025 Ma'had Tahfizh Utsman bin Affan - Bangkinang Kota
        </div>
      </footer>
    </div>
  );
}
