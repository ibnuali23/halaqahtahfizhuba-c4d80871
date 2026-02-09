import { HafalanSummary, SetoranHafalan, Santri, MonthlyProgress } from '@/types/hafalan';

// Data santri dari Excel (Updated)
export const santriList: Santri[] = [
  // Angkatan 1
  { id: '1', nama: 'HAMZAH PRATAMA', kelas: 'Angkatan 1', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '2', nama: 'M. ASLIM ASSABIQ', kelas: 'Angkatan 1', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '3', nama: 'MUHAMMAD RAZAK', kelas: 'Angkatan 1', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '4', nama: 'M. SYIHAB PRIYANDHA', kelas: 'Angkatan 1', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '5', nama: 'IZZAT ABDURROZIQ', kelas: 'Angkatan 1', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '6', nama: 'M. DELFANNO ALI AKBAR', kelas: 'Angkatan 1', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '7', nama: 'M. HAFIZ AKBARI ASRI', kelas: 'Angkatan 1', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '8', nama: 'RIZKY RIDHO ILAHI', kelas: 'Angkatan 1', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '9', nama: 'FAIZ IBADURRAHMAN', kelas: 'Angkatan 1', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '10', nama: 'FARHAN RIFQI', kelas: 'Angkatan 1', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '11', nama: 'RIFQI ZULFADHLI', kelas: 'Angkatan 1', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '12', nama: 'ANAS ABDUL HAKIM', kelas: 'Angkatan 1', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '13', nama: 'MUHAMMAD FARHAN', kelas: 'Angkatan 1', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '14', nama: 'MUHAMMAD HABIBI', kelas: 'Angkatan 1', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '15', nama: 'MUHAMMAD ROUF', kelas: 'Angkatan 1', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '16', nama: 'ABDULLAH AZZAM', kelas: 'Angkatan 1', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '17', nama: 'MUHAMMAD SAMI', kelas: 'Angkatan 1', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '18', nama: 'M. Gibran Zikrillah Al Ayemi', kelas: 'Angkatan 1', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '19', nama: 'RASYID AZZIKRI SIREGAR', kelas: 'Angkatan 1', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  
  // Angkatan 2
  { id: '20', nama: 'ABDUL ROSYID RAMADON', kelas: 'Angkatan 2', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '21', nama: 'AMMAR ABDUL HALIM', kelas: 'Angkatan 2', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '22', nama: 'DEZAN ARRASYID MANURUNG', kelas: 'Angkatan 2', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '23', nama: 'MUHAMMAD FARIZ FEBRIZEL', kelas: 'Angkatan 2', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '24', nama: 'MUHAMMAD ALFATEEH NUR', kelas: 'Angkatan 2', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '25', nama: 'MUHAMMAD WILDAN ALFATIH', kelas: 'Angkatan 2', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '26', nama: 'RADOSLAV FATUFIA AZKIO', kelas: 'Angkatan 2', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '27', nama: 'RAIHAN APRIALIS', kelas: 'Angkatan 2', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '28', nama: 'JEVANDRIAN PUTRA', kelas: 'Angkatan 2', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '29', nama: 'M NASHIRUDDIN AL-ALBANI', kelas: 'Angkatan 2', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '30', nama: 'FAKHRI ARDIANSYAH', kelas: 'Angkatan 2', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '31', nama: 'MUHAMMAD FATHIR HABIBI', kelas: 'Angkatan 2', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '32', nama: 'NABIL KHAIRANDI', kelas: 'Angkatan 2', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '33', nama: 'M ZIDANE', kelas: 'Angkatan 2', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '34', nama: 'AL RIZQY KURNIAWAN', kelas: 'Angkatan 2', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '35', nama: 'M ZAHRON', kelas: 'Angkatan 2', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '36', nama: 'MUHAMMAD ROZAAN', kelas: 'Angkatan 2', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '37', nama: 'MUHAMMAD RAJA ILHAM', kelas: 'Angkatan 2', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '38', nama: 'DERASYA RIZKI', kelas: 'Angkatan 2', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '39', nama: 'DAVIN ISNAINI', kelas: 'Angkatan 2', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '40', nama: 'MUHAMMAD JAZIL MARTIUS', kelas: 'Angkatan 2', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '41', nama: 'MUHAMMAD SYAHID AL QASAM', kelas: 'Angkatan 2', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '42', nama: 'RIGA FATIR ASSAKINATA', kelas: 'Angkatan 2', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '43', nama: 'IRSYADUL FIKRI', kelas: 'Angkatan 2', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '44', nama: 'AFIF FADHLAN SAPUTRA', kelas: 'Angkatan 2', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '45', nama: 'BRIAN SYAFIQ', kelas: 'Angkatan 2', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '46', nama: 'ARSYAD ALIFIANDRA', kelas: 'Angkatan 2', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '47', nama: 'BRIAN SADAD', kelas: 'Angkatan 2', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '48', nama: 'M MUKHTARUL MUKHLISIN', kelas: 'Angkatan 2', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '49', nama: 'MUHAMMAD ALFURQON', kelas: 'Angkatan 2', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '50', nama: 'RAJA DARMAWANSYAH', kelas: 'Angkatan 2', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '51', nama: 'SYAKIB ARSELAN ANSHORI', kelas: 'Angkatan 2', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '52', nama: 'M. IKHWAN RAFLI', kelas: 'Angkatan 2', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '53', nama: 'WILDAN ARDATULLAH', kelas: 'Angkatan 2', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '54', nama: 'M RAFFA TRISNA AL SYAKBAN', kelas: 'Angkatan 2', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '55', nama: 'ELVILO JUAN HERLEN', kelas: 'Angkatan 2', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '56', nama: 'RAFIL HIFZHI AL-WAZAN', kelas: 'Angkatan 2', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  
  // Angkatan 3
  { id: '57', nama: 'SAFAROZ MUHTADI', kelas: 'Angkatan 3', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '58', nama: 'MUHAMMAD HAZIQ AL ISRAR', kelas: 'Angkatan 3', musyrif: 'Ustadz Mubarak', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '59', nama: 'NUR ZAIDAN AUFA', kelas: 'Angkatan 3', musyrif: 'Ustadz Thoha', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '60', nama: 'HABIB NAJWAN', kelas: 'Angkatan 3', musyrif: 'Ustadz Bima', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '61', nama: 'FATHAN AL GHAZIY', kelas: 'Angkatan 3', musyrif: 'Ustadz Riyaldi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '62', nama: 'YUSRI ABDURROZAQ SIRAIT', kelas: 'Angkatan 3', musyrif: 'Ustadz Dzahabi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '63', nama: 'HABIB HIDAYATULLAH', kelas: 'Angkatan 3', musyrif: 'Ustadz Yogi', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '64', nama: 'KHOIRUL FAIZ', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '65', nama: 'MUHAMMAD ABRAR ALFATH', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '66', nama: 'MUHAMAD RYZKI SAPUTRA', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '67', nama: 'HISYAM', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '68', nama: 'KHAIRAN LUCKY ZAHWAN', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '69', nama: 'MUHAMMAD ALIF', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '70', nama: 'ALGHI FACHRY PRATAMA', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '71', nama: 'MUHAMMAD MISBAHUL BAYAN MULIADI', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '72', nama: 'ABIGEL ABDILLAH KHUSAIRI', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
  { id: '73', nama: 'MUHAMMAD HILMI ALWARID', kelas: 'Angkatan 3', musyrif: 'Ustadz Rizal', createdAt: new Date('2025-07-01'), updatedAt: new Date('2025-11-30') },
];

// Data hafalan summary dari Excel (Updated)
export const hafalanSummary: HafalanSummary[] = [
  // Angkatan 1
  { santriId: '1', santriNama: 'HAMZAH PRATAMA', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 1', juli: 0, agustus: 19, september: 14, oktober: 16, november: 17, desember: 0, totalHafalan: 14, setoranTerakhir: 'Hud : 5', status: 'tercapai', targetBulanan: 12 },
  { santriId: '2', santriNama: 'M. ASLIM ASSABIQ', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 1', juli: 0, agustus: 12, september: 9, oktober: 6, november: 6, desember: 0, totalHafalan: 15.3, setoranTerakhir: 'Yusuf : 111', status: 'tercapai', targetBulanan: 12 },
  { santriId: '3', santriNama: 'MUHAMMAD RAZAK', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 1', juli: 0, agustus: 8, september: 11, oktober: 25, november: 11, desember: 0, totalHafalan: 11.8, setoranTerakhir: 'Al Araf 137', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '4', santriNama: 'M. SYIHAB PRIYANDHA', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 1', juli: 0, agustus: 12, september: 10, oktober: 13, november: 12, desember: 0, totalHafalan: 10.5, setoranTerakhir: 'Al Anam 101', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '5', santriNama: 'IZZAT ABDURROZIQ', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 1', juli: 0, agustus: 21.5, september: 16, oktober: 0, november: 20, desember: 0, totalHafalan: 14, setoranTerakhir: 'Attaubah 92', status: 'tercapai', targetBulanan: 12 },
  { santriId: '6', santriNama: 'M. DELFANNO ALI AKBAR', musyrif: 'Ustadz Bima', kelas: 'Angkatan 1', juli: 0, agustus: 11, september: 12, oktober: 13, november: 10, desember: 0, totalHafalan: 11, setoranTerakhir: "Al A'raf 87", status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '7', santriNama: 'M. HAFIZ AKBARI ASRI', musyrif: 'Ustadz Bima', kelas: 'Angkatan 1', juli: 0, agustus: 9, september: 14, oktober: 0, november: 12, desember: 0, totalHafalan: 8.5, setoranTerakhir: 'Al maidah 31', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '8', santriNama: 'RIZKY RIDHO ILAHI', musyrif: 'Ustadz Bima', kelas: 'Angkatan 1', juli: 0, agustus: 8, september: 10, oktober: 3, november: 4, desember: 0, totalHafalan: 6.2, setoranTerakhir: 'Ali-Imran 169', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '9', santriNama: 'FAIZ IBADURRAHMAN', musyrif: 'Ustadz Bima', kelas: 'Angkatan 1', juli: 0, agustus: 7, september: 4.5, oktober: 4, november: 4.5, desember: 0, totalHafalan: 6.7, setoranTerakhir: "An nisa' : 5", status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '10', santriNama: 'FARHAN RIFQI', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 1', juli: 0, agustus: 14.5, september: 9, oktober: 9, november: 8.5, desember: 0, totalHafalan: 7.3, setoranTerakhir: 'An nisa : 59', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '11', santriNama: 'RIFQI ZULFADHLI', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 1', juli: 0, agustus: 10.5, september: 10, oktober: 9.5, november: 7.5, desember: 0, totalHafalan: 7, setoranTerakhir: 'An nisa : 29', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '12', santriNama: 'ANAS ABDUL HAKIM', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 1', juli: 0, agustus: 0, september: 0.5, oktober: 3, november: 4, desember: 0, totalHafalan: 1.5, setoranTerakhir: 'Nuh : 28', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '13', santriNama: 'MUHAMMAD FARHAN', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 1', juli: 0, agustus: 8, september: 12, oktober: 10.5, november: 6.5, desember: 0, totalHafalan: 6.8, setoranTerakhir: 'Anisa : 4', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '14', santriNama: 'MUHAMMAD HABIBI', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 1', juli: 0, agustus: 16, september: 10, oktober: 0, november: 16, desember: 0, totalHafalan: 6.9, setoranTerakhir: 'Annisa : 14', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '15', santriNama: 'MUHAMMAD ROUF', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 1', juli: 0, agustus: 8, september: 10, oktober: 3, november: 7.5, desember: 0, totalHafalan: 9.5, setoranTerakhir: "Al an'am : 39", status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '16', santriNama: 'ABDULLAH AZZAM', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 1', juli: 0, agustus: 10, september: 11, oktober: 16, november: 12, desember: 0, totalHafalan: 14.5, setoranTerakhir: 'Hud : 88', status: 'tercapai', targetBulanan: 12 },
  { santriId: '17', santriNama: 'MUHAMMAD SAMI', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 1', juli: 0, agustus: 11, september: 15, oktober: 11, november: 15, desember: 0, totalHafalan: 6.6, setoranTerakhir: 'Ali Imran : 180', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '18', santriNama: 'M. Gibran Zikrillah Al Ayemi', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 1', juli: 0, agustus: 11.5, september: 12, oktober: 12, november: 15, desember: 0, totalHafalan: 8.6, setoranTerakhir: "Annisa' : 127", status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '19', santriNama: 'RASYID AZZIKRI SIREGAR', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 1', juli: 0, agustus: 12, september: 10, oktober: 8, november: 13, desember: 0, totalHafalan: 8.1, setoranTerakhir: "Annisa' : 172", status: 'tidak tercapai', targetBulanan: 12 },

  // Angkatan 2
  { santriId: '20', santriNama: 'ABDUL ROSYID RAMADON', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 2', juli: 0, agustus: 8, september: 10, oktober: 3, november: 4, desember: 0, totalHafalan: 6.9, setoranTerakhir: 'Annisa : 14', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '21', santriNama: 'AMMAR ABDUL HALIM', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 2', juli: 0, agustus: 7, september: 9, oktober: 9, november: 5, desember: 0, totalHafalan: 6.3, setoranTerakhir: 'Ali Imran : 140', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '22', santriNama: 'DEZAN ARRASYID MANURUNG', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 2', juli: 0, agustus: 9, september: 6.5, oktober: 0, november: 5.5, desember: 0, totalHafalan: 14.2, setoranTerakhir: 'Hud : 45', status: 'tercapai', targetBulanan: 12 },
  { santriId: '23', santriNama: 'MUHAMMAD FARIZ FEBRIZEL', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 2', juli: 0, agustus: 9, september: 9, oktober: 10, november: 7, desember: 0, totalHafalan: 6.9, setoranTerakhir: 'Annisa : 14', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '24', santriNama: 'MUHAMMAD ALFATEEH NUR', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 2', juli: 0, agustus: 14, september: 3, oktober: 8, november: 13, desember: 0, totalHafalan: 8.2, setoranTerakhir: 'Al Maidah : 2', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '25', santriNama: 'MUHAMMAD WILDAN ALFATIH', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 2', juli: 0, agustus: 0, september: 5, oktober: 19, november: 6, desember: 0, totalHafalan: 6.1, setoranTerakhir: 'Ali Imran : 108', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '26', santriNama: 'RADOSLAV FATUFIA AZKIO', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 2', juli: 0, agustus: 11, september: 10, oktober: 17, november: 4, desember: 0, totalHafalan: 7.1, setoranTerakhir: 'Annisa : 37', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '27', santriNama: 'RAIHAN APRIALIS', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 2', juli: 0, agustus: 9, september: 10, oktober: 11, november: 12, desember: 0, totalHafalan: 7.6, setoranTerakhir: 'Annisa : 101', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '28', santriNama: 'JEVANDRIAN PUTRA', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 2', juli: 0, agustus: 4, september: 9, oktober: 13, november: 11.5, desember: 0, totalHafalan: 6.6, setoranTerakhir: 'Ali imran 90', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '29', santriNama: 'M NASHIRUDDIN AL-ALBANI', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 2', juli: 0, agustus: 14, september: 9, oktober: 9, november: 10, desember: 0, totalHafalan: 7.3, setoranTerakhir: 'Ali imran 200', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '30', santriNama: 'FAKHRI ARDIANSYAH', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 2', juli: 0, agustus: 5.5, september: 8.5, oktober: 7.5, november: 11.5, desember: 0, totalHafalan: 6.5, setoranTerakhir: 'Ali Imran 80', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '31', santriNama: 'MUHAMMAD FATHIR HABIBI', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 2', juli: 0, agustus: 14, september: 10, oktober: 15, november: 12, desember: 0, totalHafalan: 7.5, setoranTerakhir: 'Annisa 14', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '32', santriNama: 'NABIL KHAIRANDI', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 2', juli: 0, agustus: 11.5, september: 11, oktober: 14, november: 9, desember: 0, totalHafalan: 7.5, setoranTerakhir: 'Annisa 26', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '33', santriNama: 'M ZIDANE', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 2', juli: 0, agustus: 20, september: 16, oktober: 27, november: 30, desember: 0, totalHafalan: 8.2, setoranTerakhir: 'Ali imran 200', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '34', santriNama: 'AL RIZQY KURNIAWAN', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 2', juli: 0, agustus: 3.5, september: 6, oktober: 7.5, november: 5.5, desember: 0, totalHafalan: 3.1, setoranTerakhir: 'Al Hashr 10', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '35', santriNama: 'M ZAHRON', musyrif: 'Ustadz Bima', kelas: 'Angkatan 2', juli: 0, agustus: 9, september: 10, oktober: 14, november: 9, desember: 0, totalHafalan: 6.5, setoranTerakhir: 'Ali Imran 157', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '36', santriNama: 'MUHAMMAD ROZAAN', musyrif: 'Ustadz Bima', kelas: 'Angkatan 2', juli: 0, agustus: 16, september: 14, oktober: 22, november: 12, desember: 0, totalHafalan: 5.6, setoranTerakhir: 'Ali Imran 52', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '37', santriNama: 'MUHAMMAD RAJA ILHAM', musyrif: 'Ustadz Bima', kelas: 'Angkatan 2', juli: 0, agustus: 10, september: 11, oktober: 17, november: 3, desember: 0, totalHafalan: 6.6, setoranTerakhir: 'Al Imran 186', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '38', santriNama: 'DERASYA RIZKI', musyrif: 'Ustadz Bima', kelas: 'Angkatan 2', juli: 0, agustus: 7, september: 5, oktober: 6, november: 6, desember: 0, totalHafalan: 4.8, setoranTerakhir: 'Albaqarah 224', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '39', santriNama: 'DAVIN ISNAINI', musyrif: 'Ustadz Bima', kelas: 'Angkatan 2', juli: 0, agustus: 8, september: 8.5, oktober: 11.5, november: 12, desember: 0, totalHafalan: 6.1, setoranTerakhir: 'Ali imran 100', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '40', santriNama: 'MUHAMMAD JAZIL MARTIUS', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 2', juli: 0, agustus: 3.5, september: 4, oktober: 6, november: 5.5, desember: 0, totalHafalan: 3.6, setoranTerakhir: 'Al baqarah : 93', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '41', santriNama: 'MUHAMMAD SYAHID AL QASAM', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 2', juli: 0, agustus: 7, september: 3, oktober: 5, november: 5, desember: 0, totalHafalan: 3.9, setoranTerakhir: 'Al baqarah : 134', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '42', santriNama: 'RIGA FATIR ASSAKINATA', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 2', juli: 0, agustus: 3, september: 2.5, oktober: 8, november: 9, desember: 0, totalHafalan: 3.8, setoranTerakhir: 'Al baqarah : 119', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '43', santriNama: 'IRSYADUL FIKRI', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 2', juli: 0, agustus: 8, september: 4.5, oktober: 7.5, november: 1, desember: 0, totalHafalan: 3.6, setoranTerakhir: 'Al baqarah : 83', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '44', santriNama: 'AFIF FADHLAN SAPUTRA', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 2', juli: 0, agustus: 8.5, september: 6, oktober: 8, november: 8.5, desember: 0, totalHafalan: 6, setoranTerakhir: 'Ali imran : 104', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '45', santriNama: 'BRIAN SYAFIQ', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 2', juli: 0, agustus: 4.5, september: 3.5, oktober: 7.5, november: 4, desember: 0, totalHafalan: 4.4, setoranTerakhir: 'Al baqarah : 181', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '46', santriNama: 'ARSYAD ALIFIANDRA', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 2', juli: 0, agustus: 2.5, september: 4.5, oktober: 5.5, november: 8, desember: 0, totalHafalan: 2.8, setoranTerakhir: 'At taghabun : 18', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '47', santriNama: 'BRIAN SADAD', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 2', juli: 0, agustus: 10, september: 11, oktober: 11.5, november: 14.5, desember: 0, totalHafalan: 6.5, setoranTerakhir: 'Ali Imran : 173', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '48', santriNama: 'M MUKHTARUL MUKHLISIN', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 2', juli: 0, agustus: 6, september: 4, oktober: 8, november: 13, desember: 0, totalHafalan: 5.8, setoranTerakhir: 'Ali imran : 52', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '49', santriNama: 'MUHAMMAD ALFURQON', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 2', juli: 0, agustus: 11, september: 13, oktober: 16, november: 5.5, desember: 0, totalHafalan: 3.5, setoranTerakhir: 'Al baqarah : 73', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '50', santriNama: 'RAJA DARMAWANSYAH', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 2', juli: 0, agustus: 3, september: 4, oktober: 10, november: 3, desember: 0, totalHafalan: 4.8, setoranTerakhir: 'Al baqarah : 235', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '51', santriNama: 'SYAKIB ARSELAN ANSHORI', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 2', juli: 0, agustus: 6.5, september: 10, oktober: 11, november: 13, desember: 0, totalHafalan: 6, setoranTerakhir: 'Ali Imran : 91', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '52', santriNama: 'M. IKHWAN RAFLI', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 2', juli: 0, agustus: 4.5, september: 4, oktober: 10, november: 12, desember: 0, totalHafalan: 6, setoranTerakhir: 'Ali Imran : 89', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '53', santriNama: 'WILDAN ARDATULLAH', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 2', juli: 0, agustus: 8.5, september: 13, oktober: 15, november: 14, desember: 0, totalHafalan: 7.1, setoranTerakhir: "Annisa' : 37", status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '54', santriNama: 'M RAFFA TRISNA AL SYAKBAN', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 2', juli: 0, agustus: 5.5, september: 4, oktober: 8, november: 5, desember: 0, totalHafalan: 4.9, setoranTerakhir: 'Al baqarah : 246', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '55', santriNama: 'ELVILO JUAN HERLEN', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 2', juli: 0, agustus: 4.5, september: 2, oktober: 7, november: 5, desember: 0, totalHafalan: 3.9, setoranTerakhir: 'Albaqarah : 134', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '56', santriNama: 'RAFIL HIFZHI AL-WAZAN', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 2', juli: 0, agustus: 2, september: 0, oktober: 1, november: 1, desember: 0, totalHafalan: 2.5, setoranTerakhir: 'As Shaf : 9', status: 'tidak tercapai', targetBulanan: 12 },

  // Angkatan 3
  { santriId: '57', santriNama: 'SAFAROZ MUHTADI', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 3', juli: 0, agustus: 22, september: 21, oktober: 19, november: 8, desember: 0, totalHafalan: 3.4, setoranTerakhir: 'Al baqarah : 61', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '58', santriNama: 'MUHAMMAD HAZIQ AL ISRAR', musyrif: 'Ustadz Mubarak', kelas: 'Angkatan 3', juli: 0, agustus: 22, september: 21, oktober: 16.5, november: 11, desember: 0, totalHafalan: 3.7, setoranTerakhir: 'Al baqarah : 105', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '59', santriNama: 'NUR ZAIDAN AUFA', musyrif: 'Ustadz Thoha', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 21, oktober: 4, november: 2.5, desember: 0, totalHafalan: 2.4, setoranTerakhir: 'Alqolam 52', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '60', santriNama: 'HABIB NAJWAN', musyrif: 'Ustadz Bima', kelas: 'Angkatan 3', juli: 0, agustus: 4, september: 7, oktober: 2, november: 2, desember: 0, totalHafalan: 0.7, setoranTerakhir: 'Annaziat : 26', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '61', santriNama: 'FATHAN AL GHAZIY', musyrif: 'Ustadz Riyaldi', kelas: 'Angkatan 3', juli: 0, agustus: 10, september: 13.5, oktober: 11.5, november: 4.5, desember: 0, totalHafalan: 1.8, setoranTerakhir: 'Al Muddtasir : 30', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '62', santriNama: 'YUSRI ABDURROZAQ SIRAIT', musyrif: 'Ustadz Dzahabi', kelas: 'Angkatan 3', juli: 0, agustus: 19, september: 5, oktober: 4.5, november: 5, desember: 0, totalHafalan: 1.4, setoranTerakhir: 'Al muzammil : 20', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '63', santriNama: 'HABIB HIDAYATULLAH', musyrif: 'Ustadz Yogi', kelas: 'Angkatan 3', juli: 0, agustus: 20, september: 3, oktober: 6, november: 8, desember: 0, totalHafalan: 1.9, setoranTerakhir: 'Al Mursalat : 10', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '64', santriNama: 'KHOIRUL FAIZ', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 23, oktober: 7, november: 4, desember: 0, totalHafalan: 1.5, setoranTerakhir: 'Al- jin : 21', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '65', santriNama: 'MUHAMMAD ABRAR ALFATH', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 5.5, oktober: 19, november: 5, desember: 0, totalHafalan: 1.2, setoranTerakhir: "Al- Ma'arij : 20", status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '66', santriNama: 'MUHAMAD RYZKI SAPUTRA', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 6, oktober: 6, november: 12, desember: 0, totalHafalan: 1.2, setoranTerakhir: 'Al-haqqah : 21', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '67', santriNama: 'HISYAM', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 23, oktober: 3.5, november: 4.5, desember: 0, totalHafalan: 1.4, setoranTerakhir: "Al- Ma'arij : 44", status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '68', santriNama: 'KHAIRAN LUCKY ZAHWAN', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 5, oktober: 10, november: 7, desember: 0, totalHafalan: 1, setoranTerakhir: 'Al-Mulk : 10', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '69', santriNama: 'MUHAMMAD ALIF', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 0, oktober: 0, november: 31, desember: 0, totalHafalan: 1.2, setoranTerakhir: 'Al- haqqah : 25', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '70', santriNama: 'ALGHI FACHRY PRATAMA', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 0, oktober: 0, november: 7, desember: 0, totalHafalan: 0.3, setoranTerakhir: 'Al-mutaffifin : 36', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '71', santriNama: 'MUHAMMAD MISBAHUL BAYAN MULIADI', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 0, oktober: 28, november: 3.5, desember: 0, totalHafalan: 1.4, setoranTerakhir: 'Nuh : 11', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '72', santriNama: 'ABIGEL ABDILLAH KHUSAIRI', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 0, oktober: 0, november: 4, desember: 0, totalHafalan: 0.2, setoranTerakhir: 'Abasa : 42', status: 'tidak tercapai', targetBulanan: 12 },
  { santriId: '73', santriNama: 'MUHAMMAD HILMI ALWARID', musyrif: 'Ustadz Rizal', kelas: 'Angkatan 3', juli: 0, agustus: 0, september: 5, oktober: 12.5, november: 11, desember: 0, totalHafalan: 1.2, setoranTerakhir: 'Al-qolam : 42', status: 'tidak tercapai', targetBulanan: 12 },
];

// Progress bulanan untuk chart (Updated)
export const monthlyProgress: MonthlyProgress[] = [
  { bulan: 'Juli', totalHalaman: 0, jumlahSantri: 73 },
  { bulan: 'Agustus', totalHalaman: hafalanSummary.reduce((acc, s) => acc + s.agustus, 0), jumlahSantri: 73 },
  { bulan: 'September', totalHalaman: hafalanSummary.reduce((acc, s) => acc + s.september, 0), jumlahSantri: 73 },
  { bulan: 'Oktober', totalHalaman: hafalanSummary.reduce((acc, s) => acc + s.oktober, 0), jumlahSantri: 73 },
  { bulan: 'November', totalHalaman: hafalanSummary.reduce((acc, s) => acc + s.november, 0), jumlahSantri: 73 },
];

// List musyrif (Updated - added Ustadz Rizal)
export const musyrifList = [
  'Ustadz Dzahabi',
  'Ustadz Bima', 
  'Ustadz Riyaldi',
  'Ustadz Mubarak',
  'Ustadz Thoha',
  'Ustadz Yogi',
  'Ustadz Rizal',
];

// List surat Al-Quran
export const suratList = [
  'Al-Fatihah', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Maidah', 'Al-An\'am', 'Al-A\'raf', 
  'Al-Anfal', 'At-Taubah', 'Yunus', 'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha', 'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun',
  'An-Nur', 'Al-Furqan', 'Ash-Shu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin', 'As-Saffat', 'Sad',
  'Az-Zumar', 'Ghafir', 'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf', 'Adh-Dhariyat', 'At-Tur',
  'An-Najm', 'Al-Qamar', 'Ar-Rahman', 'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadilah', 'Al-Hashr',
  'Al-Mumtahanah', 'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij', 'Nuh', 'Al-Jinn',
  'Al-Muzzammil', 'Al-Muddathir', 'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba',
  'An-Nazi\'at', 'Abasa', 'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq',
  'Al-Buruj', 'At-Tariq', 'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad', 'Ash-Shams',
  'Al-Lail', 'Ad-Duha', 'Ash-Sharh', 'At-Tin', 'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah',
  'Az-Zalzalah', 'Al-Adiyat', 'Al-Qari\'ah', 'At-Takathur', 'Al-Asr', 'Al-Humazah',
  'Al-Fil', 'Quraish', 'Al-Ma\'un', 'Al-Kauthar', 'Al-Kafirun', 'An-Nasr', 'Al-Masad',
  'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
];

// Sample setoran data
export const setoranList: SetoranHafalan[] = hafalanSummary.flatMap((s) => {
  const setoranData: SetoranHafalan[] = [];
  
  if (s.agustus > 0) {
    setoranData.push({
      id: `${s.santriId}-agustus`,
      santriId: s.santriId,
      santriNama: s.santriNama,
      musyrif: s.musyrif,
      kelas: s.kelas,
      bulan: 'Agustus',
      tahun: 2025,
      jumlahHalaman: s.agustus,
      surat: '-',
      ayat: '-',
      tanggal: new Date('2025-08-15'),
      keterangan: 'Setoran bulan Agustus'
    });
  }
  
  if (s.september > 0) {
    setoranData.push({
      id: `${s.santriId}-september`,
      santriId: s.santriId,
      santriNama: s.santriNama,
      musyrif: s.musyrif,
      kelas: s.kelas,
      bulan: 'September',
      tahun: 2025,
      jumlahHalaman: s.september,
      surat: '-',
      ayat: '-',
      tanggal: new Date('2025-09-15'),
      keterangan: 'Setoran bulan September'
    });
  }
  
  if (s.oktober > 0) {
    setoranData.push({
      id: `${s.santriId}-oktober`,
      santriId: s.santriId,
      santriNama: s.santriNama,
      musyrif: s.musyrif,
      kelas: s.kelas,
      bulan: 'Oktober',
      tahun: 2025,
      jumlahHalaman: s.oktober,
      surat: '-',
      ayat: '-',
      tanggal: new Date('2025-10-15'),
      keterangan: 'Setoran bulan Oktober'
    });
  }
  
  if (s.november > 0) {
    setoranData.push({
      id: `${s.santriId}-november`,
      santriId: s.santriId,
      santriNama: s.santriNama,
      musyrif: s.musyrif,
      kelas: s.kelas,
      bulan: 'November',
      tahun: 2025,
      jumlahHalaman: s.november,
      surat: s.setoranTerakhir.split(':')[0]?.trim() || '-',
      ayat: s.setoranTerakhir.split(':')[1]?.trim() || '-',
      tanggal: new Date('2025-11-30'),
      keterangan: 'Setoran terakhir'
    });
  }
  
  return setoranData;
});

// Calculate stats
export const getStats = () => {
  const totalSantri = santriList.length;
  const totalHafalan = hafalanSummary.reduce((acc, s) => acc + s.totalHafalan, 0);
  const santriTercapai = hafalanSummary.filter(s => s.status === 'tercapai').length;
  const santriTidakTercapai = hafalanSummary.filter(s => s.status === 'tidak tercapai').length;
  const rataRataHafalan = totalHafalan / totalSantri;
  
  return {
    totalSantri,
    totalHafalan: totalHafalan.toFixed(1),
    santriTercapai,
    santriTidakTercapai,
    rataRataHafalan: rataRataHafalan.toFixed(1),
    persentaseTercapai: ((santriTercapai / totalSantri) * 100).toFixed(0)
  };
};

// Get hafalan by musyrif
export const getHafalanByMusyrif = () => {
  const grouped = hafalanSummary.reduce((acc, s) => {
    if (!acc[s.musyrif]) {
      acc[s.musyrif] = { totalHafalan: 0, jumlahSantri: 0 };
    }
    acc[s.musyrif].totalHafalan += s.totalHafalan;
    acc[s.musyrif].jumlahSantri += 1;
    return acc;
  }, {} as Record<string, { totalHafalan: number; jumlahSantri: number }>);
  
  return Object.entries(grouped).map(([musyrif, data]) => ({
    musyrif,
    totalHafalan: data.totalHafalan.toFixed(1),
    jumlahSantri: data.jumlahSantri,
    rataRata: (data.totalHafalan / data.jumlahSantri).toFixed(1)
  }));
};

// Get hafalan by angkatan/kelas
export const getHafalanByKelas = () => {
  const grouped = hafalanSummary.reduce((acc, s) => {
    if (!acc[s.kelas]) {
      acc[s.kelas] = { totalHafalan: 0, jumlahSantri: 0 };
    }
    acc[s.kelas].totalHafalan += s.totalHafalan;
    acc[s.kelas].jumlahSantri += 1;
    return acc;
  }, {} as Record<string, { totalHafalan: number; jumlahSantri: number }>);
  
  return Object.entries(grouped).map(([kelas, data]) => ({
    kelas,
    totalHafalan: data.totalHafalan.toFixed(1),
    jumlahSantri: data.jumlahSantri,
    rataRata: (data.totalHafalan / data.jumlahSantri).toFixed(1)
  }));
};
