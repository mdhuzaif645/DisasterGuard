/**
 * DisasterGuard Active Emergency Alert Ticker & Banner
 */

import React from 'react';
import { Alert } from '../types';
import { AlertTriangle, ChevronRight, PhoneCall, ShieldAlert } from 'lucide-react';

interface EmergencyBannerProps {
  criticalAlert?: Alert | null;
  onViewAlert: (alert: Alert) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ criticalAlert, onViewAlert }) => {
  if (!criticalAlert) return null;

  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white px-4 py-2.5 shadow-xl border-b-2 border-red-500/80">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded text-amber-300">
                CRITICAL OFFICIAL WARNING
              </span>
              <span className="text-xs text-white/80 hidden sm:inline">
                Issued by {criticalAlert.issuingAuthority}
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-tight mt-0.5">
              {criticalAlert.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewAlert(criticalAlert)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-900 rounded-lg text-xs font-black shadow hover:bg-rose-50 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            View Safety Actions & Evacuation Route
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <a
            href="tel:112"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-black/40 hover:bg-black/60 rounded-lg text-xs font-bold text-white border border-white/20 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
            Dial 112
          </a>
        </div>
      </div>
    </div>
  );
};
