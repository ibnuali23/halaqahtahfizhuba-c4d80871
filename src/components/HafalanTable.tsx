import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HafalanSummary } from '@/types/hafalan';
import { Search, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HafalanTableProps {
  data: HafalanSummary[];
}

type SortField = 'santriNama' | 'totalHafalan' | 'musyrif' | 'kelas';
type SortDirection = 'asc' | 'desc';

export default function HafalanTable({ data }: HafalanTableProps) {
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterMusyrif, setFilterMusyrif] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('santriNama');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const musyrifOptions = [...new Set(data.map((d) => d.musyrif))];
  const kelasOptions = [...new Set(data.map((d) => d.kelas))];

  const filteredData = data
    .filter((item) => {
      const matchesSearch = item.santriNama
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesKelas =
        filterKelas === 'all' || item.kelas === filterKelas;
      const matchesMusyrif =
        filterMusyrif === 'all' || item.musyrif === filterMusyrif;
      const matchesStatus =
        filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesKelas && matchesMusyrif && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'santriNama':
          comparison = a.santriNama.localeCompare(b.santriNama);
          break;
        case 'totalHafalan':
          comparison = a.totalHafalan - b.totalHafalan;
          break;
        case 'musyrif':
          comparison = a.musyrif.localeCompare(b.musyrif);
          break;
        case 'kelas':
          comparison = a.kelas.localeCompare(b.kelas);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary-foreground/80"
    >
      {children}
      <ArrowUpDown
        size={14}
        className={cn(
          'opacity-50',
          sortField === field && 'opacity-100'
        )}
      />
    </button>
  );

  const getKelasBadgeVariant = (kelas: string) => {
    if (kelas === 'Angkatan 1') return 'default';
    if (kelas === 'Angkatan 2') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Cari nama santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterKelas} onValueChange={setFilterKelas}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Semua Angkatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Angkatan</SelectItem>
              {kelasOptions.map((kelas) => (
                <SelectItem key={kelas} value={kelas}>
                  {kelas}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterMusyrif} onValueChange={setFilterMusyrif}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Musyrif" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Musyrif</SelectItem>
              {musyrifOptions.map((musyrif) => (
                <SelectItem key={musyrif} value={musyrif}>
                  {musyrif}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="tercapai">Tercapai</SelectItem>
              <SelectItem value="tidak tercapai">Tidak Tercapai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="text-primary-foreground font-semibold">
                  No
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold">
                  <SortableHeader field="santriNama">Nama Santri</SortableHeader>
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold">
                  <SortableHeader field="musyrif">Musyrif</SortableHeader>
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold">
                  <SortableHeader field="kelas">Angkatan</SortableHeader>
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">
                  Jul
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">
                  Ags
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">
                  Sep
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">
                  Okt
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">
                  Nov
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold">
                  <SortableHeader field="totalHafalan">Total (Juz)</SortableHeader>
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold">
                  Setoran Terakhir
                </TableHead>
                <TableHead className="text-primary-foreground font-semibold">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow
                  key={item.santriId}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.santriNama}</TableCell>
                  <TableCell>{item.musyrif}</TableCell>
                  <TableCell>
                    <Badge variant={getKelasBadgeVariant(item.kelas)}>
                      {item.kelas}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{item.juli}</TableCell>
                  <TableCell className="text-center">{item.agustus}</TableCell>
                  <TableCell className="text-center">{item.september}</TableCell>
                  <TableCell className="text-center">{item.oktober}</TableCell>
                  <TableCell className="text-center">{item.november}</TableCell>
                  <TableCell className="font-bold text-primary">
                    {item.totalHafalan} Juz
                  </TableCell>
                  <TableCell className="text-sm">{item.setoranTerakhir}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        item.status === 'tercapai'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      )}
                    >
                      {item.status === 'tercapai' ? 'Tercapai' : 'Tidak Tercapai'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Menampilkan {filteredData.length} dari {data.length} santri
        </p>
      </div>
    </div>
  );
}
