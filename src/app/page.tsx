'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/Navbar';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { SatpamAlarm } from '@/components/SatpamAlarm';
import { EmergencyModal } from '@/components/EmergencyModal';
import { AudioPlayerModal } from '@/components/AudioPlayerModal';
import { LandingTab } from '@/components/tabs/LandingTab';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { MapTab } from '@/components/tabs/MapTab';
import { DirectoryTab } from '@/components/tabs/DirectoryTab';
import { StatsTab } from '@/components/tabs/StatsTab';
import { ContactTab } from '@/components/tabs/ContactTab';
import { SubscriptionTab } from '@/components/tabs/SubscriptionTab';
import { PatrolTab } from '@/components/tabs/PatrolTab';
import { Footer } from '@/components/Footer';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import {
  User,
  Incident,
  ContactInquiry,
  ClusterStats,
  EmergencyType,
  SatpamStatus,
  WargaStatus,
  UserRole,
  ApprovalStatus,
  ClusterBlockArea,
  Cluster,
  BillingPlan,
  PatrolPoint,
  PatrolScan,
} from '@/types';

function HomeInner() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [users, setUsers] = useState<User[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [mapAreas, setMapAreas] = useState<ClusterBlockArea[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [patrolPoints, setPatrolPoints] = useState<PatrolPoint[]>([]);
  const [patrolScans, setPatrolScans] = useState<PatrolScan[]>([]);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [stats, setStats] = useState<ClusterStats>({
    wargaTerdaftar: 150,
    klasterTerhubung: 5,
    satpamAktif: 10,
    platformTerpadu: 1,
    activeIncidentsCount: 0,
    resolvedIncidentsCount: 0,
    averageResponseTimeMin: 2.4,
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const { setLang, t } = useLanguage();

  // Bahasa pilihan pengguna saat registrasi menjadi bahasa default seluruh aplikasi
  useEffect(() => {
    if (currentUser) {
      setLang(currentUser.language === 'en' ? 'en' : 'id');
    }
  }, [currentUser, setLang]);

  // Modals
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);

  // Fetch full state from backend API
  const fetchAllState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();

      if (data.users) {
        setUsers(data.users);
        if (!currentUser && data.users.length > 0) {
          // Default user: Bambang Sutanto (WARGA)
          const defaultUser = data.users.find((u: User) => u.id === 'usr-1') || data.users[0];
          setCurrentUser(defaultUser);
        } else if (currentUser) {
          // Segarkan data pengguna aktif (mis. status langganan berubah)
          const fresh = data.users.find((u: User) => u.id === currentUser.id);
          if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
            setCurrentUser(fresh);
          }
        }
      }
      if (data.incidents) {
        setIncidents(data.incidents);
      }
      if (data.contacts) {
        setContacts(data.contacts);
      }
      if (data.mapAreas) {
        setMapAreas(data.mapAreas);
      }
      if (data.clusters) {
        setClusters(data.clusters);
      }
      if (data.patrolPoints) {
        setPatrolPoints(data.patrolPoints);
      }
      if (data.patrolScans) {
        setPatrolScans(data.patrolScans);
      }
      if (data.stats) {
        setStats(data.stats);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAllState();
  }, [fetchAllState]);

  // Polling berkala: agar HP Satpam mendeteksi SOS baru mendekati real-time
  // (alarm sirine berbunyi otomatis walau satpam tidak menyentuh layar)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllState();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAllState]);

  // Audio Siren chime helper using Web Audio API
  const playSirenChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Ignore if audio blocked by browser policy
    }
  }, [soundEnabled]);

  // Handle resetting demo data
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error resetting demo:', err);
    }
  };

  // Handle creating new SOS Incident
  // CATATAN: SOS TIDAK PERNAH dicek/diblokir oleh billing — keselamatan warga prioritas utama.
  const handleCreateSOS = async (data: {
    type: EmergencyType;
    title: string;
    description: string;
    block: string;
  }) => {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          reporterId: currentUser.id,
          reporterName: currentUser.name,
          cluster: currentUser.cluster,
        }),
      });

      if (res.ok) {
        playSirenChime();
        await fetchAllState();
        setActiveTab('app');
      }
    } catch (err) {
      console.error('Error creating SOS:', err);
    }
  };

  // Handle Responding to an incident
  const handleRespondToIncident = async (incidentId: string) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond',
          userId: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          responderStatus: 'MELUNCUR',
        }),
      });

      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error responding:', err);
    }
  };

  // Handle Resolving an incident
  const handleResolveIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status',
          status: 'SELESAI',
        }),
      });

      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error resolving:', err);
    }
  };

  // Handle Adding comment to incident
  const handleAddComment = async (incidentId: string, text: string) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          text,
        }),
      });

      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error commenting:', err);
    }
  };

  // Handle Updating User/Satpam status
  const handleUpdateUserStatus = async (userId: string, status: SatpamStatus | WargaStatus) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Handle Approving / Rejecting user and assigning role
  const handleApproveUser = async (
    userId: string,
    approvalStatus: ApprovalStatus,
    assignedRole?: UserRole
  ) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          approvalStatus,
          assignedRole,
        }),
      });

      if (res.ok) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.5 },
        });
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error approving user:', err);
    }
  };

  // Handle Adding new user (mendukung kode undangan klaster / buat klaster baru)
  const handleAddUser = async (data: {
    name: string;
    email: string;
    role: 'WARGA' | 'SATPAM' | 'ADMIN';
    block: string;
    phone: string;
    bio: string;
    language?: 'id' | 'en';
    inviteCode?: string;
    cluster?: string;
  }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetchAllState();
      } else {
        const err = await res.json();
        // Kode undangan tidak valid, dsb.
        setBillingNotice(err.error || 'Pendaftaran gagal.');
      }
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  // ===== BILLING PER-CLUSTER (Aplikasi Berbayar, Percobaan Gratis 14 Hari) =====
  // Simulasi pembayaran billing klaster oleh Admin
  const handlePayBilling = async (clusterId: string, plan: BillingPlan) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pay', actorId: currentUser.id, clusterId, plan }),
      });
      if (res.ok) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
        setBillingNotice(null);
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error paying billing:', err);
    }
  };

  // Pengawasan billing seluruh klaster oleh Superadmin (Customer Service)
  const handleManageBilling = async (
    clusterId: string,
    manageAction: 'EXTEND_TRIAL' | 'SUSPEND' | 'ACTIVATE' | 'MARK_PAID' | 'SET_AMOUNT',
    payload?: { amount?: number }
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manage',
          actorId: currentUser.id,
          clusterId,
          manageAction,
          payload,
        }),
      });
      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error managing billing:', err);
    }
  };

  // ===== MODUL PATROLI QR (Satpam) =====
  const handlePatrolScan = async (data: {
    qrCode: string;
    coordinates: { x: number; y: number };
    wasOffline?: boolean;
    scannedAt?: string;
  }): Promise<{ ok: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { ok: false, error: 'Tidak ada pengguna aktif' };
    try {
      const res = await fetch('/api/patrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan', satpamId: currentUser.id, ...data }),
      });
      const result = await res.json();
      await fetchAllState();
      if (res.ok) {
        return { ok: true, message: result.message };
      }
      return { ok: false, error: result.error };
    } catch (err) {
      console.error('Error patrol scan:', err);
      return { ok: false, error: 'Gagal memproses scan patroli' };
    }
  };

  const handleAddPatrolPoint = async (data: { name: string; x: number; y: number; radius: number }) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/patrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-point',
          actorId: currentUser.id,
          clusterName: currentUser.cluster,
          ...data,
        }),
      });
      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error adding patrol point:', err);
    }
  };

  const handleDeletePatrolPoint = async (pointId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/patrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-point', actorId: currentUser.id, pointId }),
      });
      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error deleting patrol point:', err);
    }
  };

  // ===== AREA PETA OFFLINE KLASTER =====
  // Admin pertama klaster menentukan area peta yang ter-download ke aplikasi
  // setiap smartphone anggota, sehingga peta dapat bekerja secara offline.
  const handleSetClusterMapArea = async (data: {
    centerLat: number;
    centerLng: number;
    radiusKm: number;
  }) => {
    if (!currentUser) return;
    const myCluster = clusters.find(
      (c) => c.name.toLowerCase() === currentUser.cluster.toLowerCase()
    );
    if (!myCluster) return;
    try {
      const res = await fetch('/api/cluster-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser.id,
          clusterId: myCluster.id,
          ...data,
        }),
      });
      if (res.ok) {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.5 } });
        await fetchAllState();
      } else {
        const err = await res.json();
        setBillingNotice(err.error || 'Gagal menetapkan area peta klaster.');
      }
    } catch (err) {
      console.error('Error setting cluster map area:', err);
    }
  };

  // Handle adding Map Area by Admin
  const handleAddMapArea = async (area: {
    blockName: string;
    description: string;
    x: number;
    y: number;
    type: 'RUMAH' | 'POS_SATPAM' | 'CCTV' | 'TAMAN';
  }) => {
    try {
      const res = await fetch('/api/map-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...area,
          addedByAdminId: currentUser?.id,
        }),
      });

      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error adding map area:', err);
    }
  };

  // Handle deleting Map Area by Admin
  const handleDeleteMapArea = async (id: string) => {
    try {
      const res = await fetch(`/api/map-areas/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error deleting map area:', err);
    }
  };

  // Handle Submitting Contact Inquiry
  const handleSubmitContact = async (data: {
    name: string;
    email: string;
    phone: string;
    message: string;
    inquiryType: 'Cara daftar komunitas' | 'Fitur keamanan' | 'Kerja sama' | 'Lainnya';
    communityName: string;
  }) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error submitting contact:', err);
    }
  };

  // Handle Updating contact status & CS response
  const handleUpdateContactStatus = async (
    id: string,
    status: 'BARU' | 'DIPROSES' | 'SELESAI',
    csResponse?: string
  ) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, csResponse }),
      });

      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error updating contact status:', err);
    }
  };

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'SELESAI').length;

  // ===== PERINGATAN BILLING — HANYA UNTUK ADMIN KLASTER & SUPERADMIN =====
  // Warga dan Satpam TIDAK melihat peringatan billing; SOS tidak pernah diblokir.
  const isAdminUser = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN';
  const myClusterForBilling = currentUser
    ? clusters.find((c) => c.name.toLowerCase() === currentUser.cluster.toLowerCase())
    : undefined;
  let adminBillingWarning: { text: string; urgent: boolean } | null = null;
  if (isAdminUser && myClusterForBilling) {
    const b = myClusterForBilling.billing;
    const now = Date.now();
    const isSuspended = b.status === 'DITANGGUHKAN';
    const isExpired =
      !isSuspended &&
      b.plan !== 'GRATIS_SELAMANYA' &&
      ((b.status === 'AKTIF' && b.paidUntil && new Date(b.paidUntil).getTime() < now) ||
        (b.status === 'TRIAL' && new Date(b.trialEndsAt).getTime() < now));
    const trialDaysLeft = Math.max(0, Math.ceil((new Date(b.trialEndsAt).getTime() - now) / 86400000));

    if (isSuspended) {
      adminBillingWarning = {
        text: `Billing klaster ${myClusterForBilling.name} DITANGGUHKAN oleh Superadmin. Hubungi Customer Service (tarafk1972@gmail.com).`,
        urgent: true,
      };
    } else if (isExpired) {
      adminBillingWarning = {
        text: `Langganan klaster ${myClusterForBilling.name} telah KEDALUWARSA. Segera lunasi tagihan (Rp ${b.amountDue.toLocaleString('id-ID')}) di tab Billing Klaster.`,
        urgent: true,
      };
    } else if (b.status === 'TRIAL' && trialDaysLeft <= 3) {
      adminBillingWarning = {
        text: `Masa percobaan klaster ${myClusterForBilling.name} tersisa ${trialDaysLeft} hari. Segera pilih paket Bulanan/Tahunan di tab Billing Klaster.`,
        urgent: false,
      };
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center animate-bounce shadow-xl">
          <span className="text-2xl font-black">W</span>
        </div>
        <p className="text-sm font-bold tracking-wider uppercase text-slate-300">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* 1. TOP NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        users={users}
        activeIncidentsCount={activeIncidentsCount}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onResetDemo={handleResetDemo}
      />

      {/* 2. EMERGENCY STICKY SIREN BANNER */}
      <EmergencyBanner
        incidents={incidents}
        currentUser={currentUser}
        onViewMap={() => setActiveTab('map')}
        onRespond={handleRespondToIncident}
        onResolve={handleResolveIncident}
        onPlayAlertAudio={() => setIsAudioModalOpen(true)}
      />

      {/* 2b. PERINGATAN BILLING — HANYA TAMPIL UNTUK ADMIN KLASTER & SUPERADMIN */}
      {adminBillingWarning && (
        <div
          className={`border-b px-4 py-3 text-center ${
            adminBillingWarning.urgent
              ? 'bg-red-500/15 border-red-500/40'
              : 'bg-amber-500/15 border-amber-500/40'
          }`}
        >
          <p
            className={`text-xs sm:text-sm font-bold ${
              adminBillingWarning.urgent
                ? 'text-red-700 dark:text-red-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            💳 [Khusus Admin] {adminBillingWarning.text}{' '}
            <button
              onClick={() => setActiveTab('subscription')}
              className="underline font-black ml-2"
            >
              Buka Billing Klaster →
            </button>
          </p>
        </div>
      )}

      {/* 2c. NOTIFIKASI UMUM (mis. kode undangan salah) */}
      {billingNotice && (
        <div className="bg-amber-500/15 border-b border-amber-500/40 px-4 py-3 text-center">
          <p className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
            ⚠️ {billingNotice}{' '}
            <button
              onClick={() => setBillingNotice(null)}
              className="underline font-black ml-2"
            >
              Tutup
            </button>
          </p>
        </div>
      )}

      {/* 3. MAIN CONTENT TABS */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingTab
            stats={stats}
            currentUser={currentUser}
            onSwitchTab={setActiveTab}
            onTriggerSOSModal={() => setIsSOSModalOpen(true)}
          />
        )}

        {activeTab === 'app' && (
          <DashboardTab
            incidents={incidents}
            currentUser={currentUser}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onRespondToIncident={handleRespondToIncident}
            onResolveIncident={handleResolveIncident}
            onAddComment={handleAddComment}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            incidents={incidents}
            users={users}
            mapAreas={mapAreas}
            clusters={clusters}
            currentUser={currentUser}
            onSelectBlockForSOS={() => {
              setIsSOSModalOpen(true);
            }}
            onRespondToIncident={handleRespondToIncident}
            onResolveIncident={handleResolveIncident}
            onAddMapArea={handleAddMapArea}
            onDeleteMapArea={handleDeleteMapArea}
            onSetClusterMapArea={handleSetClusterMapArea}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryTab
            users={users}
            currentUser={currentUser}
            onUpdateUserStatus={handleUpdateUserStatus}
            onApproveUser={handleApproveUser}
            onAddUser={handleAddUser}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab stats={stats} incidents={incidents} />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionTab
            clusters={clusters}
            currentUser={currentUser}
            onPay={handlePayBilling}
            onManage={handleManageBilling}
          />
        )}

        {activeTab === 'patrol' && (
          <PatrolTab
            currentUser={currentUser}
            patrolPoints={patrolPoints}
            patrolScans={patrolScans}
            clusters={clusters}
            onScan={handlePatrolScan}
            onAddPoint={handleAddPatrolPoint}
            onDeletePoint={handleDeletePatrolPoint}
          />
        )}

        {activeTab === 'contact' && (
          <ContactTab
            contacts={contacts}
            currentUser={currentUser}
            onSubmitContact={handleSubmitContact}
            onUpdateContactStatus={handleUpdateContactStatus}
          />
        )}
      </main>

      {/* 4. FOOTER */}
      <Footer onSwitchTab={setActiveTab} />

      {/* 5. ALARM SOS SMARTPHONE SATPAM (volume paling keras, berhenti saat "Saya Meluncur") */}
      <SatpamAlarm
        incidents={incidents}
        currentUser={currentUser}
        onRespond={handleRespondToIncident}
      />

      {/* 6. MODALS */}
      <EmergencyModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        currentUser={currentUser}
        onSubmit={handleCreateSOS}
      />

      <AudioPlayerModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider initialLang="id">
      <HomeInner />
    </LanguageProvider>
  );
}
