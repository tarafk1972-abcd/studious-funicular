'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, X, Radio, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({ isOpen, onClose }) => {
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const resolvedAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAlert, setPlayingAlert] = useState(false);
  const [playingResolved, setPlayingResolved] = useState(false);

  if (!isOpen) return null;

  const toggleAlertAudio = () => {
    if (!alertAudioRef.current) return;
    if (playingAlert) {
      alertAudioRef.current.pause();
      setPlayingAlert(false);
    } else {
      if (resolvedAudioRef.current) {
        resolvedAudioRef.current.pause();
        setPlayingResolved(false);
      }
      alertAudioRef.current.currentTime = 0;
      alertAudioRef.current.play();
      setPlayingAlert(true);
    }
  };

  const toggleResolvedAudio = () => {
    if (!resolvedAudioRef.current) return;
    if (playingResolved) {
      resolvedAudioRef.current.pause();
      setPlayingResolved(false);
    } else {
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        setPlayingAlert(false);
      }
      resolvedAudioRef.current.currentTime = 0;
      resolvedAudioRef.current.play();
      setPlayingResolved(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-2.5">
            <Radio className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-base text-white">Siaran Audio WargaJagaWarga</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-700 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio elements */}
        <audio
          ref={alertAudioRef}
          src="/audio/sos-alert.mp3"
          onEnded={() => setPlayingAlert(false)}
        />
        <audio
          ref={resolvedAudioRef}
          src="/audio/sos-resolved.mp3"
          onEnded={() => setPlayingResolved(false)}
        />

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Sistem peringatan suara otomatis ini disiarkan melalui aplikasi ke seluruh Satpam dan warga klaster ketika ada kondisi darurat atau saat kondisi telah dinyatakan aman.
          </p>

          {/* SOS Alert Broadcast */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-red-600 text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Siaran Darurat SOS</h4>
                <p className="text-xs text-red-300">Pengumuman saat tombol darurat ditekan</p>
              </div>
            </div>
            <button
              onClick={toggleAlertAudio}
              className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all"
            >
              {playingAlert ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>

          {/* Resolved Broadcast */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-emerald-600 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Siaran Situasi Aman</h4>
                <p className="text-xs text-emerald-300">Pengumuman saat kondisi telah terkendali</p>
              </div>
            </div>
            <button
              onClick={toggleResolvedAudio}
              className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
            >
              {playingResolved ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Tutup Windows Audio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
