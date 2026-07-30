'use client';

import React from 'react';
import {
  ShieldCheck,
  Clock,
  Award,
  ShieldAlert,
  Download,
  Users,
  Building2,
  Flame,
  HeartPulse,
  Zap,
} from 'lucide-react';
import { Incident, ClusterStats } from '@/types';

interface StatsTabProps {
  stats: ClusterStats;
  incidents: Incident[];
}

export const StatsTab: React.FC<StatsTabProps> = ({ stats, incidents }) => {
  const keamananCount = incidents.filter((i) => i.type === 'KEAMANAN').length;
  const medisCount = incidents.filter((i) => i.type === 'MEDIS').length;
  const kebakaranCount = incidents.filter((i) => i.type === 'KEBAKARAN').length;
  const listrikCount = incidents.filter((i) => i.type === 'LISTRIK').length;

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ stats, incidents, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan_keamanan_wargajagawarga_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            LAPORAN STATISTIK KOMUNITAS
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            WargaJagaWarga Dalam Angka
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data analitis keamanan, kecepatan tanggap satpam, dan riwayat kedaruratan klaster.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center space-x-2 shadow-md hover:opacity-90 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Laporan Keamanan (JSON)</span>
        </button>
      </div>

      {/* Primary Statistics Grid - Matching durable site stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4 border border-red-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.wargaTerdaftar}+</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mt-1">
              Warga Terdaftar
            </p>
            <p className="text-xs text-slate-500 mt-1">Kepala keluarga terhubung aktif</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.klasterTerhubung}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mt-1">
              Klaster Terhubung
            </p>
            <p className="text-xs text-slate-500 mt-1">Menteng Asri, Kebayoran, BSD, dll</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.satpamAktif}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mt-1">
              Satpam Aktif
            </p>
            <p className="text-xs text-slate-500 mt-1">Siaga di gerbang & patroli blok</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-5xl font-black text-amber-500">{stats.averageResponseTimeMin} Menit</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mt-1">
              Rata-rata Waktu Tanggap
            </p>
            <p className="text-xs text-slate-500 mt-1">Sejak tombol SOS ditekan</p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics / Safety Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Breakdown by Emergency Type */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Distribusi Kategori Kejadian Darurat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Berdasarkan riwayat pelaporan tombol SOS warga dalam 30 hari terakhir
            </p>
          </div>

          <div className="space-y-4">
            {/* Keamanan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Darurat Keamanan (Mencurigakan / Penyusupan)</span>
                </span>
                <span>{keamananCount} Kejadian</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full"
                  style={{ width: `${Math.max(25, (keamananCount / Math.max(1, incidents.length)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Medis */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-2 text-rose-500">
                  <HeartPulse className="w-4 h-4" />
                  <span>Darurat Medis (Ambulans / Pertolongan Pertama)</span>
                </span>
                <span>{medisCount} Kejadian</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.max(20, (medisCount / Math.max(1, incidents.length)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Kebakaran */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-2 text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span>Darurat Kebakaran / Asap</span>
                </span>
                <span>{kebakaranCount} Kejadian</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.max(15, (kebakaranCount / Math.max(1, incidents.length)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Listrik */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-2 text-amber-500">
                  <Zap className="w-4 h-4" />
                  <span>Darurat Listrik / Utilitas</span>
                </span>
                <span>{listrikCount} Kejadian</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.max(30, (listrikCount / Math.max(1, incidents.length)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Total Kejadian Tercatat: {incidents.length}</span>
            <span className="text-emerald-500 font-bold">100% Tanggap Satpam</span>
          </div>
        </div>

        {/* Safety Score Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              INDEKS KEAMANAN KLASTER
            </span>
            <Award className="w-6 h-6 text-yellow-400" />
          </div>

          <div className="space-y-2">
            <p className="text-5xl font-black text-emerald-400">98.6 / 100</p>
            <p className="text-base font-bold text-white">Sangat Aman & Terkendali</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Klaster Menteng Asri & Kebayoran Baru menempati peringkat tertinggi dalam partisipasi wargajagawarga dan kecepatan respons Satpam.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Partisipasi Warga:</span>
              <span className="font-bold text-white">96.4% Warga Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Kehadiran Satpam Pos:</span>
              <span className="font-bold text-emerald-400">24 Jam Non-stop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
