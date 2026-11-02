/**
 * DisasterGuard Main Header & Navigation
 */

import React, { useState } from 'react';
import { UserRole, LanguageCode } from '../types';
import { translations } from '../i18n';
import {
  ShieldAlert,
  PhoneCall,
  Bell,
  Menu,
  X,
  User,
  Sparkles,
  MapPin,
  Flame,
  Radio,
  FileText,
  Users,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  unreadNotificationsCount: number;
  onOpenSOS: () => void;
  onOpenAIAssistant: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  unreadNotificationsCount,
  onOpenSOS,
  onOpenAIAssistant,
  currentView,
  onViewChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language] || translations.en;

  const roles: { value: UserRole; label: string }[] = [
    { value: 'citizen', label: 'Citizen (Arun Kumar)' },
    { value: 'emergency_responder', label: 'Responder (Insp. Varma)' },
    { value: 'shelter_manager', label: 'Shelter Mgr (Dr. Rao)' },
    { value: 'disaster_authority', label: 'Disaster Authority' },
    { value: 'system_administrator', label: 'System Admin' },
    { value: 'guest', label: 'Guest (Public)' },
  ];

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Compass },
    { id: 'alerts', label: t.alerts, icon: Radio },
    { id: 'map', label: t.map, icon: MapPin },
    { id: 'shelters', label: t.shelters, icon: ShieldAlert },
    { id: 'reports', label: t.reports, icon: FileText },
    { id: 'preparedness', label: t.preparedness, icon: Flame },
    { id: 'family', label: t.familySafety, icon: Users },
  ];

  if (currentRole === 'emergency_responder' || currentRole === 'system_administrator') {
    navItems.push({ id: 'responder-portal', label: 'Responder Portal', icon: ShieldAlert });
  }

  if (currentRole === 'disaster_authority' || currentRole === 'system_administrator' || currentRole === 'shelter_manager') {
    navItems.push({ id: 'admin-portal', label: 'Authority Admin', icon: User });
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-lg">
      {/* Top Emergency Utility Strip */}
      <div className="bg-slate-950 px-4 py-1.5 flex items-center justify-between text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold tracking-wide">
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>NATIONAL HELPLINE: 112</span>
          </div>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">NDRF: 1078 • Disaster Operations Center: Active</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Persona / Role Selector */}
          <div className="flex items-center gap-1.5">
            <span className="hidden md:inline text-slate-400 text-[11px] uppercase font-bold">Role:</span>
            <select
              aria-label="Select User Role"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-0.5 focus:ring-1 focus:ring-rose-500 cursor-pointer font-medium"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-800 rounded border border-slate-700 p-0.5 text-[11px]">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 py-0.5 rounded font-semibold transition ${
                language === 'en' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('kn')}
              className={`px-1.5 py-0.5 rounded font-semibold transition ${
                language === 'kn' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-1.5 py-0.5 rounded font-semibold transition ${
                language === 'hi' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewChange('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-950">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white block leading-none">
                  Disaster<span className="text-rose-500">Guard</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-0.5">
                  Emergency Command
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-800 text-rose-400 border border-slate-700 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Hub (SOS Button, AI Advisor, Notifications) */}
          <div className="flex items-center gap-2.5">
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 transition"
              title="Open Disaster AI Safety Assistant"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin-slow" />
              <span className="hidden sm:inline">AI Safety</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => onViewChange('notifications')}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
              title="View Emergency Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Large Urgent SOS Trigger Button */}
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-lg shadow-rose-950 hover:shadow-rose-900 active:scale-95 transition"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              {t.sosButton}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 bg-slate-900 border-b border-slate-800 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
