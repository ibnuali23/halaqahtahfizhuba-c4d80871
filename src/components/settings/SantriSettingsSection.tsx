import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Edit2, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSantri, useUpdateSantri, SantriDB } from '@/hooks/useSantriData';
import { toast } from 'sonner';

export function SantriSettingsSection() {
    const { data: santriList, isLoading } = useSantri();
    const updateSantri = useUpdateSantri();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSantri, setEditingSantri] = useState<SantriDB | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredSantri = (santriList || []).filter((s) =>
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.musyrif.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (santri: SantriDB) => {
        setEditingSantri({ ...santri });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingSantri) return;

        try {
            await updateSantri.mutateAsync({
                id: editingSantri.id,
                updates: {
                    nama: editingSantri.nama,
                    kelas: editingSantri.kelas,
                    musyrif: editingSantri.musyrif,
                    status: editingSantri.status || 'aktif',
                },
            });
            toast.success('✅ Perubahan berhasil disimpan');
            setIsDialogOpen(false);
            setEditingSantri(null);
        } catch (error) {
            console.error('Error updating santri:', error);
            toast.error('Gagal menyimpan perubahan');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border bg-card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-lg">Kelola Data Santri</h2>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari santri..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kelas</TableHead>
                            <TableHead>Musyrif</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSantri.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Tidak ada data santri
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSantri.map((santri) => (
                                <TableRow key={santri.id}>
                                    <TableCell className="font-medium">{santri.nama}</TableCell>
                                    <TableCell>{santri.kelas}</TableCell>
                                    <TableCell>{santri.musyrif}</TableCell>
                                    <TableCell>
                                        <Badge variant={santri.status === 'nonaktif' ? 'secondary' : 'default'}>
                                            {santri.status || 'aktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(santri)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Data Santri</DialogTitle>
                    </DialogHeader>
                    {editingSantri && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Santri</Label>
                                <Input
                                    id="nama"
                                    value={editingSantri.nama}
                                    onChange={(e) => setEditingSantri({ ...editingSantri, nama: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kelas">Kelas / Angkatan</Label>
                                <Select
                                    value={editingSantri.kelas}
                                    onValueChange={(value: any) => setEditingSantri({ ...editingSantri, kelas: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Angkatan 1">Angkatan 1</SelectItem>
                                        <SelectItem value="Angkatan 2">Angkatan 2</SelectItem>
                                        <SelectItem value="Angkatan 3">Angkatan 3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="musyrif">Musyrif / Halaqah</Label>
                                <Input
                                    id="musyrif"
                                    value={editingSantri.musyrif}
                                    onChange={(e) => setEditingSantri({ ...editingSantri, musyrif: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={editingSantri.status || 'aktif'}
                                    onValueChange={(value: any) => setEditingSantri({ ...editingSantri, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleSave} disabled={updateSantri.isPending}>
                            {updateSantri.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
