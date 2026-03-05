import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRekapHafalan, bulanList, getCurrentBulan, RekapSantri } from '@/hooks/useRekapHafalan';
import { supabase } from '@/integrations/supabase/client';
import { getWIBTime } from '@/hooks/useAbsensi';
import { Download, Printer, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const months = bulanList;
const currentYear = getWIBTime().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // 5 years back, current, 5 years forward

export default function LaporanPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentBulan());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterHalaqah, setFilterHalaqah] = useState<string>('all');

  const { data: rekapData, isLoading } = useRekapHafalan(selectedMonth, selectedYear);

  // monthlyData now comes from rekapData.rekap
  const monthlyData: RekapSantri[] = useMemo(() => rekapData?.rekap || [], [rekapData]);

  const halaqahNames = Array.from(new Set(monthlyData.map((s) => s.halaqah))).sort() as string[];

  let filteredData = monthlyData;
  if (filterKelas !== 'all') {
    filteredData = filteredData.filter((h) => h.kelas === filterKelas);
  }
  if (filterHalaqah !== 'all' && user?.role === 'admin') {
    filteredData = filteredData.filter((h) => h.halaqah === filterHalaqah);
  }


  // Calculate stats based on filtered data
  const totalBulanIni = filteredData.reduce((acc, h) => acc + h.totalHalamanBulan, 0);
  const totalSantri = filteredData.length;
  const santriAktif = filteredData.filter((h) => h.isActive).length;
  const rataRata = totalSantri > 0 ? (totalBulanIni / totalSantri).toFixed(1) : '0';

  // Target achievement (using same logic: 12 pages/month)
  const tercapai = filteredData.filter((s) => s.totalHalamanBulan >= 12).length;

  // Group data for summaries
  const getHafalanByMusyrif = () => {
    const grouped = filteredData.reduce((acc, s) => {
      if (!acc[s.halaqah]) {
        acc[s.halaqah] = {
          musyrif: s.halaqah,
          jumlahSantri: 0,
          terbaik: { nama: s.santriNama, amount: s.totalHalamanBulan },
          terendah: { nama: s.santriNama, amount: s.totalHalamanBulan }
        };
      }
      acc[s.halaqah].jumlahSantri += 1;
      if (s.totalHalamanBulan > acc[s.halaqah].terbaik.amount) {
        acc[s.halaqah].terbaik = { nama: s.santriNama, amount: s.totalHalamanBulan };
      }
      if (s.totalHalamanBulan < acc[s.halaqah].terendah.amount) {
        acc[s.halaqah].terendah = { nama: s.santriNama, amount: s.totalHalamanBulan };
      }
      return acc;
    }, {} as Record<string, {
      musyrif: string;
      jumlahSantri: number;
      terbaik: { nama: string; amount: number };
      terendah: { nama: string; amount: number };
    }>);

    return Object.values(grouped).sort((a, b) => a.musyrif.localeCompare(b.musyrif));
  };

  const getHafalanByKelas = () => {
    const grouped = filteredData.reduce((acc, s) => {
      if (!acc[s.kelas]) {
        acc[s.kelas] = {
          kelas: s.kelas,
          jumlahSantri: 0,
          terbaik: { nama: s.santriNama, amount: s.totalHalamanBulan },
          terendah: { nama: s.santriNama, amount: s.totalHalamanBulan }
        };
      }
      acc[s.kelas].jumlahSantri += 1;
      if (s.totalHalamanBulan > acc[s.kelas].terbaik.amount) {
        acc[s.kelas].terbaik = { nama: s.santriNama, amount: s.totalHalamanBulan };
      }
      if (s.totalHalamanBulan < acc[s.kelas].terendah.amount) {
        acc[s.kelas].terendah = { nama: s.santriNama, amount: s.totalHalamanBulan };
      }
      return acc;
    }, {} as Record<string, {
      kelas: string;
      jumlahSantri: number;
      terbaik: { nama: string; amount: number };
      terendah: { nama: string; amount: number };
    }>);

    return Object.values(grouped).sort((a, b) => a.kelas.localeCompare(b.kelas));
  };

  const hafalanByMusyrif = user?.role === 'admin'
    ? getHafalanByMusyrif()
    : getHafalanByMusyrif().filter(m => m.musyrif === user?.musyrifNama);

  const hafalanByKelas = getHafalanByKelas();

  const handlePrint = () => {
    window.print();
    toast.success('Membuka dialog cetak...');
  };

  const handleExportPDF = () => {
    // Export as CSV for now
    const headers = ['No', 'Nama Santri', 'Halaqah', 'Angkatan', `Hafalan ${selectedMonth}`, 'Update Terakhir', 'Total Juz', 'Status'];
    const rows = filteredData.map((item, index) => [
      index + 1,
      item.santriNama,
      item.halaqah,
      item.kelas,
      item.totalHalamanBulan,
      item.ayatTerakhir,
      item.totalHalamanBulan >= 12 ? 'Tercapai' : 'Tidak Tercapai',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_${selectedMonth}_${selectedYear}.csv`;
    link.click();

    toast.success('Laporan berhasil diekspor!');
  };

  const getKelasBadgeVariant = (kelas: string) => {
    if (kelas === 'Angkatan 1') return 'default';
    if (kelas === 'Angkatan 2') return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Memuat data...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Laporan Bulanan
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'admin'
                ? 'Rekap hafalan santri per bulan - Seluruh Halaqah'
                : `Rekap hafalan santri per bulan - Halaqah ${user?.musyrifNama || ''}`
              }
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {user?.role === 'admin' && (
              <Select value={filterHalaqah} onValueChange={setFilterHalaqah}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Semua Halaqah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Halaqah</SelectItem>
                  {halaqahNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Semua Angkatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Angkatan</SelectItem>
                <SelectItem value="Angkatan 1">Angkatan 1</SelectItem>
                <SelectItem value="Angkatan 2">Angkatan 2</SelectItem>
                <SelectItem value="Angkatan 3">Angkatan 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer size={18} />
              Cetak
            </Button>
            <Button onClick={handleExportPDF} className="gap-2">
              <Download size={18} />
              Export
            </Button>
          </div>
        </div>

        {/* Report Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6 text-center print:border-none"
        >
          <h2 className="font-serif text-2xl font-bold text-primary">
            LAPORAN HALAQAH ALQURAN
          </h2>
          <h3 className="font-serif text-xl font-semibold mt-1">
            MA'HAD TAHFIZH UTSMAN BIN AFFAN
          </h3>
          <p className="text-muted-foreground">Bangkinang Kota</p>
          <div className="mt-4 inline-block px-4 py-2 bg-accent rounded-lg">
            <p className="font-semibold">
              Periode: {selectedMonth} {selectedYear}
              {user?.role !== 'admin' && ` | Halaqah: ${user?.musyrifNama || ''}`}
            </p>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">Total Halaman</p>
            <p className="text-2xl font-bold text-primary">{totalBulanIni.toFixed(1)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
            <p className="text-sm text-muted-foreground">Rata-rata</p>
            <p className="text-2xl font-bold text-secondary">{rataRata} hal</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-muted-foreground">Tercapai Target</p>
            <p className="text-2xl font-bold text-emerald-600">{tercapai} santri</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-muted-foreground">Belum Tercapai</p>
            <p className="text-2xl font-bold text-amber-600">
              {filteredData.length - tercapai} santri
            </p>
          </div>
        </div>

        {/* Monthly Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="text-primary-foreground font-semibold">No</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Nama Santri</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Musyrif</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Angkatan</TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">
                  Hafalan {selectedMonth}
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">
                  Update Terakhir
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">
                  Total Juz
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Tidak ada data untuk periode ini
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={item.santriId} className="hover:bg-accent/50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.santriNama}</TableCell>
                    <TableCell>{item.halaqah}</TableCell>
                    <TableCell>
                      <Badge variant={getKelasBadgeVariant(item.kelas)}>
                        {item.kelas}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {item.totalHalamanBulan} hal
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {item.ayatTerakhir}
                    </TableCell>
                    <TableCell className="text-center font-bold text-secondary">
                      {item.totalJuz ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          item.totalHalamanBulan >= 12
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        )}
                      >
                        {item.totalHalamanBulan >= 12 ? 'Tercapai' : 'Tidak Tercapai'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* Per Angkatan Summary - Only show for admin */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="font-serif text-lg font-semibold mb-4">
              Rekap per Angkatan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {hafalanByKelas.map((item) => (
                <div
                  key={item.kelas}
                  className="p-4 rounded-lg bg-accent/50 border"
                >
                  <p className="font-semibold">{item.kelas}</p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Santri:</span>
                    <span className="font-medium">{item.jumlahSantri}</span>
                  </div>
                  <div className="flex flex-col text-sm mt-1">
                    <span className="text-muted-foreground">Paling banyak:</span>
                    <span className="font-medium text-primary">
                      {item.terbaik.nama} ({item.terbaik.amount} hal)
                    </span>
                  </div>
                  <div className="flex flex-col text-sm mt-1">
                    <span className="text-muted-foreground">Paling sedikit:</span>
                    <span className="font-medium text-secondary">
                      {item.terendah.nama} ({item.terendah.amount} hal)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Per Musyrif Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-serif text-lg font-semibold mb-4">
            {user?.role === 'admin' ? 'Rekap per Halaqah' : 'Rekap Halaqah Anda'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hafalanByMusyrif.map((item) => (
              <div
                key={item.musyrif}
                className="p-4 rounded-lg bg-accent/50 border"
              >
                <p className="font-semibold">{item.musyrif}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Santri:</span>
                  <span className="font-medium">{item.jumlahSantri}</span>
                </div>
                <div className="flex flex-col text-sm mt-1">
                  <span className="text-muted-foreground">Paling banyak:</span>
                  <span className="font-medium text-primary">
                    {item.terbaik.nama} ({item.terbaik.amount} hal)
                  </span>
                </div>
                <div className="flex flex-col text-sm mt-1">
                  <span className="text-muted-foreground">Paling sedikit:</span>
                  <span className="font-medium text-secondary">
                    {item.terendah.nama} ({item.terendah.amount} hal)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Signature */}
        <div className="flex justify-end print:block">
          <div className="text-center p-6">
            <p>Bangkinang, {getWIBTime().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mt-2 font-semibold">
              {user?.role === 'admin' ? 'KASI TAHFIZH' : 'GURU HALAQAH'}
            </p>
            <div className="h-20"></div>
            <p className="font-bold underline">
              {user?.role === 'admin' ? 'MHD ALL MUBARAK, Lc' : user?.nama || ''}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
