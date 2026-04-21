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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Users, Loader2 } from 'lucide-react';
import { SantriDB, useSantri } from '@/hooks/useSantriData';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

type KelasType = string;

// Hook to fetch musyrif list from existing data or profiles
function useMusyrifList() {
  return useQuery({
    queryKey: ['musyrif_list'],
    queryFn: async () => {
      // Get guru from profiles
      const { data: guruProfiles, error } = await supabase
        .from('profiles')
        .select('musyrif_nama')
        .not('musyrif_nama', 'is', null);

      if (error) throw error;

      // Also get distinct musyrif from santri table to catch any legacy ones
      const { data: santriMusyrif } = await supabase
        .from('santri')
        .select('musyrif');

      const allMusyrif = [
        ...(guruProfiles?.map(p => p.musyrif_nama) || []),
        ...(santriMusyrif?.map(s => s.musyrif) || [])
      ].filter(Boolean);

      return [...new Set(allMusyrif)].sort();
    }
  });
}

// Hook to fetch Wali Santri users using robust all-data fetch
function useWaliSantriList() {
  return useQuery({
    queryKey: ['wali_santri_list_robust'],
    queryFn: async () => {
      // 1. Fetch all roles
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('*');

      if (roleError) {
        console.error('Error fetching roles:', roleError);
        throw roleError;
      }

      // 2. Filter for wali_santri user_ids
      const waliUserIds = roles
        .filter(r => r.role === 'wali_santri')
        .map(r => r.user_id);

      // 3. Fetch all profiles (to ensure we don't miss any due to narrow filters)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*'); // selecting * to be safe

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      // 4. Map profiles to match wali IDs
      const waliProfiles = (profiles || [])
        .filter(p => waliUserIds.includes(p.user_id || p.id)) // Robust check for ID
        .sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));

      console.log('DEBUG STRATEGY 2', {
        allProfiles: profiles?.length,
        allRoles: roles?.length,
        waliRoleCount: waliUserIds.length,
        matchedProfiles: waliProfiles?.length,
        waliProfiles
      });

      return waliProfiles;
    }
  });
}

