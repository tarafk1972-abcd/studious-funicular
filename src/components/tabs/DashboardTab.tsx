'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Users,
  MessageSquare,
  Send,
  UserCheck,
  Flame,
  HeartPulse,
  Zap,
  Radio,
  Smile,
} from 'lucide-react';
import { Incident, User, EmergencyType, IncidentStatus } from '@/types';

interface DashboardTabProps {
  incidents: Incident[];
  currentUser: User | null;
  onOpenSOSModal: () => void;
  onRespondToIncident: (incidentId: string) => void;
  onResolveIncident: (incidentId: string) => void;
  onAddComment: (incidentId: string, text: string) => void;
  onSwitchTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  incidents,
  currentUser,
  onOpenSOSModal,
  onRespondToIncident,
  onResolveIncident,
  onAddComment,
  onSwitchTab,
}) => {
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<'SEMUA' | 'AKTIF' | 'SELESAI'>('SEMUA');

  const filteredIncidents = incidents.filter((i) => {
    if (filter === 'AKTIF') return i.status !== 'SELESAI';
    if (filter === 'SELESAI') return i.status === 'SELESAI';
    return true;
  });

  const activeIncidents = incidents.filter((i) => i.status !== 'SELESAI');

  const getEmergencyIcon = (type: EmergencyType) => {
    switch (type) {
      case 'KEAMANAN':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'MEDIS':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'KEBAKARAN':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'LISTRIK':
        return <Zap className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'MENUNGGU':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span>MENUNGGU RESPONS</span>
          </span>
        );
      case 'MERESPONS':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>SEDANG DITANGANI</span>
          </span>
        );
      case 'SELESAI':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>SITUASI AMAN</span>
          </span>
        );
    }
  };

  const handleCommentSubmit = (incidentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const txt = commentText[incidentId];
    if (!txt || !txt.trim()) return;
    onAddComment(incidentId, txt.trim());
    setCommentText((prev) => ({ ...prev, [incidentId]: '' }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SAPAAN HANGAT SETELAH HP TERDAFTAR DAN DISETUJUI ADMIN */}
      {currentUser && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                ANGGOTA DISETUJUI • {currentUser.cluster}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white mt-1">
                Apa kabar hari ini, {currentUser.name}?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                HP terdaftar di <strong>{currentUser.block}</strong> • Peran Anda:{' '}
                <strong className="text-rose-400">{currentUser.role}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 border border-slate-700">
              ⚡ Status WargaJagaWarga: <strong>Aktif Siaga</strong>
            </span>
          </div>
        </div>
      )}

      {/* Top Banner / Giant Emergency SOS Trigger & Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Giant SOS Button Panel */}
        <div className="lg:col-span-7 bg-gradient-to-br from-red-600 via-red-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between border border-red-400/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-red-950/60 text-yellow-300 text-xs font-black uppercase tracking-wider border border-yellow-300/30">
                Peringatan Satu Sentuhan • SOS WargaJagaWarga
              </span>
              {currentUser && (
                <span className="text-xs text-red-100 font-medium">
                  Lokasi Anda: <strong>{currentUser.block}</strong>
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Tekan Satu Tombol, Satpam dan Tetanggamu Datang.
            </h2>
            <p className="text-sm text-red-100 leading-relaxed max-w-xl">
              Saat terjadi keadaan darurat keamanan, medis, kebakaran, atau korsleting, langsung tekan tombol di bawah. Sinyal dikirim beserta koordinat blok Anda.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={onOpenSOSModal}
              className="w-full py-5 px-6 rounded-2xl bg-white text-red-950 font-black text-lg sm:text-xl uppercase tracking-wider shadow-2xl hover:bg-slate-100 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] ring-4 ring-yellow-300/40"
            >
              <div className="p-2 rounded-full bg-red-600 text-white animate-pulse">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <span>TEKAN DARURAT SOS SEKARANG</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Actions & Live Status */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <Radio className="w-5 h-5 text-red-500" />
                <span>Status Lingkungan Klaster</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Aman Terkendali
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSwitchTab('map')}
                className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all text-left group"
              >
                <MapPin className="w-5 h-5 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Peta Klaster</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Lihat 3 Blok & Pos Satpam</p>
              </button>

              <button
                onClick={() => onSwitchTab('directory')}
                className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all text-left group"
              >
                <Users className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">12 Satpam Siaga</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Lihat kontak & status</p>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Kejadian Aktif Hari Ini:</span>
              <span className="font-bold text-red-500">{activeIncidents.length} Kejadian</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl border border-slate-700 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Pengingat Keamanan Klaster</h4>
              <p className="text-xs text-slate-400">
                Pastikan lampu teras menyala setelah pukul 18:00 WIB.
              </p>
            </div>
            <button
              onClick={() => onSwitchTab('stats')}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold transition-colors shrink-0"
            >
              Lihat Statistik
            </button>
          </div>
        </div>
      </div>

      {/* Incident Feed & Laporan Langsung */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Laporan & Siaran Darurat Terkini
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Riwayat dan situasi kejadian secara real-time dari seluruh warga & satpam
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {(['SEMUA', 'AKTIF', 'SELESAI'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === tab
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'SEMUA' ? 'Semua Kejadian' : tab === 'AKTIF' ? 'Sedang Aktif' : 'Selesai'}
              </button>
            ))}
          </div>
        </div>

        {/* Incident List */}
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
            <h4 className="font-bold text-slate-900 dark:text-white text-lg">
              Belum ada kejadian dengan filter tersebut
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Seluruh lingkungan dalam keadaan aman terkendali.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredIncidents.map((incident) => {
              const isResponder =
                currentUser && incident.responders.some((r) => r.userId === currentUser.id);

              return (
                <div
                  key={incident.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden ${
                    incident.status !== 'SELESAI'
                      ? 'border-red-500/60 shadow-lg ring-1 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {/* Incident Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          {getEmergencyIcon(incident.type)}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white">
                            {incident.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {incident.block}
                            </span>
                            <span>•</span>
                            <span>Dilaporkan oleh {incident.reporterName}</span>
                            <span>•</span>
                            <span>
                              {new Date(incident.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              WIB
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusBadge(incident.status)}
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {incident.description}
                    </p>

                    {/* Responders bar */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Responden di Lokasi ({incident.responders.length}):
                        </span>
                        {incident.responders.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">
                            Belum ada responden
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {incident.responders.map((r) => (
                              <span
                                key={r.userId}
                                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                              >
                                <span>{r.name}</span>
                                <span className="text-[10px] text-slate-400">({r.role})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Respond / Resolve Buttons */}
                      {incident.status !== 'SELESAI' && (
                        <div className="flex items-center space-x-2">
                          {currentUser && !isResponder && (
                            <button
                              onClick={() => onRespondToIncident(incident.id)}
                              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Saya Meluncur!</span>
                            </button>
                          )}

                          {(currentUser?.role === 'SATPAM' ||
                            currentUser?.role === 'ADMIN' ||
                            currentUser?.role === 'SUPERADMIN' ||
                            currentUser?.id === incident.reporterId) && (
                            <button
                              onClick={() => onResolveIncident(incident.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Nyatakan Situasi Aman</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Thread */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Kabar / Pemutakhiran Situasi ({incident.comments.length})</span>
                    </h5>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {incident.comments.map((com) => (
                        <div
                          key={com.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {com.userName}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  com.userRole === 'SUPERADMIN'
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-extrabold'
                                    : com.userRole === 'SATPAM'
                                    ? 'bg-amber-500/20 text-amber-500'
                                    : com.userRole === 'ADMIN'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-emerald-500/20 text-emerald-500'
                                }`}
                              >
                                {com.userRole}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(com.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{com.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Input */}
                    {incident.status !== 'SELESAI' && currentUser && (
                      <form
                        onSubmit={(e) => handleCommentSubmit(incident.id, e)}
                        className="flex items-center space-x-2 pt-2"
                      >
                        <input
                          type="text"
                          value={commentText[incident.id] || ''}
                          onChange={(e) =>
                            setCommentText((prev) => ({ ...prev, [incident.id]: e.target.value }))
                          }
                          placeholder="Ketik update situasi untuk Satpam & warga lain..."
                          className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 flex items-center space-x-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
