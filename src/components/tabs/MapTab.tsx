'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Radio,
  PlusCircle,
  Trash2,
  MapPin,
  Camera,
  Home,
  Shield,
  Layers,
} from 'lucide-react';
import { Incident, User as UserType, ClusterBlockArea } from '@/types';

interface MapTabProps {
  incidents: Incident[];
  users: UserType[];
  mapAreas?: ClusterBlockArea[];
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
}

export const MapTab: React.FC<MapTabProps> = ({
  incidents,
  users,
  mapAreas = [],
  currentUser,
  onSelectBlockForSOS,
  onRespondToIncident,
  onResolveIncident,
  onAddMapArea,
  onDeleteMapArea,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<ClusterBlockArea | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE_ONLY'>('ALL');

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

  const getAreaIcon = (type: string) => {
    switch (type) {
      case 'POS_SATPAM':
        return <Shield className="w-4 h-4 text-amber-300" />;
      case 'CCTV':
        return <Camera className="w-4 h-4 text-cyan-300" />;
      case 'TAMAN':
        return <Layers className="w-4 h-4 text-emerald-300" />;
      default:
        return <Home className="w-4 h-4 text-slate-300" />;
    }
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

          {/* Graphical Street Map SVG */}
          <div className="relative w-full h-[480px] my-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-6 overflow-hidden">
            {/* Street grid background lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Street labels */}
            <div className="absolute left-4 top-5 text-[11px] font-black tracking-widest text-slate-600 uppercase">
              JALAN MENTENG RAYA (BLOK A)
            </div>
            <div className="absolute left-4 top-36 text-[11px] font-black tracking-widest text-slate-600 uppercase">
              JALAN MENTENG ASRI (BLOK B)
            </div>
            <div className="absolute left-4 top-64 text-[11px] font-black tracking-widest text-slate-600 uppercase">
              JALAN KEBAYORAN UTAMA (BLOK C)
            </div>

            {/* Render All Monitored Areas defined by Admin */}
            {mapAreas.map((area) => {
              const incident = getHouseIncident(area.blockName);
              const isSelected = selectedUnit?.id === area.id;

              if (filterType === 'ACTIVE_ONLY' && !incident) {
                return null;
              }

              const isPosSatpam = area.type === 'POS_SATPAM';

              if (isPosSatpam) {
                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedUnit(area)}
                    style={{ left: `${area.x}%`, top: `${area.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer hover:scale-105 transition-transform border-2 border-amber-300 z-20 group"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <div>
                      <p className="leading-none">{area.blockName}</p>
                      <p className="text-[9px] font-semibold text-slate-900 mt-0.5">
                        {area.description}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedUnit(area)}
                  style={{ left: `${area.x}%`, top: `${area.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 group ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Pulsing SOS Beacon if active incident */}
                    {incident && (
                      <span className="absolute -top-3 flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-red-600 border-2 border-white flex items-center justify-center">
                          <ShieldAlert className="w-3.5 h-3.5 text-white" />
                        </span>
                      </span>
                    )}

                    {/* House Box */}
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 shadow-lg transition-all ${
                        incident
                          ? 'bg-gradient-to-br from-red-600 to-rose-700 border-white text-white animate-pulse'
                          : isSelected
                          ? 'bg-slate-800 border-red-400 text-white shadow-red-500/20'
                          : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <p className="text-[10px] font-black tracking-tight">{area.blockName.replace('Blok ', '')}</p>
                      <div className="mt-0.5">
                        {incident ? (
                          <ShieldAlert className="w-4 h-4 text-white" />
                        ) : (
                          getAreaIcon(area.type)
                        )}
                      </div>
                    </div>

                    {/* Tooltip name */}
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {area.description}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Satpam Patrol Marker */}
            <div className="absolute right-8 bottom-6 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 text-xs">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Patroli Satpam Sektor Timur Aktif</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Area / Incident Inspector */}
        <div className="lg:col-span-4 space-y-6">
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
