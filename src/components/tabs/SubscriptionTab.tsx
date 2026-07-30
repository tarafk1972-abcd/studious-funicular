'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  PauseCircle,
  PlayCircle,
  CalendarPlus,
  Eye,
  KeyRound,
  Copy,
  BadgeDollarSign,
} from 'lucide-react';
import { User, Cluster, ClusterBilling, BillingPlan } from '@/types';
import { useLanguage } from '@/lib/i18n';

const HARGA_BULANAN = 150000;
const HARGA_TAHUNAN = 1500000;

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

// Hitung status billing efektif di sisi klien
export function effectiveBillingClient(b: ClusterBilling): ClusterBilling {
  if (b.status === 'DITANGGUHKAN') return b;
  if (b.plan === 'GRATIS_SELAMANYA') return { ...b, status: 'AKTIF' };
  const now = Date.now();
  if (b.status === 'AKTIF' && b.paidUntil && new Date(b.paidUntil).getTime() < now) {
    return { ...b, status: 'KEDALUWARSA' };
  }
  if (b.status === 'TRIAL' && new Date(b.trialEndsAt).getTime() < now) {
    return { ...b, status: 'KEDALUWARSA' };
  }
  return b;
}

export function trialDaysLeftClient(b: ClusterBilling): number {
  const ms = new Date(b.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

interface SubscriptionTabProps {
  clusters: Cluster[];
  currentUser: User | null;
  onPay: (clusterId: string, plan: BillingPlan) => Promise<void>;
  onManage: (
    clusterId: string,
    action: 'EXTEND_TRIAL' | 'SUSPEND' | 'ACTIVATE' | 'MARK_PAID' | 'SET_AMOUNT',
    payload?: { amount?: number }
  ) => Promise<void>;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  clusters,
  currentUser,
  onPay,
  onManage,
}) => {
  const { t } = useLanguage();
  const [paying, setPaying] = useState<BillingPlan | null>(null);
  const [managing, setManaging] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editAmount, setEditAmount] = useState<{ [id: string]: string }>({});

  const isSuperAdmin =
    currentUser?.role === 'SUPERADMIN' || currentUser?.email === 'tarafk1972@gmail.com';
  const isAdmin = currentUser?.role === 'ADMIN' || isSuperAdmin;

  // Klaster milik pengguna aktif
  const myCluster = currentUser
    ? clusters.find((c) => c.name.toLowerCase() === currentUser.cluster.toLowerCase())
    : undefined;
  const myBilling = myCluster ? effectiveBillingClient(myCluster.billing) : null;
  const daysLeft = myCluster ? trialDaysLeftClient(myCluster.billing) : 0;

  const handlePay = async (plan: BillingPlan) => {
    if (!myCluster) return;
    setPaying(plan);
    await onPay(myCluster.id, plan);
    setPaying(null);
  };

  const handleManage = async (
    clusterId: string,
    action: 'EXTEND_TRIAL' | 'SUSPEND' | 'ACTIVATE' | 'MARK_PAID' | 'SET_AMOUNT',
    payload?: { amount?: number }
  ) => {
    setManaging(clusterId + action);
    await onManage(clusterId, action, payload);
    setManaging(null);
  };

  const copyInvite = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // abaikan bila clipboard tidak tersedia
    }
  };

  const statusBadge = (b: ClusterBilling) => {
    const eff = effectiveBillingClient(b);
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
          APLIKASI BERBAYAR PER-KLASTER • DIAWASI SUPERADMIN
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center space-x-2">
          <CreditCard className="w-7 h-7 text-emerald-500" />
          <span>{t('sub.title')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t('sub.subtitle')}</p>
      </div>

      {/* Billing Klaster Saya */}
      {currentUser && myCluster && myBilling && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
                Billing Klaster Saya
              </h3>
              {statusBadge(myCluster.billing)}
            </div>

            <div>
              <p className="font-black text-lg">{myCluster.name}</p>
              <p className="text-xs text-slate-400">
                {t('sub.amountDue')}: {formatRupiah(myCluster.billing.amountDue)}
              </p>
            </div>

            {/* KODE UNDANGAN KLASTER (Join with Code) */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <KeyRound className="w-4 h-4" />
                <span>{t('sub.inviteCode')}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xl font-black tracking-widest text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  {myCluster.inviteCode}
                </code>
                <button
                  onClick={() => copyInvite(myCluster.inviteCode)}
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                  title="Salin kode"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">{t('sub.inviteCodeHint')}</p>
            </div>

            {myBilling.status === 'TRIAL' ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{t('sub.trialActive')}</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {t('sub.trialDaysLeft', { days: daysLeft })}
                </p>
                <p className="text-xs text-slate-300">
                  {t('sub.trialEndsAt')}: {formatTanggal(myBilling.trialEndsAt)}
                </p>
                {daysLeft <= 3 && (
                  <p className="text-[11px] font-bold text-amber-300">
                    ⚠️ Trial hampir habis — segera pilih paket. (Emergency Alert warga tetap aktif.)
                  </p>
                )}
              </div>
            ) : myBilling.status === 'AKTIF' ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                  <BadgeCheck className="w-4 h-4" />
                  <span>{t('sub.active')}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {myBilling.plan === 'BULANAN' ? t('sub.monthly') : t('sub.yearly')} •{' '}
                  {t('sub.paidUntil')}: {formatTanggal(myBilling.paidUntil)}
                </p>
                {myBilling.lastPaymentAmount && (
                  <p className="text-xs text-slate-400">
                    Pembayaran terakhir: {formatRupiah(myBilling.lastPaymentAmount)} (
                    {formatTanggal(myBilling.lastPaymentAt)})
                  </p>
                )}
              </div>
            ) : myBilling.status === 'DITANGGUHKAN' ? (
              <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
                  <PauseCircle className="w-4 h-4" />
                  <span>{t('sub.status.DITANGGUHKAN')}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {myBilling.note || 'Hubungi Customer Service (tarafk1972@gmail.com).'}
                </p>
                <p className="text-[11px] font-bold text-amber-300">ℹ️ {t('sub.billingBlocked')} — Emergency Alert warga tetap aktif.</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-red-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t('sub.status.KEDALUWARSA')}</span>
                </div>
                <p className="text-xs text-slate-300">{t('sub.expired')}</p>
                <p className="text-[11px] font-bold text-amber-300">ℹ️ {t('sub.billingBlocked')} — Emergency Alert warga tetap aktif.</p>
              </div>
            )}
          </div>

          {/* Paket Langganan Klaster — hanya Admin klaster / Superadmin yang bisa bayar */}
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
                    <span>Emergency Alert tanpa batas untuk SEMUA anggota klaster</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Peta klaster, patroli QR & notifikasi</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dukungan Customer Service Superadmin</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePay('BULANAN')}
                  disabled={paying !== null || !isAdmin}
                  title={!isAdmin ? 'Hanya Admin klaster yang dapat membayar' : ''}
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
                  disabled={paying !== null || !isAdmin}
                  title={!isAdmin ? 'Hanya Admin klaster yang dapat membayar' : ''}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  {paying === 'TAHUNAN' ? '...' : t('sub.payNow')}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * Billing dihitung PER-KLASTER (bukan per-anggota). Hanya Admin klaster atau Superadmin yang
              dapat membayar. Pembayaran dalam demo ini bersifat simulasi dan seluruhnya diawasi oleh
              Superadmin (tarafk1972@gmail.com). Peringatan billing HANYA ditampilkan kepada Admin
              klaster — Emergency Alert warga TIDAK PERNAH diblokir oleh masalah billing.
            </p>
          </div>
        </div>
      )}

      {/* PANEL PENGAWASAN BILLING SELURUH KLASTER (SUPERADMIN) */}
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
                  <th className="py-2 pr-4">Klaster</th>
                  <th className="py-2 pr-4">Kode Undangan</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Tagihan</th>
                  <th className="py-2 pr-4">Trial / Jatuh Tempo</th>
                  <th className="py-2">Aksi Pengawasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {clusters.map((c) => {
                  const eff = effectiveBillingClient(c.billing);
                  return (
                    <tr key={c.id}>
                      <td className="py-2.5 pr-4">
                        <p className="font-bold text-slate-100">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.billing.note || '-'}</p>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-[11px] font-black tracking-wider text-indigo-300">
                          {c.inviteCode}
                        </code>
                      </td>
                      <td className="py-2.5 pr-4">{statusBadge(c.billing)}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editAmount[c.id] ?? c.billing.amountDue}
                            onChange={(e) => setEditAmount({ ...editAmount, [c.id]: e.target.value })}
                            className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-white focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() =>
                              handleManage(c.id, 'SET_AMOUNT', {
                                amount: parseInt(editAmount[c.id] ?? String(c.billing.amountDue), 10) || 0,
                              })
                            }
                            disabled={managing !== null}
                            title="Ubah nominal tagihan"
                            className="p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white disabled:opacity-50"
                          >
                            <BadgeDollarSign className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-300">
                        {eff.status === 'TRIAL'
                          ? formatTanggal(eff.trialEndsAt)
                          : formatTanggal(eff.paidUntil || eff.trialEndsAt)}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleManage(c.id, 'EXTEND_TRIAL')}
                            disabled={managing !== null}
                            className="px-2 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-[10px] font-bold flex items-center space-x-1 disabled:opacity-50"
                          >
                            <CalendarPlus className="w-3 h-3" />
                            <span>{t('sub.extendTrial')}</span>
                          </button>
                          <button
                            onClick={() => handleManage(c.id, 'MARK_PAID')}
                            disabled={managing !== null}
                            className="px-2 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center space-x-1 disabled:opacity-50"
                          >
                            <BadgeCheck className="w-3 h-3" />
                            <span>{t('sub.markPaid')}</span>
                          </button>
                          {eff.status === 'DITANGGUHKAN' ? (
                            <button
                              onClick={() => handleManage(c.id, 'ACTIVATE')}
                              disabled={managing !== null}
                              className="px-2 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center space-x-1 disabled:opacity-50"
                            >
                              <PlayCircle className="w-3 h-3" />
                              <span>{t('sub.activate')}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleManage(c.id, 'SUSPEND')}
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
