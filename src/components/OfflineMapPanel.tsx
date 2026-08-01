'use client';

// Panel PETA OFFLINE KLASTER:
// - Area peta ditentukan SEJAK AWAL oleh ADMIN PERTAMA klaster.
// - Peta area tersebut OTOMATIS terpasang pada semua HP anggota klaster
//   setelah pendaftarannya diterima Admin (lihat OfflineMapAutoInstall)
//   — TANPA tombol download manual.
// - Gunanya: peta tetap berfungsi walau tidak terkoneksi internet.

import React, { useEffect, useState } from 'react';
import { MapPinned, CheckCircle2, HardDrive, Crosshair, Clock, RefreshCw } from 'lucide-react';
import { Cluster, User } from '@/types';
import { GeoArea, DEFAULT_AREA } from '@/lib/geo';
import {
  getOfflineMeta,
  listTilesForArea,
  OfflineMapMeta,
  clearOfflineMap,
  downloadAreaTiles,
} from '@/lib/offlineMap';

interface OfflineMapPanelProps {
  currentUser: User | null;
  myCluster?: Cluster;
  // Mode admin: pusat area diambil dari klik peta terakhir
  pendingCenter?: { lat: number; lng: number } | null;
  onSaveArea?: (data: { centerLat: number; centerLng: number; radiusKm: number }) => Promise<void>;
}

export function clusterGeoArea(cluster?: Cluster): GeoArea {
  if (cluster?.mapArea) {
    return {
      centerLat: cluster.mapArea.centerLat,
      centerLng: cluster.mapArea.centerLng,
      radiusKm: cluster.mapArea.radiusKm,
    };
  }
  return DEFAULT_AREA;
}

