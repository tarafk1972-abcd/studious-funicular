'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Clock,
  Crown,
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  PauseCircle,
  PlayCircle,
  CalendarPlus,
  Eye,
} from 'lucide-react';
import { User, Subscription, SubscriptionPlan } from '@/types';
import { useLanguage } from '@/lib/i18n';

const HARGA_BULANAN = 25000;
const HARGA_TAHUNAN = 250000;

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function formatTanggal(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Hitung status langganan efektif di sisi klien
export function effectiveSub(sub?: Subscription): Subscription {
  const fallback: Subscription = {
    plan: 'TRIAL',
    status: 'TRIAL',
    trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
  };
  const s = sub || fallback;
  if (s.status === 'DITANGGUHKAN') return s;
  const now = Date.now();
  if (s.status === 'AKTIF' && s.paidUntil && new Date(s.paidUntil).getTime() < now) {
    return { ...s, status: 'KEDALUWARSA' };
  }
  if (s.status === 'TRIAL' && new Date(s.trialEndsAt).getTime() < now) {
    return { ...s, status: 'KEDALUWARSA' };
  }
  return s;
}

export function trialDaysLeft(sub?: Subscription): number {
  if (!sub) return 0;
  const ms = new Date(sub.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

interface SubscriptionTabProps {
  users: User[];
  currentUser: User | null;
  onPay: (userId: string, plan: SubscriptionPlan) => Promise<void>;
  onManage: (userId: string, action: 'EXTEND_TRIAL' | 'SUSPEND' | 'ACTIVATE') => Promise<void>;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  users,
  currentUser,
  onPay,
  onManage,
}) => {
  const { t } = useLanguage();
  const [paying, setPaying] = useState<SubscriptionPlan | null>(null);
  const [managing, setManaging] = useState<string | null>(null);

  const isSuperAdmin =
    currentUser?.role === 'SUPERADMIN' || currentUser?.email === 'tarafk1972@gmail.com';

  const sub = currentUser ? effectiveSub(currentUser.subscription) : null;
  const daysLeft = currentUser?.subscription ? trialDaysLeft(currentUser.subscription) : 0;

  const handlePay = async (plan: SubscriptionPlan) => {
    if (!currentUser) return;
    setPaying(plan);
    await onPay(currentUser.id, plan);
    setPaying(null);
  };

  const handleManage = async (userId: string, action: 'EXTEND_TRIAL' | 'SUSPEND' | 'ACTIVATE') => {
    setManaging(userId + action);
    await onManage(userId, action);
    setManaging(null);
  };

  const statusBadge = (s: Subscription) => {
    const eff = effectiveSub(s);
    if (eff.plan === 'GRATIS_SELAMANYA') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          {t('sub.freeForever')}
        </span>
      );
    }
    const map: Record<string, string> = {
      TRIAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      AKTIF: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      KEDALUWARSA: 'bg-red-500/20 text-red-400 border-red-500/30',
      DITANGGUHKAN: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${map[eff.status]}`}>
        {t(`sub.status.${eff.status}`)}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          APLIKASI BERBAYAR • DIAWASI SUPERADMIN
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center space-x-2">
          <CreditCard className="w-7 h-7 text-emerald-500" />
          <span>{t('sub.title')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t('sub.subtitle')}</p>
      </div>

      {/* Status Langganan Saya */}
      {currentUser && sub && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
                Status Langganan Saya
              </h3>
              {statusBadge(currentUser.subscription || sub)}
            </div>

            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-600"
              />
              <div>
                <p className="font-bold text-sm">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.cluster}</p>
              </div>
            </div>

            {sub.plan === 'GRATIS_SELAMANYA' ? (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-sm">
                  <Crown className="w-4 h-4" />
                  <span>Superadmin & Customer Service</span>
                </div>
                <p className="text-xs text-slate-300">{t('sub.superadminDesc')}</p>
              </div>
            ) : sub.status === 'TRIAL' ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{t('sub.trialActive')}</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {t('sub.trialDaysLeft', { days: daysLeft })}
                </p>
                <p className="text-xs text-slate-300">
                  {t('sub.trialEndsAt')}: {formatTanggal(sub.trialEndsAt)}
                </p>
              </div>
            ) : sub.status === 'AKTIF' ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                  <BadgeCheck className="w-4 h-4" />
                  <span>{t('sub.active')}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {sub.plan === 'BULANAN' ? t('sub.monthly') : t('sub.yearly')} •{' '}
                  {t('sub.paidUntil')}: {formatTanggal(sub.paidUntil)}
                </p>
                {sub.lastPaymentAmount && (
                  <p className="text-xs text-slate-400">
                    Pembayaran terakhir: {formatRupiah(sub.lastPaymentAmount)} (
                    {formatTanggal(sub.lastPaymentAt)})
                  </p>
                )}
              </div>
            ) : sub.status === 'DITANGGUHKAN' ? (
              <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
                  <PauseCircle className="w-4 h-4" />
                  <span>{t('sub.status.DITANGGUHKAN')}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {sub.note || 'Hubungi Customer Service (tarafk1972@gmail.com) untuk aktivasi kembali.'}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-red-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t('sub.status.KEDALUWARSA')}</span>
                </div>
                <p className="text-xs text-slate-300">{t('sub.expired')}</p>
              </div>
            )}
          </div>

          {/* Paket Langganan */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>{t('sub.choosePlan')}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bulanan */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {t('sub.monthly')}
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatRupiah(HARGA_BULANAN)}
                  <span className="text-sm font-medium text-slate-500"> {t('sub.perMonth')}</span>
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tombol SOS darurat tanpa batas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Peta klaster langsung & notifikasi</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dukungan Customer Service Superadmin</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePay('BULANAN')}
                  disabled={paying !== null || sub.plan === 'GRATIS_SELAMANYA'}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  {paying === 'BULANAN' ? '...' : t('sub.payNow')}
                </button>
              </div>

              {/* Tahunan */}
              <div className="bg-gradient-to-b from-emerald-950 to-slate-900 text-white rounded-2xl border-2 border-emerald-500/50 p-6 space-y-4 shadow-xl relative overflow-hidden">
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  HEMAT 2 BULAN
                </span>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  {t('sub.yearly')}
                </p>
                <p className="text-3xl font-black">
                  {formatRupiah(HARGA_TAHUNAN)}
                  <span className="text-sm font-medium text-slate-300"> {t('sub.perYear')}</span>
                </p>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Semua fitur paket bulanan</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Prioritas respons Customer Service</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Laporan keamanan klaster bulanan</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePay('TAHUNAN')}
                  disabled={paying !== null || sub.plan === 'GRATIS_SELAMANYA'}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  {paying === 'TAHUNAN' ? '...' : t('sub.payNow')}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * Pembayaran dalam demo ini bersifat simulasi. Seluruh transaksi diawasi oleh Superadmin
              (tarafk1972@gmail.com) selaku pengawas platform & Customer Service.
            </p>
          </div>
        </div>
      )}

      {/* PANEL PENGAWASAN SUPERADMIN */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/40 shadow-xl space-y-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">{t('sub.superadminPanel')}</h3>
              <p className="text-xs text-slate-300">{t('sub.superadminDesc')}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  <th className="py-2 pr-4">Anggota</th>
                  <th className="py-2 pr-4">Peran</th>
                  <th className="py-2 pr-4">Status Langganan</th>
                  <th className="py-2 pr-4">Trial / Berlaku Hingga</th>
                  <th className="py-2">Aksi Pengawasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users
                  .filter((u) => u.role !== 'SUPERADMIN')
                  .map((u) => {
                    const eff = effectiveSub(u.subscription);
                    return (
                      <tr key={u.id}>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center space-x-2">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-slate-100">{u.name}</p>
                              <p className="text-[10px] text-slate-400">{u.cluster}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-300">{u.role}</td>
                        <td className="py-2.5 pr-4">{statusBadge(eff)}</td>
                        <td className="py-2.5 pr-4 text-slate-300">
                          {eff.status === 'TRIAL'
                            ? formatTanggal(eff.trialEndsAt)
                            : formatTanggal(eff.paidUntil || eff.trialEndsAt)}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleManage(u.id, 'EXTEND_TRIAL')}
                              disabled={managing !== null}
                              className="px-2 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-[10px] font-bold flex items-center space-x-1 disabled:opacity-50"
                            >
                              <CalendarPlus className="w-3 h-3" />
                              <span>{t('sub.extendTrial')}</span>
                            </button>
                            {eff.status === 'DITANGGUHKAN' ? (
                              <button
                                onClick={() => handleManage(u.id, 'ACTIVATE')}
                                disabled={managing !== null}
                                className="px-2 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center space-x-1 disabled:opacity-50"
                              >
                                <PlayCircle className="w-3 h-3" />
                                <span>{t('sub.activate')}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleManage(u.id, 'SUSPEND')}
                                disabled={managing !== null}
                                className="px-2 py-1 rounded-lg bg-slate-600/80 hover:bg-slate-500 text-white text-[10px] font-bold flex items-center space-x-1 disabled:opacity-50"
                              >
                                <PauseCircle className="w-3 h-3" />
                                <span>{t('sub.suspend')}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
