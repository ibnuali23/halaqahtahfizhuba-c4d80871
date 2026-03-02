import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useCallback } from 'react';
import { Tables } from '@/integrations/supabase/types';

type SetoranHafalan = Tables<'setoran_hafalan'>;

export interface RekapSantri {
  santriId: string;
  santriNama: string;
  halaqah: string;
  kelas: string;
  totalHalamanBulan: number;
  jumlahSetoran: number;
  ayatTerakhir: string;
  tanggalTerakhir: string;
  isActive: boolean;
  totalJuz: number;
}

export interface SetoranDetail {
  id: string;
  surat: string | null;
  ayat: string | null;
  jumlahHalaman: number;
  tanggal: string;
  keterangan: string | null;
  recordedBy: string | null;
}

const bulanList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function useRekapHafalan(bulan: string, tahun: number) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['rekap_hafalan', user?.id, bulan, tahun],
    queryFn: async () => {
      // Fetch all santri list.
      const santriQuery = supabase.from('santri').select('*');

      const { data: santriData, error: santriError } = await santriQuery.order('nama');

      if (santriError) throw santriError;

      // If there are no santri (e.g., wali has no children), return empty result
      const santriIds = (santriData || []).map((s) => s.id);

      // Get setoran for the month filtered to santriIds when applicable
      let setoranData: SetoranHafalan[] = [];
      if (santriIds.length > 0) {
        const { data: _setoranData, error: setoranError } = await supabase
          .from('setoran_hafalan')
          .select('*')
          .in('santri_id', santriIds)
          .eq('bulan', bulan)
          .eq('tahun', tahun)
          .order('tanggal', { ascending: false });

        console.log('Setoran Debug:', {
          bulan,
          tahun,
          count: _setoranData?.length,
          data: _setoranData
        });

        if (setoranError) throw setoranError;
        setoranData = _setoranData || [];
      } else {
        setoranData = [];
      }

      // Fetch summary for total juz from hafalan_summary (limit to santriIds to satisfy RLS)
      const { data: summaryData, error: summaryError } = await supabase
        .from('hafalan_summary')
        .select('santri_id, total_hafalan')
        .in('santri_id', santriIds)
        .eq('tahun', tahun);

      if (summaryError) throw summaryError;
      const summaryMap = (summaryData || []).reduce((acc, s) => {
        acc[s.santri_id] = Number(s.total_hafalan) || 0;
        return acc;
      }, {} as Record<string, number>);
      console.log('Debug: summaryMap:', summaryMap);

      // Also build a map from the latest setoran's total_juz per santri
      const setoranJuzMap: Record<string, number> = {};
      for (const setoran of setoranData) {
        const sid = setoran.santri_id;
        // setoranData is ordered desc by tanggal, so first occurrence is latest
        if (!(sid in setoranJuzMap) && setoran.total_juz && setoran.total_juz > 0) {
          setoranJuzMap[sid] = Number(setoran.total_juz);
        }
      }

      // Build rekap per santri
      const rekapMap: Record<string, RekapSantri> = {};

      // Initialize with fetched santri (all or only wali's children)
      for (const santri of santriData || []) {
        rekapMap[santri.id] = {
          santriId: santri.id,
          santriNama: santri.nama,
          halaqah: santri.musyrif,
          kelas: santri.kelas,
          totalHalamanBulan: 0,
          jumlahSetoran: 0,
          ayatTerakhir: '-',
          tanggalTerakhir: '-',
          isActive: false,
          totalJuz: setoranJuzMap[santri.id] || summaryMap[santri.id] || 0,
        };
      }

      // Process setoran data
      for (const setoran of setoranData || []) {
        const santriId = setoran.santri_id;
        if (rekapMap[santriId]) {
          rekapMap[santriId].totalHalamanBulan += Number(setoran.jumlah_halaman || 0);
          rekapMap[santriId].jumlahSetoran += 1;
          rekapMap[santriId].isActive = true;

          // Update ayat terakhir dan tanggal terakhir (setoran sudah diurutkan desc)
          if (rekapMap[santriId].ayatTerakhir === '-') {
            rekapMap[santriId].ayatTerakhir = setoran.surat
              ? `${setoran.surat}: ${setoran.ayat || '-'}`
              : '-';
            rekapMap[santriId].tanggalTerakhir = setoran.tanggal;
          }
        }
      }

      // Convert to array and sort by total halaman desc
      const rekapList = Object.values(rekapMap).sort((a, b) => b.totalHalamanBulan - a.totalHalamanBulan);

      // Calculate statistics
      const totalSetoran = rekapList.reduce((acc, r) => acc + r.totalHalamanBulan, 0);
      const santriAktif = rekapList.filter(r => r.isActive).length;

      return {
        rekap: rekapList,
        totalSetoran,
        santriAktif,
        totalSantri: rekapList.length,
      };
    },
    enabled: !!user && !!bulan,
  });

  // Memoize refetch to avoid dependency issues
  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

  // Subscribe to realtime updates for setoran_hafalan
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('rekap-hafalan-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'setoran_hafalan',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  return query;
}

export function useSetoranDetail(santriId: string, bulan: string, tahun: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['setoran_detail', santriId, bulan, tahun],
    queryFn: async () => {
      // Get setoran data
      const { data, error } = await supabase
        .from('setoran_hafalan')
        .select('*')
        .eq('santri_id', santriId)
        .eq('bulan', bulan)
        .eq('tahun', tahun)
        .order('tanggal', { ascending: false });

      if (error) throw error;

      // Get recorder names if there are any recorded_by values
      const recorderIds = [...new Set((data || []).map(s => s.recorded_by).filter(Boolean))];
      let recorderMap: Record<string, string> = {};

      if (recorderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, nama')
          .in('user_id', recorderIds);

        recorderMap = (profiles || []).reduce((acc: Record<string, string>, p) => {
          acc[p.user_id] = p.nama;
          return acc;
        }, {} as Record<string, string>);
      }

      return (data || []).map((s) => ({
        id: s.id,
        surat: s.surat,
        ayat: s.ayat,
        jumlahHalaman: Number(s.jumlah_halaman),
        tanggal: s.tanggal,
        keterangan: s.keterangan,
        recordedBy: s.recorded_by ? recorderMap[s.recorded_by] || null : null,
      })) as SetoranDetail[];
    },
    enabled: !!user && !!santriId && !!bulan,
  });
}

export function getCurrentBulan(): string {
  const monthIndex = new Date().getMonth();
  return bulanList[monthIndex];
}

export { bulanList };
