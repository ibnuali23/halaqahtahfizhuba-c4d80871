import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import {
  MonthlyProgressChart,
  MusyrifChart,
  StatusPieChart,
  TrendLineChart,
} from '@/components/Charts';
import {
  hafalanSummary as staticHafalanSummary,
  monthlyProgress,
  getStats,
  getHafalanByMusyrif,
} from '@/data/santriData';
import { useHafalanSummary } from '@/hooks/useSantriData';
import SetoranFeed from '@/components/SetoranFeed';
import TodayActivityPanel from '@/components/TodayActivityPanel';
import { Users, Target, Award, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dbHafalanSummary, isLoading } = useHafalanSummary();

  // Use database data if available, otherwise fall back to static data
  // Filter static data based on user role
  const hafalanData = dbHafalanSummary?.length 
    ? dbHafalanSummary 
    : user?.role === 'admin' 
      ? staticHafalanSummary
      : staticHafalanSummary.filter(s => s.musyrif === user?.musyrifNama);

  // Calculate stats based on filtered data
  const stats = user?.role === 'admin' 
    ? getStats() 
    : {
        totalSantri: hafalanData.length,
        totalHafalan: hafalanData.reduce((acc, s) => acc + s.totalHafalan, 0).toFixed(1),
        rataRataHafalan: hafalanData.length > 0 
          ? (hafalanData.reduce((acc, s) => acc + s.totalHafalan, 0) / hafalanData.length).toFixed(1)
          : '0',
        santriTercapai: hafalanData.filter(s => s.status === 'tercapai').length,
        santriTidakTercapai: hafalanData.filter(s => s.status === 'tidak tercapai').length,
        persentaseTercapai: hafalanData.length > 0
          ? Math.round((hafalanData.filter(s => s.status === 'tercapai').length / hafalanData.length) * 100)
          : 0,
      };

  const hafalanByMusyrif = user?.role === 'admin'
    ? getHafalanByMusyrif()
    : getHafalanByMusyrif().filter(m => m.musyrif === user?.musyrifNama);

  // Get top performers from filtered data
  const topPerformers = [...hafalanData]
    .sort((a, b) => b.totalHafalan - a.totalHafalan)
    .slice(0, 5);

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{user?.role === 'admin' ? 'Seluruh Angkatan' : user?.musyrifNama}</span>
            <span className="px-2 py-1 bg-accent rounded-full text-xs font-medium">
              Semester Ganjil 2025
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
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
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
                        {santri.musyrif}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {santri.totalHafalan}
                      </p>
                      <p className="text-xs text-muted-foreground">Juz</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyProgressChart data={monthlyProgress} />
          <MusyrifChart data={hafalanByMusyrif} />
        </div>

        {/* Status Pie Chart and Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusPieChart
            tercapai={stats.santriTercapai}
            tidakTercapai={stats.santriTidakTercapai}
          />
          <TrendLineChart data={monthlyProgress} />
        </div>
      </div>
    </Layout>
  );
}
