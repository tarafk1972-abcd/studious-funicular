import fs from 'fs';
import path from 'path';
import {
  AppState,
  Incident,
  User,
  ContactInquiry,
  EmergencyType,
  IncidentStatus,
  SatpamStatus,
  WargaStatus,
  UserRole,
  ApprovalStatus,
  ClusterBlockArea,
  AppLanguage,
  Cluster,
  ClusterBilling,
  BillingPlan,
  PatrolPoint,
  PatrolScan,
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'wargajagawarga.json');

// ===== Aplikasi Berbayar: BILLING PER-CLUSTER (Masa Percobaan Gratis 14 Hari) =====
export const TRIAL_DAYS = 14;
export const HARGA_BULANAN = 150000; // Rp 150.000 / bulan / klaster
export const HARGA_TAHUNAN = 1500000; // Rp 1.500.000 / tahun / klaster (hemat 2 bulan)

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// Buat kode undangan unik klaster, format: WJW-XXXXXX
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa karakter ambigu (I, O, 0, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `WJW-${code}`;
}

export function makeTrialBilling(from?: Date): ClusterBilling {
  const start = from || new Date();
  return {
    plan: 'TRIAL',
    status: 'TRIAL',
    trialEndsAt: addDays(start, TRIAL_DAYS).toISOString(),
    amountDue: HARGA_BULANAN,
    note: `Masa percobaan gratis ${TRIAL_DAYS} hari (aplikasi berbayar per-klaster, diawasi Superadmin)`,
  };
}

// Hitung status billing efektif klaster (trial/jatuh tempo kedaluwarsa otomatis terdeteksi)
export function effectiveBilling(billing?: ClusterBilling): ClusterBilling {
  const b = billing || makeTrialBilling();
  if (b.status === 'DITANGGUHKAN') return b;
  if (b.plan === 'GRATIS_SELAMANYA') return { ...b, status: 'AKTIF' };
  const now = Date.now();
  if (b.status === 'AKTIF' && b.paidUntil && new Date(b.paidUntil).getTime() < now) {
    return { ...b, status: 'KEDALUWARSA' };
  }
  if (b.status === 'TRIAL' && new Date(b.trialEndsAt).getTime() < now) {
    return { ...b, status: 'KEDALUWARSA' };
  }
  return b;
}

