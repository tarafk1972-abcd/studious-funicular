'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppLanguage } from '@/types';

/**
 * Sistem multi-bahasa WargaJagaWarga.
 * Bahasa Indonesia adalah bahasa default aplikasi.
 * Pengguna dapat memilih bahasa saat registrasi; bahasa pilihan itu
 * menjadi bahasa default seluruh teks aplikasi untuk pengguna tersebut.
 */

type Dict = Record<string, { id: string; en: string }>;

export const DICT: Dict = {
  // ===== Umum =====
  'common.appTagline': {
    id: 'Satu sentuhan, Satpam dan tetanggamu datang',
    en: 'One touch, security and your neighbors arrive',
  },
  'common.emergencyResponse': { id: 'Tanggap Darurat', en: 'Emergency Response' },
  'common.loading': { id: 'Memuat Sistem WargaJagaWarga...', en: 'Loading WargaJagaWarga System...' },
  'common.close': { id: 'Tutup', en: 'Close' },
  'common.cancel': { id: 'Batal', en: 'Cancel' },
  'common.save': { id: 'Simpan', en: 'Save' },
  'common.language': { id: 'Bahasa', en: 'Language' },
  'common.indonesian': { id: 'Bahasa Indonesia (Default)', en: 'Indonesian (Default)' },
  'common.english': { id: 'Bahasa Inggris / English', en: 'English' },

  // ===== Navigasi =====
  'nav.home': { id: 'Beranda', en: 'Home' },
  'nav.app': { id: 'Aplikasi Darurat', en: 'Emergency App' },
  'nav.map': { id: 'Peta Klaster', en: 'Cluster Map' },
  'nav.directory': { id: 'Warga & Satpam', en: 'Residents & Security' },
  'nav.stats': { id: 'Data Keamanan', en: 'Security Data' },
  'nav.patrol': { id: 'Patroli QR', en: 'QR Patrol' },
  'nav.subscription': { id: 'Billing Klaster', en: 'Cluster Billing' },
  'nav.contact': { id: 'Hubungi Kami', en: 'Contact Us' },
  'nav.register': { id: 'Daftar', en: 'Register' },
  'nav.switchRole': { id: 'Ganti Peran Pengguna (Demo)', en: 'Switch User Role (Demo)' },
  'nav.switchRoleHint': {
    id: 'Pilih untuk merasakan aplikasi sebagai Warga, Satpam, Admin, atau Superadmin',
    en: 'Choose to experience the app as Resident, Security, Admin, or Superadmin',
  },
  'nav.soundOn': { id: 'Suara Sirine Aktif', en: 'Siren Sound On' },
  'nav.soundOff': { id: 'Suara Sirine Dibisukan', en: 'Siren Sound Muted' },
  'nav.resetDemo': { id: 'Reset Data Demo ke Awal', en: 'Reset Demo Data' },

  // ===== Sapaan / Beranda =====
  'landing.greeting': { id: 'Apa kabar hari ini, {name}?', en: 'How are you today, {name}?' },
  'landing.approvedBadge': {
    id: 'ANGGOTA TERDAFTAR & DISETUJUI ADMIN',
    en: 'REGISTERED MEMBER & APPROVED BY ADMIN',
  },
  'landing.registeredInfo': {
    id: 'HP Anda telah terdaftar dalam jaringan keamanan WargaJagaWarga klaster {cluster}. Peran Anda saat ini: {role}.',
    en: 'Your phone is registered in the WargaJagaWarga security network of {cluster}. Your current role: {role}.',
  },
  'landing.heroBadge': {
    id: 'TANGGAP DARURAT KOMUNITAS PERUMAHAN',
    en: 'RESIDENTIAL COMMUNITY EMERGENCY RESPONSE',
  },
  'landing.heroTitle1': { id: 'Satu sentuhan,', en: 'One touch,' },
  'landing.heroTitle2': { id: 'Satpam dan tetanggamu', en: 'security and your neighbors' },
  'landing.heroTitle3': { id: 'datang.', en: 'arrive.' },
  'landing.heroSubtitle': {
    id: 'Kami membangun sistem peringatan komunitas yang langsung ke pokok masalah. Satu tombol, Satpam dan semua tetangga tahu, bantuan datang secepat kilat.',
    en: 'We build a community alert system that gets straight to the point. One button, security and all neighbors know, help arrives in a flash.',
  },
  'landing.openApp': { id: 'Buka Aplikasi Darurat Sekarang', en: 'Open Emergency App Now' },
  'landing.registerTrial': {
    id: 'Daftar — Gratis 14 Hari',
    en: 'Register — 14-Day Free Trial',
  },
  'landing.paidAppNote': {
    id: 'Aplikasi berbayar dengan masa percobaan GRATIS 14 hari. Diawasi langsung oleh Superadmin.',
    en: 'Paid app with a 14-day FREE trial. Directly supervised by the Superadmin.',
  },
  'landing.install10min': { id: 'Install 10 Menit di Seluruh Klaster', en: '10-Minute Install Across the Cluster' },
  'landing.connected24h': { id: 'Terhubung ke Satpam 24 Jam', en: 'Connected to 24-Hour Security' },

  // ===== Registrasi =====
  'register.title': { id: 'Pendaftaran Anggota WargaJagaWarga', en: 'WargaJagaWarga Member Registration' },
  'register.subtitle': {
    id: 'Aplikasi berbayar • Masa percobaan GRATIS 14 hari • Diawasi Superadmin',
    en: 'Paid app • 14-day FREE trial • Supervised by Superadmin',
  },
  'register.firstAdminNote': {
    id: 'Pendaftar PERTAMA di sebuah klaster otomatis menjadi ADMIN dan dapat mengajak anggota lain menjadi Admin.',
    en: 'The FIRST registrant of a cluster automatically becomes ADMIN and can invite others to become Admins.',
  },
  'register.name': { id: 'Nama Lengkap', en: 'Full Name' },
  'register.namePlaceholder': { id: 'Contoh: Budi Setiawan', en: 'Example: John Smith' },
  'register.email': { id: 'Alamat Email', en: 'Email Address' },
  'register.emailHint': {
    id: 'Email tarafk1972@gmail.com otomatis menjadi Superadmin & Customer Service.',
    en: 'The email tarafk1972@gmail.com automatically becomes Superadmin & Customer Service.',
  },
  'register.phone': { id: 'Nomor HP', en: 'Phone Number' },
  'register.block': { id: 'Blok Rumah', en: 'House Block' },
  'register.blockPlaceholder': { id: 'Contoh: Blok D-07', en: 'Example: Block D-07' },
  'register.cluster': { id: 'Nama Klaster / Perumahan', en: 'Cluster / Residential Name' },
  'register.clusterPlaceholder': { id: 'Contoh: Klaster Menteng Asri', en: 'Example: Menteng Asri Cluster' },
  'register.roleRequest': { id: 'Daftar Sebagai', en: 'Register As' },
  'register.roleWarga': { id: 'Warga', en: 'Resident' },
  'register.roleSatpam': { id: 'Satpam', en: 'Security Guard' },
  'register.roleAdmin': { id: 'Admin', en: 'Admin' },
  'register.language': { id: 'Pilih Bahasa Aplikasi', en: 'Choose App Language' },
  'register.languageHint': {
    id: 'Bahasa yang dipilih menjadi bahasa default seluruh teks aplikasi untuk akun Anda.',
    en: 'The chosen language becomes the default language of all app text for your account.',
  },
  'register.trialTitle': { id: 'Masa Percobaan Gratis 14 Hari', en: '14-Day Free Trial' },
  'register.trialDesc': {
    id: 'WargaJagaWarga adalah aplikasi berbayar yang diawasi oleh Superadmin (tarafk1972@gmail.com). Anda mendapatkan masa percobaan GRATIS selama 14 hari sejak pendaftaran. Setelah itu pilih paket Bulanan atau Tahunan.',
    en: 'WargaJagaWarga is a paid app supervised by the Superadmin (tarafk1972@gmail.com). You get a FREE 14-day trial from registration. Afterwards choose a Monthly or Yearly plan.',
  },
  'register.submit': { id: 'Daftar Sekarang — Gratis 14 Hari', en: 'Register Now — 14 Days Free' },
  'register.submitting': { id: 'Mendaftarkan...', en: 'Registering...' },
  'register.successPending': {
    id: 'Pendaftaran dikirim! Menunggu persetujuan Admin Klaster. Masa percobaan gratis 14 hari Anda dimulai hari ini.',
    en: 'Registration sent! Awaiting Cluster Admin approval. Your 14-day free trial starts today.',
  },
  'register.requiredError': { id: 'Nama dan Blok Rumah wajib diisi.', en: 'Name and House Block are required.' },

  // ===== Langganan / Billing Per-Cluster =====
  'sub.title': { id: 'Billing Klaster & Pembayaran', en: 'Cluster Billing & Payment' },
  'sub.subtitle': {
    id: 'WargaJagaWarga adalah aplikasi berbayar PER-KLASTER yang diawasi oleh Superadmin. Setiap klaster baru mendapat masa percobaan gratis 14 hari. Peringatan billing hanya ditampilkan kepada Admin klaster — Emergency Alert warga TIDAK PERNAH diblokir.',
    en: 'WargaJagaWarga is a PER-CLUSTER paid app supervised by the Superadmin. Every new cluster gets a 14-day free trial. Billing warnings are shown to cluster Admins only — resident Emergency Alerts are NEVER blocked.',
  },
  'sub.trialActive': { id: 'Masa Percobaan Gratis Aktif', en: 'Free Trial Active' },
  'sub.trialDaysLeft': { id: 'Sisa {days} hari masa percobaan gratis', en: '{days} days left in the free trial' },
  'sub.trialEndsAt': { id: 'Percobaan berakhir', en: 'Trial ends' },
  'sub.expired': {
    id: 'Langganan klaster telah berakhir. Segera lunasi tagihan agar layanan tetap optimal (Emergency Alert warga tetap aktif).',
    en: 'The cluster subscription has ended. Please settle the bill to keep the service optimal (resident Emergency Alerts remain active).',
  },
  'sub.active': { id: 'Langganan Klaster Aktif', en: 'Cluster Subscription Active' },
  'sub.paidUntil': { id: 'Jatuh tempo', en: 'Due date' },
  'sub.monthly': { id: 'Paket Bulanan', en: 'Monthly Plan' },
  'sub.yearly': { id: 'Paket Tahunan', en: 'Yearly Plan' },
  'sub.perMonth': { id: '/ bulan / klaster', en: '/ month / cluster' },
  'sub.perYear': { id: '/ tahun / klaster', en: '/ year / cluster' },
  'sub.payNow': { id: 'Bayar Sekarang (Simulasi)', en: 'Pay Now (Simulation)' },
  'sub.choosePlan': { id: 'Pilih Paket Langganan Klaster', en: 'Choose a Cluster Subscription Plan' },
  'sub.superadminPanel': { id: 'Pengawasan Billing Seluruh Klaster (Superadmin)', en: 'All-Cluster Billing Oversight (Superadmin)' },
  'sub.superadminDesc': {
    id: 'Sebagai Superadmin & Customer Service (tarafk1972@gmail.com), Anda mengawasi billing seluruh klaster: mengubah jatuh tempo, paket, nominal tagihan, menandai lunas, memperpanjang trial, menangguhkan, atau mengaktifkan.',
    en: 'As Superadmin & Customer Service (tarafk1972@gmail.com), you oversee billing of all clusters: change due dates, plans, bill amounts, mark as paid, extend trials, suspend, or activate.',
  },
  'sub.extendTrial': { id: 'Trial +14 Hari', en: 'Trial +14 Days' },
  'sub.suspend': { id: 'Tangguhkan', en: 'Suspend' },
  'sub.activate': { id: 'Aktifkan', en: 'Activate' },
  'sub.markPaid': { id: 'Tandai Lunas', en: 'Mark Paid' },
  'sub.status.TRIAL': { id: 'MASA PERCOBAAN', en: 'TRIAL' },
  'sub.status.AKTIF': { id: 'AKTIF (BERBAYAR)', en: 'ACTIVE (PAID)' },
  'sub.status.KEDALUWARSA': { id: 'KEDALUWARSA', en: 'EXPIRED' },
  'sub.status.DITANGGUHKAN': { id: 'DITANGGUHKAN', en: 'SUSPENDED' },
  'sub.freeForever': { id: 'GRATIS SELAMANYA', en: 'FREE FOREVER' },
  'sub.inviteCode': { id: 'Kode Undangan Klaster', en: 'Cluster Invite Code' },
  'sub.inviteCodeHint': {
    id: 'Bagikan kode ini agar warga lain dapat bergabung ke klaster Anda (Join with Code).',
    en: 'Share this code so other residents can join your cluster (Join with Code).',
  },
  'sub.amountDue': { id: 'Nominal Tagihan', en: 'Amount Due' },
  'sub.billingBlocked': {
    id: 'Peringatan billing (hanya terlihat oleh Admin klaster)',
    en: 'Billing warning (visible to cluster Admins only)',
  },

  // ===== Patroli QR =====
  'patrol.title': { id: 'Modul Patroli QR (Satpam)', en: 'QR Patrol Module (Security)' },
  'patrol.subtitle': {
    id: 'Satpam memindai QR Code di titik patroli. Sistem memvalidasi radius GPS; jika offline, hasil scan disimpan di antrean dan disinkronkan otomatis saat online.',
    en: 'Guards scan QR Codes at patrol points. The system validates GPS radius; when offline, scans are queued and auto-synced once online.',
  },
  'patrol.scanBtn': { id: 'Scan QR di Posisi Saya', en: 'Scan QR at My Position' },
  'patrol.online': { id: 'ONLINE', en: 'ONLINE' },
  'patrol.offline': { id: 'OFFLINE (Simulasi)', en: 'OFFLINE (Simulated)' },
  'patrol.queue': { id: 'Antrean Offline', en: 'Offline Queue' },
  'patrol.syncNow': { id: 'Sinkronkan Sekarang', en: 'Sync Now' },
  'patrol.history': { id: 'Riwayat Scan Patroli', en: 'Patrol Scan History' },
  'patrol.points': { id: 'Titik Patroli QR', en: 'QR Patrol Points' },

  // ===== Peran =====
  'role.SUPERADMIN': { id: 'Superadmin & Layanan CS', en: 'Superadmin & CS Service' },
  'role.ADMIN': { id: 'Admin Klaster', en: 'Cluster Admin' },
  'role.SATPAM': { id: 'Satpam / Keamanan', en: 'Security Guard' },
  'role.WARGA': { id: 'Warga Klaster', en: 'Cluster Resident' },

  // ===== Footer =====
  'footer.desc': {
    id: 'Tanggap Darurat untuk Komunitas yang Lebih Aman. Satu sentuhan, Satpam dan tetanggamu datang.',
    en: 'Emergency Response for a Safer Community. One touch, security and your neighbors arrive.',
  },
  'footer.platformNav': { id: 'Navigasi Platform', en: 'Platform Navigation' },
  'footer.contactTeam': { id: 'Hubungi Tim Kami', en: 'Contact Our Team' },
  'footer.registerCommunity': { id: 'Daftarkan Komunitas Anda →', en: 'Register Your Community →' },
  'footer.paidNotice': {
    id: 'Aplikasi berbayar • Percobaan gratis 14 hari • Diawasi Superadmin tarafk1972@gmail.com',
    en: 'Paid app • 14-day free trial • Supervised by Superadmin tarafk1972@gmail.com',
  },
  'footer.privacy': { id: 'Privasi & Keamanan Data', en: 'Privacy & Data Security' },
  'footer.terms': { id: 'Syarat & Ketentuan Layanan', en: 'Terms & Conditions of Service' },
  'footer.copyright': {
    id: 'Tanggap Darurat untuk Komunitas yang Lebih Aman.',
    en: 'Emergency Response for a Safer Community.',
  },
};

export function translate(lang: AppLanguage, key: string, vars?: Record<string, string | number>): string {
  const entry = DICT[key];
  let text = entry ? entry[lang] || entry.id : key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'id',
  setLang: () => {},
  t: (key) => translate('id', key),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLang?: AppLanguage }> = ({
  children,
  initialLang = 'id',
}) => {
  const [lang, setLang] = useState<AppLanguage>(initialLang);
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
