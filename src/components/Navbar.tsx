'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  MapPin,
  BarChart3,
  Mail,
  Home,
  Volume2,
  VolumeX,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { User } from '@/types';
import { useLanguage } from '@/lib/i18n';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
  activeIncidentsCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  users,
  activeIncidentsCount,
  soundEnabled,
  setSoundEnabled,
  onResetDemo,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { t } = useLanguage();

  const handleReset = async () => {
    setIsResetting(true);
    await onResetDemo();
    setTimeout(() => {
      setIsResetting(false);
    }, 600);
  };

  const navItems = [
    { id: 'landing', label: t('nav.home'), icon: Home },
    { id: 'app', label: t('nav.app'), icon: ShieldAlert, alert: activeIncidentsCount > 0 },
    { id: 'map', label: t('nav.map'), icon: MapPin },
    { id: 'directory', label: t('nav.directory'), icon: Users },
    { id: 'patrol', label: t('nav.patrol'), icon: QrCode },
    { id: 'stats', label: t('nav.stats'), icon: BarChart3 },
    { id: 'subscription', label: t('nav.subscription'), icon: CreditCard },
    { id: 'contact', label: t('nav.contact'), icon: Mail },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-extrabold';
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'SATPAM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-500/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              {activeIncidentsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  WargaJagaWarga
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                  Tanggap Darurat
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-400">
                {t('common.appTagline')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.alert && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Tools: Role Switcher & Audio Toggle & Reset */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? t('nav.soundOn') : t('nav.soundOff')}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled
                  ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-slate-700'
                  : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              title={t('nav.resetDemo')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Role / User Switcher Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-left"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-600"
                  />
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1">
                      <span>{currentUser.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getRoleBadgeColor(
                          currentUser.role
                        )}`}
                      >
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                        • {currentUser.block}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-2 divide-y divide-slate-800">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t('nav.switchRole')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t('nav.switchRoleHint')}
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {users.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              setCurrentUser(u);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                              isSelected
                                ? 'bg-red-500/10 border-l-2 border-red-500 text-white'
                                : 'hover:bg-slate-800/70 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-700"
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-200 truncate flex items-center space-x-1.5">
                                  <span>{u.name}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                                </div>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getRoleBadgeColor(
                                      u.role
                                    )}`}
                                  >
                                    {u.role}
                                  </span>
                                  <span className="text-[10px] text-slate-400 truncate">
                                    {u.block}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile bottom tabs bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium ${
                  isActive ? 'text-red-400 bg-slate-800/80' : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4 mb-0.5" />
                  {item.alert && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
