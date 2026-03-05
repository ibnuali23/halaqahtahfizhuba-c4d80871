export type KelasType = 'Angkatan 1' | 'Angkatan 2' | 'Angkatan 3';

export interface Santri {
  id: string;
  nama: string;
  kelas: KelasType;
  musyrif: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetoranHafalan {
  id: string;
  santriId: string;
  santriNama: string;
  musyrif: string;
  kelas: KelasType;
  bulan: string;
  tahun: number;
  jumlahHalaman: number;
  surat: string;
  ayat: string;
  tanggal: Date;
  keterangan?: string;
}

export interface HafalanSummary {
  santriId: string;
  santriNama: string;
  musyrif: string;
  kelas: KelasType;
  januari: number;
  februari: number;
  maret: number;
  april: number;
  mei: number;
  juni: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;
  totalHafalan: number;
  setoranTerakhir: string;
  status: 'tercapai' | 'tidak tercapai';
  targetBulanan: number;
}

export interface LaporanBulanan {
  bulan: string;
  tahun: number;
  totalSetoran: number;
  jumlahSantri: number;
  rataRataHafalan: number;
  santriTercapai: number;
  santriTidakTercapai: number;
  detailPerKelas: {
    angkatan1: number;
    angkatan2: number;
    angkatan3: number;
  };
  detailPerMusyrif: {
    musyrif: string;
    totalHafalan: number;
    jumlahSantri: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  nama: string;
  role: 'admin' | 'guru' | 'wali_santri';
  musyrifNama?: string; // For guru role
}

export interface MonthlyProgress {
  bulan: string;
  totalHalaman: number;
  jumlahSantri: number;
}

export interface RekapSantri {
  santriId: string;
  santriNama: string;
  halaqah: string;
  kelas: string;
  totalHalamanBulan: number;
  jumlahSetoran: number;
  ayatTerakhir: string;
  tanggalTerakhir: string;
  isActive: boolean;
  totalJuz: number;
}
