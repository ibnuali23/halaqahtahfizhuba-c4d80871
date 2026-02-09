import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { santriList, musyrifList } from '@/data/santriData';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { Santri, KelasType } from '@/types/hafalan';

const kelasOptions: KelasType[] = ['Angkatan 1', 'Angkatan 2', 'Angkatan 3'];

export default function SantriPage() {
  const [santris, setSantris] = useState<Santri[]>(santriList);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [formData, setFormData] = useState<{
    nama: string;
    kelas: KelasType;
    musyrif: string;
  }>({
    nama: '',
    kelas: 'Angkatan 1',
    musyrif: '',
  });

  const filteredSantris = santris.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = (santri?: Santri) => {
    if (santri) {
      setEditingSantri(santri);
      setFormData({
        nama: santri.nama,
        kelas: santri.kelas,
        musyrif: santri.musyrif,
      });
    } else {
      setEditingSantri(null);
      setFormData({
        nama: '',
        kelas: 'Angkatan 1',
        musyrif: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSantri) {
      // Update existing
      setSantris(
        santris.map((s) =>
          s.id === editingSantri.id
            ? { ...s, ...formData, updatedAt: new Date() }
            : s
        )
      );
      toast.success('Data santri berhasil diperbarui');
    } else {
      // Add new
      const newSantri: Santri = {
        id: String(santris.length + 1),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSantris([...santris, newSantri]);
      toast.success('Santri baru berhasil ditambahkan');
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setSantris(santris.filter((s) => s.id !== id));
    toast.success('Data santri berhasil dihapus');
  };

  const getKelasBadgeVariant = (kelas: string) => {
    if (kelas === 'Angkatan 1') return 'default';
    if (kelas === 'Angkatan 2') return 'secondary';
    return 'outline';
  };

  // Count per angkatan
  const countPerAngkatan = kelasOptions.reduce((acc, kelas) => {
    acc[kelas] = santris.filter((s) => s.kelas === kelas).length;
    return acc;
  }, {} as Record<KelasType, number>);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Data Santri
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola data santri Ma'had Tahfizh Utsman bin Affan
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus size={18} />
                Tambah Santri
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
                </DialogTitle>
                <DialogDescription>
                  {editingSantri
                    ? 'Perbarui informasi santri'
                    : 'Masukkan data santri baru'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    placeholder="Masukkan nama santri"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kelas">Angkatan</Label>
                  <Select
                    value={formData.kelas}
                    onValueChange={(value: KelasType) =>
                      setFormData({ ...formData, kelas: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kelasOptions.map((kelas) => (
                        <SelectItem key={kelas} value={kelas}>
                          {kelas}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="musyrif">Musyrif Halaqah</Label>
                  <Select
                    value={formData.musyrif}
                    onValueChange={(value) =>
                      setFormData({ ...formData, musyrif: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih musyrif" />
                    </SelectTrigger>
                    <SelectContent>
                      {musyrifList.map((musyrif) => (
                        <SelectItem key={musyrif} value={musyrif}>
                          {musyrif}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingSantri ? 'Simpan Perubahan' : 'Tambah Santri'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Santri</p>
              <p className="text-2xl font-bold">{santris.length}</p>
            </div>
          </div>
          {kelasOptions.map((kelas) => (
            <div key={kelas} className="p-4 rounded-lg bg-card border flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kelas}</p>
                <p className="text-2xl font-bold">{countPerAngkatan[kelas]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari nama santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="text-primary-foreground font-semibold">No</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Nama Santri</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Angkatan</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Musyrif</TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSantris.map((santri, index) => (
                <TableRow key={santri.id} className="hover:bg-accent/50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{santri.nama}</TableCell>
                  <TableCell>
                    <Badge variant={getKelasBadgeVariant(santri.kelas)}>
                      {santri.kelas}
                    </Badge>
                  </TableCell>
                  <TableCell>{santri.musyrif}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(santri)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(santri.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </Layout>
  );
}
