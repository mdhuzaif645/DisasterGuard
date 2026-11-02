/**
 * DisasterGuard Public Landing Page
 * Features application overview, active alerts, quick safety guides,
 * emergency hotline numbers, and clear disclaimer.
 */

import React from 'react';
import { Alert, Shelter } from '../types';
import {
  ShieldAlert,
  Radio,
  MapPin,
  HeartHandshake,
  Bot,
  Flame,
  PhoneCall,
  ChevronRight,
  LifeBuoy,
  Users,
  Compass,
} from 'lucide-react';

interface LandingViewProps {
  alerts: Alert[];
  shelters: Shelter[];
  onNavigate: (view: string) => void;
  onOpenSOS: () => void;
  onSelectAlert: (alert: Alert) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  alerts,
  shelters,
  onNavigate,
  onOpenSOS,
  onSelectAlert,
}) => {
  const activeAlerts = alerts.filter((a) => a.status === 'published');
  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-slate-700/80 p-8 md:p-14 shadow-2xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            National Disaster Preparedness & Emergency Response Platform
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Protecting Communities When <span className="text-rose-500">Every Second</span> Counts.
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Real-time verified hazard warnings from IMD and NDMA, interactive evacuation maps, rapid SOS response dispatch, relief shelter occupancy tracking, and AI safety assistance.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-black tracking-wider uppercase shadow-xl shadow-rose-950 transition active:scale-95"
            >
              <LifeBuoy className="w-5 h-5" />
              Trigger SOS Emergency
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold border border-slate-600 transition"
            >
              <Compass className="w-5 h-5 text-rose-400" />
              Citizen Safety Dashboard
            </button>

            <button
              onClick={() => onNavigate('map')}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-medium border border-slate-700 transition"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Live Disaster Map
            </button>
          </div>

          {/* Emergency Disclaimer Banner */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400 gap-4 mt-6">
            <div className="flex items-center gap-2.5 text-slate-300">
              <PhoneCall className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                <strong>Official Emergency Notice:</strong> In life-threatening emergencies, immediately call national emergency number <strong>112</strong> or NDRF helpline <strong>1078</strong>.
              </span>
            </div>
            <a
              href="tel:112"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs whitespace-nowrap"
            >
              Dial 112
            </a>
          </div>
        </div>
      </section>

      {/* Active Warnings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500" />
              Active Disaster Alerts
            </h2>
            <p className="text-xs text-slate-400">Official warnings issued by meteorological & disaster authorities</p>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            View All ({activeAlerts.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className="group p-5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl transition cursor-pointer flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                      alert.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : alert.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {alert.severity} • {alert.category}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                    {alert.affectedArea}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition leading-snug">
                  {alert.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {alert.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate max-w-[180px]">{alert.issuingAuthority}</span>
                <span className="text-rose-400 font-semibold group-hover:translate-x-1 transition flex items-center gap-0.5">
                  Advisory <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('map')}
          className="p-6 bg-slate-850 border border-slate-800 rounded-2xl hover:border-slate-700 transition cursor-pointer space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Interactive Hazard Maps</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Live OpenStreetMap layers plotting active cyclones, flood zones, blocked highways, and relief camps.
          </p>
        </div>

        <div
          onClick={() => onNavigate('shelters')}
          className="p-6 bg-slate-850 border border-slate-800 rounded-2xl hover:border-slate-700 transition cursor-pointer space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Relief Shelters</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time capacity tracking, medical facilities, water/food availability, and distance-based directions.
          </p>
        </div>

        <div
          onClick={() => onNavigate('preparedness')}
          className="p-6 bg-slate-850 border border-slate-800 rounded-2xl hover:border-slate-700 transition cursor-pointer space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Preparedness Center</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Expert safety protocols for 9 natural disaster categories, interactive supply kit checklists, and quizzes.
          </p>
        </div>

        <div
          onClick={() => onNavigate('family')}
          className="p-6 bg-slate-850 border border-slate-800 rounded-2xl hover:border-slate-700 transition cursor-pointer space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Family Safety Circles</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            One-tap "Mark Safe" check-ins, battery status, emergency contact synchronization, and location sharing.
          </p>
        </div>
      </section>

      {/* Shelter Directory Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              Emergency Relief Shelters Nearby
            </h2>
            <p className="text-xs text-slate-400">Open shelters with verified food, drinking water, and trauma medical units</p>
          </div>
          <button
            onClick={() => onNavigate('shelters')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            All Shelters ({shelters.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shelters.slice(0, 3).map((shelter) => (
            <div
              key={shelter.id}
              className="p-5 bg-slate-850 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                    {shelter.operatingStatus === 'open' ? 'Open & Receiving' : 'Near Capacity'}
                  </span>
                  <span className="text-slate-400">{shelter.district}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{shelter.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{shelter.address}</p>
              </div>

              {/* Capacity Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Occupancy</span>
                  <span>{shelter.currentOccupancy} / {shelter.totalCapacity} beds</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (shelter.currentOccupancy / shelter.totalCapacity) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Helpline: {shelter.contactPhone}</span>
                <button
                  onClick={() => onNavigate('shelters')}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
