import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import {
  useTodayAbsensi,
  useAbsensi,
  useCheckIn,
  useCheckOut,
  useAbsensiSummary,
  useHalaqahLocations,
  reverseGeocode,
  calculateDistance,
  AttendanceStatus,
  WaktuHalaqah,
  getWIBDate,
  getWIBTime,
} from '@/hooks/useAbsensi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  Calendar,
  Loader2,
  AlertCircle,
  MapPin,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const statusLabels: Record<AttendanceStatus, string> = {
  present: 'Hadir',
  izin: 'Izin',
  sakit: 'Sakit',
  dinas_luar: 'Dinas Luar',
  alfa: 'Alfa',
};

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-green-500',
  izin: 'bg-blue-500',
  sakit: 'bg-yellow-500',
  dinas_luar: 'bg-purple-500',
  alfa: 'bg-red-500',
};

// Session labels for display
const waktuLabels: Record<WaktuHalaqah, string> = {
  subuh: 'Halaqah Subuh',
  maghrib: 'Halaqah Maghrib',
};

interface LocationState {
  loading: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  alamat: string | null;
  distance: number | null;
  withinRadius: boolean;
}

function CheckInDialog({
  onSuccess,
  subuhCheckedIn,
  maghribCheckedIn
}: {
  onSuccess: () => void;
  subuhCheckedIn: boolean;
  maghribCheckedIn: boolean;
}) {
  // Auto-select available session
  const getDefaultWaktu = (): WaktuHalaqah => {
    if (!subuhCheckedIn) return 'subuh';
    if (!maghribCheckedIn) return 'maghrib';
    return 'subuh';
  };

  const [waktuHalaqah, setWaktuHalaqah] = useState<WaktuHalaqah>(getDefaultWaktu());
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [keterangan, setKeterangan] = useState('');
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    loading: false,
    error: null,
    latitude: null,
    longitude: null,
    alamat: null,
    distance: null,
    withinRadius: true,
  });

  const checkInMutation = useCheckIn();
  const { data: halaqahLocations } = useHalaqahLocations();

  // Get current location when dialog opens
  useEffect(() => {
    if (open && !location.latitude) {
      setLocation((prev) => ({ ...prev, loading: true, error: null }));

      if (!navigator.geolocation) {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: 'Geolocation tidak didukung oleh browser Anda',
        }));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Get address
          const alamat = await reverseGeocode(latitude, longitude);

          // Calculate distance from reference location
          const refLocation = halaqahLocations?.find(
            (loc) => loc.waktu_halaqah === waktuHalaqah
          );

          let distance: number | null = null;
          let withinRadius = true;

          if (refLocation) {
            distance = calculateDistance(
              latitude,
              longitude,
              refLocation.latitude,
              refLocation.longitude
            );
            withinRadius = distance <= refLocation.radius_meter;
          }

          setLocation({
            loading: false,
            error: null,
            latitude,
            longitude,
            alamat,
            distance,
            withinRadius,
          });
        },
        (error) => {
          let errorMessage = 'Gagal mendapatkan lokasi';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Izin lokasi ditolak. Aktifkan akses lokasi.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Lokasi tidak tersedia';
              break;
            case error.TIMEOUT:
              errorMessage = 'Waktu permintaan lokasi habis';
              break;
          }
          setLocation((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, waktuHalaqah]);

  // Recalculate distance when waktu_halaqah changes
  useEffect(() => {
    if (location.latitude && location.longitude && halaqahLocations) {
      const refLocation = halaqahLocations.find(
        (loc) => loc.waktu_halaqah === waktuHalaqah
      );

      if (refLocation) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          refLocation.latitude,
          refLocation.longitude
        );
        setLocation((prev) => ({
          ...prev,
          distance,
          withinRadius: distance <= refLocation.radius_meter,
        }));
      }
    }
  }, [waktuHalaqah, halaqahLocations, location.latitude, location.longitude]);

  const handleCheckIn = async () => {

    // Validate location only for "Hadir" status
    if (status === 'present' && (!location.latitude || !location.longitude)) {
      toast.error('Lokasi GPS wajib diisi untuk status Hadir. Pastikan GPS aktif.');
      return;
    }

    try {
      await checkInMutation.mutateAsync({
        waktu_halaqah: waktuHalaqah,
        status,
        keterangan,
        latitude: status === 'present' ? (location.latitude || undefined) : undefined,
        longitude: status === 'present' ? (location.longitude || undefined) : undefined,
        alamat_lokasi: status === 'present' ? (location.alamat || undefined) : undefined,
      });

      const locationInfo = location.withinRadius
        ? `(Lokasi: ${location.alamat || 'Terdeteksi'})`
        : `(Lokasi: ${location.alamat || 'Terdeteksi'} - Di luar area halaqah)`;

      toast.success(`Check-in berhasil untuk ${waktuLabels[waktuHalaqah]} ${locationInfo}`);
      setOpen(false);
      onSuccess();
    } catch (error) {
      const err = error as { message?: string };
      if (err.message?.includes('unique_absensi_waktu') || err.message?.includes('duplicate')) {
        toast.error(`Anda sudah check-in untuk ${waktuLabels[waktuHalaqah]} hari ini`);
      } else {
        toast.error('Gagal check-in: ' + err.message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="lg">
          <LogIn className="h-5 w-5" />
          Check-in
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Check-in Kehadiran</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Waktu Halaqah <span className="text-destructive">*</span></Label>
            <RadioGroup
              value={waktuHalaqah}
              onValueChange={(v) => setWaktuHalaqah(v as WaktuHalaqah)}
              className="grid grid-cols-2 gap-3"
            >
              <div className={`relative flex items-center justify-center rounded-lg border-2 p-4 transition-all ${waktuHalaqah === 'subuh' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                } ${subuhCheckedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <RadioGroupItem
                  value="subuh"
                  id="subuh"
                  disabled={subuhCheckedIn}
                  className="sr-only"
                />
                <label
                  htmlFor="subuh"
                  className={`flex flex-col items-center gap-2 ${subuhCheckedIn ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Sun className={`h-6 w-6 ${waktuHalaqah === 'subuh' ? 'text-primary' : 'text-amber-500'}`} />
                  <span className="font-medium text-sm">Halaqah Subuh</span>
                  {subuhCheckedIn && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Sudah Check-in
                    </span>
                  )}
                </label>
              </div>
              <div className={`relative flex items-center justify-center rounded-lg border-2 p-4 transition-all ${waktuHalaqah === 'maghrib' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                } ${maghribCheckedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <RadioGroupItem
                  value="maghrib"
                  id="maghrib"
                  disabled={maghribCheckedIn}
                  className="sr-only"
                />
                <label
                  htmlFor="maghrib"
                  className={`flex flex-col items-center gap-2 ${maghribCheckedIn ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Moon className={`h-6 w-6 ${waktuHalaqah === 'maghrib' ? 'text-primary' : 'text-indigo-500'}`} />
                  <span className="font-medium text-sm">Halaqah Maghrib</span>
                  {maghribCheckedIn && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Sudah Check-in
                    </span>
                  )}
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Location Status */}
          <div className="p-3 rounded-lg bg-accent/50 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Lokasi GPS
            </div>
            {location.loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mendapatkan lokasi...
              </div>
            ) : location.error ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {location.error}
              </div>
            ) : location.latitude ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground truncate">
                  {location.alamat}
                </p>
                {location.distance !== null && (
                  <div className={`flex items-center gap-2 text-sm ${location.withinRadius ? 'text-green-600' : 'text-amber-600'
                    }`}>
                    {location.withinRadius ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span>
                      {location.withinRadius
                        ? 'Di dalam area halaqah'
                        : `Di luar area (${Math.round(location.distance)}m dari titik halaqah)`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Lokasi belum terdeteksi</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status Kehadiran</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as AttendanceStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Hadir</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
                <SelectItem value="dinas_luar">Dinas Luar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Keterangan (Opsional)</Label>
            <Textarea
              placeholder="Catatan tambahan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            onClick={handleCheckIn}
            className="w-full gap-2"
            disabled={checkInMutation.isPending || location.loading}
          >
            {checkInMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Konfirmasi Check-in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TodaySessionCardProps {
  waktuHalaqah: WaktuHalaqah;
  record: {
    id: string;
    status: AttendanceStatus;
    waktu_check_in: string | null;
    waktu_check_out: string | null;
    keterangan: string | null;
    alamat_lokasi: string | null;
  } | null;
  onCheckOut: (waktu: WaktuHalaqah) => void;
  isCheckingOut: boolean;
}

function TodaySessionCard({ waktuHalaqah, record, onCheckOut, isCheckingOut }: TodaySessionCardProps) {
  const Icon = waktuHalaqah === 'subuh' ? Sun : Moon;

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium">{waktuLabels[waktuHalaqah]}</span>
        </div>
        {record ? (
          <Badge className={`${statusColors[record.status]} text-white`}>
            {statusLabels[record.status]}
          </Badge>
        ) : (
          <Badge variant="outline">Belum Check-in</Badge>
        )}
      </div>

      {record ? (
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <LogIn className="h-4 w-4 text-green-500" />
              <span>
                {record.waktu_check_in
                  ? format(new Date(record.waktu_check_in), 'HH:mm')
                  : '-'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <LogOut className="h-4 w-4 text-red-500" />
              <span>
                {record.waktu_check_out
                  ? format(new Date(record.waktu_check_out), 'HH:mm')
                  : '-'}
              </span>
            </div>
          </div>

          {record.alamat_lokasi && (
            <div className="flex items-start gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{record.alamat_lokasi}</span>
            </div>
          )}

          {record.keterangan && (
            <p className="text-xs text-muted-foreground">
              {record.keterangan}
            </p>
          )}

          {!record.waktu_check_out && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 mt-2"
              onClick={() => onCheckOut(waktuHalaqah)}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Check-out
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">-</p>
      )}
    </div>
  );
}

export default function AbsensiPage() {
  const { user } = useAuth();
  const { data: todayAbsensiList, isLoading: loadingToday, refetch } = useTodayAbsensi();
  const { data: monthlyAbsensi, isLoading: loadingMonthly } = useAbsensi();
  const summary = useAbsensiSummary();
  const checkOutMutation = useCheckOut();

  const subuhRecord = todayAbsensiList?.find((r) => r.waktu_halaqah === 'subuh') || null;
  const maghribRecord = todayAbsensiList?.find((r) => r.waktu_halaqah === 'maghrib') || null;

  const handleCheckOut = async (waktuHalaqah: WaktuHalaqah) => {
    try {
      await checkOutMutation.mutateAsync(waktuHalaqah);
      toast.success(`Check-out ${waktuLabels[waktuHalaqah]} berhasil!`);
      refetch();
    } catch (error) {
      const err = error as { message?: string };
      toast.error('Gagal check-out: ' + err.message);
    }
  };

  const currentMonth = format(getWIBTime(), 'MMMM yyyy', { locale: id });

  if (loadingToday) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Absensi
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola kehadiran harian Anda
          </p>
        </div>

        {/* Today's Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Status Hari Ini
              </CardTitle>
              {(!subuhRecord || !maghribRecord) && (
                <CheckInDialog
                  onSuccess={refetch}
                  subuhCheckedIn={!!subuhRecord}
                  maghribCheckedIn={!!maghribRecord}
                />
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {format(getWIBTime(), 'EEEE, d MMMM yyyy', { locale: id })}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TodaySessionCard
                  waktuHalaqah="subuh"
                  record={subuhRecord}
                  onCheckOut={handleCheckOut}
                  isCheckingOut={checkOutMutation.isPending}
                />
                <TodaySessionCard
                  waktuHalaqah="maghrib"
                  record={maghribRecord}
                  onCheckOut={handleCheckOut}
                  isCheckingOut={checkOutMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Ringkasan Bulan {currentMonth}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-2xl font-bold text-green-600">
                    {summary.present}
                  </p>
                  <p className="text-xs text-muted-foreground">Hadir</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.izin}
                  </p>
                  <p className="text-xs text-muted-foreground">Izin</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                  <p className="text-2xl font-bold text-yellow-600">
                    {summary.sakit}
                  </p>
                  <p className="text-xs text-muted-foreground">Sakit</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <p className="text-2xl font-bold text-purple-600">
                    {summary.dinas_luar}
                  </p>
                  <p className="text-xs text-muted-foreground">Dinas Luar</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
                  <p className="text-2xl font-bold text-red-600">
                    {summary.alfa}
                  </p>
                  <p className="text-xs text-muted-foreground">Alfa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Riwayat Kehadiran</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMonthly ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : monthlyAbsensi && monthlyAbsensi.length > 0 ? (
                <div className="space-y-2">
                  {monthlyAbsensi.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${statusColors[record.status]}`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {format(new Date(record.tanggal), 'EEEE, d MMM', {
                                locale: id,
                              })}
                            </p>
                            {record.waktu_halaqah && (
                              <Badge variant="outline" className="text-xs">
                                {record.waktu_halaqah === 'subuh' ? (
                                  <Sun className="h-3 w-3 mr-1" />
                                ) : (
                                  <Moon className="h-3 w-3 mr-1" />
                                )}
                                {waktuLabels[record.waktu_halaqah]}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {record.keterangan || statusLabels[record.status]}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <p>
                          {record.waktu_check_in
                            ? format(new Date(record.waktu_check_in), 'HH:mm')
                            : '-'}{' '}
                          -{' '}
                          {record.waktu_check_out
                            ? format(new Date(record.waktu_check_out), 'HH:mm')
                            : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Belum ada riwayat kehadiran</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
