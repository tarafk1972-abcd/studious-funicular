'use client';

// ==================================================================
// ALARM SOS UNTUK SMARTPHONE SATPAM
// - SIARAN AUDIO WargaJagaWarga (sos-alert.mp3) LANGSUNG MENYALA dan
//   diputar BERULANG-ULANG (loop) pada volume PALING KERAS di HP
//   Satpam ketika ada warga menekan tombol darurat SOS.
// - Siaran audio & alarm BERHENTI otomatis ketika ada Satpam yang
//   bertugas malam itu menekan tombol "Saya Meluncur".
// - Sirine sintetis (Web Audio API) menjadi cadangan bila file audio
//   gagal diputar. Satpam berstatus ISTIRAHAT tidak dibunyikan.
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Sirine sintetis cadangan (Web Audio API)
  const startFallbackSiren = useCallback(() => {
    if (nodesRef.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      ctxRef.current = ctx;

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 900;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 1.4;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 300;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // VOLUME PALING KERAS
      const gain = ctx.createGain();
      gain.gain.value = 1.0;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      lfo.start();
      nodesRef.current = { osc, lfo, gain };

      if (ctx.state === 'suspended') {
        setNeedSoundPermission(true);
        ctx.resume().then(() => setNeedSoundPermission(false)).catch(() => {});
      }
    } catch {
      // AudioContext tidak tersedia
    }
  }, []);

  const stopAlarm = useCallback(() => {
    // Hentikan siaran audio WargaJagaWarga
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // abaikan
      }
      audioRef.current = null;
    }
    // Hentikan sirine cadangan
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
    if (audioRef.current || nodesRef.current) return; // sudah berbunyi

    // === SIARAN AUDIO WARGAJAGAWARGA: LANGSUNG MENYALA, LOOP TERUS-MENERUS ===
    try {
      const audio = new Audio('/audio/sos-alert.mp3');
      audio.loop = true; // diputar BERULANG-ULANG sampai satpam merespons
      audio.volume = 1.0; // VOLUME PALING KERAS
      audioRef.current = audio;

      audio
        .play()
        .then(() => setNeedSoundPermission(false))
        .catch(() => {
          // Kebijakan autoplay browser: butuh satu interaksi pengguna
          setNeedSoundPermission(true);
        });

      // Bila file audio gagal dimuat, pakai sirine sintetis cadangan
      audio.onerror = () => {
        audioRef.current = null;
        startFallbackSiren();
      };
    } catch {
      startFallbackSiren();
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
  }, [startFallbackSiren]);

  // Aktifkan/matikan alarm mengikuti kondisi insiden
  useEffect(() => {
    if (alarmActive) {
      startAlarm();
    } else {
      stopAlarm();
      setNeedSoundPermission(false);
    }
  }, [alarmActive, startAlarm, stopAlarm]);

  // Bersihkan saat komponen dilepas
  useEffect(() => stopAlarm, [stopAlarm]);

  // Satu ketukan di mana pun akan membuka izin suara (autoplay policy)
  useEffect(() => {
    if (!needSoundPermission) return;
    const unlock = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setNeedSoundPermission(false))
          .catch(() => {});
      }
      ctxRef.current?.resume().then(() => setNeedSoundPermission(false)).catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [needSoundPermission]);

  const handleRespond = async () => {
    if (!targetIncident) return;
    setResponding(true);
    // Menekan "SAYA MELUNCUR" -> responden SATPAM tercatat -> siaran audio
    // & alarm berhenti di SEMUA smartphone satpam
    stopAlarm();
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
            🚨 Siaran Darurat WargaJagaWarga — Volume Maksimum 🚨
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
            onClick={() => {
              audioRef.current?.play().then(() => setNeedSoundPermission(false)).catch(() => {});
              ctxRef.current?.resume().then(() => setNeedSoundPermission(false)).catch(() => {});
            }}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition-all"
          >
            <Volume2 className="w-5 h-5" />
            <span>KETUK UNTUK MENYALAKAN SIARAN AUDIO</span>
          </button>
        ) : (
          <p className="text-[11px] text-red-300 font-bold flex items-center justify-center space-x-1.5">
            <VolumeX className="w-3.5 h-3.5 animate-pulse" />
            <span>Siaran audio WargaJagaWarga diputar berulang-ulang sampai ada yang meluncur...</span>
          </p>
        )}

        {/* TOMBOL SAYA MELUNCUR -> MENGHENTIKAN SIARAN AUDIO & ALARM */}
        <button
          onClick={handleRespond}
          disabled={responding}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xl uppercase tracking-wider shadow-xl shadow-emerald-500/40 flex items-center justify-center space-x-3 transition-all transform active:scale-95 disabled:opacity-60"
        >
          <Navigation className="w-7 h-7" />
          <span>{responding ? 'MENGIRIM...' : '🏃 SAYA MELUNCUR!'}</span>
        </button>

        <p className="text-[10px] text-slate-500">
          Siaran audio berhenti otomatis di semua HP Satpam begitu salah satu petugas yang
          bertugas malam itu menekan &ldquo;Saya Meluncur&rdquo;. Satpam berstatus Istirahat
          tidak menerima siaran.
        </p>
      </div>
    </div>
  );
};

