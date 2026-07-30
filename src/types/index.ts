export type UserRole = 'WARGA' | 'SATPAM' | 'ADMIN' | 'SUPERADMIN';

export type SatpamStatus = 'SIAGA_DI_POS' | 'PATROLI' | 'MERESPONS' | 'ISTIRAHAT';
export type WargaStatus = 'AMAN' | 'SIAGA' | 'DARURAT';
export type ApprovalStatus = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';

// Bahasa aplikasi: Indonesia (default) atau Inggris
export type AppLanguage = 'id' | 'en';

// ===== BILLING PER-CLUSTER (aplikasi berbayar, diawasi Superadmin) =====
export type BillingPlan = 'TRIAL' | 'BULANAN' | 'TAHUNAN' | 'GRATIS_SELAMANYA';
export type BillingStatus = 'TRIAL' | 'AKTIF' | 'KEDALUWARSA' | 'DITANGGUHKAN';

export interface ClusterBilling {
  plan: BillingPlan;
  status: BillingStatus;
  trialEndsAt: string; // Akhir masa percobaan gratis 14 hari
  paidUntil?: string; // Jatuh tempo langganan berbayar
  amountDue: number; // Nominal tagihan (Rupiah) — dapat diubah Superadmin
  lastPaymentAt?: string;
  lastPaymentAmount?: number;
  note?: string; // Catatan Superadmin (pengawasan)
}

// Area peta klaster yang ditentukan Admin pertama — di-download ke aplikasi
// setiap anggota agar peta dapat bekerja secara OFFLINE
export interface ClusterMapArea {
  centerLat: number;
  centerLng: number;
  radiusKm: number; // radius area dari pusat klaster
  minZoom: number;
  maxZoom: number;
  definedByAdminId?: string;
  updatedAt?: string;
}

// Cluster/klaster perumahan dengan kode undangan (Join with Code)
export interface Cluster {
  id: string;
  name: string;
  inviteCode: string; // Kode undangan untuk bergabung (mis. WJW-A1B2C3)
  createdAt: string;
  createdByUserId?: string;
  billing: ClusterBilling;
  mapArea?: ClusterMapArea; // Area peta offline yang ditentukan Admin
}

// ===== PATROLI QR (Satpam) =====
export interface PatrolPoint {
  id: string;
  clusterName: string;
  name: string; // Nama titik patroli (mis. "Gerbang Utama")
  qrCode: string; // Isi QR Code (mis. WJW-PATROL-GERBANG)
  x: number; // Koordinat pada peta klaster (0-100)
  y: number;
  radius: number; // Radius valid scan (satuan unit peta)
  addedByAdminId?: string;
}

export type PatrolScanStatus = 'TERSINKRON' | 'TERTUNDA' | 'DITOLAK';

export interface PatrolScan {
  id: string;
  patrolPointId: string;
  patrolPointName: string;
  qrCode: string;
  satpamId: string;
  satpamName: string;
  scannedAt: string;
  coordinates: { x: number; y: number }; // Posisi GPS (simulasi) saat scan
  distance: number; // Jarak dari titik patroli
  withinRadius: boolean;
  wasOffline: boolean; // Discan saat offline (masuk offline queue)
  status: PatrolScanStatus;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  block: string;
  phone: string;
  cluster: string;
  status: SatpamStatus | WargaStatus;
  approvalStatus: ApprovalStatus;
  avatar: string;
  bio: string;
  isOnline?: boolean;
  createdAt?: string;
  language?: AppLanguage; // Bahasa pilihan saat registrasi (default: 'id')
  joinedWithCode?: string; // Kode undangan yang dipakai saat bergabung
  // Lokasi rumah anggota — diambil dari GPS smartphone yang dipakai membuka peta
  homeLat?: number;
  homeLng?: number;
}

export type EmergencyType = 'KEAMANAN' | 'MEDIS' | 'KEBAKARAN' | 'LISTRIK';

export type IncidentStatus = 'MENUNGGU' | 'MERESPONS' | 'SELESAI';

export interface IncidentResponder {
  userId: string;
  name: string;
  role: UserRole;
  respondedAt: string;
  status?: 'MELUNCUR' | 'TIBA_DI_LOKASI' | 'MEMERIKSA';
}

export interface IncidentComment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  type: EmergencyType;
  title: string;
  description: string;
  status: IncidentStatus;
  reporterId: string;
  reporterName: string;
  block: string;
  cluster: string;
  createdAt: string;
  resolvedAt?: string;
  responders: IncidentResponder[];
  comments: IncidentComment[];
  coordinates: { x: number; y: number };
  responseTimeMinutes?: number;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiryType: 'Cara daftar komunitas' | 'Fitur keamanan' | 'Kerja sama' | 'Lainnya';
  communityName: string;
  createdAt: string;
  status: 'BARU' | 'DIPROSES' | 'SELESAI';
  csResponse?: string;
}

export interface ClusterBlockArea {
  id: string;
  blockName: string;
  description: string;
  x: number;
  y: number;
  type: 'RUMAH' | 'POS_SATPAM' | 'CCTV' | 'TAMAN';
  addedByAdminId?: string;
}

export interface ClusterStats {
  wargaTerdaftar: number;
  klasterTerhubung: number;
  satpamAktif: number;
  platformTerpadu: number;
  activeIncidentsCount: number;
  resolvedIncidentsCount: number;
  averageResponseTimeMin: number;
}

export interface AppState {
  users: User[];
  incidents: Incident[];
  contacts: ContactInquiry[];
  mapAreas: ClusterBlockArea[];
  clusters: Cluster[]; // Klaster dengan kode undangan & billing per-cluster
  patrolPoints: PatrolPoint[]; // Titik patroli QR (diatur Admin)
  patrolScans: PatrolScan[]; // Riwayat scan patroli Satpam
  stats: ClusterStats;
  version: number;
}