export const OfflineMapPanel: React.FC<OfflineMapPanelProps> = ({
  currentUser,
  myCluster,
  pendingCenter,
  onSaveArea,
}) => {
  const [meta, setMeta] = useState<OfflineMapMeta | null>(null);
  const [radiusKm, setRadiusKm] = useState(myCluster?.mapArea?.radiusKm ?? 0.7);
  const [saving, setSaving] = useState(false);
  // Pasang ulang peta di HP ini (khusus Admin, mis. bila data peta rusak)
  const [reinstalling, setReinstalling] = useState(false);
  const [reinstallProgress, setReinstallProgress] = useState<{ done: number; total: number } | null>(null);

  const isAdmin =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPERADMIN' ||
    currentUser?.email === 'tarafk1972@gmail.com';

  const isApproved = currentUser?.approvalStatus === 'DISETUJUI';

  const area = clusterGeoArea(myCluster);
  const minZoom = myCluster?.mapArea?.minZoom ?? 14;
  const maxZoom = myCluster?.mapArea?.maxZoom ?? 17;
  const tileEstimate = Math.min(300, listTilesForArea(area, minZoom, maxZoom).length);

  // Pantau status pemasangan otomatis (disegarkan berkala,
  // karena OfflineMapAutoInstall bekerja di latar belakang)
  useEffect(() => {
    getOfflineMeta().then(setMeta);
    const interval = setInterval(() => {
      getOfflineMeta().then(setMeta);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveArea = async () => {
    if (!onSaveArea) return;
    // Bila Admin tidak memilih titik baru, pakai pusat area saat ini
    // (berguna untuk MEMAKSA pemasangan ulang di semua HP anggota tanpa mengubah area)
    const center = pendingCenter || { lat: area.centerLat, lng: area.centerLng };
    setSaving(true);
    await onSaveArea({ centerLat: center.lat, centerLng: center.lng, radiusKm });
    setSaving(false);
  };

  // PASANG ULANG PETA DI HP INI (khusus Admin):
  // hapus cache tile lama -> unduh ulang seluruh tile area klaster
  const handleReinstall = async () => {
    if (!myCluster || reinstalling) return;
    setReinstalling(true);
    setReinstallProgress({ done: 0, total: tileEstimate });
    try {
      await clearOfflineMap();
      const m = await downloadAreaTiles(myCluster.name, area, minZoom, maxZoom, (done, total) =>
        setReinstallProgress({ done, total })
      );
      setMeta(m);
    } catch {
      // gagal (mis. offline) — biarkan auto-install mencoba lagi nanti
    } finally {
      setReinstalling(false);
      setReinstallProgress(null);
    }
  };

  const fmtSize = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

  // Apakah peta di HP ini sudah sesuai area yang ditentukan Admin?
  const metaMatchesArea =
    meta &&
    myCluster &&
    meta.clusterName === myCluster.name &&
    Math.abs(meta.area.centerLat - area.centerLat) < 1e-6 &&
    Math.abs(meta.area.centerLng - area.centerLng) < 1e-6;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-emerald-500" />
          <span>Peta Offline Klaster</span>
        </h3>
        {myCluster?.mapArea ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            AREA DITETAPKAN ADMIN
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-500 border border-amber-500/30">
            AREA DEFAULT (BELUM DIATUR)
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Area peta ditentukan <strong>sejak awal oleh Admin pertama klaster</strong>. Peta area ini{' '}
        <strong>otomatis terpasang di semua HP anggota</strong> setelah pendaftarannya diterima Admin
        — tanpa perlu tombol download. Gunanya: <strong>peta tetap berfungsi walau tidak
        terkoneksi internet</strong>.
      </p>

      {/* Info area saat ini */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
          <p className="text-[9px] uppercase font-bold text-slate-400">Pusat Area</p>
          <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">
            {area.centerLat.toFixed(4)}, {area.centerLng.toFixed(4)}
          </p>
        </div>
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
          <p className="text-[9px] uppercase font-bold text-slate-400">Radius</p>
          <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">{area.radiusKm} km</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
          <p className="text-[9px] uppercase font-bold text-slate-400">Perkiraan Tile</p>
          <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">±{tileEstimate}</p>
        </div>
      </div>

      {/* ADMIN: tetapkan area dari klik peta */}
      {isAdmin && onSaveArea && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
          <p className="text-[11px] font-black text-purple-500 uppercase tracking-wider flex items-center space-x-1.5">
            <MapPinned className="w-3.5 h-3.5" />
            <span>Tetapkan Area Peta (Khusus Admin)</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {pendingCenter ? (
              <>
                📍 Pusat baru dari klik peta:{' '}
                <strong>
                  {pendingCenter.lat.toFixed(4)}, {pendingCenter.lng.toFixed(4)}
                </strong>
              </>
            ) : (
              <>Klik pada peta OSM untuk memilih titik pusat area klaster Anda.</>
            )}
          </p>
          <div className="flex items-center space-x-2">
            <label className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
              Radius: {radiusKm.toFixed(1)} km
            </label>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="flex-1 accent-purple-500"
            />
          </div>
          <button
            onClick={handleSaveArea}
            disabled={saving}
            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>
              {saving
                ? 'Menyimpan...'
                : pendingCenter
                ? 'Simpan Area Baru — Otomatis Terpasang di Semua HP Anggota'
                : 'Simpan / Pasang Ulang ke Semua HP Anggota (Area Saat Ini)'}
            </span>
          </button>

          {/* PASANG ULANG PETA (Admin): di HP ini & paksa semua HP anggota */}
          <div className="pt-1 border-t border-purple-500/20 space-y-1.5">
            {reinstalling && reinstallProgress ? (
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{
                      width: `${Math.round((reinstallProgress.done / Math.max(1, reinstallProgress.total)) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] font-bold text-purple-500 text-center">
                  Memasang ulang peta... {reinstallProgress.done}/{reinstallProgress.total} tile
                </p>
              </div>
            ) : (
              <button
                onClick={handleReinstall}
                className="w-full py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-500 text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pasang Ulang Peta di HP Ini</span>
              </button>
            )}
            <p className="text-[9px] text-slate-500 leading-relaxed">
              💡 Untuk memasang ulang di <strong>semua HP anggota</strong>: cukup tekan tombol
              &ldquo;Simpan&rdquo; di atas (area boleh sama) — setiap HP anggota akan otomatis
              mengunduh ulang peta versi terbaru.
            </p>
          </div>
        </div>
      )}

      {/* STATUS PEMASANGAN OTOMATIS DI HP INI */}
      {metaMatchesArea && meta ? (
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
              Peta offline terpasang otomatis di HP ini ✓
            </p>
            <p className="text-[10px] text-slate-500">
              {meta.clusterName} • {meta.tileCount} tile • {fmtSize(meta.sizeBytes)} • terpasang{' '}
              {new Date(meta.downloadedAt).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
      ) : isApproved ? (
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            Peta offline sedang dipasang otomatis di latar belakang...
          </p>
        </div>
      ) : (
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="text-[11px] font-bold text-slate-500">
            Peta offline akan terpasang otomatis setelah pendaftaran Anda diterima Admin.
          </p>
        </div>
      )}
    </div>
  );
};
