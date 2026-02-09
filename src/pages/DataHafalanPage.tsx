import Layout from '@/components/Layout';
import HafalanTable from '@/components/HafalanTable';
import { useHafalanSummary } from '@/hooks/useSantriData';
import { useAuth } from '@/contexts/AuthContext';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { hafalanSummary as staticHafalanSummary } from '@/data/santriData';

export default function DataHafalanPage() {
  const { user } = useAuth();
  const { data: dbHafalanSummary, isLoading } = useHafalanSummary();
  
  // Use database data if available, otherwise fall back to static data
  // Filter static data based on user role
  const hafalanSummary = dbHafalanSummary?.length 
    ? dbHafalanSummary 
    : user?.role === 'admin' 
      ? staticHafalanSummary
      : staticHafalanSummary.filter(s => s.musyrif === user?.musyrifNama);

  const handleExportExcel = () => {
    const headers = [
      'No',
      'Nama Santri',
      'Musyrif',
      'Kelas',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Total Hafalan',
      'Setoran Terakhir',
      'Status',
    ];

    const rows = hafalanSummary.map((s, i) => [
      i + 1,
      s.santriNama,
      s.musyrif,
      s.kelas,
      s.juli,
      s.agustus,
      s.september,
      s.oktober,
      s.november,
      s.totalHafalan,
      s.setoranTerakhir,
      s.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data_hafalan_${user?.role === 'admin' ? 'seluruh_santri' : user?.musyrifNama?.replace(/\s+/g, '_')}.csv`;
    link.click();
    
    toast.success('Data berhasil diekspor ke CSV');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Data Hafalan
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'admin' 
                ? "Rekap hafalan seluruh santri Ma'had Tahfizh Utsman bin Affan"
                : `Rekap hafalan santri halaqah ${user?.musyrifNama || ''}`
              }
            </p>
          </div>
          <Button onClick={handleExportExcel} className="gap-2" disabled={isLoading}>
            <FileSpreadsheet size={18} />
            Export Excel
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-accent border">
            <p className="text-sm text-muted-foreground">Keterangan</p>
            <p className="text-sm mt-1">
              Data hafalan berdasarkan halaman mushaf Madinah
            </p>
          </div>
          <div className="p-4 rounded-lg bg-accent border">
            <p className="text-sm text-muted-foreground">Target Bulanan</p>
            <p className="text-sm mt-1 font-semibold">12 halaman/bulan</p>
          </div>
          <div className="p-4 rounded-lg bg-accent border">
            <p className="text-sm text-muted-foreground">Periode</p>
            <p className="text-sm mt-1 font-semibold">
              Semester Ganjil 2025/2026
            </p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Memuat data...</span>
          </div>
        ) : (
          <HafalanTable data={hafalanSummary} />
        )}
      </div>
    </Layout>
  );
}
