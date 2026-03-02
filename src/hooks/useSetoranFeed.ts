import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SetoranFeedItem {
  id: string;
  santri_id: string;
  santri_nama: string;
  santri_kelas: string;
  santri_musyrif: string;
  surat: string | null;
  ayat: string | null;
  jumlah_halaman: number;
  tanggal: string;
  bulan: string;
  tahun: number;
  keterangan: string | null;
  recorded_by: string | null;
  recorded_by_nama: string | null;
  created_at: string;
  is_today: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export function useSetoranFeed(days: number = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['setoran_feed', user?.id, days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      const fromDateStr = fromDate.toISOString().split('T')[0];

      // Fetch setoran with santri info
      const { data: setoranData, error: setoranError } = await supabase
        .from('setoran_hafalan')
        .select(`
          *,
          santri:santri_id (
            nama,
            kelas,
            musyrif
          )
        `)
        .gte('tanggal', fromDateStr)
        .order('created_at', { ascending: false });

      if (setoranError) throw setoranError;

      // Fetch profiles to get recorder names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nama');

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.nama])
      );

      const today = new Date().toISOString().split('T')[0];
      const isAdmin = user?.role === 'admin';

      const feedItems: SetoranFeedItem[] = (setoranData || []).map((item) => {
        const isOwner = item.recorded_by === user?.id;
        const santriInfo = item.santri as unknown as { nama: string; kelas: string; musyrif: string };
        return {
          id: item.id,
          santri_id: item.santri_id,
          santri_nama: santriInfo?.nama || 'Unknown',
          santri_kelas: santriInfo?.kelas || 'Unknown',
          santri_musyrif: santriInfo?.musyrif || 'Unknown',
          surat: item.surat,
          ayat: item.ayat,
          jumlah_halaman: item.jumlah_halaman,
          tanggal: item.tanggal,
          bulan: item.bulan,
          tahun: item.tahun,
          keterangan: item.keterangan,
          recorded_by: item.recorded_by,
          recorded_by_nama: item.recorded_by
            ? profileMap.get(item.recorded_by) || 'Imported'
            : 'Imported',
          created_at: item.created_at,
          is_today: item.tanggal === today,
          can_edit: isAdmin || isOwner,
          can_delete: isAdmin || isOwner,
        };
      });

      return feedItems;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useUpdateSetoran() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      surat?: string;
      ayat?: string;
      jumlah_halaman?: number;
      tanggal?: string;
      keterangan?: string;
      old_data: Record<string, unknown>;
    }) => {
      const { id, old_data, ...updateData } = data;

      // Update the record
      const { error: updateError } = await supabase
        .from('setoran_hafalan')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Log the change
      const { error: logError } = await supabase.from('hafalan_log').insert({
        setoran_id: id,
        action: 'updated',
        old_data: old_data,
        new_data: updateData,
        performed_by: user!.id,
      });

      if (logError) console.error('Failed to log change:', logError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setoran_feed'] });
      queryClient.invalidateQueries({ queryKey: ['hafalan_summary'] });
      queryClient.invalidateQueries({ queryKey: ['today_stats'] });
    },
  });
}

export function useDeleteSetoran() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; old_data: Record<string, unknown>; reason?: string }) => {
      // Log the deletion first
      const { error: logError } = await supabase.from('hafalan_log').insert({
        setoran_id: data.id,
        action: 'deleted',
        old_data: data.old_data,
        reason: data.reason,
        performed_by: user!.id,
      });

      if (logError) console.error('Failed to log deletion:', logError);

      // Delete the record
      const { error: deleteError } = await supabase
        .from('setoran_hafalan')
        .delete()
        .eq('id', data.id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setoran_feed'] });
      queryClient.invalidateQueries({ queryKey: ['hafalan_summary'] });
      queryClient.invalidateQueries({ queryKey: ['today_stats'] });
    },
  });
}

export function useTodayStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['today_stats', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      // Get today's setoran count
      const { count: setoranCount } = await supabase
        .from('setoran_hafalan')
        .select('*', { count: 'exact', head: true })
        .eq('tanggal', today);

      // Get today's check-ins count
      const { data: checkinData } = await supabase
        .from('absensi_guru')
        .select('waktu_halaqah')
        .eq('tanggal', today)
        .not('waktu_check_in', 'is', null);

      const subuhCheckins = checkinData?.filter((a) => a.waktu_halaqah === 'subuh').length || 0;
      const maghribCheckins = checkinData?.filter((a) => a.waktu_halaqah === 'maghrib').length || 0;

      return {
        setoranCount: setoranCount || 0,
        checkinCount: checkinData?.length || 0,
        subuhCheckins,
        maghribCheckins,
      };
    },
    enabled: !!user,
  });
}

export function useHafalanLog(setoranId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hafalan_log', setoranId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hafalan_log')
        .select('*')
        .eq('setoran_id', setoranId!)
        .order('performed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!setoranId,
  });
}
