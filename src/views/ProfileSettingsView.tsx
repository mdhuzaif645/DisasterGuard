/**
 * DisasterGuard User Profile, Privacy & Platform Settings
 * Sections 3 & 22: Profile editing, phone verification, privacy consent,
 * notification preferences, and data export.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { LanguageCode } from '../types';
import {
  User,
  Shield,
  MapPin,
  Bell,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  PhoneCall,
  Save,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  language,
  onLanguageChange,
}) => {
  const [profile, setProfile] = useState<any>({
    fullName: 'Arun Kumar',
    email: 'arun.citizen@disasterguard.org',
    phone: '+91 98765 43210',
    phoneVerified: true,
    homeCity: 'Bengaluru Central',
    locationPermissionGranted: true,
    notificationPushEnabled: true,
    notificationEmailEnabled: true,
    notificationSmsEnabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.getSession().then((res) => {
      if (res.user) setProfile(res.user);
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);

    try {
      await api.getUsers(); // simulated profile update
      setSaveSuccess('Profile and safety settings updated successfully.');
    } catch (_err) {
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `disasterguard-profile-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-rose-500" />
          Profile & Safety Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your verified contact identity, location boundaries, and alert subscriptions.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-200">
          ✓ {saveSuccess}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Personal Details Card */}
        <div className="p-6 bg-slate-850 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-rose-400" />
            Verified Identity & Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Name:</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address:</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold">Mobile Phone:</label>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OTP Verified
                </span>
              </div>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Home Area / City:</label>
              <input
                type="text"
                value={profile.homeCity}
                onChange={(e) => setProfile({ ...profile, homeCity: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 bg-slate-850 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Alert Delivery Channels
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">Web Push Notifications</span>
                <span className="text-slate-400 text-[11px]">Instant audio alert for critical red cyclone & flood warnings</span>
              </div>
              <input
                type="checkbox"
                checked={profile.notificationPushEnabled}
                onChange={(e) => setProfile({ ...profile, notificationPushEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">Email Advisories</span>
                <span className="text-slate-400 text-[11px]">Comprehensive safety protocols and regional evacuation maps</span>
              </div>
              <input
                type="checkbox"
                checked={profile.notificationEmailEnabled}
                onChange={(e) => setProfile({ ...profile, notificationEmailEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">SMS Priority Alert System</span>
                <span className="text-slate-400 text-[11px]">Cellular SMS delivery during telecom data outages</span>
              </div>
              <input
                type="checkbox"
                checked={profile.notificationSmsEnabled}
                onChange={(e) => setProfile({ ...profile, notificationSmsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600"
              />
            </label>
          </div>
        </div>

        {/* Privacy & Data Ownership Card */}
        <div className="p-6 bg-slate-850 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Privacy & GDPR / Digital Personal Data Protection
          </h2>

          <div className="p-3 bg-slate-900 rounded-xl text-slate-300 leading-relaxed text-[11px] border border-slate-800">
            DisasterGuard strictly limits location access to emergency response and disaster radius matching. We do not sell user data, record background routes without consent, or share details with unauthorized commercial third parties.
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download My Data (JSON)
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold uppercase tracking-wider shadow transition"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
