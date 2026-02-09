import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AttendanceStatus = 'present' | 'izin' | 'sakit' | 'dinas_luar' | 'alfa';
export type WaktuHalaqah = 'subuh' | 'maghrib';

export interface AbsensiRecord {
  id: string;
  user_id: string;
  tanggal: string;
  waktu_check_in: string | null;
  waktu_check_out: string | null;
  status: AttendanceStatus;
  keterangan: string | null;
  photo_proof_url: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  alamat_lokasi: string | null;
  waktu_halaqah: WaktuHalaqah | null;
  created_at: string;
  updated_at: string;
  user_nama?: string;
  distance_from_ref?: number;
  is_within_radius?: boolean;
}

export interface AbsensiSummary {
  present: number;
  izin: number;
  sakit: number;
  dinas_luar: number;
  alfa: number;
  total: number;
}

export interface HalaqahLocation {
  id: string;
  nama: string;
  waktu_halaqah: WaktuHalaqah;
  latitude: number;
  longitude: number;
  radius_meter: number;
  alamat: string | null;
}

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Reverse geocoding using free API
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id',
        },
      }
    );
    const data = await response.json();
    return data.display_name || `${lat}, ${lon}`;
  } catch {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
}

export function useHalaqahLocations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['halaqah_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('halaqah_locations')
        .select('*')
        .order('waktu_halaqah');

      if (error) throw error;
      return data as HalaqahLocation[];
    },
    enabled: !!user,
  });
}

export function useAbsensi(month?: number, year?: number) {
  const { user } = useAuth();
  const currentDate = new Date();
  const targetMonth = month ?? currentDate.getMonth() + 1;
  const targetYear = year ?? currentDate.getFullYear();

  return useQuery({
    queryKey: ['absensi', user?.id, targetMonth, targetYear],
    queryFn: async () => {
      const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
      const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('absensi_guru')
        .select('*')
        .eq('user_id', user!.id)
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return data as AbsensiRecord[];
    },
    enabled: !!user,
  });
}

export function useAllAbsensi(month?: number, year?: number) {
  const { user } = useAuth();
  const { data: locations } = useHalaqahLocations();
  const currentDate = new Date();
  const targetMonth = month ?? currentDate.getMonth() + 1;
  const targetYear = year ?? currentDate.getFullYear();

  return useQuery({
    queryKey: ['all_absensi', targetMonth, targetYear],
    queryFn: async () => {
      const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
      const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

      const { data: absensiData, error: absensiError } = await supabase
        .from('absensi_guru')
        .select('*')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('tanggal', { ascending: false });

      if (absensiError) throw absensiError;

      // Get profile names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nama');

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.nama])
      );

      const records: AbsensiRecord[] = (absensiData || []).map((item) => {
        // Calculate distance from reference location if GPS data exists
        let distance_from_ref: number | undefined;
        let is_within_radius = true;

        if (item.gps_latitude && item.gps_longitude && item.waktu_halaqah && locations) {
          const refLocation = locations.find(
            (loc) => loc.waktu_halaqah === item.waktu_halaqah
          );
          if (refLocation) {
            distance_from_ref = calculateDistance(
              item.gps_latitude,
              item.gps_longitude,
              refLocation.latitude,
              refLocation.longitude
            );
            is_within_radius = distance_from_ref <= refLocation.radius_meter;
          }
        }

        return {
          ...item,
          status: item.status as AttendanceStatus,
          waktu_halaqah: item.waktu_halaqah as WaktuHalaqah | null,
          user_nama: profileMap.get(item.user_id) || 'Unknown',
          distance_from_ref,
          is_within_radius,
        };
      });

      return records;
    },
    enabled: !!user && user.role === 'admin',
  });
}

export function useTodayAbsensi(waktuHalaqah?: WaktuHalaqah) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['today_absensi', user?.id, today, waktuHalaqah],
    queryFn: async () => {
      let query = supabase
        .from('absensi_guru')
        .select('*')
        .eq('user_id', user!.id)
        .eq('tanggal', today);

      if (waktuHalaqah) {
        query = query.eq('waktu_halaqah', waktuHalaqah);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AbsensiRecord[];
    },
    enabled: !!user,
  });
}

export function useCheckIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  return useMutation({
    mutationFn: async (data: {
      waktu_halaqah: WaktuHalaqah;
      status?: AttendanceStatus;
      keterangan?: string;
      latitude?: number;
      longitude?: number;
      alamat_lokasi?: string;
    }) => {
      const { error } = await supabase.from('absensi_guru').insert({
        user_id: user!.id,
        tanggal: today,
        waktu_check_in: new Date().toISOString(),
        waktu_halaqah: data.waktu_halaqah,
        status: data.status || 'present',
        keterangan: data.keterangan || null,
        gps_latitude: data.latitude || null,
        gps_longitude: data.longitude || null,
        alamat_lokasi: data.alamat_lokasi || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today_absensi'] });
      queryClient.invalidateQueries({ queryKey: ['absensi'] });
      queryClient.invalidateQueries({ queryKey: ['today_stats'] });
      queryClient.invalidateQueries({ queryKey: ['all_absensi'] });
    },
  });
}

export function useCheckOut() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  return useMutation({
    mutationFn: async (waktuHalaqah: WaktuHalaqah) => {
      const { error } = await supabase
        .from('absensi_guru')
        .update({ waktu_check_out: new Date().toISOString() })
        .eq('user_id', user!.id)
        .eq('tanggal', today)
        .eq('waktu_halaqah', waktuHalaqah);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today_absensi'] });
      queryClient.invalidateQueries({ queryKey: ['absensi'] });
    },
  });
}

export function useAbsensiSummary(month?: number, year?: number) {
  const { data: absensiData } = useAbsensi(month, year);

  const summary: AbsensiSummary = {
    present: 0,
    izin: 0,
    sakit: 0,
    dinas_luar: 0,
    alfa: 0,
    total: 0,
  };

  if (absensiData) {
    absensiData.forEach((record) => {
      summary[record.status]++;
      summary.total++;
    });
  }

  return summary;
}

export function useTodayAbsensiStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['today_absensi_stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('absensi_guru')
        .select('waktu_halaqah')
        .eq('tanggal', today)
        .not('waktu_check_in', 'is', null);

      if (error) throw error;

      const subuhCount = data?.filter((a) => a.waktu_halaqah === 'subuh').length || 0;
      const maghribCount = data?.filter((a) => a.waktu_halaqah === 'maghrib').length || 0;

      return {
        total: data?.length || 0,
        subuh: subuhCount,
        maghrib: maghribCount,
      };
    },
    enabled: !!user && user.role === 'admin',
  });
}

export function useSaveHalaqahLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id?: string;
      nama: string;
      waktu_halaqah: WaktuHalaqah;
      latitude: number;
      longitude: number;
      radius_meter: number;
      alamat?: string;
    }) => {
      if (data.id) {
        const { error } = await supabase
          .from('halaqah_locations')
          .update({
            nama: data.nama,
            waktu_halaqah: data.waktu_halaqah,
            latitude: data.latitude,
            longitude: data.longitude,
            radius_meter: data.radius_meter,
            alamat: data.alamat,
          })
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('halaqah_locations').insert({
          nama: data.nama,
          waktu_halaqah: data.waktu_halaqah,
          latitude: data.latitude,
          longitude: data.longitude,
          radius_meter: data.radius_meter,
          alamat: data.alamat,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqah_locations'] });
    },
  });
}

export function useDeleteHalaqahLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('halaqah_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqah_locations'] });
    },
  });
}
