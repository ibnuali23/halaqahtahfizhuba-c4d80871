import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus, Pencil, Trash2, Search, Users, Shield, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  user_id: string;
  nama: string;
  musyrif_nama: string | null;
  created_at: string;
  role?: 'admin' | 'guru' | 'wali_santri';
  email?: string;
}

type AppRole = 'admin' | 'guru' | 'wali_santri';

export default function ManageGuruPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama: '',
    musyrifNama: '',
    role: 'guru' as AppRole,
  });

  // Fetch all musyrif from santri table for reference
  const { data: existingMusyrif } = useQuery({
    queryKey: ['existing-musyrif'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('santri')
        .select('musyrif');
      if (error) throw error;
      const unique = [...new Set(data?.map(s => s.musyrif) || [])];
      return unique.sort();
    },
  });

  // Fetch all user profiles
  const { data: userList, isLoading } = useQuery({
    queryKey: ['user-list'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('nama');

      if (profilesError) throw profilesError;

      // Get roles for each user
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      return (profiles || []).map((profile) => {
        const userRole = (roles || []).find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || 'guru',
        };
      }) as UserProfile[];
    },
  });

  // Add new user mutation using edge function
  const addUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Get current session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Sesi tidak valid. Silakan login ulang.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            nama: data.nama,
            musyrifNama: data.role === 'guru' ? data.musyrifNama : null,
            role: data.role,
          }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat akun');
      }

      return result;
    },
    onSuccess: () => {
      toast.success('✅ Akun berhasil dibuat oleh Admin.');
      setIsAddDialogOpen(false);
      setFormData({ email: '', password: '', nama: '', musyrifNama: '', role: 'guru' });
      queryClient.invalidateQueries({ queryKey: ['user-list'] });
    },
    onError: (error: Error) => {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        toast.error('Email sudah terdaftar.');
      } else {
        toast.error(error.message);
      }
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, user_id, nama, musyrifNama, role }: { 
      id: string; 
      user_id: string;
      nama: string; 
      musyrifNama: string;
      role: AppRole;
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nama, musyrif_nama: role === 'guru' ? musyrifNama : null })
        .eq('id', id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', user_id);

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      toast.success('Data pengguna berhasil diperbarui');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['user-list'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete from profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Delete from user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      toast.success('Akun berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['user-list'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredUsers = (userList || []).filter((user) =>
    user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.musyrif_nama || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!formData.email || !formData.password || !formData.nama) {
      toast.error('Lengkapi semua field wajib');
      return;
    }
    if (formData.role === 'guru' && !formData.musyrifNama) {
      toast.error('Nama halaqah wajib diisi untuk Guru');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    addUserMutation.mutate(formData);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      id: selectedUser.id,
      user_id: selectedUser.user_id,
      nama: selectedUser.nama,
      musyrifNama: selectedUser.musyrif_nama || '',
      role: selectedUser.role || 'guru',
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.user_id);
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary text-primary-foreground"><Shield size={12} className="mr-1" />Admin</Badge>;
      case 'wali_santri':
        return <Badge variant="outline" className="border-amber-500 text-amber-600"><Eye size={12} className="mr-1" />Wali Santri</Badge>;
      default:
        return <Badge variant="secondary">Guru</Badge>;
    }
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'wali_santri': return 'Wali Santri';
      default: return 'Guru';
    }
  };

  // Stats
  const adminCount = userList?.filter(u => u.role === 'admin').length || 0;
  const guruCount = userList?.filter(u => u.role === 'guru').length || 0;
  const waliCount = userList?.filter(u => u.role === 'wali_santri').length || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Kelola Pengguna
            </h1>
            <p className="text-muted-foreground mt-1">
              Tambah, edit, atau hapus akun pengguna sistem
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus size={18} />
                Tambah Pengguna Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Buat akun baru untuk guru halaqah atau wali santri
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Peran / Role <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: AppRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guru">Guru Halaqah</SelectItem>
                      <SelectItem value="wali_santri">Wali Santri (View Only)</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nama Lengkap <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                {formData.role === 'guru' && (
                  <div className="space-y-2">
                    <Label>Nama Halaqah / Musyrif <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="Contoh: Ustadz Ahmad"
                      value={formData.musyrifNama}
                      onChange={(e) => setFormData({ ...formData, musyrifNama: e.target.value })}
                      list="musyrif-suggestions"
                    />
                    <datalist id="musyrif-suggestions">
                      {existingMusyrif?.map(m => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                    <p className="text-xs text-muted-foreground">
                      Ketik nama baru atau pilih dari daftar yang sudah ada
                    </p>
                  </div>
                )}

                {formData.role === 'wali_santri' && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      ℹ️ Akun Wali Santri hanya dapat melihat data hafalan (read-only). 
                      Tidak dapat menambah, mengubah, atau menghapus data.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input
                    type="email"
                    placeholder="email@contoh.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password <span className="text-destructive">*</span></Label>
                  <Input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddUser} disabled={addUserMutation.isPending}>
                  {addUserMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Akun</p>
              <p className="text-2xl font-bold">{userList?.length || 0}</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admin</p>
              <p className="text-2xl font-bold">{adminCount}</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Guru Halaqah</p>
              <p className="text-2xl font-bold">{guruCount}</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Eye className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wali Santri</p>
              <p className="text-2xl font-bold">{waliCount}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau halaqah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card overflow-hidden"
        >
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Memuat data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Halaqah</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pengguna
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{user.nama}</TableCell>
                      <TableCell>{user.musyrif_nama || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role || 'guru')}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={user.role === 'admin'}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Edit Data Pengguna</DialogTitle>
              <DialogDescription>
                Perbarui informasi pengguna
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Peran / Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value: AppRole) => setSelectedUser({ ...selectedUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guru">Guru Halaqah</SelectItem>
                      <SelectItem value="wali_santri">Wali Santri (View Only)</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={selectedUser.nama}
                    onChange={(e) => setSelectedUser({ ...selectedUser, nama: e.target.value })}
                  />
                </div>

                {selectedUser.role === 'guru' && (
                  <div className="space-y-2">
                    <Label>Nama Halaqah / Musyrif</Label>
                    <Input
                      placeholder="Contoh: Ustadz Ahmad"
                      value={selectedUser.musyrif_nama || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, musyrif_nama: e.target.value })}
                      list="musyrif-suggestions-edit"
                    />
                    <datalist id="musyrif-suggestions-edit">
                      {existingMusyrif?.map(m => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Akun Pengguna?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda yakin ingin menghapus akun <strong>{selectedUser?.nama}</strong> ({getRoleLabel(selectedUser?.role || 'guru')})?
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteUserMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
