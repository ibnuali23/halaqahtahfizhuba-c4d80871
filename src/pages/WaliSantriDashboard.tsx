import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Search, LogOut, Lock, Users, TrendingUp } from 'lucide-react';
import { format, isToday, startOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WaliSantriDashboard() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState<string>('all');
  const [selectedMusyrif, setSelectedMusyrif] = useState<string>('all');

  // Fetch all santri data
  const { data: santriList } = useQuery({
    queryKey: ['wali-santri-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('santri')
        .select('*')
        .order('nama');
      if (error) throw error;
      return data;
    },
  });

  // Fetch all setoran data
  const { data: setoranList } = useQuery({
    queryKey: ['wali-setoran-list'],
    queryFn: async () => {
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
        .order('tanggal', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch hafalan summary
  const { data: summaryList } = useQuery({
    queryKey: ['wali-hafalan-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hafalan_summary')
        .select(`
          *,
          santri:santri_id (
            nama,
            kelas,
            musyrif
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  // Get unique musyrif list
  const musyrifList = [...new Set(santriList?.map(s => s.musyrif) || [])].sort();

  // Filter santri
  const filteredSantri = santriList?.filter(santri => {
    const matchesSearch = santri.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKelas = selectedKelas === 'all' || santri.kelas === selectedKelas;
    const matchesMusyrif = selectedMusyrif === 'all' || santri.musyrif === selectedMusyrif;
    return matchesSearch && matchesKelas && matchesMusyrif;
  }) || [];

  // Calculate stats
  const totalSantri = santriList?.length || 0;
  const totalSetoran = setoranList?.length || 0;
  const avgHafalan = summaryList?.length
    ? (summaryList.reduce((acc, s) => acc + (s.total_hafalan || 0), 0) / summaryList.length).toFixed(1)
    : '0';

  // Daily Stats - setoran hari ini
  const todaySetoran = setoranList?.filter(s => {
    const setoranDate = new Date(s.tanggal);
    return isToday(setoranDate);
  }) || [];
  const todaySetoranCount = todaySetoran.length;
  const todayHalaman = todaySetoran.reduce((acc, s) => acc + (s.jumlah_halaman || 0), 0);

  // Monthly Progress Chart Data
  const monthlyData = [
    { bulan: 'Jul', halaman: summaryList?.reduce((acc, s) => acc + (s.juli || 0), 0) || 0 },
    { bulan: 'Agu', halaman: summaryList?.reduce((acc, s) => acc + (s.agustus || 0), 0) || 0 },
    { bulan: 'Sep', halaman: summaryList?.reduce((acc, s) => acc + (s.september || 0), 0) || 0 },
    { bulan: 'Okt', halaman: summaryList?.reduce((acc, s) => acc + (s.oktober || 0), 0) || 0 },
    { bulan: 'Nov', halaman: summaryList?.reduce((acc, s) => acc + (s.november || 0), 0) || 0 },
    { bulan: 'Des', halaman: summaryList?.reduce((acc, s) => acc + (s.desember || 0), 0) || 0 },
  ];

  const handleLogout = async () => {
    await logout();
  };

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
        {/* Read-only Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3"
        >
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            🔒 Anda sedang menggunakan akun Wali Santri (mode baca saja).
            Anda dapat melihat data hafalan seluruh santri tetapi tidak dapat mengubah data.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Santri</p>
                  <p className="text-2xl font-bold">{totalSantri}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Setoran</p>
                  <p className="text-2xl font-bold">{totalSetoran}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata Hafalan</p>
                  <p className="text-2xl font-bold">{avgHafalan} hal</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* NEW: Today's Stats */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setoran Hari Ini</p>
                  <p className="text-2xl font-bold">{todaySetoranCount}</p>
                  <p className="text-xs text-green-600">{todayHalaman.toFixed(1)} halaman</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* NEW: Monthly Total */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hafalan Bulan Ini</p>
                  <p className="text-2xl font-bold">{monthlyData[monthlyData.length - 1]?.halaman.toFixed(0) || 0}</p>
                  <p className="text-xs text-blue-600">halaman (Desember)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-serif">📊 Progres Hafalan Bulanan</CardTitle>
            <CardDescription>
              Total halaman yang dihafal seluruh santri per bulan (Semester 2)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} halaman`, 'Total']} />
                  <Bar dataKey="halaman" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-serif">Data Santri & Hafalan</CardTitle>
            <CardDescription>
              Lihat progres hafalan seluruh santri Ma'had
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama santri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  <SelectItem value="Angkatan 1">Angkatan 1</SelectItem>
                  <SelectItem value="Angkatan 2">Angkatan 2</SelectItem>
                  <SelectItem value="Angkatan 3">Angkatan 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMusyrif} onValueChange={setSelectedMusyrif}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Halaqah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Halaqah</SelectItem>
                  {musyrifList.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Santri Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Santri</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Halaqah</TableHead>
                    <TableHead>Total Hafalan</TableHead>
                    <TableHead>Terakhir Setor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSantri.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada data santri
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSantri.map((santri, index) => {
                      const summary = summaryList?.find(s => s.santri_id === santri.id);
                      const lastSetoran = setoranList?.find(s => s.santri_id === santri.id);

                      return (
                        <TableRow key={santri.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{santri.nama}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{santri.kelas}</Badge>
                          </TableCell>
                          <TableCell>{santri.musyrif}</TableCell>
                          <TableCell>
                            {summary?.total_hafalan?.toFixed(1) || '0'} halaman
                          </TableCell>
                          <TableCell>
                            {lastSetoran
                              ? format(new Date(lastSetoran.tanggal), 'dd MMM yyyy', { locale: localeId })
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {summary && (summary.total_hafalan || 0) >= (summary.target_bulanan || 12) ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                Tercapai
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Belum Tercapai</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Setoran */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-serif">Riwayat Setoran Terbaru</CardTitle>
            <CardDescription>
              100 setoran hafalan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Santri</TableHead>
                    <TableHead>Halaqah</TableHead>
                    <TableHead>Surat</TableHead>
                    <TableHead>Ayat</TableHead>
                    <TableHead>Halaman</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(setoranList || []).slice(0, 20).map((setoran) => (
                    <TableRow key={setoran.id}>
                      <TableCell>
                        {format(new Date(setoran.tanggal), 'dd MMM yyyy', { locale: localeId })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {setoran.santri?.nama || '-'}
                      </TableCell>
                      <TableCell>{setoran.santri?.musyrif || '-'}</TableCell>
                      <TableCell>{setoran.surat || '-'}</TableCell>
                      <TableCell>{setoran.ayat || '-'}</TableCell>
                      <TableCell>{setoran.jumlah_halaman}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2025 Ma'had Tahfizh Utsman bin Affan - Bangkinang Kota
        </div>
      </footer>
    </div>
  );
}
