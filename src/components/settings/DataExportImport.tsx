import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

export function DataExportImport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch all hafalan data with santri names
      const { data: setoranData, error: setoranError } = await supabase
        .from('setoran_hafalan')
        .select(`
          *,
          santri:santri_id (nama, kelas, musyrif)
        `)
        .order('tanggal', { ascending: false });

      if (setoranError) throw setoranError;

      // Transform data for Excel
      const excelData = setoranData?.map((item) => ({
        'Tanggal': item.tanggal,
        'Nama Santri': item.santri?.nama || '-',
        'Kelas': item.santri?.kelas || '-',
        'Musyrif': item.santri?.musyrif || '-',
        'Surat': item.surat || '-',
        'Ayat': item.ayat || '-',
        'Jumlah Halaman': item.jumlah_halaman,
        'Bulan': item.bulan,
        'Tahun': item.tahun,
        'Keterangan': item.keterangan || '-',
      })) || [];

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Tanggal
        { wch: 25 }, // Nama Santri
        { wch: 12 }, // Kelas
        { wch: 20 }, // Musyrif
        { wch: 15 }, // Surat
        { wch: 10 }, // Ayat
        { wch: 15 }, // Jumlah Halaman
        { wch: 12 }, // Bulan
        { wch: 8 },  // Tahun
        { wch: 30 }, // Keterangan
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Data Hafalan');

      // Download file
      const fileName = `data-hafalan-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('📤 Data berhasil diekspor.');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Hanya file Excel (.xlsx, .xls) yang diterima');
      return;
    }

    try {
      setIsImporting(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          if (jsonData.length === 0) {
            toast.error('File Excel kosong');
            return;
          }

          // Get all santri for name matching
          const { data: santriList } = await supabase.from('santri').select('id, nama');
          const santriMap = new Map(santriList?.map(s => [s.nama.toLowerCase(), s.id]) || []);

          let imported = 0;
          let skipped = 0;

          interface ExcelRow {
            'Nama Santri'?: string;
            'Tanggal'?: string;
            'Surat'?: string;
            'Ayat'?: string;
            'Jumlah Halaman'?: string | number;
            'Bulan'?: string;
            'Tahun'?: string | number;
            'Keterangan'?: string;
          }

          for (const row of (jsonData as ExcelRow[])) {
            const santriName = row['Nama Santri']?.toLowerCase();
            const santriId = santriName ? santriMap.get(santriName) : null;

            if (!santriId) {
              skipped++;
              continue;
            }

            const { error } = await supabase.from('setoran_hafalan').insert({
              santri_id: santriId,
              tanggal: row['Tanggal'] || new Date().toISOString().split('T')[0],
              surat: row['Surat'] || null,
              ayat: row['Ayat'] || null,
              jumlah_halaman: Number(row['Jumlah Halaman']) || 0,
              bulan: row['Bulan'] || new Date().toLocaleString('id-ID', { month: 'long' }),
              tahun: Number(row['Tahun']) || new Date().getFullYear(),
              keterangan: row['Keterangan'] || null,
            });

            if (!error) imported++;
            else skipped++;
          }

          toast.success(`📥 Data berhasil diimpor. ${imported} baris ditambahkan, ${skipped} baris dilewati.`);
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error('Gagal memproses file Excel');
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Gagal mengimpor data');
      setIsImporting(false);
    }

    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Ekspor Semua Data</p>
          <p className="text-sm text-muted-foreground">
            Unduh seluruh data dalam format Excel
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Import Data</p>
          <p className="text-sm text-muted-foreground">
            Unggah data dari file Excel (.xlsx, .xls)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button variant="outline" size="sm" onClick={handleImportClick} disabled={isImporting}>
          {isImporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Import
        </Button>
      </div>
    </div>
  );
}
