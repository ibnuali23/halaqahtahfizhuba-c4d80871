import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import {
  MonthlyProgressChart,
  MusyrifChart,
  StatusPieChart,
  TrendLineChart,
  StudentAchievementChart,
} from '@/components/Charts';
import {
  hafalanSummary as staticHafalanSummary,
  getStats,
  getHafalanByMusyrif,
} from '@/data/santriData';
import { useHafalanSummary, useSantri } from '@/hooks/useSantriData';
import { useRekapHafalan, getCurrentBulan, bulanList } from '@/hooks/useRekapHafalan';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import SetoranFeed from '@/components/SetoranFeed';
import TodayActivityPanel from '@/components/TodayActivityPanel';
import { Users, Target, Award, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentBulan());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>(user?.role === 'guru' ? user?.musyrifNama || 'all' : 'all');

  const { data: rekapData, isLoading: isRekapLoading } = useRekapHafalan(selectedMonth, selectedYear);
  const { data: santriData } = useSantri();

  const halaqahNames = Array.from(new Set(santriData?.map((s) => s.musyrif) || []));

  // Filtering rekap data for the chart
  let filteredRekap = rekapData?.rekap || [];
  if (selectedHalaqah !== 'all') {
    filteredRekap = filteredRekap.filter(r => r.halaqah === selectedHalaqah);
  }


  // Calculate stats based on rekap data (which respects the month filter)
  const stats = {
    totalSantri: filteredRekap.length,
    totalHafalan: filteredRekap.reduce((acc, r) => acc + r.totalHalamanBulan, 0).toFixed(1),
    rataRataHafalan: filteredRekap.length > 0
      ? (filteredRekap.reduce((acc, r) => acc + r.totalHalamanBulan, 0) / filteredRekap.length).toFixed(1)
      : '0',
    santriTercapai: filteredRekap.filter(r => r.totalHalamanBulan >= 12).length,
    santriTidakTercapai: filteredRekap.filter(r => r.totalHalamanBulan < 12 && r.totalHalamanBulan > 0).length,
    persentaseTercapai: filteredRekap.length > 0
      ? Math.round((filteredRekap.filter(r => r.totalHalamanBulan >= 12).length / filteredRekap.length) * 100)
      : 0,
  };

  const hafalanByMusyrif = user?.role === 'admin'
    ? getHafalanByMusyrif()
    : getHafalanByMusyrif().filter(m => m.musyrif === user?.musyrifNama);

  // Get top performers from filtered rekap data (Sorted by Monthly Total Juz)
  const topPerformers = [...filteredRekap]
    .sort((a, b) => (b.totalJuz || 0) - (a.totalJuz || 0))
    .slice(0, 5);

  if (isRekapLoading) {
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
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Selamat datang, {user?.nama}.
              {user?.role === 'admin'
                ? ' Berikut ringkasan hafalan seluruh santri.'
                : ` Berikut ringkasan hafalan halaqah ${user?.musyrifNama || ''}.`
              }
            </p>
          </div>

          {/* Filters for Chart */}
          <Card className="bg-card/50 border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-center gap-2 text-primary mb-2 md:mb-0 md:mr-4">
                  <Filter className="h-5 w-5" />
                  <span className="font-semibold">Filter Grafik Hafalan</span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground ml-1">Bulan</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[140px] bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bulanList.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground ml-1">Tahun</Label>
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-[100px] bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(user?.role === 'admin' || (user?.role === 'guru' && !user?.musyrifNama)) && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground ml-1">Halaqah</Label>
                    <Select value={selectedHalaqah} onValueChange={setSelectedHalaqah}>
                      <SelectTrigger className="w-[200px] bg-background">
                        <SelectValue placeholder="Semua Halaqah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Halaqah</SelectItem>
                        {halaqahNames.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{selectedHalaqah === 'all' ? 'Seluruh Angkatan' : selectedHalaqah}</span>
            <span className="px-2 py-1 bg-accent rounded-full text-xs font-medium">
              {selectedMonth} {selectedYear}
            </span>
          </div>
        </div>

        {/* Stats Cards - Removed Total Hafalan and Rata-rata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <StatsCard
            title={user?.role === 'admin' ? 'Total Santri' : 'Santri Halaqah'}
            value={stats.totalSantri}
            subtitle={user?.role === 'admin' ? "Aktif di Ma'had" : 'Dalam halaqah Anda'}
            icon={Users}
            delay={0}
          />
          <StatsCard
            title="Target Tercapai"
            value={`${stats.persentaseTercapai}%`}
            subtitle={`${stats.santriTercapai} dari ${stats.totalSantri} santri`}
            icon={Target}
            variant="gold"
            delay={0.1}
          />
        </div>

        {/* Today Activity Panel (Admin only) */}
        {user?.role === 'admin' && <TodayActivityPanel />}

        {/* Setoran Feed and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setoran Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border bg-card p-6"
          >
            <SetoranFeed showFilters={user?.role === 'admin'} />
          </motion.div>

          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-secondary" />
              <h3 className="font-serif text-lg font-semibold">
                {user?.role === 'admin' ? 'Santri Terbaik' : 'Santri Terbaik Halaqah'}
              </h3>
            </div>
            <div className="space-y-3">
              {topPerformers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada data santri
                </p>
              ) : (
                topPerformers.map((santri, index) => (
                  <div
                    key={santri.santriId}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0
                        ? 'bg-secondary text-secondary-foreground'
                        : index === 1
                          ? 'bg-muted text-muted-foreground'
                          : index === 2
                            ? 'bg-secondary/70 text-secondary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {santri.santriNama}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {santri.halaqah}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {santri.totalJuz || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Juz</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Student Achievement Chart */}
        <div className="grid grid-cols-1 gap-6">
          <StudentAchievementChart data={filteredRekap} />
        </div>

        {/* Status Pie Chart and Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusPieChart
            tercapai={stats.santriTercapai}
            tidakTercapai={stats.santriTidakTercapai}
          />
          <TrendLineChart data={rekapData?.rekap.map(r => ({ bulan: selectedMonth, totalHalaman: r.totalHalamanBulan, jumlahSantri: 1 })) || []} />
        </div>
      </div>
    </Layout>
  );
}
