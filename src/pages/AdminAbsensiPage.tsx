import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAllAbsensi,
  useHalaqahLocations,
  useSaveHalaqahLocation,
  useDeleteHalaqahLocation,
  useGuruProfiles,
  AbsensiRecord,
  WaktuHalaqah,
  getWIBDate,
  getWIBTime,
} from '@/hooks/useAbsensi';
import { useTodayAbsensiStats } from '@/hooks/useAbsensi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Loader2,
  Users,
  Sun,
  Moon,
  MapPin,
  Calendar,
  Download,
  Settings,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  present: 'Hadir',
  izin: 'Izin',
  sakit: 'Sakit',
  dinas_luar: 'Dinas Luar',
  alfa: 'Alfa',
};

const statusColors: Record<string, string> = {
  present: 'bg-green-500',
  izin: 'bg-blue-500',
  sakit: 'bg-yellow-500',
  dinas_luar: 'bg-purple-500',
  alfa: 'bg-red-500',
};

function LocationSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [waktuHalaqah, setWaktuHalaqah] = useState<WaktuHalaqah>('subuh');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('100');
  const [alamat, setAlamat] = useState('');

  const { data: locations, isLoading } = useHalaqahLocations();
  const saveMutation = useSaveHalaqahLocation();
  const deleteMutation = useDeleteHalaqahLocation();

  const resetForm = () => {
    setEditId(null);
    setNama('');
    setWaktuHalaqah('subuh');
    setLatitude('');
    setLongitude('');
    setRadius('100');
    setAlamat('');
  };

  const handleEdit = (loc: {
    id: string;
    nama: string;
    waktu_halaqah: WaktuHalaqah;
    latitude: number;
    longitude: number;
    radius_meter: number;
    alamat?: string;
  }) => {
    setEditId(loc.id);
    setNama(loc.nama);
    setWaktuHalaqah(loc.waktu_halaqah);
    setLatitude(loc.latitude.toString());
    setLongitude(loc.longitude.toString());
    setRadius(loc.radius_meter.toString());
    setAlamat(loc.alamat || '');
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        id: editId || undefined,
        nama,
        waktu_halaqah: waktuHalaqah,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius_meter: parseInt(radius),
        alamat: alamat || undefined,
      });
      toast.success('Lokasi halaqah berhasil disimpan');
      resetForm();
    } catch (error) {
      const err = error as { message?: string };
      toast.error('Gagal menyimpan: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Lokasi berhasil dihapus');
    } catch (error) {
      const err = error as { message?: string };
      toast.error('Gagal menghapus: ' + err.message);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          toast.success('Lokasi saat ini berhasil diambil');
        },
        (error) => {
          toast.error('Gagal mendapatkan lokasi: ' + (error as GeolocationPositionError).message);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Kelola Lokasi Halaqah
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Pengaturan Lokasi Halaqah</DialogTitle>
        </DialogHeader>

        {/* Existing Locations */}
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : locations && locations.length > 0 ? (
            locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-accent/30"
              >
                <div className="flex items-center gap-3">
                  {loc.waktu_halaqah === 'subuh' ? (
                    <Sun className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Moon className="h-5 w-5 text-indigo-600" />
                  )}
                  <div>
                    <p className="font-medium">{loc.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {loc.alamat || `${loc.latitude}, ${loc.longitude}`} • Radius: {loc.radius_meter}m
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(loc)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(loc.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Belum ada lokasi halaqah yang ditentukan
            </p>
          )}
        </div>

        {/* Add/Edit Form */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editId ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Lokasi</Label>
              <Input
                placeholder="Masjid Utama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Waktu Halaqah</Label>
              <Select
                value={waktuHalaqah}
                onValueChange={(v) => setWaktuHalaqah(v as WaktuHalaqah)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subuh">Halaqah Subuh</SelectItem>
                  <SelectItem value="maghrib">Halaqah Maghrib</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                placeholder="-6.123456"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                placeholder="106.123456"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Radius (meter)</Label>
              <Input
                type="number"
                placeholder="100"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
              <MapPin className="h-4 w-4 mr-2" />
              Gunakan Lokasi Saat Ini
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Alamat (Opsional)</Label>
            <Input
              placeholder="Jl. Contoh No. 123"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          {editId && (
            <Button variant="outline" onClick={resetForm}>
              Batal Edit
            </Button>
          )}
          <Button onClick={handleSave} disabled={saveMutation.isPending || !nama || !latitude || !longitude}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editId ? 'Simpan Perubahan' : 'Tambah Lokasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AbsensiRow({ record }: { record: AbsensiRecord }) {
  const openInMaps = () => {
    if (record.gps_latitude && record.gps_longitude) {
      window.open(
        `https://www.google.com/maps?q=${record.gps_latitude},${record.gps_longitude}`,
        '_blank'
      );
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{record.user_nama}</p>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm">
          {format(new Date(record.tanggal), 'd MMM yyyy', { locale: id })}
        </span>
      </TableCell>
      <TableCell>
        {record.waktu_halaqah && (
          <Badge variant="outline" className="gap-1">
            {record.waktu_halaqah === 'subuh' ? (
              <Sun className="h-3 w-3" />
            ) : (
              <Moon className="h-3 w-3" />
            )}
            {record.waktu_halaqah === 'subuh' ? 'Subuh' : 'Maghrib'}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {record.waktu_check_in
          ? format(new Date(record.waktu_check_in), 'HH:mm')
          : '-'}
      </TableCell>
      <TableCell>
        <Badge className={`${statusColors[record.status]} text-white`}>
          {statusLabels[record.status]}
        </Badge>
        {record.status !== 'present' && (
          <span className="text-[10px] block text-muted-foreground mt-0.5">
            (Tidak Hadir)
          </span>
        )}
      </TableCell>
      <TableCell>
        {record.gps_latitude && record.gps_longitude ? (
          <div className="flex items-center gap-2">
            {record.is_within_radius !== undefined && (
              record.is_within_radius ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-amber-500" />
              )
            )}
            <span className="text-xs text-muted-foreground max-w-[150px] truncate">
              {record.alamat_lokasi || `${record.gps_latitude.toFixed(4)}, ${record.gps_longitude.toFixed(4)}`}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        {record.distance_from_ref !== undefined ? (
          <span className={`text-sm ${record.is_within_radius ? 'text-green-600' : 'text-amber-600'}`}>
            {Math.round(record.distance_from_ref)}m
          </span>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        {record.gps_latitude && record.gps_longitude && (
          <Button variant="ghost" size="sm" onClick={openInMaps}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function AdminAbsensiPage() {
  const { user } = useAuth();
  const nowWib = getWIBTime();
  const [month, setMonth] = useState(nowWib.getMonth() + 1);
  const [year, setYear] = useState(nowWib.getFullYear());
  const [filterGuru, setFilterGuru] = useState<string>('all');
  const [filterWaktu, setFilterWaktu] = useState<string>('all');

  const { data: absensiData, isLoading } = useAllAbsensi(month, year);
  const { data: todayStats } = useTodayAbsensiStats();
  const { data: allGuruProfiles } = useGuruProfiles();

  // Filter data (include generated alfa records)
  let filteredData = absensiData || [];

  if (filterGuru !== 'all') {
    filteredData = filteredData.filter((a) => a.user_nama === filterGuru);
  }

  if (filterWaktu !== 'all') {
    filteredData = filteredData.filter((a) => a.waktu_halaqah === filterWaktu);
  }

  // Get unique guru names from profiles (not just from attendance records)
  const guruNames = useMemo(() => {
    const fromProfiles = (allGuruProfiles || []).map((p) => p.nama);
    const fromRecords = (absensiData || []).map((a) => a.user_nama).filter(Boolean);
    return Array.from(new Set([...fromProfiles, ...fromRecords])).sort();
  }, [allGuruProfiles, absensiData]);

  // Create daily summary per guru with auto-alfa for missing check-ins
  const dailySummary = useMemo(() => {
    const guruList = (allGuruProfiles || []).map((p) => p.nama);
    if (guruList.length === 0 && (!absensiData || absensiData.length === 0)) return [];

    // Build attendance lookup: key = "tanggal_userName"
    const attendanceMap = new Map<string, {
      subuh: AbsensiRecord | null;
      maghrib: AbsensiRecord | null;
    }>();

    (absensiData || []).forEach((record) => {
      const key = `${record.tanggal}_${record.user_nama}`;
      if (!attendanceMap.has(key)) {
        attendanceMap.set(key, { subuh: null, maghrib: null });
      }
      const entry = attendanceMap.get(key)!;
      if (record.waktu_halaqah === 'subuh') {
        entry.subuh = record;
      } else if (record.waktu_halaqah === 'maghrib') {
        entry.maghrib = record;
      }
    });

    // Generate dates from day 1 to today (or end of month if past)
    const today = getWIBDate();
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayDate = new Date(today);
    const dates: string[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      // Only include dates up to today
      if (new Date(dateStr) <= todayDate) {
        dates.push(dateStr);
      }
    }

    // For each date and each guru, create summary entry
    const result: {
      tanggal: string;
      user_nama: string;
      subuh: AbsensiRecord | null;
      maghrib: AbsensiRecord | null;
      subuhAlfa: boolean;
      maghribAlfa: boolean;
    }[] = [];

    const allGuru = guruList.length > 0 ? guruList : Array.from(new Set((absensiData || []).map(a => a.user_nama)));

    dates.forEach((dateStr) => {
      allGuru.forEach((guruNama) => {
        const key = `${dateStr}_${guruNama}`;
        const existing = attendanceMap.get(key);

        result.push({
          tanggal: dateStr,
          user_nama: guruNama,
          subuh: existing?.subuh || null,
          maghrib: existing?.maghrib || null,
          subuhAlfa: !existing?.subuh,
          maghribAlfa: !existing?.maghrib,
        });
      });
    });

    return result.sort((a, b) =>
      new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );
  }, [absensiData, allGuruProfiles, month, year]);

  // Filter daily summary
  const filteredDailySummary = dailySummary.filter((s) => {
    if (filterGuru !== 'all' && s.user_nama !== filterGuru) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (!filteredData.length) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['Tanggal', 'Nama Guru', 'Waktu Halaqah', 'Check-in', 'Check-out', 'Status', 'Latitude', 'Longitude', 'Alamat', 'Jarak (m)'];
    const rows = filteredData.map((a) => [
      format(new Date(a.tanggal), 'yyyy-MM-dd'),
      a.user_nama,
      a.waktu_halaqah || '-',
      a.waktu_check_in ? format(new Date(a.waktu_check_in), 'HH:mm') : '-',
      a.waktu_check_out ? format(new Date(a.waktu_check_out), 'HH:mm') : '-',
      statusLabels[a.status],
      a.gps_latitude || '-',
      a.gps_longitude || '-',
      a.alamat_lokasi || '-',
      a.distance_from_ref !== undefined ? Math.round(a.distance_from_ref) : '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `absensi_guru_${year}_${month}.csv`;
    link.click();

    toast.success('Data absensi berhasil diekspor');
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini</p>
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
              Laporan Absensi Guru
            </h1>
            <p className="text-muted-foreground mt-1">
              Pantau kehadiran guru halaqah
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LocationSettingsDialog />
            <Button onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Today Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-primary">
                    {todayStats?.total || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Guru Hadir</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <Sun className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="text-2xl font-bold text-amber-600">
                    {todayStats?.subuh || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Hadir Subuh</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                  <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                  <p className="text-2xl font-bold text-indigo-600">
                    {todayStats?.maghrib || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Hadir Maghrib</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent border">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{filteredData.length}</p>
                  <p className="text-xs text-muted-foreground">Total Record Bulan Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Filter Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>Bulan</Label>
                <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {format(new Date(2025, i, 1), 'MMMM', { locale: id })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tahun</Label>
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
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

              <div className="space-y-2">
                <Label>Guru</Label>
                <Select value={filterGuru} onValueChange={setFilterGuru}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Semua Guru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Guru</SelectItem>
                    {guruNames.map((name) => (
                      <SelectItem key={name} value={name || 'unknown'}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Waktu Halaqah</Label>
                <Select value={filterWaktu} onValueChange={setFilterWaktu}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="subuh">Subuh</SelectItem>
                    <SelectItem value="maghrib">Maghrib</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Ringkasan Harian per Guru</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDailySummary.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada data absensi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Guru</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Halaqah Subuh</TableHead>
                      <TableHead>Halaqah Maghrib</TableHead>
                      <TableHead className="text-center">Total Sesi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDailySummary.map((summary) => (
                      <TableRow key={`${summary.tanggal}_${summary.user_nama}`}>
                        <TableCell>
                          <p className="font-medium">{summary.user_nama}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(summary.tanggal), 'EEEE, d MMM yyyy', { locale: id })}
                          </span>
                        </TableCell>
                        <TableCell>
                          {summary.subuh ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <div className="text-sm">
                                <p className={cn(
                                  "font-medium",
                                  summary.subuh.status === 'present' ? "text-green-600" : "text-amber-600"
                                )}>
                                  {statusLabels[summary.subuh.status]}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {summary.subuh.waktu_check_in
                                    ? format(new Date(summary.subuh.waktu_check_in), 'HH:mm')
                                    : '-'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm">Tidak Hadir</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {summary.maghrib ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <div className="text-sm">
                                <p className={cn(
                                  "font-medium",
                                  summary.maghrib.status === 'present' ? "text-green-600" : "text-amber-600"
                                )}>
                                  {statusLabels[summary.maghrib.status]}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {summary.maghrib.waktu_check_in
                                    ? format(new Date(summary.maghrib.waktu_check_in), 'HH:mm')
                                    : '-'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm">Tidak Hadir</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={summary.subuh && summary.maghrib ? 'default' : 'secondary'}>
                            {(summary.subuh ? 1 : 0) + (summary.maghrib ? 1 : 0)} / 2
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Detail Data Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada data absensi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Guru</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Halaqah</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Jarak</TableHead>
                      <TableHead>Peta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((record) => (
                      <AbsensiRow key={record.id} record={record} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
