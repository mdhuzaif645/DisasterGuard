/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, LanguageCode, Alert, Shelter, SOSRequest, DisasterReport, FamilyGroup } from './types';
import { api } from './api/client';
import { Header } from './components/Header';
import { EmergencyBanner } from './components/EmergencyBanner';
import { DisasterMap } from './components/DisasterMap';
import { SOSModal } from './components/SOSModal';
import { AIAssistantModal } from './components/AIAssistantModal';

// Views
import { LandingView } from './views/LandingView';
import { CitizenDashboardView } from './views/CitizenDashboardView';
import { AlertsView } from './views/AlertsView';
import { SheltersView } from './views/SheltersView';
import { ReportsView } from './views/ReportsView';
import { PreparednessView } from './views/PreparednessView';
import { FamilySafetyView } from './views/FamilySafetyView';
import { EmergencyContactsView } from './views/EmergencyContactsView';
import { ResponderPortalView } from './views/ResponderPortalView';
import { AdminPortalView } from './views/AdminPortalView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileSettingsView } from './views/ProfileSettingsView';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [personalSOS, setPersonalSOS] = useState<SOSRequest[]>([]);
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState<number>(2);

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<Alert | null>(null);

  const refreshAllData = async () => {
    try {
      const [alertsData, sheltersData, reportsData, sosData, familyData, notifs] =
        await Promise.all([
          api.getAlerts(),
          api.getShelters(),
          api.getReports(),
          api.getSOSRequests(),
          api.getFamilyGroup(),
          api.getNotifications(),
        ]);

      setAlerts(alertsData);
      setShelters(sheltersData);
      setReports(reportsData);
      setPersonalSOS(sosData);
      setFamilyGroup(familyData);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
    } catch (err) {
      console.warn('Initial data load notice:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    try {
      await api.switchRole(newRole);
      // Auto route to corresponding default portal for smoother UX
      if (newRole === 'emergency_responder') {
        setCurrentView('responder-portal');
      } else if (newRole === 'disaster_authority' || newRole === 'system_administrator') {
        setCurrentView('admin-portal');
      } else if (newRole === 'shelter_manager') {
        setCurrentView('shelters');
      } else if (newRole === 'guest') {
        setCurrentView('landing');
      } else {
        setCurrentView('dashboard');
      }
      refreshAllData();
    } catch (_err) {
      // Ignored
    }
  };

  const handleSOSCreated = (newSOS: SOSRequest) => {
    setIsSOSOpen(false);
    setPersonalSOS((prev) => [newSOS, ...prev]);
    setCurrentView('dashboard');
    refreshAllData();
  };

  const criticalAlert = alerts.find(
    (a) => a.severity === 'critical' && (a.status === 'published' || a.status === 'updated')
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Critical Emergency Marquee / Banner */}
      <EmergencyBanner
        criticalAlert={criticalAlert}
        onViewAlert={(alert) => {
          setSelectedAlertForModal(alert);
          setCurrentView('alerts');
        }}
      />

      {/* Main App Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        language={language}
        onLanguageChange={setLanguage}
        unreadNotificationsCount={unreadCount}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAIAssistant={() => setIsAIOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'landing' && (
          <LandingView
            alerts={alerts}
            shelters={shelters}
            onNavigate={setCurrentView}
            onOpenSOS={() => setIsSOSOpen(true)}
            onSelectAlert={(a) => {
              setSelectedAlertForModal(a);
              setCurrentView('alerts');
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <CitizenDashboardView
            alerts={alerts}
            shelters={shelters}
            personalSOS={personalSOS}
            familyGroup={familyGroup}
            onNavigate={setCurrentView}
            onOpenSOS={() => setIsSOSOpen(true)}
            onSelectAlert={(a) => {
              setSelectedAlertForModal(a);
              setCurrentView('alerts');
            }}
            onMarkSafe={() => setCurrentView('family')}
          />
        )}

        {currentView === 'alerts' && (
          <AlertsView
            alerts={alerts}
            language={language}
            onSelectAlert={(a) => setSelectedAlertForModal(a)}
          />
        )}

        {currentView === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Interactive Natural Disaster Map</h1>
                <p className="text-xs text-slate-400">
                  Real-time geospatial visualization of official hazards, shelters, blocked routes, and citizen reports.
                </p>
              </div>
            </div>
            <div className="h-[680px]">
              <DisasterMap
                alerts={alerts}
                shelters={shelters}
                reports={reports}
                onSelectAlert={(a) => {
                  setSelectedAlertForModal(a);
                  setCurrentView('alerts');
                }}
                onSelectShelter={(_s) => {
                  setCurrentView('shelters');
                }}
              />
            </div>
          </div>
        )}

        {currentView === 'shelters' && (
          <SheltersView
            shelters={shelters}
            currentRole={currentRole}
            onRefreshShelters={refreshAllData}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView
            reports={reports}
            currentRole={currentRole}
            onRefreshReports={refreshAllData}
          />
        )}

        {currentView === 'preparedness' && <PreparednessView />}

        {currentView === 'family' && (
          <FamilySafetyView
            familyGroup={familyGroup}
            onRefreshFamily={refreshAllData}
          />
        )}

        {currentView === 'emergency-contacts' && <EmergencyContactsView />}

        {currentView === 'responder-portal' && (
          <ResponderPortalView onRefreshData={refreshAllData} />
        )}

        {currentView === 'admin-portal' && (
          <AdminPortalView
            alerts={alerts}
            shelters={shelters}
            reports={reports}
            onRefreshAll={refreshAllData}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationsView
            onRefreshCount={refreshAllData}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'profile-settings' && (
          <ProfileSettingsView
            language={language}
            onLanguageChange={setLanguage}
          />
        )}
      </main>

      {/* Global Emergency SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        onSuccess={handleSOSCreated}
      />

      {/* Global AI Safety Advisor Modal */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        language={language}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-300">DisasterGuard Emergency Coordination Platform</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Integrated with IMD (CAP-CP Protocol), National Disaster Management Authority (NDMA), and CWC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentView('profile-settings')}
              className="text-slate-400 hover:text-white"
            >
              Privacy & Consent
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentView('preparedness')}
              className="text-slate-400 hover:text-white"
            >
              Safety Guides
            </button>
            <span>•</span>
            <span className="text-rose-400 font-bold">National Helpline: 112 (Toll Free)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
