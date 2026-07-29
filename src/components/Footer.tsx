'use client';

import React from 'react';
import { ShieldAlert, Mail, CreditCard } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface FooterProps {
  onSwitchTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSwitchTab }) => {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSwitchTab('landing')}>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white">WargaJagaWarga</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="flex items-center space-x-4 text-xs pt-1">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                150+ Warga Terdaftar
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                10+ Satpam Aktif
              </span>
            </div>
            <button
              onClick={() => onSwitchTab('subscription')}
              className="flex items-center space-x-2 text-xs text-amber-300/90 hover:text-amber-200 font-semibold transition-colors text-left"
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>{t('footer.paidNotice')}</span>
            </button>
          </div>

          {/* Nav links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.platformNav')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSwitchTab('landing')}
                  className="hover:text-white transition-colors"
                >
                  Beranda & Fitur
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSwitchTab('app')}
                  className="hover:text-white transition-colors"
                >
                  Aplikasi Darurat SOS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSwitchTab('map')}
                  className="hover:text-white transition-colors"
                >
                  Peta Klaster Langsung
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSwitchTab('directory')}
                  className="hover:text-white transition-colors"
                >
                  Daftar Warga & Satpam
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSwitchTab('stats')}
                  className="hover:text-white transition-colors"
                >
                  Data Keamanan (Statistik)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.contactTeam')}</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href="mailto:tarafk1972@gmail.com" className="hover:text-white">
                  tarafk1972@gmail.com (Superadmin & CS)
                </a>
              </li>
              <li>
                <button
                  onClick={() => onSwitchTab('contact')}
                  className="text-red-400 font-bold hover:underline"
                >
                  {t('footer.registerCommunity')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            &copy; {new Date().getFullYear()} WargaJagaWarga. {t('footer.copyright')}
          </p>
          <div className="flex items-center space-x-6">
            <span>{t('footer.privacy')}</span>
            <span>{t('footer.terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
