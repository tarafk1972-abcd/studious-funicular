export type UserRole = 'WARGA' | 'SATPAM' | 'ADMIN' | 'SUPERADMIN';

export type SatpamStatus = 'SIAGA_DI_POS' | 'PATROLI' | 'MERESPONS' | 'ISTIRAHAT';
export type WargaStatus = 'AMAN' | 'SIAGA' | 'DARURAT';
export type ApprovalStatus = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';

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
  stats: ClusterStats;
  version: number;
}
