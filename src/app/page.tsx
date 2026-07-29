'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/Navbar';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { EmergencyModal } from '@/components/EmergencyModal';
import { AudioPlayerModal } from '@/components/AudioPlayerModal';
import { LandingTab } from '@/components/tabs/LandingTab';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { MapTab } from '@/components/tabs/MapTab';
import { DirectoryTab } from '@/components/tabs/DirectoryTab';
import { StatsTab } from '@/components/tabs/StatsTab';
import { ContactTab } from '@/components/tabs/ContactTab';
import { Footer } from '@/components/Footer';
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
} from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [users, setUsers] = useState<User[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [mapAreas, setMapAreas] = useState<ClusterBlockArea[]>([]);
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

  // Handle Adding new user
  const handleAddUser = async (data: {
    name: string;
    email: string;
    role: 'WARGA' | 'SATPAM' | 'ADMIN';
    block: string;
    phone: string;
    bio: string;
  }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetchAllState();
      }
    } catch (err) {
      console.error('Error adding user:', err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center animate-bounce shadow-xl">
          <span className="text-2xl font-black">W</span>
        </div>
        <p className="text-sm font-bold tracking-wider uppercase text-slate-300">
          Memuat Sistem WargaJagaWarga...
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
            currentUser={currentUser}
            onSelectBlockForSOS={() => {
              setIsSOSModalOpen(true);
            }}
            onRespondToIncident={handleRespondToIncident}
            onResolveIncident={handleResolveIncident}
            onAddMapArea={handleAddMapArea}
            onDeleteMapArea={handleDeleteMapArea}
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

      {/* 5. MODALS */}
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
