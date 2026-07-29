'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  UserPlus,
  Search,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { User, SatpamStatus, WargaStatus, UserRole, ApprovalStatus, AppLanguage } from '@/types';

interface DirectoryTabProps {
  users: User[];
  currentUser: User | null;
  onUpdateUserStatus: (userId: string, status: SatpamStatus | WargaStatus) => void;
  onApproveUser: (userId: string, approvalStatus: ApprovalStatus, assignedRole?: UserRole) => void;
  onAddUser: (data: {
    name: string;
    email: string;
    role: 'WARGA' | 'SATPAM' | 'ADMIN';
    block: string;
    phone: string;
    bio: string;
    language: AppLanguage;
  }) => void;
}

export const DirectoryTab: React.FC<DirectoryTabProps> = ({
  users,
  currentUser,
  onUpdateUserStatus,
  onApproveUser,
  onAddUser,
}) => {
  const [filterRole, setFilterRole] = useState<'SEMUA' | 'SATPAM' | 'WARGA' | 'ADMIN'>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Anggota Baru State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'WARGA' | 'SATPAM' | 'ADMIN'>('WARGA');
  const [block, setBlock] = useState('Blok B-08');
  const [phone, setPhone] = useState('0812-3456-7899');
  const [bio, setBio] = useState('Anggota klaster Menteng Asri');
  const [language, setLanguage] = useState<AppLanguage>('id');

  // Role assigned per pending user
  const [assignedRoles, setAssignedRoles] = useState<{ [key: string]: UserRole }>({});

  const isAdminOrSuper =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPERADMIN' ||
    currentUser?.email === 'tarafk1972@gmail.com';

  const isSuperAdmin =
    currentUser?.role === 'SUPERADMIN' || currentUser?.email === 'tarafk1972@gmail.com';

  // Pending approval queue
  const pendingUsers = users.filter((u) => u.approvalStatus === 'MENUNGGU');

  // Approved active users
  const approvedUsers = users.filter((u) => u.approvalStatus === 'DISETUJUI');

  const filteredUsers = approvedUsers.filter((u) => {
    if (filterRole === 'SATPAM' && u.role !== 'SATPAM') return false;
    if (filterRole === 'WARGA' && u.role !== 'WARGA') return false;
    if (filterRole === 'ADMIN' && u.role !== 'ADMIN' && u.role !== 'SUPERADMIN') return false;
    if (
      searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.block.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const satpamCount = approvedUsers.filter((u) => u.role === 'SATPAM').length;
  const wargaCount = approvedUsers.filter((u) => u.role === 'WARGA').length;
  const adminCount = approvedUsers.filter((u) => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({ name, email, role, block, phone, bio, language });
    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  const satpamStatusList: { id: SatpamStatus; label: string; color: string }[] = [
    { id: 'SIAGA_DI_POS', label: 'Siaga di Pos', color: 'bg-emerald-500/20 text-emerald-500' },
    { id: 'PATROLI', label: 'Patroli Keliling', color: 'bg-indigo-500/20 text-indigo-500' },
    { id: 'MERESPONS', label: 'Merespons Darurat', color: 'bg-red-500/20 text-red-500 font-bold' },
    { id: 'ISTIRAHAT', label: 'Istirahat / Shift', color: 'bg-slate-500/20 text-slate-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Direktori */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            DIREKTORI KOMUNITAS KLASTER
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Daftar Satpam, Warga, & Admin Siaga
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {satpamCount} Satpam Aktif, {wargaCount} Warga Terdaftar, dan {adminCount} Admin yang saling terhubung
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftarkan Anggota Baru</span>
          </button>
        </div>
      </div>

      {/* SUPERADMIN CS: PANEL PENGAWASAN ADMIN KLASTER */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/40 shadow-xl space-y-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded">
                  HAK AKSES SUPERADMIN & LAYANAN CS
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Pengawasan Seluruh Admin Klaster & Layanan Pelanggan (CS)
                </h3>
              </div>
            </div>
            <span className="text-xs text-indigo-200 hidden sm:inline">
              Akun Resmi: <strong>tarafk1972@gmail.com</strong>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sebagai Superadmin yang mengawasi admin, Anda memiliki kendali penuh atas seluruh klaster terdaftar, memverifikasi admin komunitas, serta melayani pertanyaan bantuan sebagai Customer Service (CS).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Admin Klaster Terverifikasi</p>
              <p className="text-lg font-black text-emerald-400 mt-1">{adminCount} Admin Aktif</p>
              <p className="text-[10px] text-slate-400">Bertanggung jawab di klaster masing-masing</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Menunggu Persetujuan</p>
              <p className="text-lg font-black text-amber-400 mt-1">{pendingUsers.length} Permohonan</p>
              <p className="text-[10px] text-slate-400">Siap disetujui / ditolak oleh Admin atau Superadmin</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Layanan Customer Service</p>
              <p className="text-lg font-black text-indigo-300 mt-1">Siaga 24/7</p>
              <p className="text-[10px] text-slate-400">Memeriksa pesan kontak & kendala warga</p>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN & SUPERADMIN: DAFTAR PERSETUJUAN ANGGOTA BARU (ACCEPT / REJECT) */}
      {isAdminOrSuper && pendingUsers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-500/50 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Permohonan Persetujuan Anggota Baru ({pendingUsers.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sebagai Admin, Anda dapat menyetujui (Accept) atau menolak (Reject) anggota ini dan menentukan perannya sebagai Warga, Satpam, atau Admin.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingUsers.map((p) => {
              const currentAssignedRole = assignedRoles[p.id] || p.role || 'WARGA';
              return (
                <div
                  key={p.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-500"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {p.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500">
                          MENUNGGU PERSETUJUAN
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {p.block} • {p.email || 'Email belum tercantum'} • {p.phone}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">
                        &ldquo;{p.bio}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Penentuan Peran (Warga, Satpam, atau Admin) & Tombol Terima / Tolak */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Tetapkan Peran:
                      </span>
                      <select
                        value={currentAssignedRole}
                        onChange={(e) =>
                          setAssignedRoles((prev) => ({
                            ...prev,
                            [p.id]: e.target.value as UserRole,
                          }))
                        }
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="WARGA">Warga Klaster</option>
                        <option value="SATPAM">Satpam / Keamanan</option>
                        <option value="ADMIN">Admin Klaster (Pengelola)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => onApproveUser(p.id, 'DISETUJUI', currentAssignedRole)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setujui (Accept)</span>
                    </button>

                    <button
                      onClick={() => onApproveUser(p.id, 'DITOLAK')}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-xs font-bold flex items-center space-x-1 border border-red-500/30 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak (Reject)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau blok rumah..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          {(['SEMUA', 'SATPAM', 'WARGA', 'ADMIN'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterRole(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterRole === tab
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'SEMUA'
                ? 'Semua Anggota'
                : tab === 'SATPAM'
                ? 'Satpam Keamanan'
                : tab === 'WARGA'
                ? 'Warga Klaster'
                : 'Admin & Superadmin'}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid - Only DISETUJUI members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((u) => {
          const isSatpam = u.role === 'SATPAM';
          const isSuper = u.role === 'SUPERADMIN';
          const isAdminRole = u.role === 'ADMIN' || isSuper;

          return (
            <div
              key={u.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-5 ${
                isSatpam
                  ? 'border-amber-500/40 shadow-sm hover:shadow-md'
                  : isSuper
                  ? 'border-indigo-500/60 shadow-md ring-1 ring-indigo-500/20'
                  : isAdminRole
                  ? 'border-purple-500/40 shadow-sm hover:shadow-md'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="relative">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        u.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {u.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {u.block} • {u.cluster}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isSatpam
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : isSuper
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : isAdminRole
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  }`}
                >
                  {u.role}
                </span>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {u.email && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                    ✉️ {u.email}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{u.bio}&rdquo;
                </p>
              </div>

              {/* Satpam Status Switcher */}
              {isSatpam && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">
                      Status Tugas Saat Ini:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {satpamStatusList.map((st) => {
                      const isActive = u.status === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => onUpdateUserStatus(u.id, st.id)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                            isActive
                              ? `${st.color} border border-current shadow-sm`
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {u.phone}
                </span>

                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${u.phone}`}
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                    title="Telepon Darurat"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/62${u.phone.replace(/[^0-9]/g, '').slice(1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors"
                    title="Chat WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Pendaftaran Anggota Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg">Pendaftaran Anggota Komunitas</h3>
                <p className="text-xs text-slate-400">
                  Warga pertama di klaster otomatis menjadi Admin dan berhak menyetujui anggota lain.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Hartono"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Email (Ketik tarafk1972@gmail.com untuk Superadmin CS)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Peran (Role) yang Diajukan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('WARGA')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      role === 'WARGA'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Warga
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('SATPAM')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      role === 'SATPAM'
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Satpam
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      role === 'ADMIN'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Admin Klaster
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Blok / Posisi Rumah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="Contoh: Blok B-08 atau Pos Gerbang"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 0812-9988-7766"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Keterangan Singkat (Bio)
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Contoh: Warga baru blok atau Satpam Patroli"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* PILIH BAHASA APLIKASI (Indonesia default, opsi bahasa lain saat registrasi) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Pilih Bahasa Aplikasi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('id')}
                    className={`py-2.5 rounded-xl text-xs font-bold border ${
                      language === 'id'
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🇮🇩 Bahasa Indonesia (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2.5 rounded-xl text-xs font-bold border ${
                      language === 'en'
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Bahasa yang dipilih akan menjadi bahasa default seluruh teks aplikasi untuk akun ini.
                </p>
              </div>

              {/* INFO APLIKASI BERBAYAR & MASA PERCOBAAN 14 HARI */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  Masa Percobaan Gratis 14 Hari
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  WargaJagaWarga adalah aplikasi berbayar yang diawasi oleh Superadmin
                  (tarafk1972@gmail.com). Setiap anggota baru mendapat masa percobaan GRATIS 14 hari,
                  setelah itu pilih paket Bulanan (Rp 25.000) atau Tahunan (Rp 250.000).
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg transition-all"
                >
                  Kirim Pendaftaran — Gratis 14 Hari
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
