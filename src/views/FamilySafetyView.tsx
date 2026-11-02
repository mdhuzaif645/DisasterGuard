/**
 * DisasterGuard Family Safety & Check-in Circle
 * Section 13: Family group creation, invite codes, "Mark Safe" updates,
 * battery levels, and last shared voluntary locations.
 */

import React, { useState } from 'react';
import { FamilyGroup } from '../types';
import { api } from '../api/client';
import {
  Users,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  MapPin,
  Battery,
  Send,
  Plus,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface FamilySafetyViewProps {
  familyGroup?: FamilyGroup;
  onRefreshFamily: () => void;
}

export const FamilySafetyView: React.FC<FamilySafetyViewProps> = ({
  familyGroup,
  onRefreshFamily,
}) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'safe' | 'needs_help'>('safe');
  const [isUpdating, setIsUpdating] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleUpdateMyStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessNote(null);

    try {
      await api.markSafe(
        selectedStatus,
        statusMessage || (selectedStatus === 'safe' ? 'Safe and accounted for.' : 'Experiencing difficulties, need assistance.'),
        12.9716,
        77.5946
      );
      setSuccessNote('Your safety status was broadcast to all circle members.');
      setStatusMessage('');
      onRefreshFamily();
    } catch (_err) {
      alert('Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestCheckin = async () => {
    setRequestSent(true);
    try {
      await api.requestFamilyCheckin();
      setTimeout(() => setRequestSent(false), 5000);
    } catch (_err) {
      setRequestSent(false);
    }
  };

  if (!familyGroup) {
    return (
      <div className="p-8 text-center bg-slate-850 rounded-2xl border border-slate-800">
        <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No Family Circle Configured</h3>
        <p className="text-xs text-slate-400 mt-1">Create or join an emergency safety circle to check in on loved ones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            {familyGroup.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Private safety circle for real-time status check-ins and emergency alerts without invasive tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-300">
            Invite Code: <strong className="text-purple-400 font-mono tracking-wider">{familyGroup.inviteCode}</strong>
          </div>

          <button
            onClick={handleRequestCheckin}
            disabled={requestSent}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            {requestSent ? 'Check-in Broadcast Sent!' : 'Request Family Check-in'}
          </button>
        </div>
      </div>

      {successNote && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-200">
          ✓ {successNote}
        </div>
      )}

      {/* Two Column Layout: Quick Status Update & Member Statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Update My Status */}
        <div className="p-5 bg-slate-850 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Broadcast My Safety Status
          </h2>

          <form onSubmit={handleUpdateMyStatus} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('safe')}
                className={`p-3 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                  selectedStatus === 'safe'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>I Am Safe</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('needs_help')}
                className={`p-3 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                  selectedStatus === 'needs_help'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>I Need Help</span>
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Status Note to Family:</label>
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="e.g. At home on 2nd floor, generator working..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wider transition shadow"
            >
              {isUpdating ? 'Broadcasting...' : 'Update Status in Circle'}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Privacy Guarantee: Coordinates are only shared voluntarily upon clicking update. No continuous background tracking.
          </p>
        </div>

        {/* Right Column: Circle Members List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Circle Members ({familyGroup.members.length})</span>
            <span className="text-xs text-slate-400 font-normal">Last Updated</span>
          </h2>

          <div className="space-y-3">
            {familyGroup.members.map((member, idx) => {
              const isSafe = member.status === 'safe';
              const needsHelp = member.status === 'needs_help';

              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-850 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSafe
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : needsHelp
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{member.name}</h4>
                        <span className="text-[10px] text-slate-400">({member.role})</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {member.message || 'Status updated'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Phone: {member.phone}</span>
                        {member.lastLat && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-400" />
                            {member.lastLat.toFixed(3)}, {member.lastLng?.toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                        isSafe
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : needsHelp
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isSafe ? '✓ SAFE' : needsHelp ? '⚠ NEEDS HELP' : 'UNKNOWN'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(member.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