// Sisa hari trial billing klaster
export function billingTrialDaysLeft(billing: ClusterBilling): number {
  const ms = new Date(billing.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

const INITIAL_MAP_AREAS: ClusterBlockArea[] = [
  { id: 'area-1', blockName: 'Pos Satpam Gerbang Utama', description: 'Gerbang utama & Pos Pengamanan 24 Jam', x: 10, y: 90, type: 'POS_SATPAM' },
  { id: 'area-2', blockName: 'Blok A-01', description: 'Rina Wijaya (Ibu RT 04)', x: 20, y: 22, type: 'RUMAH' },
  { id: 'area-3', blockName: 'Blok A-02', description: 'Keluarga Hartono', x: 32, y: 22, type: 'RUMAH' },
  { id: 'area-4', blockName: 'Blok A-03', description: 'Keluarga Wibowo', x: 44, y: 22, type: 'RUMAH' },
  { id: 'area-5', blockName: 'Blok A-04', description: 'Keluarga Halim', x: 56, y: 22, type: 'RUMAH' },
  { id: 'area-6', blockName: 'Blok A-05', description: 'Keluarga Saputra', x: 68, y: 22, type: 'RUMAH' },
  { id: 'area-7', blockName: 'Blok A-06', description: 'Linda Kusuma (Dokter Siaga)', x: 80, y: 22, type: 'RUMAH' },

  { id: 'area-8', blockName: 'Blok B-01', description: 'Keluarga Gunawan', x: 20, y: 50, type: 'RUMAH' },
  { id: 'area-9', blockName: 'Blok B-02', description: 'Aditya Pratama', x: 32, y: 50, type: 'RUMAH' },
  { id: 'area-10', blockName: 'Blok B-03', description: 'Keluarga Darmawan', x: 44, y: 50, type: 'RUMAH' },
  { id: 'area-11', blockName: 'Blok B-04', description: 'Keluarga Setiawan', x: 56, y: 50, type: 'RUMAH' },
  { id: 'area-12', blockName: 'Blok B-05', description: 'Sari Dewi', x: 68, y: 50, type: 'RUMAH' },
  { id: 'area-13', blockName: 'Blok B-06', description: 'Keluarga Wijaya', x: 80, y: 50, type: 'RUMAH' },

  { id: 'area-14', blockName: 'Blok C-01', description: 'Keluarga Permana', x: 20, y: 78, type: 'RUMAH' },
  { id: 'area-15', blockName: 'Blok C-02', description: 'Keluarga Santoso', x: 32, y: 78, type: 'RUMAH' },
  { id: 'area-16', blockName: 'Blok C-03', description: 'Hendra Gunawan', x: 44, y: 78, type: 'RUMAH' },
  { id: 'area-17', blockName: 'Blok C-04', description: 'Keluarga Hidayat', x: 56, y: 78, type: 'RUMAH' },
  { id: 'area-18', blockName: 'Blok C-05', description: 'Keluarga Kusuma', x: 68, y: 78, type: 'RUMAH' },
  { id: 'area-19', blockName: 'Blok C-12', description: 'Bambang Sutanto', x: 80, y: 78, type: 'RUMAH' },
];

const INITIAL_CLUSTERS: Cluster[] = [
  {
    id: 'cls-1',
    name: 'Klaster Menteng Asri',
    inviteCode: 'WJW-MENTNG',
    createdAt: '2025-02-10T10:00:00.000Z',
    createdByUserId: 'usr-2',
    billing: {
      plan: 'TAHUNAN',
      status: 'AKTIF',
      trialEndsAt: '2025-02-24T10:00:00.000Z',
      paidUntil: '2026-12-31T23:59:59.000Z',
      amountDue: HARGA_TAHUNAN,
      lastPaymentAt: '2025-12-31T10:00:00.000Z',
      lastPaymentAmount: HARGA_TAHUNAN,
      note: 'Langganan tahunan aktif (data demo)',
    },
  },
  {
    id: 'cls-2',
    name: 'Klaster Kebayoran Baru',
    inviteCode: 'WJW-KBYRAN',
    createdAt: '2025-03-01T12:00:00.000Z',
    createdByUserId: 'usr-1',
    billing: {
      plan: 'BULANAN',
      status: 'AKTIF',
      trialEndsAt: '2025-03-15T12:00:00.000Z',
      paidUntil: '2026-08-15T23:59:59.000Z',
      amountDue: HARGA_BULANAN,
      lastPaymentAt: '2026-07-15T09:00:00.000Z',
      lastPaymentAmount: HARGA_BULANAN,
      note: 'Langganan bulanan aktif (data demo)',
    },
  },
  {
    id: 'cls-3',
    name: 'Klaster Kelapa Gading',
    inviteCode: 'WJW-KLPGDG',
    createdAt: '2025-03-05T14:00:00.000Z',
    createdByUserId: 'usr-3',
    billing: {
      plan: 'TRIAL',
      status: 'TRIAL',
      // Trial masih berjalan agar demo cek billing SOS bisa dicoba
      trialEndsAt: addDays(new Date(), 9).toISOString(),
      amountDue: HARGA_BULANAN,
      note: 'Masa percobaan gratis 14 hari sedang berjalan (data demo)',
    },
  },
];

// Titik patroli QR default (Klaster Menteng Asri) — diatur Admin
const INITIAL_PATROL_POINTS: PatrolPoint[] = [
  { id: 'pp-1', clusterName: 'Klaster Menteng Asri', name: 'Gerbang Utama & Pos Satpam', qrCode: 'WJW-PATROL-GERBANG', x: 10, y: 90, radius: 12, addedByAdminId: 'usr-2' },
  { id: 'pp-2', clusterName: 'Klaster Menteng Asri', name: 'Ujung Blok A (Timur)', qrCode: 'WJW-PATROL-BLOK-A', x: 80, y: 22, radius: 12, addedByAdminId: 'usr-2' },
  { id: 'pp-3', clusterName: 'Klaster Menteng Asri', name: 'Tengah Blok B', qrCode: 'WJW-PATROL-BLOK-B', x: 50, y: 50, radius: 12, addedByAdminId: 'usr-2' },
  { id: 'pp-4', clusterName: 'Klaster Menteng Asri', name: 'Ujung Blok C (Barat)', qrCode: 'WJW-PATROL-BLOK-C', x: 20, y: 78, radius: 12, addedByAdminId: 'usr-2' },
];

const INITIAL_STATE: AppState = {
  version: 4,
  stats: {
    wargaTerdaftar: 156,
    klasterTerhubung: 5,
    satpamAktif: 12,
    platformTerpadu: 1,
    activeIncidentsCount: 1,
    resolvedIncidentsCount: 42,
    averageResponseTimeMin: 2.4,
  },
  mapAreas: INITIAL_MAP_AREAS,
  clusters: INITIAL_CLUSTERS,
  patrolPoints: INITIAL_PATROL_POINTS,
  patrolScans: [],
  users: [
    {
      id: 'sup-1',
      name: 'Taraf K. (Superadmin & CS)',
      email: 'tarafk1972@gmail.com',
      role: 'SUPERADMIN',
      block: 'Pusat Komando & Customer Service WJW',
      phone: '0811-1972-1972',
      cluster: 'Semua Klaster (Platform Terpadu)',
      status: 'AMAN',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      bio: 'Superadmin Pusat WargaJagaWarga & Customer Service Resmi (tarafk1972@gmail.com)',
      isOnline: true,
      createdAt: '2025-01-01T08:00:00.000Z',
    },
    {
      id: 'usr-2',
      name: 'Rina Wijaya',
      email: 'rina.wijaya@gmail.com',
      role: 'ADMIN',
      block: 'Blok A-01',
      phone: '0811-2233-4455',
      cluster: 'Klaster Menteng Asri',
      status: 'AMAN',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Ibu RT 04, Menteng (Admin Klaster Pertama - Mendaftarkan & Menyebarkan Aplikasi di Lingkungan)',
      isOnline: true,
      createdAt: '2025-02-10T10:00:00.000Z',
    },
    {
      id: 'usr-1',
      name: 'Bambang Sutanto',
      email: 'bambang.sutanto@gmail.com',
      role: 'WARGA',
      block: 'Blok C-12',
      phone: '0812-3456-7890',
      cluster: 'Klaster Kebayoran Baru',
      status: 'AMAN',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Warga aktif - Blok C-12 (Testimoni: "Dalam 3 menit, tiga tetangga sudah di depan rumah.")',
      isOnline: true,
      createdAt: '2025-03-01T12:00:00.000Z',
    },
    {
      id: 'usr-3',
      name: 'Sari Dewi',
      email: 'sari.dewi@gmail.com',
      role: 'WARGA',
      block: 'Blok B-05',
      phone: '0813-8899-0011',
      cluster: 'Klaster Kelapa Gading',
      status: 'AMAN',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      bio: 'Ibu Rumah Tangga dengan 2 anak kecil (Testimoni: "Tidur lebih tenang sejak pakai WargaJagaWarga.")',
      isOnline: false,
      createdAt: '2025-03-05T14:00:00.000Z',
    },
    {
      id: 'usr-4',
      name: 'Hendra Gunawan',
      email: 'hendra.g@gmail.com',
      role: 'WARGA',
      block: 'Blok C-03',
      phone: '0815-4433-2211',
      cluster: 'Klaster Menteng Asri',
      status: 'SIAGA',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Anggota Karang Taruna Klaster Menteng Asri',
      isOnline: true,
      createdAt: '2025-04-01T09:00:00.000Z',
    },
    {
      id: 'usr-5',
      name: 'Linda Kusuma',
      email: 'linda.kusuma@gmail.com',
      role: 'WARGA',
      block: 'Blok A-06',
      phone: '0816-7788-9900',
      cluster: 'Klaster Menteng Asri',
      status: 'AMAN',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Dokter Umum - Warga Siaga Medis',
      isOnline: true,
      createdAt: '2025-04-10T11:00:00.000Z',
    },
    {
      id: 'sat-1',
      name: 'Pak Yanto',
      email: 'yanto.satpam@gmail.com',
      role: 'SATPAM',
      block: 'Pos Satpam Gerbang Utama',
      phone: '0852-1111-2222',
      cluster: 'Klaster Menteng Asri',
      status: 'SIAGA_DI_POS',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      bio: 'Komandan Regu (Danru) Satpam - Pengalaman 8 tahun keamanan perumahan',
      isOnline: true,
      createdAt: '2025-02-15T07:00:00.000Z',
    },
    {
      id: 'sat-2',
      name: 'Pak Budi Santoso',
      email: 'budi.satpam@gmail.com',
      role: 'SATPAM',
      block: 'Sektor Barat (Blok B)',
      phone: '0852-3333-4444',
      cluster: 'Klaster Menteng Asri',
      status: 'PATROLI',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      bio: 'Satpam Patroli Sektor Barat - Siaga 24 Jam',
      isOnline: true,
      createdAt: '2025-02-16T08:00:00.000Z',
    },
    {
      id: 'sat-3',
      name: 'Pak Suparno',
      email: 'suparno.satpam@gmail.com',
      role: 'SATPAM',
      block: 'Sektor Timur (Blok C)',
      phone: '0852-5555-6666',
      cluster: 'Klaster Menteng Asri',
      status: 'MERESPONS',
      approvalStatus: 'DISETUJUI',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      bio: 'Satpam Patroli Sektor Timur - Respons Cepat Darurat',
      isOnline: true,
      createdAt: '2025-02-20T09:00:00.000Z',
    },
    // Menunggu Persetujuan Admin / Superadmin (Pending Queue)
    {
      id: 'usr-new-101',
      name: 'Budi Gunawan',
      email: 'budi.gunawan@yahoo.com',
      role: 'WARGA',
      block: 'Blok C-08',
      phone: '0812-7788-9911',
      cluster: 'Klaster Menteng Asri',
      status: 'AMAN',
      approvalStatus: 'MENUNGGU',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      bio: 'Warga baru Blok C-08 - Menunggu persetujuan Admin Klaster Rina Wijaya',
      isOnline: false,
      createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    },
    {
      id: 'sat-new-102',
      name: 'Pak Rudi Hartono',
      email: 'rudi.security@gmail.com',
      role: 'SATPAM',
      block: 'Pos Gerbang Timur',
      phone: '0852-8899-0011',
      cluster: 'Klaster Menteng Asri',
      status: 'SIAGA_DI_POS',
      approvalStatus: 'MENUNGGU',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      bio: 'Calon Satpam Shift Malam - Menunggu persetujuan Admin/Superadmin',
      isOnline: false,
      createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    },
  ],
  incidents: [
    {
      id: 'inc-101',
      type: 'KEAMANAN',
      title: 'Suara Mencurigakan di Belakang Rumah',
      description: 'Malam ini listrik sempat berkedip dan terdengar suara langkah orang di dekat pagar belakang rumah. Mohon bantuan pengecekan Satpam & Warga sekitar!',
      status: 'MERESPONS',
      reporterId: 'usr-1',
      reporterName: 'Bambang Sutanto',
      block: 'Blok C-12',
      cluster: 'Klaster Kebayoran Baru',
      createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      responders: [
        {
          userId: 'sat-3',
          name: 'Pak Suparno',
          role: 'SATPAM',
          respondedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          status: 'TIBA_DI_LOKASI',
        },
        {
          userId: 'usr-4',
          name: 'Hendra Gunawan',
          role: 'WARGA',
          respondedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          status: 'MELUNCUR',
        },
        {
          userId: 'sat-1',
          name: 'Pak Yanto',
          role: 'SATPAM',
          respondedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          status: 'MEMERIKSA',
        },
      ],
      comments: [
        {
          id: 'com-1',
          userId: 'sat-3',
          userName: 'Pak Suparno',
          userRole: 'SATPAM',
          text: 'Saya sudah tiba di halaman belakang Blok C-12, sedang memeriksa area pagar.',
          createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        },
        {
          id: 'com-2',
          userId: 'usr-4',
          userName: 'Hendra Gunawan',
          userRole: 'WARGA',
          text: 'Saya dari Blok C-03 menuju kesana dengan senter, lampu jalan belakang sudah dinyalakan.',
          createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        },
        {
          id: 'com-3',
          userId: 'usr-1',
          userName: 'Bambang Sutanto',
          userRole: 'WARGA',
          text: 'Terima kasih Pak Suparno dan Pak Hendra, saya standby di pintu belakang.',
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
      ],
      coordinates: { x: 75, y: 70 },
      responseTimeMinutes: 2,
    },
    {
      id: 'inc-102',
      type: 'LISTRIK',
      title: 'Kabel Listrik Korsleting Depan Taman',
      description: 'Ada percikan api kecil dari tiang listrik dekat Blok B-05. Listrik sebagian blok padam sesaat.',
      status: 'SELESAI',
      reporterId: 'usr-3',
      reporterName: 'Sari Dewi',
      block: 'Blok B-05',
      cluster: 'Klaster Kelapa Gading',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      resolvedAt: new Date(Date.now() - 86400000 + 15 * 60000).toISOString(),
      responders: [
        {
          userId: 'sat-1',
          name: 'Pak Yanto',
          role: 'SATPAM',
          respondedAt: new Date(Date.now() - 86400000 + 2 * 60000).toISOString(),
          status: 'TIBA_DI_LOKASI',
        },
      ],
      comments: [
        {
          id: 'com-4',
          userId: 'sat-1',
          userName: 'Pak Yanto',
          userRole: 'SATPAM',
          text: 'Sudah diamankan dengan APAR pos dan PLN sudah dihubungi. Situasi aman terkendali.',
          createdAt: new Date(Date.now() - 86400000 + 12 * 60000).toISOString(),
        },
      ],
      coordinates: { x: 45, y: 55 },
      responseTimeMinutes: 2,
    },
  ],
  contacts: [
    {
      id: 'cont-1',
      name: 'Hadi Gunawan',
      email: 'hadi.gunawan@gmail.com',
      phone: '0812-4567-8901',
      message: 'Halo tim WargaJagaWarga, saya Ketua RT 05 di BSD City. Kami ingin menginstall sistem ini untuk 45 kepala keluarga di klaster kami.',
      inquiryType: 'Cara daftar komunitas',
      communityName: 'Klaster Pesona BSD',
      createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      status: 'DIPROSES',
      csResponse: 'Halo Pak Hadi, tim instalasi dan Customer Service WJW sedang mengonfirmasi koordinat klaster Anda. Sesuai kebijakan, Anda akan menjadi Admin pertama untuk Klaster Pesona BSD.',
    },
    {
      id: 'cont-2',
      name: 'Ibu Maya Lestari',
      email: 'maya.lestari@yahoo.com',
      phone: '0813-1122-3344',
      message: 'Apakah aplikasi bisa terhubung langsung dengan pos keamanan 24 jam dan CCTV lingkungan?',
      inquiryType: 'Fitur keamanan',
      communityName: 'Perumahan Puri Indah',
      createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      status: 'SELESAI',
      csResponse: 'Benar Ibu Maya, satu tombol di WJW akan langsung membunyikan notifikasi di ponsel seluruh Satpam Pos dan warga yang terdaftar.',
    },
  ],
};

function ensureDbExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_STATE, null, 2), 'utf-8');
  }
}

