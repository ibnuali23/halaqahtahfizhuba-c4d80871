import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSetoranFeed, useUpdateSetoran, useDeleteSetoran, SetoranFeedItem } from '@/hooks/useSetoranFeed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, BookOpen, Calendar, User, Eye, Clock, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

function SetoranDetailModal({ item }: { item: SetoranFeedItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Detail Setoran</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Santri</p>
              <p className="font-medium">{item.santri_nama}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kelas</p>
              <p className="font-medium">{item.santri_kelas}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Musyrif</p>
              <p className="font-medium">{item.santri_musyrif}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tanggal</p>
              <p className="font-medium">
                {format(new Date(item.tanggal), 'd MMMM yyyy', { locale: id })}
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Surat</p>
                <p className="font-medium">{item.surat || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ayat</p>
                <p className="font-medium">{item.ayat || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Halaman</p>
                <p className="font-medium">{item.jumlah_halaman} halaman</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bulan</p>
                <p className="font-medium">
                  {item.bulan} {item.tahun}
                </p>
              </div>
            </div>
          </div>
          {item.keterangan && (
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground">Keterangan</p>
              <p className="text-sm mt-1">{item.keterangan}</p>
            </div>
          )}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">Dicatat oleh</p>
            <p className="text-sm font-medium">{item.recorded_by_nama}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(item.created_at), 'd MMM yyyy, HH:mm', {
                locale: id,
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditSetoranDialog({ item, onSuccess }: { item: SetoranFeedItem; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [surat, setSurat] = useState(item.surat || '');
  const [ayat, setAyat] = useState(item.ayat || '');
  const [jumlahHalaman, setJumlahHalaman] = useState(item.jumlah_halaman.toString());
  const [tanggal, setTanggal] = useState(item.tanggal);
  const [keterangan, setKeterangan] = useState(item.keterangan || '');
  
  const updateMutation = useUpdateSetoran();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        surat,
        ayat,
        jumlah_halaman: parseFloat(jumlahHalaman),
        tanggal,
        keterangan,
        old_data: {
          surat: item.surat,
          ayat: item.ayat,
          jumlah_halaman: item.jumlah_halaman,
          tanggal: item.tanggal,
          keterangan: item.keterangan,
        },
      });
      toast.success('Data hafalan berhasil diperbarui');
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error('Gagal memperbarui: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Edit Data Hafalan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Surat</Label>
              <Input value={surat} onChange={(e) => setSurat(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ayat</Label>
              <Input value={ayat} onChange={(e) => setAyat(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jumlah Halaman</Label>
              <Input
                type="number"
                step="0.5"
                value={jumlahHalaman}
                onChange={(e) => setJumlahHalaman(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Setor</Label>
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSetoranDialog({ item, onSuccess }: { item: SetoranFeedItem; onSuccess: () => void }) {
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(1);
  const deleteMutation = useDeleteSetoran();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        id: item.id,
        old_data: {
          santri_nama: item.santri_nama,
          surat: item.surat,
          ayat: item.ayat,
          jumlah_halaman: item.jumlah_halaman,
          tanggal: item.tanggal,
        },
        reason,
      });
      toast.success('Data hafalan berhasil dihapus');
      onSuccess();
    } catch (error: any) {
      toast.error('Gagal menghapus: ' + error.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {step === 1 ? 'Hapus Data Hafalan?' : 'Konfirmasi Penghapusan'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {step === 1 ? (
              <>
                Anda akan menghapus data setoran hafalan{' '}
                <strong>{item.santri_nama}</strong> ({item.surat} {item.ayat}).
                Tindakan ini tidak dapat dibatalkan.
              </>
            ) : (
              <div className="space-y-3">
                <p>Alasan penghapusan (opsional):</p>
                <Textarea
                  placeholder="Tulis alasan penghapusan..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setStep(1)}>Batal</AlertDialogCancel>
          {step === 1 ? (
            <Button variant="destructive" onClick={() => setStep(2)}>
              Lanjutkan
            </Button>
          ) : (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus Permanen
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SetoranItem({ item, onUpdate }: { item: SetoranFeedItem; onUpdate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <BookOpen className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{item.santri_nama}</span>
          {item.is_today && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Hari Ini
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {item.surat} {item.ayat ? `: ${item.ayat}` : ''} •{' '}
          <span className="text-primary font-medium">{item.jumlah_halaman} hal</span>
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{item.recorded_by_nama}</span>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>
            {format(new Date(item.created_at), 'HH:mm', { locale: id })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <SetoranDetailModal item={item} />
        {item.can_edit && <EditSetoranDialog item={item} onSuccess={onUpdate} />}
        {item.can_delete && <DeleteSetoranDialog item={item} onSuccess={onUpdate} />}
      </div>
    </motion.div>
  );
}

interface SetoranFeedProps {
  compact?: boolean;
  maxItems?: number;
  showFilters?: boolean;
}

export default function SetoranFeed({ compact = false, maxItems, showFilters = false }: SetoranFeedProps) {
  const [days, setDays] = useState<number>(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGuru, setFilterGuru] = useState<string>('all');
  const { data: feedItems, isLoading, error, refetch } = useSetoranFeed(days);

  // Get unique guru names for filter
  const guruNames = Array.from(new Set(feedItems?.map((item) => item.recorded_by_nama) || []));

  // Filter items
  let filteredItems = feedItems || [];
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.santri_nama.toLowerCase().includes(query) ||
        item.surat?.toLowerCase().includes(query) ||
        item.santri_musyrif.toLowerCase().includes(query)
    );
  }
  
  if (filterGuru !== 'all') {
    filteredItems = filteredItems.filter((item) => item.recorded_by_nama === filterGuru);
  }

  const displayItems = maxItems ? filteredItems.slice(0, maxItems) : filteredItems;
  const todayItems = displayItems.filter((item) => item.is_today);
  const olderItems = displayItems.filter((item) => !item.is_today);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Gagal memuat riwayat setoran
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Riwayat Setoran
            </h3>
            <Select
              value={days.toString()}
              onValueChange={(v) => setDays(parseInt(v))}
            >
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Hari Ini</SelectItem>
                <SelectItem value="7">7 Hari</SelectItem>
                <SelectItem value="30">30 Hari</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari santri, surat, halaqah..."
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterGuru} onValueChange={setFilterGuru}>
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Guru" />
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
          )}
        </div>
      )}

      <ScrollArea className={compact ? 'h-[350px]' : 'h-[500px]'}>
        {displayItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Belum ada setoran</p>
          </div>
        ) : (
          <div className="space-y-4 pr-4">
            {/* Today's setoran */}
            {todayItems.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                  Hari Ini ({todayItems.length})
                </h4>
                <div className="space-y-1">
                  {todayItems.map((item) => (
                    <SetoranItem key={item.id} item={item} onUpdate={refetch} />
                  ))}
                </div>
              </div>
            )}

            {/* Older setoran */}
            {olderItems.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                  Sebelumnya ({olderItems.length})
                </h4>
                <div className="space-y-1">
                  {olderItems.map((item) => (
                    <SetoranItem key={item.id} item={item} onUpdate={refetch} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
