'use client';

import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Shield,
  CornerDownRight,
} from 'lucide-react';
import { ContactInquiry, User } from '@/types';

interface ContactTabProps {
  contacts: ContactInquiry[];
  currentUser: User | null;
  onSubmitContact: (data: {
    name: string;
    email: string;
    phone: string;
    message: string;
    inquiryType: 'Cara daftar komunitas' | 'Fitur keamanan' | 'Kerja sama' | 'Lainnya';
    communityName: string;
  }) => void;
  onUpdateContactStatus: (
    id: string,
    status: 'BARU' | 'DIPROSES' | 'SELESAI',
    csResponse?: string
  ) => void;
}

export const ContactTab: React.FC<ContactTabProps> = ({
  contacts,
  currentUser,
  onSubmitContact,
  onUpdateContactStatus,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [inquiryType, setInquiryType] = useState<'Cara daftar komunitas' | 'Fitur keamanan' | 'Kerja sama' | 'Lainnya'>('Cara daftar komunitas');
  const [communityName, setCommunityName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // CS Reply Text state per contact id
  const [csReplyText, setCsReplyText] = useState<{ [key: string]: string }>({});

  const isSuperAdminCS =
    currentUser?.role === 'SUPERADMIN' || currentUser?.email === 'tarafk1972@gmail.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitContact({
        name,
        email,
        phone,
        message,
        inquiryType,
        communityName,
      });
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setCommunityName('');
      setTimeout(() => setSubmittedSuccess(false), 5000);
    }, 400);
  };

  const handleSendCSReply = (contactId: string, status: 'BARU' | 'DIPROSES' | 'SELESAI') => {
    const reply = csReplyText[contactId];
    onUpdateContactStatus(contactId, status, reply);
    setCsReplyText((prev) => ({ ...prev, [contactId]: '' }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* HEADER SUPERADMIN CS INFO */}
      {isSuperAdminCS && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/40 shadow-xl space-y-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded">
                  HAK AKSES SUPERADMIN & CUSTOMER SERVICE
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Layanan Customer Service & Pendaftaran Klaster Resmi
                </h3>
              </div>
            </div>
            <span className="text-xs text-indigo-200 hidden sm:inline">
              Email Resmi CS: <strong>tarafk1972@gmail.com</strong>
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Anda dapat merespons pertanyaan calon komunitas dan memverifikasi permohonan pendaftaran klaster di bawah ini. Jawaban dari Customer Service langsung tercatat dalam sistem server.
          </p>
        </div>
      )}

      {/* 1. HUBUNGI KAMI FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Copy */}
        <div className="lg:col-span-5 space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-extrabold uppercase tracking-wider">
            HUBUNGI KAMI & CUSTOMER SERVICE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Ada pertanyaan tentang cara kerja wargajagawarga?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Hubungi tim Customer Service kami langsung — kami siap menjelaskan bagaimana platform ini membantu lingkungan Anda lebih aman dengan bantuan satu sentuhan.
          </p>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-medium">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                <Mail className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Email Customer Service Resmi</p>
                <p className="font-bold">tarafk1972@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-medium">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Waktu Respons Customer Service</p>
                <p className="font-bold">Siaga 24/7 (Diawasi Superadmin)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          {submittedSuccess ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Pesan & Pendaftaran Anda Telah Diterima!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Tim Customer Service WargaJagaWarga (tarafk1972@gmail.com) akan segera merespons pesan Anda. Permohonan Anda juga telah disimpan pada tabel database di bawah.
              </p>
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                Kirim Pesan Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nama */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nomor telepon */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Nomor telepon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Jenis pertanyaan Anda */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Jenis pertanyaan Anda
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) =>
                      setInquiryType(
                        e.target.value as 'Cara daftar komunitas' | 'Fitur keamanan' | 'Kerja sama' | 'Lainnya'
                      )
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="Cara daftar komunitas">Cara daftar komunitas</option>
                    <option value="Fitur keamanan">Fitur keamanan</option>
                    <option value="Kerja sama">Kerja sama</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Nama komunitas atau lingkungan Anda */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Nama komunitas atau lingkungan Anda (jika ada)
                </label>
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  placeholder="Contoh: Klaster Menteng Asri RT 04 / RW 02"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Pesan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan pertanyaan atau kebutuhan instalasi klaster Anda..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transition-all"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'Mengirim pesan...' : 'Kirim pesan ke CS'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2. ADMIN INQUIRY VIEWER & CUSTOMER SERVICE REPONSE TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              DATABASE PENDAFTARAN KOMUNITAS & LAYANAN CS
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Daftar Pesan Masuk & Calon Klaster ({contacts.length})
            </h3>
            <p className="text-xs text-slate-500">
              Semua formulir yang dikirim melalui halaman ini otomatis tersimpan dan dijawab oleh Customer Service (tarafk1972@gmail.com).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Pengirim</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Jenis & Komunitas</th>
                <th className="py-3 px-4">Pesan & Balasan CS</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Aksi CS / Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors align-top">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                    {c.name}
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                    <div>{c.email}</div>
                    <div className="text-slate-400 mt-0.5">{c.phone || '-'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-2 py-0.5 rounded font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                      {c.inquiryType}
                    </span>
                    <div className="text-slate-600 dark:text-slate-300 font-semibold mt-1">
                      {c.communityName || 'Individu / Pribadi'}
                    </div>
                  </td>
                  <td className="py-4 px-4 max-w-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                    <p>&ldquo;{c.message}&rdquo;</p>
                    {c.csResponse && (
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/30 text-indigo-700 dark:text-indigo-200 text-xs flex items-start space-x-2">
                        <CornerDownRight className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-[11px] uppercase tracking-wider text-indigo-500 dark:text-indigo-300">
                            Balasan Customer Service (WJW CS):
                          </p>
                          <p className="mt-0.5">{c.csResponse}</p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold ${
                        c.status === 'BARU'
                          ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                          : c.status === 'DIPROSES'
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 space-y-2">
                    <div className="flex items-center space-x-1">
                      {(['BARU', 'DIPROSES', 'SELESAI'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => onUpdateContactStatus(c.id, st)}
                          disabled={c.status === st}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            c.status === st
                              ? 'bg-slate-800 text-white cursor-default'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {st === 'BARU' ? 'Baru' : st === 'DIPROSES' ? 'Proses' : 'Selesai'}
                        </button>
                      ))}
                    </div>

                    {/* Form Input Balasan CS jika sedang login sebagai Superadmin / CS */}
                    {isSuperAdminCS && (
                      <div className="flex items-center space-x-1 pt-1">
                        <input
                          type="text"
                          value={csReplyText[c.id] || ''}
                          onChange={(e) =>
                            setCsReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          placeholder="Ketik balasan CS..."
                          className="w-36 px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[11px] text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleSendCSReply(c.id, 'DIPROSES')}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded"
                        >
                          Balas
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
