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
import {
  Loader2,
  BookOpen,
  Search,
  Filter,
  TrendingUp,
  Eye,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import SetoranDetailModal from '@/components/rekap/SetoranDetailModal';

export default function WaliSantriDashboard() {
  const { user } = useAuth();
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
  const totalSantri = filteredData.length;
  const targetBulanan = settings?.target_hafalan_bulanan || 12;
  const progressPercentage = totalSantri > 0
    ? Math.min((totalSetoran / (totalSantri * targetBulanan)) * 100, 100)
    : 0;

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
              📖 Rekap Hafalan Santri
            </h1>
            <p className="text-muted-foreground mt-1">
              Pantau hafalan santri di bulan {bulan} {tahun}
            </p>
          </div>
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
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{totalSetoran.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Total Halaman Bulan Ini</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-accent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-accent/20">
                    <TrendingUp className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{filteredData.reduce((acc, h) => acc + h.jumlahSetoran, 0)}</p>
                    <p className="text-xs text-muted-foreground">Jumlah Setoran</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
              {totalSetoran.toFixed(1)} dari {(totalSantri * targetBulanan).toFixed(0)} halaman target
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
