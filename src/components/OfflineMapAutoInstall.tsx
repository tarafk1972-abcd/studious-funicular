'use client';

// ==================================================================
// PEMASANGAN OTOMATIS PETA OFFLINE KLASTER
// Area peta ditentukan sejak awal oleh ADMIN PERTAMA klaster.
// Setelah pendaftaran anggota DITERIMA oleh Admin, peta area klaster
// otomatis ter-download & terpasang di HP anggota (IndexedDB) —
// TANPA tombol download manual — agar peta tetap berfungsi walau
// tidak terkoneksi internet.
// ==================================================================

import React, { useEffect, useRef, useState } from 'react';
import { DownloadCloud, CheckCircle2 } from 'lucide-react';
import { Cluster, User } from '@/types';
import { clusterGeoArea } from '@/components/OfflineMapPanel';
import { downloadAreaTiles, getOfflineMeta } from '@/lib/offlineMap';

interface OfflineMapAutoInstallProps {
  currentUser: User | null;
  clusters: Cluster[];
}

export const OfflineMapAutoInstall: React.FC<OfflineMapAutoInstallProps> = ({
  currentUser,
  clusters,
}) => {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [justDone, setJustDone] = useState(false);
  const busyRef = useRef(false);

  const myCluster = currentUser
    ? clusters.find((c) => c.name.toLowerCase() === currentUser.cluster.toLowerCase())
    : undefined;

  // Tanda tangan area: berubah bila Admin memperbarui area peta klaster
  const areaSignature = myCluster
    ? `${myCluster.name}|${myCluster.mapArea?.centerLat ?? 'def'}|${myCluster.mapArea?.centerLng ?? 'def'}|${
        myCluster.mapArea?.radiusKm ?? 'def'
      }|${myCluster.mapArea?.updatedAt ?? ''}`
    : '';

  useEffect(() => {
    // Syarat pemasangan otomatis:
    // 1) pendaftaran anggota sudah DITERIMA admin, 2) klaster diketahui, 3) sedang online
    if (!currentUser || currentUser.approvalStatus !== 'DISETUJUI') return;
    if (!myCluster) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (busyRef.current) return;

    const area = clusterGeoArea(myCluster);
    const minZoom = myCluster.mapArea?.minZoom ?? 14;
    const maxZoom = myCluster.mapArea?.maxZoom ?? 17;
    const updatedAt = myCluster.mapArea?.updatedAt;
    let cancelled = false;

    (async () => {
      // Cek apakah peta offline di HP ini sudah sesuai area yang ditentukan Admin
      const meta = await getOfflineMeta();
      const sameArea =
        meta &&
        Math.abs(meta.area.centerLat - area.centerLat) < 1e-6 &&
        Math.abs(meta.area.centerLng - area.centerLng) < 1e-6 &&
        Math.abs(meta.area.radiusKm - area.radiusKm) < 1e-6 &&
        meta.clusterName === myCluster.name;
      const upToDate =
        sameArea && (!updatedAt || new Date(meta!.downloadedAt) >= new Date(updatedAt));
      if (upToDate || cancelled) return;

      // Pasang otomatis (diam-diam, hanya indikator kecil di pojok layar)
      busyRef.current = true;
      setProgress({ done: 0, total: 1 });
      try {
        await downloadAreaTiles(myCluster.name, area, minZoom, maxZoom, (done, total) => {
          if (!cancelled) setProgress({ done, total });
        });
        if (!cancelled) {
          setJustDone(true);
          setTimeout(() => setJustDone(false), 6000);
        }
      } catch {
        // gagal (mis. offline) — akan dicoba lagi otomatis saat state menyegar
      } finally {
        busyRef.current = false;
        if (!cancelled) setProgress(null);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.approvalStatus, areaSignature]);

  if (progress) {
    const pct = Math.round((progress.done / Math.max(1, progress.total)) * 100);
    return (
      <div className="fixed bottom-4 right-4 z-[150] flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl text-white">
        <DownloadCloud className="w-4 h-4 text-emerald-400 animate-bounce shrink-0" />
        <div>
          <p className="text-[11px] font-black text-emerald-400">
            Memasang peta offline klaster... {pct}%
          </p>
          <div className="w-40 h-1.5 rounded-full bg-slate-700 overflow-hidden mt-1">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (justDone) {
    return (
      <div className="fixed bottom-4 right-4 z-[150] flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl text-white">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-[11px] font-black text-emerald-400">
          Peta offline klaster terpasang — peta tetap berfungsi tanpa internet ✓
        </p>
      </div>
    );
  }

  return null;
};