export function getState(): AppState {
  ensureDbExists();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const state = JSON.parse(raw) as AppState;
    // Ensure Superadmin tarafk1972@gmail.com is present and DISETUJUI
    const hasTaraf = state.users.some(
      (u) => u.email === 'tarafk1972@gmail.com' || u.role === 'SUPERADMIN'
    );
    if (!hasTaraf) {
      const superUser: User = {
        id: 'sup-1',
        name: 'Taraf K. (Superadmin & CS)',
        email: 'tarafk1972@gmail.com',
        role: 'SUPERADMIN',
        block: 'Pusat Komando & Customer Service WJW',
        phone: '0811-1972-1972',
        cluster: 'Semua Klaster (Platform Terpadu)',
        status: 'AMAN',
        approvalStatus: 'DISETUJUI',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        bio: 'Superadmin Pusat WargaJagaWarga & Customer Service Resmi (tarafk1972@gmail.com)',
        isOnline: true,
        createdAt: '2025-01-01T08:00:00.000Z',
      };
      state.users.unshift(superUser);
      saveState(state);
    }
    // Ensure mapAreas is populated
    if (!state.mapAreas || state.mapAreas.length === 0) {
      state.mapAreas = INITIAL_MAP_AREAS;
      saveState(state);
    }
    // Migrasi: pastikan setiap anggota memiliki bahasa default (Indonesia)
    let migrated = false;
    state.users.forEach((u) => {
      if (!u.language) {
        u.language = 'id'; // Bahasa Indonesia adalah bahasa default aplikasi
        migrated = true;
      }
    });
    // Migrasi v4: pastikan data klaster (kode undangan + billing per-cluster) & patroli tersedia
    if (!state.clusters || state.clusters.length === 0) {
      state.clusters = INITIAL_CLUSTERS;
      migrated = true;
    }
    if (!state.patrolPoints) {
      state.patrolPoints = INITIAL_PATROL_POINTS;
      migrated = true;
    }
    if (!state.patrolScans) {
      state.patrolScans = [];
      migrated = true;
    }
    // Pastikan setiap nama klaster yang dipakai user punya entri Cluster (billing & kode undangan)
    const knownClusterNames = new Set(state.clusters.map((c) => c.name.toLowerCase()));
    state.users.forEach((u) => {
      const cname = (u.cluster || '').trim();
      if (
        cname &&
        !cname.toLowerCase().startsWith('semua klaster') &&
        !knownClusterNames.has(cname.toLowerCase())
      ) {
        state.clusters.push({
          id: `cls-${Date.now().toString().slice(-5)}-${state.clusters.length}`,
          name: cname,
          inviteCode: generateInviteCode(),
          createdAt: u.createdAt || new Date().toISOString(),
          createdByUserId: u.id,
          billing: makeTrialBilling(u.createdAt ? new Date(u.createdAt) : undefined),
        });
        knownClusterNames.add(cname.toLowerCase());
        migrated = true;
      }
    });
    if (migrated) {
      saveState(state);
    }
    return state;
  } catch (err) {
    console.error('Error reading DB, re-initializing:', err);
    saveState(INITIAL_STATE);
    return INITIAL_STATE;
  }
}

