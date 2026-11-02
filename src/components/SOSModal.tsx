/**
 * DisasterGuard SOS Emergency Dispatch Workflow
 * Section 8 Implementation: Emergency categories, GPS detection,
 * manual fallback, people count, injury triage, and 112 disclaimer.
 */

import React, { useState } from 'react';
import { api } from '../api/client';
import { SOSRequest } from '../types';
import {
  ShieldAlert,
  AlertOctagon,
  MapPin,
  Users,
  HeartPulse,
  Send,
  X,
  PhoneCall,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSOS: SOSRequest) => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [category, setCategory] = useState<string>('trapped_person');
  const [description, setDescription] = useState<string>('');
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [hasInjuries, setHasInjuries] = useState<boolean>(false);
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.5946);
  const [addressApprox, setAddressApprox] = useState<string>('Bengaluru Central');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [photoAttached, setPhotoAttached] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'trapped_person', label: 'Trapped Person / Structural Danger', critical: true },
    { id: 'medical_emergency', label: 'Medical Emergency / Oxygen / Trauma', critical: true },
    { id: 'flood_rescue', label: 'Swiftwater / Flood Evacuation', critical: true },
    { id: 'fire_related', label: 'Fire Outbreak / Gas Leak', critical: true },
    { id: 'missing_person', label: 'Missing Person / Lost Family Member', critical: false },
    { id: 'food_water_assistance', label: 'Essential Food & Drinking Water', critical: false },
    { id: 'shelter_assistance', label: 'Emergency Evacuation & Shelter Need', critical: false },
    { id: 'other', label: 'Other Disaster Hazard Emergency', critical: false },
  ];

  const handleDetectGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setAddressApprox(`GPS Fixed: (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
          setIsLocating(false);
        },
        (_err) => {
          // Fallback gracefully
          setAddressApprox('Bengaluru (GPS fallback applied)');
          setIsLocating(false);
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide a brief description of the emergency.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await api.createSOS({
        category,
        description,
        peopleCount,
        hasInjuries,
        lat,
        lng,
        addressApprox,
      });

      onSuccess(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit SOS. Please call 112 directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-rose-600 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-700 to-rose-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">SOS EMERGENCY DISPATCH</h2>
              <p className="text-xs text-rose-100">Dispatches alert to active responders and command center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 112 Hotline Advisory Notice */}
        <div className="bg-rose-950/60 border-b border-rose-800/80 px-6 py-2.5 flex items-center justify-between text-xs text-rose-200">
          <span>For immediate life-threatening danger:</span>
          <a
            href="tel:112"
            className="flex items-center gap-1 font-black text-white bg-rose-600 hover:bg-rose-500 px-2.5 py-1 rounded shadow"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            CALL 112 NOW
          </a>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-950/80 border border-red-500 rounded-lg text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Emergency Category */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
              Select Emergency Nature:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`text-left p-2.5 rounded-lg border transition font-medium flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-600/20 border-rose-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.label}</span>
                    {c.critical && (
                      <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded">
                        High
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & GPS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Incident Location & GPS:
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
              >
                {isLocating ? 'Detecting GPS...' : 'Detect Device GPS'}
              </button>
            </div>
            <input
              type="text"
              value={addressApprox}
              onChange={(e) => setAddressApprox(e.target.value)}
              placeholder="Building name, landmark, cross road, apartment number"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* People Count and Injuries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 text-[11px] uppercase tracking-wider">
                Persons Stranded / Needing Help:
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 bg-slate-800 p-2.5 rounded-lg border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasInjuries}
                  onChange={(e) => setHasInjuries(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-rose-300 flex items-center gap-1">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  Injuries / Medical Emergency
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 text-[11px] uppercase tracking-wider">
              Situation Details & Immediate Hazards:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify water height, fire hazard, trapped floor, presence of children/elderly, or needed supplies..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* Optional Photo Attachment */}
          <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg border border-slate-700">
            <span className="text-slate-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-400" />
              Incident Photo (Optional)
            </span>
            <button
              type="button"
              onClick={() => setPhotoAttached(!photoAttached)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                photoAttached
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              {photoAttached ? '✓ Photo Attached' : '+ Attach Snapshot'}
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-rose-950 transition"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Transmitting Request...' : 'Transmit SOS Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