export default function SantriPage() {
  const queryClient = useQueryClient();
  const { data: santris, isLoading: loadingSantris } = useSantri();
  const { data: musyrifList } = useMusyrifList();
  const { data: waliList } = useWaliSantriList();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpenInternal, setIsDeleteDialogOpenInternal] = useState(false);
  const [editingSantri, setEditingSantri] = useState<SantriDB | null>(null);

  const [formData, setFormData] = useState<{
    nama: string;
    kelas: KelasType;
    musyrif: string;
    wali_id: string | null;
  }>({
    nama: '',
    kelas: '',
    musyrif: '',
    wali_id: 'none', // 'none' represents null in Select
  });

  // Filter santri
  const filteredSantris = (santris || []).filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  );

  // Mutations
  const addSantriMutation = useMutation({
    mutationFn: async (newSantri: typeof formData) => {
      const { error } = await supabase.from('santri').insert({
        nama: newSantri.nama,
        kelas: newSantri.kelas,
        musyrif: newSantri.musyrif,
        wali_id: newSantri.wali_id === 'none' ? null : newSantri.wali_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Santri baru berhasil ditambahkan');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['santri'] });
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const updateSantriMutation = useMutation({
    mutationFn: async (data: { id: string; updates: typeof formData }) => {
      const { error } = await supabase
        .from('santri')
        .update({
          nama: data.updates.nama,
          kelas: data.updates.kelas,
          musyrif: data.updates.musyrif,
          wali_id: data.updates.wali_id === 'none' ? null : data.updates.wali_id,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Data santri berhasil diperbarui');
      setIsDeleteDialogOpenInternal(false);
      setEditingSantri(null);
      queryClient.invalidateQueries({ queryKey: ['santri'] });
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const deleteSantriMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('santri').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Data santri berhasil dihapus');
      setIsDeleteDialogOpenInternal(false);
      setEditingSantri(null);
      queryClient.invalidateQueries({ queryKey: ['santri'] });
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const handleOpenDialog = (santri?: SantriDB) => {
    if (santri) {
      setEditingSantri(santri);
      setFormData({
        nama: santri.nama,
        kelas: santri.kelas,
        musyrif: santri.musyrif,
        wali_id: santri.wali_id || 'none',
      });
    } else {
      setEditingSantri(null);
      setFormData({
        nama: '',
        kelas: '',
        musyrif: '',
        wali_id: 'none',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSantri) {
      updateSantriMutation.mutate({ id: editingSantri.id, updates: formData });
    } else {
      addSantriMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (editingSantri) {
      deleteSantriMutation.mutate(editingSantri.id);
    }
  };

  const getKelasBadgeVariant = (kelas: string) => {
    if (kelas === 'Angkatan 1') return 'default';
    if (kelas === 'Angkatan 2') return 'secondary';
    return 'outline';
  };

  // Dynamic count per angkatan based on existing santri data
  const angkatanList = Array.from(new Set((santris || []).map((s) => s.kelas).filter(Boolean))).sort();
  const countPerAngkatan: Record<string, number> = angkatanList.reduce((acc, kelas) => {
    acc[kelas] = (santris || []).filter((s) => s.kelas === kelas).length;
    return acc;
  }, {} as Record<string, number>);

  const getWaliName = (waliId?: string | null) => {
    if (!waliId) return '-';
    return waliList?.find(w => w.user_id === waliId)?.nama || 'Unknown';
  };

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
                    ? 'Perbarui informasi santri dan akun wali'
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
                  <Input
                    id="kelas"
                    value={formData.kelas}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas: e.target.value })
                    }
                    placeholder="Contoh: Angkatan 1, Angkatan 4, dll"
                    required
                    list="angkatan-suggestions"
                  />
                  <datalist id="angkatan-suggestions">
                    {angkatanList.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
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
                      <SelectValue placeholder="Pilih atau ketik musyrif" />
                    </SelectTrigger>
                    <SelectContent>
                      {musyrifList?.map((musyrif) => (
                        <SelectItem key={musyrif} value={musyrif as string}>
                          {musyrif as string}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Tambah Baru (Ketik Manual)</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Fallback input if needed, but Select with search/combobox is better. For now simple Select */}
                </div>

                <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
                  <Label htmlFor="wali">Akun Wali Santri</Label>
                  <Select
                    value={formData.wali_id || 'none'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, wali_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Akun Wali" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Belum Ada Wali --</SelectItem>
                      {waliList?.map((wali) => (
                        <SelectItem key={wali.user_id} value={wali.user_id}>
                          {wali.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pilih akun wali untuk mengizinkan akses ke "Rekap Hafalan".
                    <br />
                    <span className="text-xs text-blue-500">
                      Debug: Ditemukan {waliList?.length || 0} akun Wali.
                    </span>
                  </p>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={addSantriMutation.isPending || updateSantriMutation.isPending}>
                    {addSantriMutation.isPending || updateSantriMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      editingSantri ? 'Simpan Perubahan' : 'Tambah Santri'
                    )}
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
              <p className="text-2xl font-bold">{santris?.length || 0}</p>
            </div>
          </div>
          {angkatanList.map((kelas) => (
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
          {loadingSantris ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-semibold">No</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Nama Santri</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Angkatan</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Musyrif</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Wali Santri</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSantris.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data santri
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSantris.map((santri, index) => (
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
                        {santri.wali_id ? (
                          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                            {getWaliName(santri.wali_id)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">Belum terhubung</span>
                        )}
                      </TableCell>
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
                            onClick={() => {
                              setEditingSantri(santri);
                              setIsDeleteDialogOpenInternal(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </motion.div>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpenInternal} onOpenChange={setIsDeleteDialogOpenInternal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Data Santri?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda yakin ingin menghapus data santri <strong>{editingSantri?.nama}</strong>?
                Data hafalan yang terkait juga mungkin akan terhapus atau menjadi yatim.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteSantriMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
