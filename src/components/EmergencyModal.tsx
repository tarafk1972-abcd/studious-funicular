'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, Flame, HeartPulse, Zap, MapPin } from 'lucide-react';
import { EmergencyType, User } from '@/types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSubmit: (data: {
    type: EmergencyType;
    title: string;
    description: string;
    block: string;
  }) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
}) => {
  const [selectedType, setSelectedType] = useState<EmergencyType>('KEAMANAN');
  const [title, setTitle] = useState('Suara Mencurigakan / Potensi Bahaya');
  const [description, setDescription] = useState('Mohon bantuan segera di lokasi saya, terdeteksi aktivitas yang mencurigakan.');
  const [block, setBlock] = useState(currentUser?.block || 'Blok C-12');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const emergencyTypes = [
    {
      id: 'KEAMANAN' as EmergencyType,
      label: 'Darurat Keamanan',
      icon: ShieldAlert,
      color: 'bg-red-600 border-red-500 text-white',
      defaultTitle: 'Suara Mencurigakan / Potensi Bahaya',
      defaultDesc: 'Mohon bantuan segera di lokasi saya, terdeteksi aktivitas yang mencurigakan di sekitar rumah.',
    },
    {
      id: 'MEDIS' as EmergencyType,
      label: 'Darurat Medis',
      icon: HeartPulse,
      color: 'bg-rose-600 border-rose-500 text-white',
      defaultTitle: 'Bantuan Medis Darurat',
      defaultDesc: 'Ada penghuni rumah yang membutuhkan pertolongan pertama dan ambulans segera.',
    },
    {
      id: 'KEBAKARAN' as EmergencyType,
      label: 'Darurat Kebakaran',
      icon: Flame,
      color: 'bg-orange-600 border-orange-500 text-white',
      defaultTitle: 'Indikasi Kebakaran / Asap',
      defaultDesc: 'Terlihat asap tebal atau percikan api di sekitar rumah, butuh pemadam APAR & bantuan warga.',
    },
    {
      id: 'LISTRIK' as EmergencyType,
      label: 'Listrik / Utilitas',
      icon: Zap,
      color: 'bg-amber-600 border-amber-500 text-white',
      defaultTitle: 'Korsleting / Masalah Utilitas',
      defaultDesc: 'Terjadi korsleting listrik atau gangguan utilitas berbahaya di sekitar lingkungan blok.',
    },
  ];

  const handleSelectType = (type: EmergencyType) => {
    const selected = emergencyTypes.find((t) => t.id === type);
    setSelectedType(type);
    if (selected) {
      setTitle(selected.defaultTitle);
      setDescription(selected.defaultDesc);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        type: selectedType,
        title,
        description,
        block,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-6 py-4 flex items-center justify-between border-b border-red-500/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-950/60 rounded-xl border border-red-400/40">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Aktifkan Tombol Darurat SOS
              </h3>
              <p className="text-xs text-red-100">
                Satu sentuhan, Satpam dan seluruh tetangga blok akan dinotifikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-red-950/40 text-red-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
          {/* Emergency Type Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              1. Pilih Jenis Darurat
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {emergencyTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectType(item.id)}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? `${item.color} shadow-lg scale-[1.02] ring-2 ring-white/30`
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Block */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              2. Lokasi Kejadian / Blok Rumah
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 font-semibold"
                placeholder="Contoh: Blok C-12"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              3. Judul / Keterangan Singkat
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              placeholder="Apa yang terjadi?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              4. Detail Kejadian & Bantuan yang Dibutuhkan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              placeholder="Tambahkan keterangan untuk Satpam dan tetangga..."
            />
          </div>

          {/* Submit SOS Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-red-600/40 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span>{isSubmitting ? 'MENGIRIM SINYAL DARURAT...' : 'KIRIM SINYAL DARURAT SEKARANG'}</span>
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Sesuai ketentuan WargaJagaWarga, notifikasi akan langsung terkirim ke Satpam & seluruh Warga Klaster.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
