/**
 * DisasterGuard Shelter & Relief Resource Management View
 * Section 10: Shelter search, occupancy tracking, facilities badges,
 * and manager capacity updates.
 */

import React, { useState } from 'react';
import { Shelter, UserRole } from '../types';
import { api } from '../api/client';
import { formatDistance, calculateHaversineDistance } from '../utils/geo';
import {
  Home,
  ShieldAlert,
  Search,
  Filter,
  PhoneCall,
  Check,
  Plus,
  Edit3,
  Heart,
  Dog,
  Users,
  Accessibility,
  Droplets,
  Stethoscope,
  X,
} from 'lucide-react';

interface SheltersViewProps {
  shelters: Shelter[];
  currentRole: UserRole;
  onRefreshShelters: () => void;
  onSelectShelter?: (shelter: Shelter) => void;
}

export const SheltersView: React.FC<SheltersViewProps> = ({
  shelters,
  currentRole,
  onRefreshShelters,
}) => {
  const userCoords = { lat: 12.9716, lng: 77.5946 };
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [newOccupancy, setNewOccupancy] = useState<number>(0);
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canManageShelters = currentRole === 'shelter_manager' || currentRole === 'system_administrator' || currentRole === 'disaster_authority';

  const processed = shelters
    .map((s) => ({
      ...s,
      distanceKm: calculateHaversineDistance(userCoords, { lat: s.lat, lng: s.lng }),
    }))
    .filter((s) => {
      if (statusFilter !== 'all' && s.operatingStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const handleUpdateOccupancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShelter) return;
    setIsUpdating(true);
    setSuccessMessage(null);

    try {
      await api.updateShelterOccupancy(editingShelter.id, newOccupancy, updateNotes);
      setSuccessMessage(`Updated occupancy for ${editingShelter.name} to ${newOccupancy}`);
      setEditingShelter(null);
      onRefreshShelters();
    } catch (err: any) {
      alert(err.message || 'Failed to update occupancy.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            Verified Relief Shelters & Safe Havens
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Government and verified community shelters with live bed capacity, medical trauma supplies, and clean water.
          </p>
        </div>

        {canManageShelters && (
          <div className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Shelter Manager Mode Enabled
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-200">
          ✓ {successMessage}
        </div>
      )}

      {/* Filter and Search */}
      <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shelter name, neighborhood, or district..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
          >
            <option value="all">All Operating Statuses</option>
            <option value="open">Open (Space Available)</option>
            <option value="near_capacity">Near Capacity (&gt;85%)</option>
            <option value="full">Full / Diverting</option>
          </select>
        </div>
      </div>

      {/* Shelter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {processed.map((shelter) => {
          const occupancyPct = Math.min(100, Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100));
          const isFull = shelter.operatingStatus === 'full';

          return (
            <div
              key={shelter.id}
              className="p-5 bg-slate-850 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                      shelter.operatingStatus === 'open'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : shelter.operatingStatus === 'near_capacity'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {shelter.operatingStatus.replace('_', ' ')}
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {formatDistance(shelter.distanceKm)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{shelter.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{shelter.address}</p>
                <span className="text-[11px] text-slate-500 block mt-0.5">District: {shelter.district}</span>
              </div>

              {/* Live Bed Capacity Progress Bar */}
              <div className="space-y-1.5 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Beds In Use:</span>
                  <span className="font-bold text-white">
                    {shelter.currentOccupancy} / {shelter.totalCapacity} ({occupancyPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      occupancyPct >= 95 ? 'bg-rose-500' : occupancyPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>Free: {Math.max(0, shelter.totalCapacity - shelter.currentOccupancy)} beds</span>
                  <span>Verified: {new Date(shelter.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Facility Badges */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Available Facilities:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {shelter.hasMedicalSupport && (
                    <span className="flex items-center gap-1 bg-slate-800 text-rose-300 px-2 py-0.5 rounded border border-slate-700">
                      <Stethoscope className="w-3 h-3 text-rose-400" /> Medical
                    </span>
                  )}
                  {shelter.hasFoodWater && (
                    <span className="flex items-center gap-1 bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700">
                      <Droplets className="w-3 h-3 text-blue-400" /> Food & Water
                    </span>
                  )}
                  {shelter.allowsPets && (
                    <span className="flex items-center gap-1 bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                      <Dog className="w-3 h-3 text-amber-400" /> Pets Allowed
                    </span>
                  )}
                  {shelter.isAccessible && (
                    <span className="flex items-center gap-1 bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
                      <Accessibility className="w-3 h-3 text-emerald-400" /> Wheelchair
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
                <a
                  href={`tel:${shelter.contactPhone}`}
                  className="flex items-center gap-1 text-slate-300 hover:text-white font-medium"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  {shelter.contactPhone}
                </a>

                {canManageShelters && (
                  <button
                    onClick={() => {
                      setEditingShelter(shelter);
                      setNewOccupancy(shelter.currentOccupancy);
                      setUpdateNotes('');
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg font-bold border border-emerald-500/30 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Update Beds
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shelter Manager Edit Occupancy Modal */}
      {editingShelter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Update Shelter Occupancy</h3>
                <p className="text-xs text-slate-400">{editingShelter.name}</p>
              </div>
              <button
                onClick={() => setEditingShelter(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOccupancy} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Current Occupant Headcount (Max Capacity: {editingShelter.totalCapacity}):
                </label>
                <input
                  type="number"
                  min="0"
                  max={editingShelter.totalCapacity * 1.2}
                  value={newOccupancy}
                  onChange={(e) => setNewOccupancy(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Log / Status Notes (Optional):
                </label>
                <input
                  type="text"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="e.g. Influx of 30 people from flood sector 4..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShelter(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition"
                >
                  {isUpdating ? 'Saving...' : 'Commit Count'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
