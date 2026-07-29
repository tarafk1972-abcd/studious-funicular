'use client';

import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Radio,
  Quote,
  Smile,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { ClusterStats, User } from '@/types';
import { useLanguage } from '@/lib/i18n';

interface LandingTabProps {
  stats: ClusterStats;
  currentUser: User | null;
  onSwitchTab: (tab: string) => void;
  onTriggerSOSModal: () => void;
}

export const LandingTab: React.FC<LandingTabProps> = ({
  stats,
  currentUser,
  onSwitchTab,
  onTriggerSOSModal,
}) => {
  const { t } = useLanguage();
  const isApprovedMember = currentUser && currentUser.approvalStatus === 'DISETUJUI';

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return t('role.SUPERADMIN');
      case 'ADMIN':
        return t('role.ADMIN');
      case 'SATPAM':
        return t('role.SATPAM');
      default:
        return t('role.WARGA');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION DENGAN SAPAAN "APA KABAR HARI INI, <NAMA ANGGOTA>?" JIKA SUDAH DISETUJUI */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-rose-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>TANGGAP DARURAT KOMUNITAS PERUMAHAN</span>
              </div>

              {/* SAPAAN RESMI SETELAH HP TERDAFTAR DAN DISETUJUI ADMIN */}
              {isApprovedMember && (
                <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-slate-900/90 p-5 rounded-2xl border-2 border-emerald-500/60 shadow-xl space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
                      <Smile className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                        {t('landing.approvedBadge')}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                        {t('landing.greeting', { name: currentUser.name })}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t('landing.registeredInfo', {
                      cluster: currentUser.cluster,
                      role: getRoleDisplayName(currentUser.role),
                    })}
                  </p>
                </div>
              )}

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-balance">
                {t('landing.heroTitle1')} <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                  {t('landing.heroTitle2')}
                </span>{' '}
                {t('landing.heroTitle3')}
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
                {t('landing.heroSubtitle')}
              </p>

              {/* ACTION BUTTONS: HILANGKAN TOMBOL PENDAFTARAN JIKA HP SUDAH TERDAFTAR & DISETUJUI */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
                <button
                  onClick={() => onSwitchTab('app')}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base shadow-xl shadow-red-600/30 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <span>{t('landing.openApp')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {!isApprovedMember && (
                  <button
                    onClick={() => onSwitchTab('directory')}
                    className="px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-base border border-slate-700 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>{t('landing.registerTrial')}</span>
                  </button>
                )}
              </div>

              {/* APLIKASI BERBAYAR: MASA PERCOBAAN GRATIS 14 HARI */}
              <p className="text-xs text-amber-300/90 font-semibold flex items-center space-x-2">
                <span>💳</span>
                <span>{t('landing.paidAppNote')}</span>
              </p>

              <div className="flex items-center space-x-6 pt-4 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('landing.install10min')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('landing.connected24h')}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual / Interactive Phone Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-slate-800/80 p-3 shadow-2xl border border-slate-700 backdrop-blur-md">
                <div className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
                  <img
                    src="/images/hero.jpg"
                    alt="Sekelompok tetangga melihat ponsel bersama di sore hari"
                    className="w-full h-64 object-cover object-center"
                  />
                  <div className="p-5 space-y-4 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Klaster Menteng Asri • Siaga
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">12 Satpam Aktif</span>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-red-900/60 to-rose-900/60 border border-red-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-red-200">TOMBOL DARURAT SOS</span>
                        <Radio className="w-4 h-4 text-red-400 animate-ping" />
                      </div>
                      <p className="text-xs text-slate-300">
                        Tekan untuk mengirim sinyal darurat ke Pos Satpam dan seluruh tetangga.
                      </p>
                      <button
                        onClick={onTriggerSOSModal}
                        className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>TES SIMULASI SOS SEKARANG</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>• Peta Kejadian Langsung</span>
                      <span>• Tanggap 2.4 Menit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TEKNOLOGI KAMI: KEAMANAN YANG TIDAK PERLU RUMIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-extrabold uppercase tracking-wider">
            TEKNOLOGI KAMI
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Keamanan yang tidak perlu rumit
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Kami membangun sistem peringatan komunitas yang langsung ke pokok masalah. Satu tombol, Satpam dan semua tetangga tahu, bantuan datang secepat kilat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Feature 1: Peringatan Satu Sentuhan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Peringatan satu sentuhan
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Tekan tombol darurat, dan seluruh blok Anda mendapat notifikasi langsung. Satpam yang bertugas dan tetangga terdekat segera menerima tanda darurat beserta koordinat lokasi rumah Anda.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src="/images/sos-app.jpg"
                alt="Layar ponsel modern menampilkan tombol darurat merah besar"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>

          {/* Feature 2: Peta Kejadian Langsung */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Peta kejadian langsung
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Lihat di mana bantuan dibutuhkan dan siapa yang merespons di sekitar Anda. Setiap pergerakan Satpam dari Pos Gerbang dan warga tetangga terpantau secara langsung sampai situasi aman terkendali.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src="/images/community-patrol.jpg"
                alt="Satpam dan warga memantau peta klaster"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. TETANGGA BICARA: TESTIMONIALS */}
      <section className="bg-slate-900 text-white py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-extrabold uppercase tracking-wider">
              TETANGGA BICARA
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Cukup satu aplikasi yang menyatukan seluruh klaster kami
            </h2>
            <p className="text-base sm:text-lg text-slate-400">
              Pengalaman langsung dari Ibu RT, Warga, dan Ibu Rumah Tangga setelah menggunakan WargaJagaWarga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between space-y-6 relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-700 opacity-50" />
              <p className="text-slate-200 text-base leading-relaxed relative z-10 italic">
                &ldquo;Dulu kalau ada apa-apa di blok, kami harus WA dulu. Sekarang sekali klik di WargaJagaWarga, semua Satpam dan tetangga langsung tahu. Rasanya aman banget.&rdquo;
              </p>
              <div className="flex items-center space-x-3.5 pt-4 border-t border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Rina Wijaya"
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                />
                <div>
                  <h4 className="font-bold text-white text-base">Rina Wijaya</h4>
                  <p className="text-xs text-red-400 font-semibold">Ibu RT, Menteng</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between space-y-6 relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-700 opacity-50" />
              <p className="text-slate-200 text-base leading-relaxed relative z-10 italic">
                &ldquo;Pas malam-malam listrik mati dan ada suara mencurigakan, saya langsung pakai fitur darurat. Dalam 3 menit, tiga tetangga sudah di depan rumah. Cepat sekali.&rdquo;
              </p>
              <div className="flex items-center space-x-3.5 pt-4 border-t border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Bambang Sutanto"
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                />
                <div>
                  <h4 className="font-bold text-white text-base">Bambang Sutanto</h4>
                  <p className="text-xs text-red-400 font-semibold">Warga, Kebayoran Baru</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between space-y-6 relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-700 opacity-50" />
              <p className="text-slate-200 text-base leading-relaxed relative z-10 italic">
                &ldquo;Saya ibu rumah tangga dengan dua anak kecil. Sejak pakai WargaJagaWarga, saya tidur lebih tenang. Anak-anak juga tahu cara minta tolong lewat aplikasi.&rdquo;
              </p>
              <div className="flex items-center space-x-3.5 pt-4 border-t border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                  alt="Sari Dewi"
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                />
                <div>
                  <h4 className="font-bold text-white text-base">Sari Dewi</h4>
                  <p className="text-xs text-red-400 font-semibold">Ibu Rumah Tangga, Kelapa Gading</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DATA KEAMANAN: WARGAJAGAWARGA DALAM ANGKA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
            DATA KEAMANAN
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            WargaJagaWarga dalam angka
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Kami baru memulai, tapi komitmen kami untuk lingkungan yang lebih aman sudah terlihat. Berikut data awal perjalanan kami.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-all">
            <p className="text-4xl sm:text-6xl font-black text-red-600 dark:text-red-500 mb-2">
              {stats.wargaTerdaftar}+
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Warga terdaftar
            </p>
            <p className="text-xs text-slate-500 mt-1">Terhubung aktif di lingkungan</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-all">
            <p className="text-4xl sm:text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
              {stats.klasterTerhubung}
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Klaster terhubung
            </p>
            <p className="text-xs text-slate-500 mt-1">Menteng, Kebayoran, Gading, dll.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-all">
            <p className="text-4xl sm:text-6xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
              {stats.satpamAktif}
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Satpam aktif
            </p>
            <p className="text-xs text-slate-500 mt-1">Siaga 24/7 di gerbang & patroli</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-all">
            <p className="text-4xl sm:text-6xl font-black text-amber-500 mb-2">
              {stats.platformTerpadu}
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Platform terpadu
            </p>
            <p className="text-xs text-slate-500 mt-1">Satu aplikasi untuk seluruh klaster</p>
          </div>
        </div>
      </section>

      {/* 5. COMMUNITY BANNER CTA & SIGNUP TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {isApprovedMember
                ? `Apa kabar hari ini, ${currentUser.name}?`
                : 'Satu ketukan untuk klaster yang lebih aman. Daftar WargaJagaWarga hari ini.'}
            </h2>
            <p className="text-lg text-red-100 max-w-2xl leading-relaxed">
              {isApprovedMember
                ? `HP dan nomor Anda telah terdaftar dan disetujui dalam jaringan keamanan WargaJagaWarga klaster ${currentUser.cluster}. Seluruh tetangga saling terhubung dengan satu aplikasi.`
                : 'Install pada hp seluruh komunitas klaster Anda dalam 10 menit. Semua tetangga saling terhubung dengan satu aplikasi, satu tombol darurat.'}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              {isApprovedMember ? (
                <button
                  onClick={() => onSwitchTab('app')}
                  className="px-8 py-4 rounded-xl bg-white text-red-950 font-black text-base hover:bg-slate-100 shadow-xl transition-all text-center flex items-center justify-center space-x-2"
                >
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Buka Aplikasi Darurat Klaster</span>
                </button>
              ) : (
                <button
                  onClick={() => onSwitchTab('contact')}
                  className="px-8 py-4 rounded-xl bg-white text-red-950 font-black text-base hover:bg-slate-100 shadow-xl transition-all text-center"
                >
                  Daftar gratis sekarang
                </button>
              )}
              <a
                href="mailto:tarafk1972@gmail.com"
                className="px-6 py-4 rounded-xl bg-red-900/60 hover:bg-red-900/80 text-white font-semibold text-base border border-red-400/40 text-center transition-all"
              >
                Kirim email ke Customer Service WJW
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
