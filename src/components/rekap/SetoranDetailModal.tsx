import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen } from 'lucide-react';
import { useSetoranDetail } from '@/hooks/useRekapHafalan';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface SetoranDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  santriId: string;
  santriNama: string;
  bulan: string;
  tahun: number;
}

export default function SetoranDetailModal({
  open,
  onOpenChange,
  santriId,
  santriNama,
  bulan,
  tahun,
}: SetoranDetailModalProps) {
  const { data: setoranList, isLoading } = useSetoranDetail(santriId, bulan, tahun);

  const totalHalaman = setoranList?.reduce((acc: number, s) => acc + s.jumlahHalaman, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Detail Setoran - {santriNama}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Bulan {bulan} {tahun}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !setoranList || setoranList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada setoran di bulan ini</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex gap-4 mb-4">
              <Badge variant="outline" className="px-3 py-1.5">
                📘 Total: {totalHalaman} halaman
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5">
                📝 {setoranList.length} setoran
              </Badge>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No</TableHead>
                    <TableHead>Surat</TableHead>
                    <TableHead>Ayat</TableHead>
                    <TableHead className="text-center">Halaman</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Guru</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setoranList.map((setoran, index) => (
                    <TableRow key={setoran.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{setoran.surat || '-'}</TableCell>
                      <TableCell>{setoran.ayat || '-'}</TableCell>
                      <TableCell className="text-center font-semibold text-primary">
                        {setoran.jumlahHalaman}
                      </TableCell>
                      <TableCell>
                        {format(new Date(setoran.tanggal), 'd MMM yyyy', { locale: id })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {setoran.recordedBy || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Keterangan */}
            {setoranList.some((s) => s.keterangan) && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2 text-sm">Catatan:</h4>
                {setoranList
                  .filter((s) => s.keterangan)
                  .map((s, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      • {s.keterangan}
                    </p>
                  ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
