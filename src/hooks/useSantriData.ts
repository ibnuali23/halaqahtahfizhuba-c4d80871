import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HafalanSummary } from '@/types/hafalan';

export interface SantriDB {
  id: string;
  nama: string;
  kelas: 'Angkatan 1' | 'Angkatan 2' | 'Angkatan 3';
  musyrif: string;
  created_at: string;
  updated_at: string;
}

export interface HafalanSummaryDB {
  id: string;
  santri_id: string;
  tahun: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;
  total_hafalan: number;
  setoran_terakhir: string | null;
  target_bulanan: number;
  santri?: SantriDB;
}

export function useSantri() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['santri', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('santri')
        .select('*')
        .order('nama');

      if (error) throw error;
      return data as SantriDB[];
    },
    enabled: !!user,
  });
}

export function useHafalanSummary(tahun: number = 2025) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hafalan_summary', user?.id, tahun],
    queryFn: async () => {
      const { data: summaryData, error: summaryError } = await supabase
        .from('hafalan_summary')
        .select('*')
        .eq('tahun', tahun);

      if (summaryError) throw summaryError;

      const { data: santriData, error: santriError } = await supabase
        .from('santri')
        .select('*');

      if (santriError) throw santriError;

      // Join the data
      const summaryWithSantri: HafalanSummary[] = (summaryData || []).map((summary) => {
        const santri = (santriData || []).find((s) => s.id === summary.santri_id);
        const totalBulanan = 
          Number(summary.juli || 0) +
          Number(summary.agustus || 0) +
          Number(summary.september || 0) +
          Number(summary.oktober || 0) +
          Number(summary.november || 0) +
          Number(summary.desember || 0);
        
        return {
          santriId: summary.santri_id,
          santriNama: santri?.nama || 'Unknown',
          musyrif: santri?.musyrif || 'Unknown',
          kelas: santri?.kelas as 'Angkatan 1' | 'Angkatan 2' | 'Angkatan 3',
          juli: Number(summary.juli || 0),
          agustus: Number(summary.agustus || 0),
          september: Number(summary.september || 0),
          oktober: Number(summary.oktober || 0),
          november: Number(summary.november || 0),
          desember: Number(summary.desember || 0),
          totalHafalan: Number(summary.total_hafalan || 0),
          setoranTerakhir: summary.setoran_terakhir || '-',
          status: totalBulanan >= (summary.target_bulanan * 4) ? 'tercapai' : 'tidak tercapai',
          targetBulanan: summary.target_bulanan || 12,
        };
      });

      return summaryWithSantri;
    },
    enabled: !!user,
  });
}

export function useSetoranHafalan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['setoran_hafalan', user?.id],
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
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useMusyrifStats() {
  const { data: santriData } = useSantri();
  const { data: hafalanData } = useHafalanSummary();

  const stats = (santriData || []).reduce((acc, santri) => {
    if (!acc[santri.musyrif]) {
      acc[santri.musyrif] = {
        musyrif: santri.musyrif,
        totalSantri: 0,
        totalHafalan: 0,
      };
    }
    acc[santri.musyrif].totalSantri += 1;
    
    const hafalan = (hafalanData || []).find((h) => h.santriId === santri.id);
    if (hafalan) {
      acc[santri.musyrif].totalHafalan += hafalan.totalHafalan;
    }
    
    return acc;
  }, {} as Record<string, { musyrif: string; totalSantri: number; totalHafalan: number }>);

  return Object.values(stats);
}
