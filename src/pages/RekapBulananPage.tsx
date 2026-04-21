import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { useRekapHafalan, getCurrentBulan, bulanList } from '@/hooks/useRekapHafalan';
import { useSantri } from '@/hooks/useSantriData';
import { usePengaturanSistem } from '@/hooks/usePengaturanSistem';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Loader2,
  BookOpen,
  Download,
  Search,
  Filter,
  TrendingUp,
  Users,
  Eye,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import SetoranDetailModal from '@/components/rekap/SetoranDetailModal';

export default function RekapBulananPage() {
  const { user } = useAuth();
  const isWaliSantri = user?.role === 'wali_santri';
  const [bulan, setBulan] = useState(getCurrentBulan());
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterHalaqah, setFilterHalaqah] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedSantri, setSelectedSantri] = useState<{
    id: string;
    nama: string;
  } | null>(null);

  // Remove undefined summaryMap reference
  const { data: rekapData, isLoading } = useRekapHafalan(bulan, tahun);
  const { data: santriData } = useSantri();
  const { settings } = usePengaturanSistem();

  // Get unique halaqah/musyrif names
  const halaqahNames = Array.from(new Set(santriData?.map((s) => s.musyrif) || []));

  // Filter data
  let filteredData = rekapData?.rekap || [];

  if (filterKelas !== 'all') {
    filteredData = filteredData.filter((h) => h.kelas === filterKelas);
  }

  if (filterHalaqah !== 'all') {
    filteredData = filteredData.filter((h) => h.halaqah === filterHalaqah);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredData = filteredData.filter((h) =>
      h.santriNama.toLowerCase().includes(query)
    );
  }

  // Calculate statistics
  const totalSetoran = filteredData.reduce((acc, h) => acc + h.totalHalamanBulan, 0);
  const santriAktif = filteredData.filter((h) => h.isActive).length;
  const totalSantri = filteredData.length;
  const targetBulanan = settings?.target_hafalan_bulanan || 12;
  const santriTercapai = filteredData.filter((h) => h.totalHalamanBulan >= targetBulanan).length;
  const progressPercentage = totalSantri > 0 ? Math.min((santriTercapai / totalSantri) * 100, 100) : 0;

  const handleExportCSV = () => {
    if (!filteredData.length) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['No', 'Nama Santri', 'Halaqah', 'Kelas', 'Total Halaman', 'Jumlah Setoran', 'Ayat Terakhir', 'Tanggal Terakhir', 'Status'];
    const rows = filteredData.map((h, i) => [
      i + 1,
      h.santriNama,
      h.halaqah,
      h.kelas,
      h.totalHalamanBulan,
      h.jumlahSetoran,
      h.ayatTerakhir,
      h.tanggalTerakhir,
      h.totalJuz,
      h.isActive ? 'Aktif' : 'Belum Setoran',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rekap_hafalan_${bulan}_${tahun}.csv`;
    link.click();

    toast.success('📤 Data rekap berhasil diekspor');
  };

  const openDetailModal = (santriId: string, santriNama: string) => {
    setSelectedSantri({ id: santriId, nama: santriNama });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {isWaliSantri ? '📖 Rekap Hafalan Santri' : 'Rekap Hafalan Bulanan'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isWaliSantri
                ? `Pantau hafalan anak Anda di bulan ${bulan} ${tahun}`
                : `Rekap hafalan santri bulan ${bulan} ${tahun}`
              }
            </p>
          </div>
          {!isWaliSantri && (
            <Button onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {santriTercapai}<span className="text-base font-medium text-muted-foreground">/{totalSantri}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Santri Tercapai Target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {!isWaliSantri && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-l-4 border-l-accent">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-accent/20">
                      <Users className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{santriAktif}</p>
                      <p className="text-xs text-muted-foreground">Santri Aktif</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!isWaliSantri && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-l-4 border-l-muted-foreground">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {totalSantri > 0 ? (totalSetoran / totalSantri).toFixed(1) : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Rata-rata/Santri</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={isWaliSantri ? "col-span-1" : ""}
          >
            <Card className="border-l-4 border-l-secondary">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-secondary/10">
                    <Target className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{targetBulanan}</p>
                    <p className="text-xs text-muted-foreground">Target/Santri</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progres Hafalan Bulan {bulan}</span>
              <span className="text-sm text-muted-foreground">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalSetoran} dari {totalSantri * targetBulanan} halaman target
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama santri..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Bulan</Label>
                <Select value={bulan} onValueChange={setBulan}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bulanList.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tahun</Label>
                <Select value={tahun.toString()} onValueChange={(v) => setTahun(parseInt(v))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Kelas</Label>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    <SelectItem value="Angkatan 1">Angkatan 1</SelectItem>
                    <SelectItem value="Angkatan 2">Angkatan 2</SelectItem>
                    <SelectItem value="Angkatan 3">Angkatan 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Halaqah</Label>
                <Select value={filterHalaqah} onValueChange={setFilterHalaqah}>
                  <SelectTrigger className="w-[180px]">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Data Rekap Hafalan - {bulan} {tahun}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada data hafalan di bulan {bulan} {tahun}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama Santri</TableHead>
                      <TableHead>Halaqah</TableHead>
                      <TableHead className="text-center">Total Halaman</TableHead>
                      <TableHead className="text-center">Jumlah Setoran</TableHead>
                      <TableHead className="text-center">Total Juz</TableHead>
                      <TableHead>Ayat Terakhir</TableHead>
                      <TableHead>Tanggal Terakhir</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((h, index) => (
                      <TableRow
                        key={h.santriId}
                        className={h.isActive ? '' : 'bg-muted/30'}
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {h.isActive && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                            <div>
                              <p className="font-medium">{h.santriNama}</p>
                              <Badge variant="outline" className="text-xs">{h.kelas}</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{h.halaqah}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-primary text-lg">
                            {h.totalHalamanBulan}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{h.jumlahSetoran}x</Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold text-secondary">
                          {h.totalJuz}
                        </TableCell>
                        <TableCell className="text-sm">{h.ayatTerakhir}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {h.tanggalTerakhir !== '-'
                            ? format(new Date(h.tanggalTerakhir), 'd MMM yyyy', { locale: id })
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => openDetailModal(h.santriId, h.santriNama)}
                          >
                            <Eye className="h-4 w-4" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        {selectedSantri && (
          <SetoranDetailModal
            open={!!selectedSantri}
            onOpenChange={(open) => !open && setSelectedSantri(null)}
            santriId={selectedSantri.id}
            santriNama={selectedSantri.nama}
            bulan={bulan}
            tahun={tahun}
          />
        )}
      </div>
    </Layout>
  );
}
