'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Wifi,
  WifiOff,
  MapPin,
  CheckCircle2,
  XCircle,
  History,
  Navigation,
  ShieldCheck,
  Trash2,
  PlusCircle,
  CloudUpload,
} from 'lucide-react';
import { User, PatrolPoint, PatrolScan } from '@/types';
import { useLanguage } from '@/lib/i18n';

// Item antrean offline (disimpan di sisi klien sampai "online" kembali)
interface OfflineQueueItem {
  qrCode: string;
  pointName: string;
  coordinates: { x: number; y: number };
  scannedAt: string;
  localValid: boolean; // hasil validasi lokal (radius)
}

interface PatrolTabProps {
  currentUser: User | null;
  patrolPoints: PatrolPoint[];
  patrolScans: PatrolScan[];
  onScan: (data: {
    qrCode: string;
    coordinates: { x: number; y: number };
    wasOffline?: boolean;
    scannedAt?: string;
  }) => Promise<{ ok: boolean; message?: string; error?: string }>;
  onAddPoint: (data: { name: string; x: number; y: number; radius: number }) => Promise<void>;
  onDeletePoint: (pointId: string) => Promise<void>;
}

export const PatrolTab: React.FC<PatrolTabProps> = ({
  currentUser,
  patrolPoints,
  patrolScans,
  onScan,
  onAddPoint,
  onDeletePoint,
}) => {
  const { t } = useLanguage();

  // Posisi GPS satpam (simulasi) pada peta klaster 0-100
  const [myPos, setMyPos] = useState<{ x: number; y: number }>({ x: 12, y: 88 });
  // Mode online/offline (simulasi koneksi tidak stabil)
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'warn' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Form titik patroli baru (Admin)
  const [newName, setNewName] = useState('');
  const [newX, setNewX] = useState('50');
  const [newY, setNewY] = useState('50');

  const isSatpam =
    currentUser?.role === 'SATPAM' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPERADMIN';
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN';

  // Cari titik patroli terdekat dari posisi saya
  const nearestPoint = patrolPoints.reduce<{ point: PatrolPoint | null; dist: number }>(
    (acc, p) => {
      const d = Math.sqrt((p.x - myPos.x) ** 2 + (p.y - myPos.y) ** 2);
      return d < acc.dist ? { point: p, dist: d } : acc;
    },
    { point: null, dist: Infinity }
  );

  // ===== ALUR SCAN QR (sesuai workflow): baca QR -> ambil GPS -> cek online =====
  const handleScan = async (point: PatrolPoint) => {
    if (!currentUser) return;
    setBusy(true);
    setFeedback(null);

    const dist = Math.sqrt((point.x - myPos.x) ** 2 + (point.y - myPos.y) ** 2);
    const withinRadius = dist <= point.radius;

    if (!isOnline) {
      // OFFLINE: validasi LOKAL radius, simpan ke offline queue
      if (!withinRadius) {
        setFeedback({
          type: 'err',
          text: `❌ Validasi lokal GAGAL: Anda di luar radius "${point.name}" (jarak ${dist.toFixed(1)}, maks ${point.radius}). Mendekatlah ke titik patroli.`,
        });
      } else {
        setOfflineQueue((q) => [
          ...q,
          {
            qrCode: point.qrCode,
            pointName: point.name,
            coordinates: { ...myPos },
            scannedAt: new Date().toISOString(),
            localValid: true,
          },
        ]);
        setFeedback({
          type: 'warn',
          text: `📴 Perangkat OFFLINE. Scan "${point.name}" LOLOS validasi lokal & disimpan di antrean offline. Akan otomatis dikirim saat koneksi kembali.`,
        });
      }
      setBusy(false);
      return;
    }

    // ONLINE: kirim ke server untuk diverifikasi
    const res = await onScan({ qrCode: point.qrCode, coordinates: { ...myPos } });
    if (res.ok) {
      setFeedback({ type: 'ok', text: `✅ ${res.message}` });
    } else {
      setFeedback({ type: 'err', text: `❌ ${res.error}` });
    }
    setBusy(false);
  };

  // Kembali online → sinkronkan antrean offline ke server
  const handleGoOnline = async () => {
    setIsOnline(true);
    if (offlineQueue.length === 0) return;
    setSyncing(true);
    let sent = 0;
    for (const item of offlineQueue) {
      const res = await onScan({
        qrCode: item.qrCode,
        coordinates: item.coordinates,
        wasOffline: true,
        scannedAt: item.scannedAt,
      });
      if (res.ok) sent += 1;
    }
    setOfflineQueue([]);
    setSyncing(false);
    setFeedback({
      type: 'ok',
      text: `🔄 Koneksi kembali! ${sent} scan dari antrean offline berhasil disinkronkan ke server.`,
    });
  };

  const handleAddPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await onAddPoint({
      name: newName.trim(),
      x: Math.min(100, Math.max(0, parseInt(newX, 10) || 50)),
      y: Math.min(100, Math.max(0, parseInt(newY, 10) || 50)),
      radius: 12,
    });
    setNewName('');
  };

  if (!isSatpam) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <QrCode className="w-16 h-16 mx-auto text-slate-400" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('patrol.title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Modul patroli QR hanya untuk petugas keamanan (Satpam) dan Admin. Silakan ganti peran melalui
          menu di kanan atas untuk mencoba sebagai Satpam.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            MODUL PATROLI SATPAM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center space-x-2">
            <QrCode className="w-7 h-7 text-amber-500" />
            <span>{t('patrol.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t('patrol.subtitle')}</p>
        </div>

        {/* Toggle Online/Offline (simulasi) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (isOnline ? setIsOnline(false) : handleGoOnline())}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 border transition-all ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                : 'bg-red-500/10 border-red-500/40 text-red-500'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? t('patrol.online') : t('patrol.offline')}</span>
          </button>
          {!isOnline && offlineQueue.length > 0 && (
            <button
              onClick={handleGoOnline}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 transition-all"
            >
              <CloudUpload className="w-4 h-4" />
              <span>
                {t('patrol.syncNow')} ({offlineQueue.length})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold ${
            feedback.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : feedback.type === 'warn'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
              : 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400'
          }`}
        >
          {syncing ? '🔄 Menyinkronkan antrean offline...' : feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PETA POSISI + SIMULASI GPS */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-amber-400" />
            <span>Posisi GPS Saya (Simulasi) — klik peta untuk berpindah</span>
          </h3>
          <div
            className="relative w-full aspect-[4/3] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden cursor-crosshair"
            onClick={(e) => {
              const rect = (e.target as HTMLElement).closest('div')!.getBoundingClientRect();
              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
              setMyPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
            }}
          >
            {/* Titik patroli + radius */}
            {patrolPoints.map((p) => {
              const dist = Math.sqrt((p.x - myPos.x) ** 2 + (p.y - myPos.y) ** 2);
              const inRange = dist <= p.radius;
              return (
                <React.Fragment key={p.id}>
                  {/* Lingkaran radius */}
                  <div
                    className={`absolute rounded-full border-2 ${
                      inRange ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-slate-600/60 bg-slate-600/10'
                    }`}
                    style={{
                      left: `${p.x - p.radius}%`,
                      top: `${p.y - p.radius * (4 / 3)}%`,
                      width: `${p.radius * 2}%`,
                      height: `${p.radius * 2 * (4 / 3)}%`,
                    }}
                  />
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <QrCode className={`w-5 h-5 ${inRange ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-[8px] font-bold text-slate-300 whitespace-nowrap">{p.name}</span>
                  </div>
                </React.Fragment>
              );
            })}
            {/* Posisi saya */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
              style={{ left: `${myPos.x}%`, top: `${myPos.y}%` }}
            >
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white" />
              </span>
              <span className="text-[9px] font-black text-amber-300 mt-0.5">SAYA</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            📍 Posisi: ({myPos.x}, {myPos.y}) • Titik terdekat:{' '}
            <strong className="text-slate-200">
              {nearestPoint.point ? `${nearestPoint.point.name} (jarak ${nearestPoint.dist.toFixed(1)})` : '-'}
            </strong>
          </p>
        </div>

        {/* DAFTAR TITIK PATROLI + TOMBOL SCAN */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{t('patrol.points')} ({patrolPoints.length})</span>
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {patrolPoints.map((p) => {
                const dist = Math.sqrt((p.x - myPos.x) ** 2 + (p.y - myPos.y) ** 2);
                const inRange = dist <= p.radius;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                      inRange
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500">
                        QR: <code className="font-bold">{p.qrCode}</code> • jarak {dist.toFixed(1)} / radius{' '}
                        {p.radius} {inRange ? '• ✅ DALAM JANGKAUAN' : '• di luar jangkauan'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleScan(p)}
                        disabled={busy}
                        className={`px-3 py-2 rounded-lg text-[11px] font-black flex items-center space-x-1.5 transition-all disabled:opacity-50 ${
                          inRange
                            ? 'bg-amber-500 hover:bg-amber-400 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>SCAN</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => onDeletePoint(p.id)}
                          title="Hapus titik patroli (Admin)"
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Antrean offline */}
          {offlineQueue.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center space-x-2">
                <WifiOff className="w-4 h-4" />
                <span>
                  {t('patrol.queue')} ({offlineQueue.length})
                </span>
              </h4>
              {offlineQueue.map((q, i) => (
                <p key={i} className="text-[11px] text-slate-600 dark:text-slate-300">
                  ⏳ {q.pointName} — {new Date(q.scannedAt).toLocaleTimeString('id-ID')} (menunggu sinkronisasi)
                </p>
              ))}
            </div>
          )}

          {/* Admin: tambah titik patroli */}
          {isAdmin && (
            <form
              onSubmit={handleAddPoint}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-purple-500" />
                <span>Tambah Titik Patroli (Admin)</span>
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama titik, mis: Taman Tengah"
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <input
                  type="number"
                  value={newX}
                  onChange={(e) => setNewX(e.target.value)}
                  placeholder="X"
                  className="w-16 px-2 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <input
                  type="number"
                  value={newY}
                  onChange={(e) => setNewY(e.target.value)}
                  placeholder="Y"
                  className="w-16 px-2 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
                >
                  Tambah
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* RIWAYAT SCAN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
          <History className="w-4 h-4 text-indigo-500" />
          <span>
            {t('patrol.history')} ({patrolScans.length})
          </span>
        </h3>
        {patrolScans.length === 0 ? (
          <p className="text-xs text-slate-500">Belum ada scan patroli. Mulai patroli dan scan QR di titik terdekat!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-4">Waktu</th>
                  <th className="py-2 pr-4">Petugas</th>
                  <th className="py-2 pr-4">Titik Patroli</th>
                  <th className="py-2 pr-4">Jarak</th>
                  <th className="py-2 pr-4">Mode</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patrolScans.slice(0, 15).map((sc) => (
                  <tr key={sc.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(sc.scannedAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 pr-4 font-semibold">{sc.satpamName}</td>
                    <td className="py-2 pr-4">{sc.patrolPointName}</td>
                    <td className="py-2 pr-4">{sc.distance}</td>
                    <td className="py-2 pr-4">
                      {sc.wasOffline ? (
                        <span className="inline-flex items-center space-x-1 text-amber-500 font-bold">
                          <WifiOff className="w-3 h-3" />
                          <span>Offline→Sinkron</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-emerald-500 font-bold">
                          <Wifi className="w-3 h-3" />
                          <span>Online</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      {sc.status === 'DITOLAK' ? (
                        <span className="inline-flex items-center space-x-1 text-red-500 font-black">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>DITOLAK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-emerald-500 font-black">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>TERSINKRON</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-slate-400 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>
            Validasi radius GPS dilakukan server saat online, dan secara lokal saat offline (offline QR
            validation). Seluruh histori patroli tersimpan sebagai arsip.
          </span>
        </p>
      </div>
    </div>
  );
};
