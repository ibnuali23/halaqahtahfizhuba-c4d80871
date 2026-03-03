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

const MERGE_PREFIX = "_SESSION_DATA_:";

function unmergeRecords(record: AbsensiRecord): AbsensiRecord[] {
  if (!record) return [];

  const records: AbsensiRecord[] = [record as AbsensiRecord];

  if (record.keterangan && record.keterangan.includes(MERGE_PREFIX)) {
    try {
      const parts = record.keterangan.split(MERGE_PREFIX);
      const mainKeterangan = parts[0].trim();
      const mergedData = JSON.parse(parts[1]);

      // Update main record's keterangan to remove the JSON part
      records[0].keterangan = mainKeterangan || null;

      // Add the merged record
      records.push({
        ...record,
        id: `${record.id}_merged`,
        waktu_check_in: mergedData.waktu_check_in,
        waktu_check_out: mergedData.waktu_check_out || null,
        status: mergedData.status,
        waktu_halaqah: mergedData.waktu_halaqah,
        gps_latitude: mergedData.gps_latitude,
        gps_longitude: mergedData.gps_longitude,
        alamat_lokasi: mergedData.alamat_lokasi,
        keterangan: mergedData.keterangan || null,
        created_at: record.created_at,
        updated_at: record.updated_at
      });
    } catch (e) {
      console.error("Failed to parse merged absensi data:", e);
    }
  }

  return records;
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

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    if (!data || typeof data.display_name !== 'string') {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }

    // Sanitize and limit length
    const address = data.display_name
      .substring(0, 500)
      .replace(/[<>]/g, '');

    return address || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
}

// Helper to get current date/time in WIB (Asia/Jakarta)
export function getWIBTime(): Date {
  // Create a date object for the current time
  const now = new Date();
  // Get the time in Jakarta
  const jakartaTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
  return new Date(jakartaTimeStr);
}

export function getWIBTimestamp(): string {
  // Returns a standard ISO string that Supabase interprets as UTC.
  // The frontend will then correctly convert this to local time (WIB) for display.
  return new Date().toISOString();
}

export function getWIBDate(): string {
  // Returns current date in YYYY-MM-DD format based on WIB
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
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

      // Flatten merged records
      return (data || []).flatMap((item) => unmergeRecords(item as unknown as AbsensiRecord));
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

      const records: AbsensiRecord[] = (absensiData || []).flatMap((item) => {
        // Unmerge first to get all sessions
        const items = unmergeRecords(item as unknown as AbsensiRecord);

        return items.map(sessionItem => {
          let distance_from_ref: number | undefined;
          let is_within_radius = true;

          if (sessionItem.gps_latitude && sessionItem.gps_longitude && sessionItem.waktu_halaqah && locations) {
            const refLocation = locations.find(
              (loc) => loc.waktu_halaqah === sessionItem.waktu_halaqah
            );
            if (refLocation) {
              distance_from_ref = calculateDistance(
                sessionItem.gps_latitude,
                sessionItem.gps_longitude,
                refLocation.latitude,
                refLocation.longitude
              );
              is_within_radius = distance_from_ref <= refLocation.radius_meter;
            }
          }

          return {
            ...sessionItem,
            status: sessionItem.status as AttendanceStatus,
            waktu_halaqah: sessionItem.waktu_halaqah as WaktuHalaqah | null,
            user_nama: profileMap.get(sessionItem.user_id) || 'Unknown',
            distance_from_ref,
            is_within_radius,
          };
        });
      });

      return records;
    },
    enabled: !!user && user.role === 'admin',
  });
}

export function useTodayAbsensi(waktuHalaqah?: WaktuHalaqah) {
  const { user } = useAuth();
  const today = getWIBDate();

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

      // Flatten merged records and filter by waktuHalaqah if requested
      const allRecords = (data || []).flatMap(unmergeRecords);
      if (waktuHalaqah) {
        return allRecords.filter(r => r.waktu_halaqah === waktuHalaqah);
      }
      return allRecords;
    },
    enabled: !!user,
  });
}

