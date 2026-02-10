import { useState } from 'react';
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
import { useRekapHafalan, bulanList, getCurrentBulan } from '@/hooks/useRekapHafalan';
import { Download, Printer, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const months = bulanList;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // 5 years back, current, 5 years forward

export default function LaporanPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentBulan());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: rekapData, isLoading } = useRekapHafalan(selectedMonth, selectedYear);

  // monthlyData now comes from rekapData.rekap
  const monthlyData = rekapData?.rekap || [];

  // Calculate stats based on rekap data
  const totalBulanIni = rekapData?.totalSetoran || 0;
  const totalSantri = rekapData?.totalSantri || 0;
  const santriAktif = rekapData?.santriAktif || 0;
  const rataRata = totalSantri > 0 ? (totalBulanIni / totalSantri).toFixed(1) : '0';

  // Target achievement (using same logic: 12 pages/month)
  const tercapai = monthlyData.filter((s) => s.totalHalamanBulan >= 12).length;

  // Group data for summaries
  const getHafalanByMusyrif = () => {
    const grouped = monthlyData.reduce((acc, s) => {
      if (!acc[s.halaqah]) {
        acc[s.halaqah] = { totalHafalan: 0, jumlahSantri: 0, musyrif: s.halaqah };
      }
      acc[s.halaqah].totalHafalan += s.totalHalamanBulan;
      acc[s.halaqah].jumlahSantri += 1;
      return acc;
    }, {} as Record<string, { totalHafalan: number; jumlahSantri: number; musyrif: string }>);

    return Object.values(grouped).map(d => ({
      ...d,
      totalHafalan: d.totalHafalan.toFixed(1),
      rataRata: (d.totalHafalan / d.jumlahSantri).toFixed(1)
    }));
  };

  const getHafalanByKelas = () => {
    const grouped = monthlyData.reduce((acc, s) => {
      if (!acc[s.kelas]) {
        acc[s.kelas] = { totalHafalan: 0, jumlahSantri: 0, kelas: s.kelas };
      }
      acc[s.kelas].totalHafalan += s.totalHalamanBulan;
      acc[s.kelas].jumlahSantri += 1;
      return acc;
    }, {} as Record<string, { totalHafalan: number; jumlahSantri: number; kelas: string }>);

    return Object.values(grouped).map(d => ({
      ...d,
      totalHafalan: d.totalHafalan.toFixed(1),
      rataRata: (d.totalHafalan / d.jumlahSantri).toFixed(1)
    }));
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
    const headers = ['No', 'Nama Santri', 'Halaqah', 'Angkatan', `Hafalan ${selectedMonth}`, 'Update Terakhir', 'Status'];
    const rows = monthlyData.map((item, index) => [
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
          <div className="flex items-center gap-2">
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
              {monthlyData.length - tercapai} santri
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
                <TableHead className="text-primary-foreground font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Tidak ada data untuk periode ini
                  </TableCell>
                </TableRow>
              ) : (
                monthlyData.map((item, index) => (
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{item.totalHafalan} Juz</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rata-rata:</span>
                    <span className="font-medium">{item.rataRata} Juz</span>
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{item.totalHafalan} Juz</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rata-rata:</span>
                  <span className="font-medium">{item.rataRata} Juz</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Signature */}
        <div className="flex justify-end print:block">
          <div className="text-center p-6">
            <p>Bangkinang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
