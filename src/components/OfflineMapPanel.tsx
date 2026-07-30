'use client';

// Panel PETA OFFLINE KLASTER:
// - ADMIN PERTAMA klaster menentukan area peta (pusat + radius)
// - Seluruh anggota men-DOWNLOAD tile area tsb ke penyimpanan smartphone
//   (IndexedDB) sehingga peta tetap berfungsi saat OFFLINE.

import React, { useEffect, useState } from 'react';
import {
  DownloadCloud,
  MapPinned,
  Trash2,
  CheckCircle2,
  HardDrive,
  Crosshair,
} from 'lucide-react';
import { Cluster, User } from '@/types';
import { GeoArea, DEFAULT_AREA } from '@/lib/geo';
import {
  downloadAreaTiles,
  getOfflineMeta,
  clearOfflineMap,
  listTilesForArea,
  OfflineMapMeta,
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
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(myCluster?.mapArea?.radiusKm ?? 0.7);
  const [saving, setSaving] = useState(false);

  const isAdmin =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPERADMIN' ||
    currentUser?.email === 'tarafk1972@gmail.com';

  const area = clusterGeoArea(myCluster);
  const minZoom = myCluster?.mapArea?.minZoom ?? 14;
  const maxZoom = myCluster?.mapArea?.maxZoom ?? 17;
  const tileEstimate = Math.min(300, listTilesForArea(area, minZoom, maxZoom).length);

  useEffect(() => {
    getOfflineMeta().then(setMeta);
  }, []);

  const handleDownload = async () => {
    if (!myCluster) return;
    setDownloading(true);
    setProgress({ done: 0, total: tileEstimate });
    try {
      const m = await downloadAreaTiles(myCluster.name, area, minZoom, maxZoom, (done, total) =>
        setProgress({ done, total })
      );
      setMeta(m);
    } finally {
      setDownloading(false);
      setProgress(null);
    }
  };

  const handleClear = async () => {
    await clearOfflineMap();
    setMeta(null);
  };

  const handleSaveArea = async () => {
    if (!onSaveArea || !pendingCenter) return;
    setSaving(true);
    await onSaveArea({ centerLat: pendingCenter.lat, centerLng: pendingCenter.lng, radiusKm });
    setSaving(false);
  };

  const fmtSize = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

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
        Area peta ditentukan oleh <strong>Admin pertama klaster</strong> dan akan{' '}
        <strong>ter-download ke aplikasi setiap smartphone anggota</strong>, sehingga peta tetap
        berfungsi <strong>secara offline</strong> (tanpa koneksi internet).
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
            disabled={!pendingCenter || saving}
            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Area untuk Seluruh Anggota'}</span>
          </button>
        </div>
      )}

      {/* Semua anggota: DOWNLOAD peta offline */}
      {downloading && progress ? (
        <div className="space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round((progress.done / Math.max(1, progress.total)) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-bold text-emerald-500 text-center">
            Mengunduh tile peta... {progress.done}/{progress.total}
          </p>
        </div>
      ) : (
        <button
          onClick={handleDownload}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
        >
          <DownloadCloud className="w-4 h-4" />
          <span>{meta ? 'Perbarui Peta Offline' : 'Download Peta Offline ke HP Saya'}</span>
        </button>
      )}

      {/* Status peta offline tersimpan */}
      {meta && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                Peta offline tersimpan di perangkat
              </p>
              <p className="text-[10px] text-slate-500">
                {meta.clusterName} • {meta.tileCount} tile • {fmtSize(meta.sizeBytes)} •{' '}
                {new Date(meta.downloadedAt).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            title="Hapus peta offline"
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
