'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Navigation,
  CheckCircle2,
  Radio,
  PlusCircle,
  Trash2,
  MapPin,
} from 'lucide-react';
import { Incident, User as UserType, ClusterBlockArea, Cluster } from '@/types';
import { OsmMapLazy, OsmMarker } from '@/components/OsmMapLazy';
import { OfflineMapPanel, clusterGeoArea } from '@/components/OfflineMapPanel';
import { xyToLatLng } from '@/lib/geo';

interface MapTabProps {
  incidents: Incident[];
  users: UserType[];
  mapAreas?: ClusterBlockArea[];
  clusters?: Cluster[];
  currentUser: UserType | null;
  onSelectBlockForSOS: (blockName: string) => void;
  onRespondToIncident: (incidentId: string) => void;
  onResolveIncident: (incidentId: string) => void;
  onAddMapArea?: (area: {
    blockName: string;
    description: string;
    x: number;
    y: number;
    type: 'RUMAH' | 'POS_SATPAM' | 'CCTV' | 'TAMAN';
  }) => void;
  onDeleteMapArea?: (id: string) => void;
  onSetClusterMapArea?: (data: { centerLat: number; centerLng: number; radiusKm: number }) => Promise<void>;
}

export const MapTab: React.FC<MapTabProps> = ({
  incidents,
  users,
  mapAreas = [],
  clusters = [],
  currentUser,
  onSelectBlockForSOS,
  onRespondToIncident,
  onResolveIncident,
  onAddMapArea,
  onDeleteMapArea,
  onSetClusterMapArea,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<ClusterBlockArea | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE_ONLY'>('ALL');
  // Titik pusat area baru yang dipilih Admin lewat klik peta (untuk peta offline)
  const [pendingCenter, setPendingCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Klaster milik pengguna aktif -> area peta offline yang ditentukan Admin
  const myCluster = currentUser
    ? clusters.find((c) => c.name.toLowerCase() === currentUser.cluster.toLowerCase())
    : undefined;
  const geoArea = clusterGeoArea(myCluster);

  // Mode Pengelolaan Area Peta oleh Admin
  const [isAdminManageMode, setIsAdminManageMode] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newX, setNewX] = useState(50);
  const [newY, setNewY] = useState(50);
  const [newType, setNewType] = useState<'RUMAH' | 'POS_SATPAM' | 'CCTV' | 'TAMAN'>('RUMAH');

  const isAdminOrSuper =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPERADMIN' ||
    currentUser?.email === 'tarafk1972@gmail.com';

  const activeIncidents = incidents.filter((i) => i.status !== 'SELESAI');

  const satpamUnits = users.filter((u) => u.role === 'SATPAM');

  const getHouseIncident = (blockName: string) => {
    return activeIncidents.find((i) => i.block === blockName);
  };

  const handleAddAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockName || !onAddMapArea) return;
    onAddMapArea({
      blockName: newBlockName,
      description: newDesc || 'Area penempatan pemantauan klaster',
      x: Number(newX),
      y: Number(newY),
      type: newType,
    });
    setNewBlockName('');
    setNewDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Map Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
              PETA KEJADIAN & AREA KLASTER
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• GPS Pemantauan Real-time</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Peta Klaster Menteng Asri & Kebayoran Baru
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isAdminOrSuper
              ? 'Sebagai Admin, Anda dapat menentukan area dan titik yang perlu dipasangi pada aplikasi seluruh anggota.'
              : 'Pantau posisi kejadian darurat SOS dan rute pergerakan Satpam di sekitar lingkungan Anda.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrSuper && (
            <button
              onClick={() => setIsAdminManageMode(!isAdminManageMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                isAdminManageMode
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAdminManageMode ? 'Tutup Mode Admin Peta' : 'Kelola Area Peta (Admin)'}</span>
            </button>
          )}

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Semua Titik Area
          </button>

          <button
            onClick={() => setFilterType('ACTIVE_ONLY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterType === 'ACTIVE_ONLY'
                ? 'bg-red-600 text-white'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Kejadian Aktif ({activeIncidents.length})</span>
          </button>
        </div>
      </div>

      {/* MODE KELOLA AREA PETA OLEH ADMIN */}
      {isAdminManageMode && isAdminOrSuper && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 p-6 rounded-3xl border border-purple-500/40 shadow-xl space-y-4 text-white animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">
                  HAK AKSES ADMIN KLASTER
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Tentukan Area & Titik Pantau pada Aplikasi Seluruh Anggota
                </h3>
              </div>
            </div>
            <span className="text-xs text-purple-200 hidden sm:inline">
              Total Area Saat Ini: <strong>{mapAreas.length} Titik</strong>
            </span>
          </div>

          <form onSubmit={handleAddAreaSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Nama Blok / Titik <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={newBlockName}
                onChange={(e) => setNewBlockName(e.target.value)}
                placeholder="Contoh: Blok D-01"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Keterangan
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Penghuni / Keterangan"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Tipe Area
              </label>
              <select
                value={newType}
                onChange={(e) =>
                  setNewType(e.target.value as 'RUMAH' | 'POS_SATPAM' | 'CCTV' | 'TAMAN')
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              >
                <option value="RUMAH">Rumah Warga</option>
                <option value="POS_SATPAM">Pos Satpam</option>
                <option value="CCTV">Titik CCTV</option>
                <option value="TAMAN">Fasilitas Umum</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Posisi Horizontal & Vertikal (%)
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="5"
                  max="95"
                  value={newX}
                  onChange={(e) => setNewX(Number(e.target.value))}
                  className="w-1/2 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white text-center font-bold"
                  placeholder="X"
                />
                <span className="text-slate-400">:</span>
                <input
                  type="number"
                  min="5"
                  max="95"
                  value={newY}
                  onChange={(e) => setNewY(Number(e.target.value))}
                  className="w-1/2 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white text-center font-bold"
                  placeholder="Y"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambahkan Titik</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Graphical Interactive SVG Cluster Map */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-6 sm:p-8 border-2 border-slate-800 relative overflow-hidden shadow-2xl">
          {/* Legend bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Rumah Warga</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-bold">Darurat SOS</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-amber-300">Pos Satpam</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 italic">
              *Klik ikon pada peta untuk melihat keterangan dan memicu darurat SOS
            </span>
          </div>

          {/* PETA OPENSTREETMAP KLASTER */}
          <div className="my-6">
            {/* Susun marker dari area yang ditentukan Admin */}
            {(() => {
              const markers: OsmMarker[] = [];

              mapAreas.forEach((area) => {
                const incident = getHouseIncident(area.blockName);
                if (filterType === 'ACTIVE_ONLY' && !incident) return;
                const isSelected = selectedUnit?.id === area.id;
                const isPosSatpam = area.type === 'POS_SATPAM';
                const shortName = area.blockName.replace('Blok ', '');

                if (isPosSatpam) {
                  markers.push({
                    id: area.id,
                    x: area.x,
                    y: area.y,
                    iconSize: [52, 52],
                    zIndexOffset: 500,
                    tooltip: `${area.blockName} — ${area.description}`,
                    html: `<div style="width:52px;height:52px;border-radius:14px;background:#f59e0b;border:3px solid #fcd34d;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.45);">
                      <span style="font-size:20px;line-height:1">🛡️</span>
                      <span style="font-size:8px;font-weight:900;color:#1e293b;">POS</span>
                    </div>`,
                  });
                  return;
                }

                const emoji =
                  area.type === 'CCTV' ? '📹' : area.type === 'TAMAN' ? '🌳' : '🏠';
                const bg = incident
                  ? 'background:linear-gradient(135deg,#dc2626,#be123c);border:3px solid #fff;'
                  : isSelected
                  ? 'background:#1e293b;border:3px solid #f87171;'
                  : 'background:rgba(15,23,42,.92);border:2px solid #475569;';
                const pulse = incident
                  ? '<span style="position:absolute;top:-6px;right:-6px;width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid #fff;animation:wjwPulse 1s infinite;"></span>'
                  : '';

                markers.push({
                  id: area.id,
                  x: area.x,
                  y: area.y,
                  iconSize: [46, 46],
                  zIndexOffset: incident ? 800 : isSelected ? 600 : 0,
                  tooltip: `${area.blockName} — ${area.description}`,
                  html: `<div style="position:relative;width:46px;height:46px;border-radius:12px;${bg}display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.4);color:#fff;">
                    ${pulse}
                    <span style="font-size:15px;line-height:1">${incident ? '🚨' : emoji}</span>
                    <span style="font-size:8.5px;font-weight:900;">${shortName}</span>
                  </div>`,
                });
              });

              return (
                <OsmMapLazy
                  markers={markers}
                  area={geoArea}
                  height={480}
                  zoom={16}
                  onMarkerClick={(id) => {
                    const area = mapAreas.find((a) => a.id === id);
                    if (area) setSelectedUnit(area);
                  }}
                  onMapClick={
                    isAdminOrSuper
                      ? (xy) => {
                          if (isAdminManageMode) {
                            setNewX(Math.round(xy.x));
                            setNewY(Math.round(xy.y));
                          }
                          // Simpan juga sebagai kandidat pusat area peta offline
                          const [lat, lng] = xyToLatLng(xy.x, xy.y, geoArea);
                          setPendingCenter({ lat, lng });
                        }
                      : undefined
                  }
                  clickHint={
                    isAdminManageMode && isAdminOrSuper
                      ? '🖱️ Klik peta untuk mengisi posisi titik baru (form Admin di atas)'
                      : isAdminOrSuper
                      ? '🖱️ Klik peta untuk memilih pusat area peta offline (panel kanan)'
                      : '🗺️ Peta © OpenStreetMap contributors — klik ikon untuk detail'
                  }
                />
              );
            })()}

            {/* Satpam Patrol Info */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Patroli Satpam Sektor Timur Aktif</span>
              </div>
              <span className="text-[10px]">
                Data peta: © OpenStreetMap contributors
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Area / Incident Inspector */}
        <div className="lg:col-span-4 space-y-6">
          {/* PANEL PETA OFFLINE KLASTER (area ditentukan Admin, di-download semua anggota) */}
          <OfflineMapPanel
            currentUser={currentUser}
            myCluster={myCluster}
            pendingCenter={pendingCenter}
            onSaveArea={
              onSetClusterMapArea
                ? async (data) => {
                    await onSetClusterMapArea(data);
                    setPendingCenter(null);
                  }
                : undefined
            }
          />
          {selectedUnit ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    DETAIL TITIK AREA KLASTER
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {selectedUnit.blockName}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedUnit.description}</p>
                </div>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Tutup
                </button>
              </div>

              {/* Check if this unit has an active emergency */}
              {getHouseIncident(selectedUnit.blockName) ? (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/50 space-y-3">
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                    <span>DARURAT AKTIF DILAPORKAN</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {getHouseIncident(selectedUnit.blockName)?.description}
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() =>
                        onRespondToIncident(getHouseIncident(selectedUnit.blockName)!.id)
                      }
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                    >
                      Saya Meluncur ke {selectedUnit.blockName}!
                    </button>
                    <button
                      onClick={() =>
                        onResolveIncident(getHouseIncident(selectedUnit.blockName)!.id)
                      }
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Lapor Situasi Telah Aman
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>STATUS: AMAN TERKENDALI</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Titik area ini telah dipasangi dan dipantau dalam sistem WargaJagaWarga klaster.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => onSelectBlockForSOS(selectedUnit.blockName)}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Simulasikan Darurat di {selectedUnit.blockName}</span>
                </button>

                {isAdminOrSuper && onDeleteMapArea && (
                  <button
                    onClick={() => {
                      onDeleteMapArea(selectedUnit.id);
                      setSelectedUnit(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-600 dark:text-slate-400 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Titik Area dari Peta (Admin)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center py-12 space-y-3">
              <Navigation className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Pilih Titik Area pada Peta
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Klik ikon pada Peta Klaster sebelah kiri untuk melihat keterangan penghuni atau memicu alarm uji coba.
              </p>
            </div>
          )}

          {/* Active Responders Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Satpam & Tim Siaga Sektor
              </h4>
              <span className="text-xs font-bold text-emerald-500">
                {satpamUnits.length} Satpam Aktif
              </span>
            </div>

            <div className="space-y-3">
              {satpamUnits.slice(0, 3).map((sat) => (
                <div
                  key={sat.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={sat.avatar}
                      alt={sat.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{sat.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{sat.block}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    {sat.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
