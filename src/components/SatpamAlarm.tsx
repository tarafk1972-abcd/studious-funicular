'use client';

// ==================================================================
// ALARM SOS UNTUK SMARTPHONE SATPAM
// - Berbunyi dengan VOLUME PALING KERAS (gain maksimum + getaran)
//   ketika ada warga menekan tombol darurat SOS.
// - Alarm BERHENTI otomatis ketika ada Satpam yang bertugas menekan
//   tombol "Saya Meluncur" (insiden mendapat responden ber-role SATPAM).
// - Satpam berstatus ISTIRAHAT (tidak bertugas) tidak dibunyikan.
// ==================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Siren, Navigation, VolumeX, Volume2 } from 'lucide-react';
import { Incident, User } from '@/types';

interface SatpamAlarmProps {
  incidents: Incident[];
  currentUser: User | null;
  onRespond: (incidentId: string) => Promise<void> | void;
}

export const SatpamAlarm: React.FC<SatpamAlarmProps> = ({ incidents, currentUser, onRespond }) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null>(null);
  const vibrateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [needSoundPermission, setNeedSoundPermission] = useState(false);
  const [responding, setResponding] = useState(false);

  // Satpam yang BERTUGAS = role SATPAM dan tidak sedang ISTIRAHAT
  const isOnDutySatpam =
    currentUser?.role === 'SATPAM' && currentUser?.status !== 'ISTIRAHAT';

  // Insiden yang membutuhkan alarm: belum SELESAI dan BELUM ADA responden Satpam
  const unattendedIncidents = incidents.filter(
    (i) => i.status !== 'SELESAI' && !i.responders.some((r) => r.role === 'SATPAM')
  );
  const alarmActive = isOnDutySatpam && unattendedIncidents.length > 0;
  const targetIncident = unattendedIncidents[0];

  const stopAlarm = useCallback(() => {
    if (nodesRef.current) {
      try {
        nodesRef.current.osc.stop();
        nodesRef.current.lfo.stop();
        nodesRef.current.osc.disconnect();
        nodesRef.current.lfo.disconnect();
        nodesRef.current.gain.disconnect();
      } catch {
        // sudah berhenti
      }
      nodesRef.current = null;
    }
    if (ctxRef.current) {
      try {
        ctxRef.current.close();
      } catch {
        // abaikan
      }
      ctxRef.current = null;
    }
    if (vibrateRef.current) {
      clearInterval(vibrateRef.current);
      vibrateRef.current = null;
      try {
        navigator.vibrate?.(0);
      } catch {
        // abaikan
      }
    }
  }, []);

  const startAlarm = useCallback(() => {
    if (nodesRef.current) return; // sudah berbunyi
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      ctxRef.current = ctx;

      // Sirine meraung: oscillator sawtooth + LFO menyapu frekuensi 600-1200 Hz
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 900;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 1.4; // kecepatan raungan sirine

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 300; // rentang sapuan frekuensi
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // VOLUME PALING KERAS: gain maksimum (1.0)
      const gain = ctx.createGain();
      gain.gain.value = 1.0;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      lfo.start();
      nodesRef.current = { osc, lfo, gain };

      if (ctx.state === 'suspended') {
        // Kebijakan autoplay browser: perlu satu interaksi pengguna
        setNeedSoundPermission(true);
        ctx.resume().then(() => setNeedSoundPermission(false)).catch(() => {});
      } else {
        setNeedSoundPermission(false);
      }

      // Getaran berulang (smartphone)
      try {
        navigator.vibrate?.([500, 200, 500, 200, 800]);
        vibrateRef.current = setInterval(() => {
          navigator.vibrate?.([500, 200, 500, 200, 800]);
        }, 2500);
      } catch {
        // perangkat tanpa vibrasi
      }
    } catch {
      // AudioContext tidak tersedia
    }
  }, []);

  // Aktifkan/matikan alarm mengikuti kondisi insiden
  useEffect(() => {
    if (alarmActive) {
      startAlarm();
    } else {
      stopAlarm();
      setNeedSoundPermission(false);
    }
    return () => {
      // dibersihkan saat unmount
    };
  }, [alarmActive, startAlarm, stopAlarm]);

  // Bersihkan saat komponen dilepas
  useEffect(() => stopAlarm, [stopAlarm]);

  // Satu ketukan di mana pun akan membuka izin suara (autoplay policy)
  useEffect(() => {
    if (!needSoundPermission) return;
    const unlock = () => {
      ctxRef.current?.resume().then(() => setNeedSoundPermission(false)).catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [needSoundPermission]);

  const handleRespond = async () => {
    if (!targetIncident) return;
    setResponding(true);
    // Menekan "SAYA MELUNCUR" -> responden SATPAM tercatat -> alarm berhenti
    // di SEMUA smartphone satpam (kondisi alarmActive menjadi false)
    await onRespond(targetIncident.id);
    setResponding(false);
  };

  if (!alarmActive || !targetIncident) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-red-950/95 backdrop-blur-sm animate-pulse-slow">
      {/* Kilatan latar sirine */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-600/40 via-transparent to-red-600/40 animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-950 border-4 border-red-500 rounded-3xl p-6 sm:p-8 text-center text-white shadow-[0_0_80px_rgba(239,68,68,0.8)] space-y-5">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-600 flex items-center justify-center animate-bounce shadow-xl shadow-red-500/50">
          <Siren className="w-11 h-11 text-white" />
        </div>

        <div>
          <p className="text-xs font-black tracking-[0.3em] text-red-400 uppercase">
            🚨 Alarm Darurat SOS — Volume Maksimum 🚨
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">
            {targetIncident.title}
          </h2>
          <p className="text-sm text-slate-300 mt-1.5">
            <strong className="text-white">{targetIncident.reporterName}</strong> •{' '}
            {targetIncident.block} • {targetIncident.cluster}
          </p>
          {targetIncident.description && (
            <p className="text-xs text-slate-400 mt-2 italic">
              &ldquo;{targetIncident.description}&rdquo;
            </p>
          )}
          {unattendedIncidents.length > 1 && (
            <p className="text-[11px] font-bold text-amber-400 mt-2">
              +{unattendedIncidents.length - 1} kejadian lain juga menunggu respons!
            </p>
          )}
        </div>

        {/* Izin suara (kebijakan autoplay browser) */}
        {needSoundPermission ? (
          <button
            onClick={() => ctxRef.current?.resume().then(() => setNeedSoundPermission(false))}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition-all"
          >
            <Volume2 className="w-5 h-5" />
            <span>KETUK UNTUK MEMBUNYIKAN SIRINE</span>
          </button>
        ) : (
          <p className="text-[11px] text-red-300 font-bold flex items-center justify-center space-x-1.5">
            <VolumeX className="w-3.5 h-3.5 animate-pulse" />
            <span>Sirine berbunyi di seluruh HP Satpam yang bertugas...</span>
          </p>
        )}

        {/* TOMBOL SAYA MELUNCUR -> MENGHENTIKAN ALARM */}
        <button
          onClick={handleRespond}
          disabled={responding}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xl uppercase tracking-wider shadow-xl shadow-emerald-500/40 flex items-center justify-center space-x-3 transition-all transform active:scale-95 disabled:opacity-60"
        >
          <Navigation className="w-7 h-7" />
          <span>{responding ? 'MENGIRIM...' : '🏃 SAYA MELUNCUR!'}</span>
        </button>

        <p className="text-[10px] text-slate-500">
          Alarm berhenti otomatis di semua HP Satpam begitu salah satu petugas menekan
          &ldquo;Saya Meluncur&rdquo;. Satpam berstatus Istirahat tidak menerima alarm.
        </p>
      </div>
    </div>
  );
};
