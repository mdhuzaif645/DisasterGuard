/**
 * DisasterGuard Emergency Responder Portal
 * Section 9: Incident dispatch, status transitions (En Route -> In Progress -> Resolved),
 * notes logging, and responder availability controls.
 */

import React, { useState, useEffect } from 'react';
import { SOSRequest, Responder } from '../types';
import { api } from '../api/client';
import {
  ShieldAlert,
  MapPin,
  Clock,
  PhoneCall,
  CheckCircle2,
  Navigation,
  Send,
  AlertOctagon,
  Users,
  HeartPulse,
} from 'lucide-react';

interface ResponderPortalViewProps {
  onRefreshData: () => void;
}

export const ResponderPortalView: React.FC<ResponderPortalViewProps> = ({ onRefreshData }) => {
  const [incidents, setIncidents] = useState<SOSRequest[]>([]);
  const [availability, setAvailability] = useState<'available' | 'busy' | 'off_duty'>('busy');
  const [activeNote, setActiveNote] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      const data = await api.getResponderAssignments();
      setIncidents(data);
    } catch (_err) {
      // Ignored
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStatusChange = async (incidentId: string, nextStatus: string) => {
    setIsUpdating(incidentId);
    const note = activeNote[incidentId] || `Status advanced to ${nextStatus}`;
    try {
      await api.updateSOSStatus(incidentId, nextStatus, note);
      setActiveNote((prev) => ({ ...prev, [incidentId]: '' }));
      fetchAssignments();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleAvailability = async (newStatus: 'available' | 'busy' | 'off_duty') => {
    try {
      await api.setResponderAvailability(newStatus);
      setAvailability(newStatus);
    } catch (_err) {
      // Ignored
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Responder Header & Availability Bar */}
      <div className="p-6 bg-slate-850 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Inspector Rajesh Varma</h1>
              <span className="text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                NDRF 10th Battalion
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Badge: NDRF-BN10-449 • Specialization: Flood Rescue & Swiftwater Evacuation
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Duty Status:</span>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => handleToggleAvailability('available')}
              className={`px-3 py-1.5 rounded-lg transition ${
                availability === 'available'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => handleToggleAvailability('busy')}
              className={`px-3 py-1.5 rounded-lg transition ${
                availability === 'busy'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              On Rescue Mission
            </button>
            <button
              onClick={() => handleToggleAvailability('off_duty')}
              className={`px-3 py-1.5 rounded-lg transition ${
                availability === 'off_duty'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Off Duty
            </button>
          </div>
        </div>
      </div>

      {/* Incident Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            Active Assigned Incidents ({incidents.filter((i) => i.status !== 'resolved').length})
          </h2>
          <span className="text-xs text-slate-400">Automatic priority routing enabled</span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-8 text-center bg-slate-850 rounded-2xl border border-slate-800 text-xs text-slate-400">
            No active incidents currently assigned to your team.
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => {
              const isResolved = incident.status === 'resolved';
              const isCancelled = incident.status === 'cancelled';

              return (
                <div
                  key={incident.id}
                  className={`p-6 bg-slate-850 border rounded-2xl space-y-4 transition ${
                    incident.priority === 'critical'
                      ? 'border-rose-500/80 shadow-lg shadow-rose-950/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded">
                          {incident.priority} PRIORITY
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          Incident ID: {incident.id}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400">
                          Category: {incident.category.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {incident.userName} • {incident.userPhone}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">{incident.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-slate-800 text-rose-400 border border-slate-700">
                        {incident.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Reported: {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Location and stranded count bar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span className="truncate">{incident.addressApprox}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>Stranded Persons: <strong>{incident.peopleCount}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <HeartPulse className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>Injuries: <strong>{incident.hasInjuries ? 'YES - Medical Triage Required' : 'None reported'}</strong></span>
                    </div>
                  </div>

                  {/* Incident Notes Log */}
                  {incident.incidentNotes && incident.incidentNotes.length > 0 && (
                    <div className="p-3 bg-slate-900/60 rounded-xl text-xs space-y-1 border border-slate-800">
                      <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">
                        Mission Log & Triage Notes:
                      </span>
                      {incident.incidentNotes.map((note, idx) => (
                        <div key={idx} className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lifecycle Status Action Steps */}
                  {!isResolved && !isCancelled && (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400 font-semibold mr-2">Advance Mission Status:</span>

                        {incident.status === 'submitted' && (
                          <button
                            onClick={() => handleStatusChange(incident.id, 'acknowledged')}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-700"
                          >
                            1. Acknowledge Incident
                          </button>
                        )}

                        {(incident.status === 'acknowledged' || incident.status === 'assigned') && (
                          <button
                            onClick={() => handleStatusChange(incident.id, 'responder_en_route')}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow"
                          >
                            2. Set En Route (ETA Dispatched)
                          </button>
                        )}

                        {incident.status === 'responder_en_route' && (
                          <button
                            onClick={() => handleStatusChange(incident.id, 'in_progress')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow"
                          >
                            3. On Scene / Rescue In Progress
                          </button>
                        )}

                        {incident.status === 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(incident.id, 'resolved')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow"
                          >
                            4. Mark Rescue Completed & Safe
                          </button>
                        )}
                      </div>

                      {/* Add Custom Note */}
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <input
                          type="text"
                          value={activeNote[incident.id] || ''}
                          onChange={(e) => setActiveNote({ ...activeNote, [incident.id]: e.target.value })}
                          placeholder="Add incident operational note (e.g. Boat arrived, evacuating 3 children)..."
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                        />
                        <button
                          onClick={() => handleStatusChange(incident.id, incident.status)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold border border-slate-700"
                        >
                          Append Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
