/**
 * DisasterGuard Citizen Dashboard View
 * Section 4: Current location, weather conditions, active alerts,
 * nearby shelters, preparedness checklist progress, family status, and quick actions.
 */

import React from 'react';
import { Alert, Shelter, SOSRequest, FamilyGroup } from '../types';
import { formatDistance, calculateHaversineDistance } from '../utils/geo';
import {
  MapPin,
  CloudRain,
  Radio,
  ShieldAlert,
  Users,
  CheckCircle2,
  LifeBuoy,
  FileText,
  Flame,
  ArrowRight,
  AlertTriangle,
  HeartHandshake,
  Clock,
  Compass,
} from 'lucide-react';

interface CitizenDashboardViewProps {
  alerts: Alert[];
  shelters: Shelter[];
  personalSOS: SOSRequest[];
  familyGroup?: FamilyGroup;
  onNavigate: (view: string) => void;
  onOpenSOS: () => void;
  onSelectAlert: (alert: Alert) => void;
  onMarkSafe: () => void;
}

export const CitizenDashboardView: React.FC<CitizenDashboardViewProps> = ({
  alerts,
  shelters,
  personalSOS,
  familyGroup,
  onNavigate,
  onOpenSOS,
  onSelectAlert,
  onMarkSafe,
}) => {
  const userCoords = { lat: 12.9716, lng: 77.5946 };
  const activeAlerts = alerts.filter((a) => a.status === 'published');

  // Calculate nearby shelters with distances
  const sheltersWithDist = shelters.map((s) => ({
    ...s,
    distanceKm: calculateHaversineDistance(userCoords, { lat: s.lat, lng: s.lng }),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const activeSOS = personalSOS.find(
    (s) => s.status !== 'resolved' && s.status !== 'cancelled'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Location & Real-Time Weather Widget Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Location Card */}
        <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Monitored Location
              </span>
              <h3 className="text-sm font-bold text-white">Bengaluru Central Urban</h3>
              <span className="text-[11px] text-slate-400">12.9716° N, 77.5946° E</span>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
            GPS Active
          </span>
        </div>

        {/* Real-Time Disaster Weather Monitor */}
        <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Severe Storm Sensor
              </span>
              <h3 className="text-sm font-bold text-white">24°C • Heavy Downpour</h3>
              <span className="text-[11px] text-amber-400">Wind Gusts: 48 km/h • Precip: 85mm</span>
            </div>
          </div>
          <span className="text-[11px] bg-amber-500/10 text-amber-400 font-semibold px-2 py-0.5 rounded border border-amber-500/20">
            Risk: High
          </span>
        </div>

        {/* Family Safety Summary Card */}
        <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Family Circle (3 Members)
              </span>
              <h3 className="text-sm font-bold text-white">2 Safe • 1 Needs Attention</h3>
              <span className="text-[11px] text-slate-400">Lakshmi Kumar (Battery: 15%)</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('family')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold"
          >
            Check
          </button>
        </div>
      </div>

      {/* Active Personal SOS Tracking Callout (if active) */}
      {activeSOS && (
        <div className="p-5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-2 border-rose-600 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-400 animate-pulse">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded text-white">
                  INCIDENT IN PROGRESS: {activeSOS.id}
                </span>
                <span className="text-xs text-rose-300">
                  Priority: {activeSOS.priority.toUpperCase()}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Status: <span className="text-rose-400">{activeSOS.status.replace(/_/g, ' ').toUpperCase()}</span>
              </h3>
              <p className="text-xs text-slate-300">
                Assigned Responder: {activeSOS.assignedResponderName || 'Triage in Progress'} ({activeSOS.assignedAgency || 'NDRF Command'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
            >
              View on Map
            </button>
            <button
              onClick={() => onNavigate('sos-tracking')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow"
            >
              Track Live Timeline
            </button>
          </div>
        </div>
      )}

      {/* 6 Quick Action Grid Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <button
          onClick={onOpenSOS}
          className="p-4 bg-gradient-to-b from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-2xl flex flex-col items-center text-center justify-center space-y-2 shadow-lg shadow-rose-950 transition active:scale-95"
        >
          <LifeBuoy className="w-6 h-6 animate-pulse" />
          <span className="text-xs font-black tracking-wide uppercase">SOS Emergency</span>
        </button>

        <button
          onClick={() => onNavigate('map')}
          className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl flex flex-col items-center text-center justify-center space-y-2 transition"
        >
          <Compass className="w-6 h-6 text-blue-400" />
          <span className="text-xs font-bold">Disaster Map</span>
        </button>

        <button
          onClick={() => onNavigate('shelters')}
          className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl flex flex-col items-center text-center justify-center space-y-2 transition"
        >
          <ShieldAlert className="w-6 h-6 text-emerald-400" />
          <span className="text-xs font-bold">Find Shelter</span>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl flex flex-col items-center text-center justify-center space-y-2 transition"
        >
          <FileText className="w-6 h-6 text-purple-400" />
          <span className="text-xs font-bold">Report Hazard</span>
        </button>

        <button
          onClick={onMarkSafe}
          className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl flex flex-col items-center text-center justify-center space-y-2 transition"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <span className="text-xs font-bold">Mark Myself Safe</span>
        </button>

        <button
          onClick={() => onNavigate('preparedness')}
          className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl flex flex-col items-center text-center justify-center space-y-2 transition"
        >
          <Flame className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold">Safety Guides</span>
        </button>
      </div>

      {/* Main Two-Column Layout: Local Active Alerts & Nearby Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Local Disaster Warnings (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              Active Alerts In Your Region ({activeAlerts.length})
            </h2>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              View Full Directory
            </button>
          </div>

          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
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
                    <span className="text-xs text-slate-400">{alert.affectedArea}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{alert.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{alert.description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Source: {alert.issuingAuthority}</span>
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    Read Evacuation Guidance <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Preparedness 72-Hour Supply Kit Progress Widget */}
          <div className="p-5 bg-slate-850 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Emergency 72-Hour Survival Kit Readiness</h3>
              </div>
              <span className="text-xs text-amber-400 font-bold">75% Complete</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full w-3/4" />
            </div>
            <p className="text-xs text-slate-400">
              6 of 8 essential items prepared (Water, Food, Flashlight, Battery Bank, Whistle, First Aid). Missing: Water purification tablets, spare cash.
            </p>
            <button
              onClick={() => onNavigate('preparedness')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Open Full Checklist & Safety Quiz →
            </button>
          </div>
        </div>

        {/* Right Column: Nearest Verified Relief Shelters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Nearest Shelters
            </h2>
            <button
              onClick={() => onNavigate('shelters')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              All Shelters
            </button>
          </div>

          <div className="space-y-3">
            {sheltersWithDist.slice(0, 3).map((shelter) => (
              <div
                key={shelter.id}
                className="p-4 bg-slate-850 border border-slate-800 rounded-2xl space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{shelter.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{shelter.address}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap ml-2">
                    {formatDistance(shelter.distanceKm)}
                  </span>
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Capacity Available</span>
                    <span className="text-slate-200">
                      {shelter.totalCapacity - shelter.currentOccupancy} beds free
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (shelter.currentOccupancy / shelter.totalCapacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">{shelter.contactPhone}</span>
                  <button
                    onClick={() => onNavigate('shelters')}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Emergency Contacts Card */}
          <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Emergency Contacts</h3>
              <button
                onClick={() => onNavigate('emergency-contacts')}
                className="text-xs text-rose-400 hover:underline font-semibold"
              >
                Manage
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                <div>
                  <span className="font-bold text-white block">Priya Kumar (Spouse)</span>
                  <span className="text-slate-400">+91 98765 11223</span>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded">
                  Primary
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                <div>
                  <span className="font-bold text-white block">National Disaster Control</span>
                  <span className="text-slate-400">Toll Free: 112 / 1078</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                  24x7
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