export function saveState(state: AppState): void {
  ensureDbExists();
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export function resetState(): AppState {
  ensureDbExists();
  saveState(INITIAL_STATE);
  return INITIAL_STATE;
}

// Helper methods for clean business logic
export function getIncidents(): Incident[] {
  const state = getState();
  return state.incidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createIncident(data: {
  type: EmergencyType;
  title: string;
  description: string;
  reporterId: string;
  reporterName: string;
  block: string;
  cluster: string;
  coordinates?: { x: number; y: number };
}): Incident {
  const state = getState();
  const newIncident: Incident = {
    id: `inc-${Date.now().toString().slice(-6)}`,
    type: data.type,
    title: data.title,
    description: data.description,
    status: 'MENUNGGU',
    reporterId: data.reporterId,
    reporterName: data.reporterName,
    block: data.block,
    cluster: data.cluster,
    createdAt: new Date().toISOString(),
    responders: [],
    comments: [
      {
        id: `com-${Date.now()}`,
        userId: data.reporterId,
        userName: data.reporterName,
        userRole: 'WARGA',
        text: `🚨 PERINGATAN SATU SENTUHAN DIAKTIFKAN: ${data.title} di ${data.block}!`,
        createdAt: new Date().toISOString(),
      },
    ],
    coordinates: data.coordinates || {
      x: Math.floor(Math.random() * 70) + 15,
      y: Math.floor(Math.random() * 70) + 15,
    },
  };

  state.incidents.unshift(newIncident);
  state.stats.activeIncidentsCount = state.incidents.filter((i) => i.status !== 'SELESAI').length;
  saveState(state);
  return newIncident;
}

export function updateIncidentStatus(id: string, status: IncidentStatus): Incident | null {
  const state = getState();
  const idx = state.incidents.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  state.incidents[idx].status = status;
  if (status === 'SELESAI') {
    state.incidents[idx].resolvedAt = new Date().toISOString();
    state.stats.resolvedIncidentsCount += 1;
  }
  state.stats.activeIncidentsCount = state.incidents.filter((i) => i.status !== 'SELESAI').length;

  saveState(state);
  return state.incidents[idx];
}

export function addIncidentResponder(
  incidentId: string,
  responder: { userId: string; name: string; role: UserRole; status?: 'MELUNCUR' | 'TIBA_DI_LOKASI' | 'MEMERIKSA' }
): Incident | null {
  const state = getState();
  const inc = state.incidents.find((i) => i.id === incidentId);
  if (!inc) return null;

  const existingIdx = inc.responders.findIndex((r) => r.userId === responder.userId);
  if (existingIdx >= 0) {
    if (responder.status) {
      inc.responders[existingIdx].status = responder.status;
    }
  } else {
    inc.responders.push({
      userId: responder.userId,
      name: responder.name,
      role: responder.role,
      respondedAt: new Date().toISOString(),
      status: responder.status || 'MELUNCUR',
    });
  }

  if (inc.status === 'MENUNGGU') {
    inc.status = 'MERESPONS';
  }

  saveState(state);
  return inc;
}

export function addIncidentComment(
  incidentId: string,
  comment: { userId: string; userName: string; userRole: UserRole; text: string }
): Incident | null {
  const state = getState();
  const inc = state.incidents.find((i) => i.id === incidentId);
  if (!inc) return null;

  inc.comments.push({
    id: `com-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: comment.userId,
    userName: comment.userName,
    userRole: comment.userRole,
    text: comment.text,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return inc;
}

export function deleteIncident(id: string): boolean {
  const state = getState();
  const initialLen = state.incidents.length;
  state.incidents = state.incidents.filter((i) => i.id !== id);
  if (state.incidents.length < initialLen) {
    state.stats.activeIncidentsCount = state.incidents.filter((i) => i.status !== 'SELESAI').length;
    saveState(state);
    return true;
  }
  return false;
}

export function getUsers(): User[] {
  return getState().users;
}

export function updateUserStatus(userId: string, status: SatpamStatus | WargaStatus): User | null {
  const state = getState();
  const user = state.users.find((u) => u.id === userId);
  if (!user) return null;
  user.status = status;
  saveState(state);
  return user;
}

export function createUser(data: {
  name: string;
  email?: string;
  role?: UserRole;
  block: string;
  phone: string;
  cluster?: string;
  inviteCode?: string; // Bergabung ke klaster via kode undangan (Join with Code)
  status?: SatpamStatus | WargaStatus;
  avatar?: string;
  bio?: string;
  language?: AppLanguage;
}): { user: User; message: string; autoAdmin: boolean; cluster?: Cluster; error?: string } {
  const state = getState();
  const emailLower = (data.email || '').toLowerCase().trim();
  const chosenLanguage: AppLanguage = data.language === 'en' ? 'en' : 'id';

  // 1. Check if email is tarafk1972@gmail.com -> SUPERADMIN
  if (emailLower === 'tarafk1972@gmail.com') {
    const existingSuper = state.users.find((u) => u.email === 'tarafk1972@gmail.com' || u.role === 'SUPERADMIN');
    if (existingSuper) {
      return {
        user: existingSuper,
        message: 'Akun Superadmin & Layanan CS (tarafk1972@gmail.com) sudah aktif.',
        autoAdmin: false,
      };
    }
    const newSuperUser: User = {
      id: 'sup-1',
      name: data.name || 'Taraf K. (Superadmin & CS)',
      email: 'tarafk1972@gmail.com',
      role: 'SUPERADMIN',
      block: data.block || 'Pusat Komando & Customer Service WJW',
      phone: data.phone || '0811-1972-1972',
      cluster: data.cluster || 'Semua Klaster (Platform Terpadu)',
      status: 'AMAN',
      approvalStatus: 'DISETUJUI',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      bio: data.bio || 'Superadmin Pusat WargaJagaWarga & Customer Service Resmi',
      isOnline: true,
      createdAt: new Date().toISOString(),
      language: chosenLanguage,
    };
    state.users.unshift(newSuperUser);
    saveState(state);
    return {
      user: newSuperUser,
      message: 'Selamat! Akun email tarafk1972@gmail.com diaktifkan sebagai SUPERADMIN dan Customer Service.',
      autoAdmin: true,
    };
  }

  // 2. Tentukan klaster tujuan:
  //    (a) Via KODE UNDANGAN (Join with Code) — prioritas utama
  //    (b) Via nama klaster — jika belum ada, dibuat baru (pendaftar = admin awal + billing trial 14 hari)
  let targetCluster: Cluster | undefined;
  let joinedWithCode: string | undefined;

  if (data.inviteCode && data.inviteCode.trim()) {
    const codeUpper = data.inviteCode.trim().toUpperCase();
    targetCluster = state.clusters.find((c) => c.inviteCode.toUpperCase() === codeUpper);
    if (!targetCluster) {
      return {
        user: null as unknown as User,
        message: '',
        autoAdmin: false,
        error: `Kode undangan "${codeUpper}" tidak ditemukan. Periksa kembali kode dari Admin Klaster Anda.`,
      };
    }
    joinedWithCode = targetCluster.inviteCode;
  } else {
    const clusterName = (data.cluster || 'Klaster Menteng Asri').trim();
    targetCluster = state.clusters.find((c) => c.name.toLowerCase() === clusterName.toLowerCase());
    if (!targetCluster) {
      // Buat klaster baru dengan kode undangan unik & billing trial gratis 14 hari
      targetCluster = {
        id: `cls-${Date.now().toString().slice(-5)}`,
        name: clusterName,
        inviteCode: generateInviteCode(),
        createdAt: new Date().toISOString(),
        billing: makeTrialBilling(),
      };
      state.clusters.push(targetCluster);
    }
  }

  // 3. Check if this is the FIRST registrant for this cluster (no approved ADMIN exists in this cluster)
  const existingAdminInCluster = state.users.some(
    (u) =>
      u.cluster.toLowerCase() === targetCluster!.name.toLowerCase() &&
      u.role === 'ADMIN' &&
      u.approvalStatus === 'DISETUJUI'
  );

  let finalRole: UserRole = data.role || 'WARGA';
  let finalApproval: ApprovalStatus = 'MENUNGGU';
  let message = `Pendaftaran dikirim! Menunggu persetujuan dari Admin ${targetCluster.name} agar dapat terhubung dengan warga lain.`;
  let autoAdmin = false;

  if (!existingAdminInCluster) {
    // "Warga yg pertama mendaftar otomatis menjadi admin dan bisa mengajak yg lain menjadi admin"
    finalRole = 'ADMIN';
    finalApproval = 'DISETUJUI';
    message = `Selamat! Anda adalah pendaftar pertama di ${targetCluster.name}, sehingga Anda OTOMATIS menjadi ADMIN KLASTER. Kode undangan klaster Anda: ${targetCluster.inviteCode} — bagikan ke warga lain agar bisa bergabung. Masa percobaan gratis 14 hari klaster dimulai hari ini.`;
    autoAdmin = true;
    if (!targetCluster.createdByUserId) {
      targetCluster.createdByUserId = 'pending';
    }
  } else if (data.role === 'ADMIN' || data.role === 'SATPAM') {
    // If Admin/Satpam applied, wait for approval
    finalApproval = 'MENUNGGU';
  }

  const newUser: User = {
    id: `${finalRole === 'SATPAM' ? 'sat' : finalRole === 'ADMIN' ? 'adm' : 'usr'}-${Date.now().toString().slice(-5)}`,
    name: data.name,
    email: data.email || `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@warga.local`,
    role: finalRole,
    block: data.block,
    phone: data.phone || '0812-0000-0000',
    cluster: targetCluster.name,
    status: data.status || 'AMAN',
    approvalStatus: finalApproval,
    avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: data.bio || (autoAdmin ? 'Admin Klaster Pertama (Pengelola Warga & Satpam)' : 'Anggota klaster'),
    isOnline: true,
    createdAt: new Date().toISOString(),
    language: chosenLanguage,
    joinedWithCode,
  };

  if (autoAdmin && targetCluster.createdByUserId === 'pending') {
    targetCluster.createdByUserId = newUser.id;
  }

  state.users.push(newUser);
  if (newUser.role === 'SATPAM' && newUser.approvalStatus === 'DISETUJUI') {
    state.stats.satpamAktif = state.users.filter((u) => u.role === 'SATPAM' && u.approvalStatus === 'DISETUJUI').length;
  } else if (newUser.approvalStatus === 'DISETUJUI') {
    state.stats.wargaTerdaftar = state.stats.wargaTerdaftar + 1;
  }
  state.stats.klasterTerhubung = state.clusters.length;
  saveState(state);
  return { user: newUser, message, autoAdmin, cluster: targetCluster };
}

// "Sebagai admin, dia bisa accept atau reject anggota baru, dan bisa menentukan anggota baru ini sebagai Warga, Satpam atau Admin"
export function approveUserRole(
  userId: string,
  approvalStatus: ApprovalStatus,
  assignedRole?: UserRole
): User | null {
  const state = getState();
  const idx = state.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  state.users[idx].approvalStatus = approvalStatus;
  if (assignedRole) {
    state.users[idx].role = assignedRole;
  }

  // Update live statistics
  state.stats.satpamAktif = state.users.filter((u) => u.role === 'SATPAM' && u.approvalStatus === 'DISETUJUI').length;
  state.stats.wargaTerdaftar = state.users.filter(
    (u) => (u.role === 'WARGA' || u.role === 'ADMIN') && u.approvalStatus === 'DISETUJUI'
  ).length;

  saveState(state);
  return state.users[idx];
}

// Map area customization for Admin
export function getMapAreas(): ClusterBlockArea[] {
  return getState().mapAreas || INITIAL_MAP_AREAS;
}

export function addMapArea(area: Omit<ClusterBlockArea, 'id'>): ClusterBlockArea {
  const state = getState();
  if (!state.mapAreas) state.mapAreas = [];
  const newArea: ClusterBlockArea = {
    ...area,
    id: `area-${Date.now().toString().slice(-5)}`,
  };
  state.mapAreas.push(newArea);
  saveState(state);
  return newArea;
}

export function deleteMapArea(id: string): boolean {
  const state = getState();
  if (!state.mapAreas) return false;
  const initialLen = state.mapAreas.length;
  state.mapAreas = state.mapAreas.filter((a) => a.id !== id);
  if (state.mapAreas.length < initialLen) {
    saveState(state);
    return true;
  }
  return false;
}

export function getContacts(): ContactInquiry[] {
  return getState().contacts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createContactInquiry(data: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>): ContactInquiry {
  const state = getState();
  const newContact: ContactInquiry = {
    ...data,
    id: `cont-${Date.now().toString().slice(-5)}`,
    createdAt: new Date().toISOString(),
    status: 'BARU',
  };
  state.contacts.unshift(newContact);
  saveState(state);
  return newContact;
}

export function updateContactStatus(
  id: string,
  status: 'BARU' | 'DIPROSES' | 'SELESAI',
  csResponse?: string
): ContactInquiry | null {
  const state = getState();
  const item = state.contacts.find((c) => c.id === id);
  if (!item) return null;
  item.status = status;
  if (csResponse !== undefined) {
    item.csResponse = csResponse;
  }
  saveState(state);
  return item;
}

// ===============================================
// BILLING PER-CLUSTER (Aplikasi Berbayar, Diawasi Superadmin)
// Masa percobaan gratis 14 hari untuk setiap klaster baru.
// Status billing klaster memengaruhi pengiriman Emergency Alert (SOS).
// ===============================================

export function getClusters(): Cluster[] {
  return getState().clusters;
}

export function getClusterByName(name: string): Cluster | undefined {
  return getState().clusters.find((c) => c.name.toLowerCase() === (name || '').toLowerCase());
}

// Peringatan billing klaster — HANYA untuk ADMIN klaster (dan Superadmin).
// Emergency Alert warga TIDAK PERNAH diblokir oleh status billing.
export function getBillingWarningForAdmin(clusterName: string): {
  warning?: string;
  severity?: 'INFO' | 'URGENT';
  billing?: ClusterBilling;
} {
  const cluster = getClusterByName(clusterName);
  if (!cluster) return {};
  const billing = effectiveBilling(cluster.billing);

  if (billing.status === 'DITANGGUHKAN') {
    return {
      warning: `Billing klaster ${cluster.name} sedang DITANGGUHKAN oleh Superadmin. Segera hubungi Customer Service (tarafk1972@gmail.com) untuk mengaktifkan kembali.`,
      severity: 'URGENT',
      billing,
    };
  }
  if (billing.status === 'KEDALUWARSA') {
    return {
      warning: `Langganan klaster ${cluster.name} telah KEDALUWARSA. Segera lunasi tagihan (Rp ${billing.amountDue.toLocaleString('id-ID')}) melalui tab Billing Klaster.`,
      severity: 'URGENT',
      billing,
    };
  }
  if (billing.status === 'TRIAL') {
    const daysLeft = billingTrialDaysLeft(billing);
    if (daysLeft <= 3) {
      return {
        warning: `Masa percobaan klaster ${cluster.name} tersisa ${daysLeft} hari. Segera pilih paket Bulanan/Tahunan di tab Billing Klaster.`,
        severity: 'INFO',
        billing,
      };
    }
  }
  return { billing };
}

// Pembayaran billing klaster (simulasi) oleh Admin klaster
export function payClusterBilling(clusterId: string, plan: BillingPlan): Cluster | null {
  const state = getState();
  const cluster = state.clusters.find((c) => c.id === clusterId);
  if (!cluster) return null;

  const now = new Date();
  if (plan === 'BULANAN') {
    const paidUntil = new Date(now);
    paidUntil.setMonth(paidUntil.getMonth() + 1);
    cluster.billing = {
      ...cluster.billing,
      plan: 'BULANAN',
      status: 'AKTIF',
      paidUntil: paidUntil.toISOString(),
      amountDue: HARGA_BULANAN,
      lastPaymentAt: now.toISOString(),
      lastPaymentAmount: cluster.billing.amountDue || HARGA_BULANAN,
      note: 'Langganan bulanan klaster aktif (pembayaran terverifikasi)',
    };
  } else if (plan === 'TAHUNAN') {
    const paidUntil = new Date(now);
    paidUntil.setFullYear(paidUntil.getFullYear() + 1);
    cluster.billing = {
      ...cluster.billing,
      plan: 'TAHUNAN',
      status: 'AKTIF',
      paidUntil: paidUntil.toISOString(),
      amountDue: HARGA_TAHUNAN,
      lastPaymentAt: now.toISOString(),
      lastPaymentAmount: cluster.billing.plan === 'TAHUNAN' ? cluster.billing.amountDue : HARGA_TAHUNAN,
      note: 'Langganan tahunan klaster aktif (pembayaran terverifikasi)',
    };
  } else {
    return null;
  }
  saveState(state);
  return cluster;
}

// Aksi pengawasan Superadmin terhadap billing klaster (sesuai PDF):
// perpanjang trial, ubah jatuh tempo, ubah paket, ubah nominal, catatan, tandai lunas, tangguhkan/aktifkan
export function superadminManageClusterBilling(
  clusterId: string,
  action:
    | 'EXTEND_TRIAL'
    | 'SUSPEND'
    | 'ACTIVATE'
    | 'MARK_PAID'
    | 'SET_DUE_DATE'
    | 'SET_PLAN'
    | 'SET_AMOUNT'
    | 'SET_NOTE',
  payload?: { dueDate?: string; plan?: BillingPlan; amount?: number; note?: string }
): Cluster | null {
  const state = getState();
  const cluster = state.clusters.find((c) => c.id === clusterId);
  if (!cluster) return null;

  const now = new Date();
  const b = cluster.billing;

  switch (action) {
    case 'EXTEND_TRIAL': {
      const base = new Date(Math.max(new Date(b.trialEndsAt).getTime(), now.getTime()));
      base.setDate(base.getDate() + TRIAL_DAYS);
      cluster.billing = {
        ...b,
        plan: 'TRIAL',
        status: 'TRIAL',
        trialEndsAt: base.toISOString(),
        note: payload?.note || `Trial klaster diperpanjang ${TRIAL_DAYS} hari oleh Superadmin (Customer Service)`,
      };
      break;
    }
    case 'SUSPEND':
      cluster.billing = {
        ...b,
        status: 'DITANGGUHKAN',
        note: payload?.note || 'Billing klaster ditangguhkan oleh Superadmin (pengawasan aplikasi berbayar)',
      };
      break;
    case 'ACTIVATE': {
      const paidUntil = new Date(now);
      paidUntil.setMonth(paidUntil.getMonth() + 1);
      cluster.billing = {
        ...b,
        status: 'AKTIF',
        plan: b.plan === 'TRIAL' ? 'BULANAN' : b.plan,
        paidUntil: b.paidUntil && new Date(b.paidUntil) > now ? b.paidUntil : paidUntil.toISOString(),
        note: payload?.note || 'Billing klaster diaktifkan kembali oleh Superadmin (Customer Service)',
      };
      break;
    }
    case 'MARK_PAID': {
      const paidUntil = new Date(now);
      if (b.plan === 'TAHUNAN') paidUntil.setFullYear(paidUntil.getFullYear() + 1);
      else paidUntil.setMonth(paidUntil.getMonth() + 1);
      cluster.billing = {
        ...b,
        status: 'AKTIF',
        plan: b.plan === 'TRIAL' ? 'BULANAN' : b.plan,
        paidUntil: paidUntil.toISOString(),
        lastPaymentAt: now.toISOString(),
        lastPaymentAmount: b.amountDue,
        note: payload?.note || 'Pembayaran ditandai LUNAS oleh Superadmin',
      };
      break;
    }
    case 'SET_DUE_DATE':
      if (!payload?.dueDate) return null;
      cluster.billing = { ...b, paidUntil: new Date(payload.dueDate).toISOString(), note: payload?.note || b.note };
      break;
    case 'SET_PLAN':
      if (!payload?.plan) return null;
      cluster.billing = {
        ...b,
        plan: payload.plan,
        amountDue: payload.plan === 'TAHUNAN' ? HARGA_TAHUNAN : payload.plan === 'BULANAN' ? HARGA_BULANAN : b.amountDue,
        note: payload?.note || `Paket diubah menjadi ${payload.plan} oleh Superadmin`,
      };
      break;
    case 'SET_AMOUNT':
      if (payload?.amount === undefined || payload.amount < 0) return null;
      cluster.billing = { ...b, amountDue: payload.amount, note: payload?.note || `Nominal tagihan diubah oleh Superadmin` };
      break;
    case 'SET_NOTE':
      cluster.billing = { ...b, note: payload?.note || '' };
      break;
    default:
      return null;
  }

  saveState(state);
  return cluster;
}

// ===============================================
// MODUL PATROLI QR (Satpam) — sesuai alur PDF:
// scan QR -> ambil GPS -> cek online/offline -> validasi radius ->
// online: kirim server | offline: validasi lokal + simpan queue -> sinkron saat online
// ===============================================

export function getPatrolPoints(): PatrolPoint[] {
  return getState().patrolPoints;
}

export function getPatrolScans(): PatrolScan[] {
  return getState().patrolScans.sort(
    (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
  );
}

// Admin menambah titik patroli QR baru
export function addPatrolPoint(data: Omit<PatrolPoint, 'id' | 'qrCode'> & { qrCode?: string }): PatrolPoint {
  const state = getState();
  const newPoint: PatrolPoint = {
    ...data,
    id: `pp-${Date.now().toString().slice(-5)}`,
    qrCode:
      data.qrCode ||
      `WJW-PATROL-${data.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20)}`,
    radius: data.radius || 12,
  };
  state.patrolPoints.push(newPoint);
  saveState(state);
  return newPoint;
}

export function deletePatrolPoint(id: string): boolean {
  const state = getState();
  const before = state.patrolPoints.length;
  state.patrolPoints = state.patrolPoints.filter((p) => p.id !== id);
  if (state.patrolPoints.length < before) {
    saveState(state);
    return true;
  }
  return false;
}

// Satpam scan QR di titik patroli (dengan validasi radius GPS + dukungan offline queue)
export function recordPatrolScan(data: {
  qrCode: string;
  satpamId: string;
  satpamName: string;
  coordinates: { x: number; y: number };
  wasOffline?: boolean;
  scannedAt?: string; // Waktu scan asli (untuk sinkronisasi offline queue)
}): { scan: PatrolScan | null; error?: string } {
  const state = getState();
  const point = state.patrolPoints.find((p) => p.qrCode.toUpperCase() === data.qrCode.trim().toUpperCase());
  if (!point) {
    return { scan: null, error: `QR Code "${data.qrCode}" tidak dikenal. Halaman fallback: pastikan QR berasal dari titik patroli resmi klaster.` };
  }

  // Validasi radius: jarak Euclidean pada koordinat peta (0-100)
  const dx = data.coordinates.x - point.x;
  const dy = data.coordinates.y - point.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const withinRadius = distance <= point.radius;

  const scan: PatrolScan = {
    id: `scan-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
    patrolPointId: point.id,
    patrolPointName: point.name,
    qrCode: point.qrCode,
    satpamId: data.satpamId,
    satpamName: data.satpamName,
    scannedAt: data.scannedAt || new Date().toISOString(),
    coordinates: data.coordinates,
    distance: Math.round(distance * 10) / 10,
    withinRadius,
    wasOffline: !!data.wasOffline,
    status: withinRadius ? 'TERSINKRON' : 'DITOLAK',
  };

  state.patrolScans.push(scan);
  saveState(state);

  if (!withinRadius) {
    return {
      scan,
      error: `Posisi Anda di luar radius titik patroli "${point.name}" (jarak ${scan.distance} unit, maksimum ${point.radius}). Scan DITOLAK — mendekatlah ke titik patroli.`,
    };
  }
  return { scan };
}