export function useCheckIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      waktu_halaqah: WaktuHalaqah;
      status?: AttendanceStatus;
      keterangan?: string;
      latitude?: number;
      longitude?: number;
      alamat_lokasi?: string;
    }) => {
      const wibDate = getWIBDate();
      const wibTimestamp = getWIBTimestamp();

      // Check if a record already exists for today
      const { data: existing } = await supabase
        .from('absensi_guru')
        .select('*')
        .eq('user_id', user!.id)
        .eq('tanggal', wibDate)
        .maybeSingle();

      if (existing) {
        // If it's the same session, just update it (overwrite)
        if (existing.waktu_halaqah === data.waktu_halaqah) {
          const { error } = await supabase
            .from('absensi_guru')
            .update({
              waktu_check_in: wibTimestamp,
              waktu_check_out: null, // Reset checkout if re-checking in
              status: data.status || 'present',
              keterangan: data.keterangan || existing.keterangan,
              gps_latitude: data.latitude || null,
              gps_longitude: data.longitude || null,
              alamat_lokasi: data.alamat_lokasi || null,
            })
            .eq('id', existing.id);
          if (error) throw error;
          return;
        }

        // If it's a different session, merge it into keterangan
        const sessionData = {
          waktu_halaqah: data.waktu_halaqah,
          waktu_check_in: wibTimestamp,
          waktu_check_out: null, // Ensure new session has no checkout
          status: data.status || 'present',
          keterangan: data.keterangan || null,
          gps_latitude: data.latitude || null,
          gps_longitude: data.longitude || null,
          alamat_lokasi: data.alamat_lokasi || null,
        };

        const newKeterangan = `${existing.keterangan || ''} ${MERGE_PREFIX}${JSON.stringify(sessionData)}`.trim();

        const { error } = await supabase
          .from('absensi_guru')
          .update({
            keterangan: newKeterangan,
          })
          .eq('id', existing.id);

        if (error) throw error;
        return;
      }

      // No existing record, normal insert
      const { error } = await supabase.from('absensi_guru').insert({
        user_id: user!.id,
        tanggal: wibDate,
        waktu_check_in: wibTimestamp,
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

  return useMutation({
    mutationFn: async (waktuHalaqah: WaktuHalaqah) => {
      const wibDate = getWIBDate();
      const wibTimestamp = getWIBTimestamp();

      // Get existing record to see where to update checkout
      const { data: existing } = await supabase
        .from('absensi_guru')
        .select('*')
        .eq('user_id', user!.id)
        .eq('tanggal', wibDate)
        .maybeSingle();

      if (!existing) return;

      // If main record matches the session
      if (existing.waktu_halaqah === waktuHalaqah) {
        const { error } = await supabase
          .from('absensi_guru')
          .update({ waktu_check_out: wibTimestamp })
          .eq('id', existing.id);
        if (error) throw error;
        return;
      }

      // If it's in the merged data
      if (existing.keterangan && existing.keterangan.includes(MERGE_PREFIX)) {
        const parts = existing.keterangan.split(MERGE_PREFIX);
        const mergedData = JSON.parse(parts[1]);

        if (mergedData.waktu_halaqah === waktuHalaqah) {
          mergedData.waktu_check_out = wibTimestamp;
          const newKeterangan = `${parts[0].trim()} ${MERGE_PREFIX}${JSON.stringify(mergedData)}`.trim();

          const { error } = await supabase
            .from('absensi_guru')
            .update({ keterangan: newKeterangan })
            .eq('id', existing.id);
        }
      }
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
  const today = getWIBDate();

  return useQuery({
    queryKey: ['today_absensi_stats', today],
    queryFn: async () => {

      const { data, error } = await supabase
        .from('absensi_guru')
        .select('waktu_halaqah')
        .eq('tanggal', today)
        .not('waktu_check_in', 'is', null);

      if (error) throw error;

      // Extract all sessions (including merged ones)
      const allData = (data || []).flatMap(unmergeRecords);

      const subuhCount = allData.filter((a) => a.waktu_halaqah === 'subuh').length || 0;
      const maghribCount = allData.filter((a) => a.waktu_halaqah === 'maghrib').length || 0;

      return {
        total: allData.length,
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
