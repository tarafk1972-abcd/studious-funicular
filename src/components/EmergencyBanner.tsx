'use client';

import React from 'react';
import { MapPin, CheckCircle2, UserCheck, Siren } from 'lucide-react';
import { Incident, User } from '@/types';

interface EmergencyBannerProps {
  incidents: Incident[];
  currentUser: User | null;
  onViewMap: () => void;
  onRespond: (incidentId: string) => void;
  onResolve: (incidentId: string) => void;
  onPlayAlertAudio: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  incidents,
  currentUser,
  onViewMap,
  onRespond,
  onResolve,
  onPlayAlertAudio,
}) => {
  const activeIncidents = incidents.filter((i) => i.status !== 'SELESAI');

  if (activeIncidents.length === 0) return null;

  const incident = activeIncidents[0];
  const isResponder = currentUser && incident.responders.some((r) => r.userId === currentUser.id);

  const getEmergencyTypeLabel = (type: string) => {
    switch (type) {
      case 'KEAMANAN':
        return '🚨 DARURAT KEAMANAN';
      case 'MEDIS':
        return '🚑 DARURAT MEDIS';
      case 'KEBAKARAN':
        return '🚒 DARURAT KEBAKARAN';
      case 'LISTRIK':
        return '⚡ DARURAT UTILITY / LISTRIK';
      default:
        return '🚨 PERINGATAN DARURAT';
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white shadow-lg animate-siren-glow border-b border-red-400/40 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-950/40 text-white border border-red-400/30 shrink-0">
              <Siren className="w-6 h-6 animate-spin text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="inline-block px-2 py-0.5 text-xs font-black tracking-wide bg-yellow-400 text-red-950 rounded uppercase">
                  {getEmergencyTypeLabel(incident.type)}
                </span>
                <span className="inline-block px-2 py-0.5 text-xs font-bold bg-red-950/50 rounded border border-red-400/40">
                  {incident.block}
                </span>
                <span className="text-xs text-red-100">
                  Dilaporkan oleh <strong>{incident.reporterName}</strong>
                </span>
              </div>
              <p className="text-sm font-semibold mt-0.5 text-white">
                {incident.title}: <span className="font-normal text-red-100">{incident.description}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:shrink-0">
            <button
              onClick={onPlayAlertAudio}
              className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900/80 text-xs font-semibold border border-red-400/30 flex items-center space-x-1.5 transition-all"
            >
              <span>🔊 Siaran Suara</span>
            </button>

            <button
              onClick={onViewMap}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/30 flex items-center space-x-1.5 transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Lihat di Peta</span>
            </button>

            {currentUser && !isResponder && (
              <button
                onClick={() => onRespond(incident.id)}
                className="px-4 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-red-950 text-xs font-extrabold shadow-md flex items-center space-x-1.5 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Saya Meluncur!</span>
              </button>
            )}

            {(currentUser?.role === 'SATPAM' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN' || currentUser?.id === incident.reporterId) && (
              <button
                onClick={() => onResolve(incident.id)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold border border-emerald-400/50 flex items-center space-x-1 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lapor Aman</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
