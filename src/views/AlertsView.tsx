/**
 * DisasterGuard Disaster Alerts Management & Directory
 * Section 5: Alert filters, official attribution, evacuation guidance,
 * AI simple-language explanation, and acknowledgement.
 */

import React, { useState } from 'react';
import { Alert, LanguageCode } from '../types';
import { api } from '../api/client';
import {
  Radio,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Info,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  X,
  Compass,
  MapPin,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  language: LanguageCode;
  onSelectAlert?: (alert: Alert) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, language }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeModalAlert, setActiveModalAlert] = useState<Alert | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const filtered = alerts.filter((a) => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.affectedArea.toLowerCase().includes(q) ||
        a.issuingAuthority.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExplain = async (alert: Alert) => {
    setIsExplaining(true);
    setAiExplanation(null);
    try {
      const res = await api.explainAlert(alert.title, alert.description, language);
      setAiExplanation(res.explanation);
    } catch (_err) {
      setAiExplanation('Unable to contact AI assistant. Please review the official safety points listed below.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      setAcknowledged((prev) => ({ ...prev, [alertId]: true }));
    } catch (_err) {
      setAcknowledged((prev) => ({ ...prev, [alertId]: true }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-rose-500" />
            Disaster Alerts & Early Warnings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official feeds from IMD, NDMA, CWC, and State Disaster Management Authorities.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
            {alerts.filter((a) => a.severity === 'critical').length} Critical
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
            {alerts.filter((a) => a.severity === 'high').length} High
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Total {alerts.length} Warnings
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, locations, or agencies..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
          >
            <option value="all">All Disaster Categories</option>
            <option value="cyclone">Cyclone & Gale Storms</option>
            <option value="flood">River & Urban Floods</option>
            <option value="earthquake">Earthquakes & Aftershocks</option>
            <option value="landslide">Landslides & Mudflows</option>
            <option value="wildfire">Wildfires & Forest Fires</option>
            <option value="extreme_heat">Heatwave & High Temp</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (Red Alert)</option>
            <option value="high">High (Orange Alert)</option>
            <option value="moderate">Moderate (Yellow Alert)</option>
            <option value="minor">Minor / Advisory</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published & Active</option>
            <option value="draft">Drafts</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((alert) => {
          const isAck = acknowledged[alert.id];
          return (
            <div
              key={alert.id}
              className="p-5 bg-slate-850 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition shadow-lg"
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

                  {alert.isSimulated ? (
                    <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                      Simulated Drill
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      Official Verified
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{alert.title}</h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {alert.description}
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span className="truncate">{alert.affectedArea}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>By {alert.issuingAuthority}</span>
                  <span>Radius: {alert.radiusKm} km</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => {
                      setActiveModalAlert(alert);
                      setAiExplanation(null);
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold border border-slate-700 text-center transition"
                  >
                    View Advisory & Actions
                  </button>

                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1 ${
                      isAck
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                    title="Acknowledge you have read and noted this alert"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAck ? 'Noted' : 'Ack'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Detail Modal with AI Simplifier */}
      {activeModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-850 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span className="text-xs uppercase font-black tracking-wider text-rose-400">
                  {activeModalAlert.severity} Alert Advisory Details
                </span>
              </div>
              <button
                onClick={() => setActiveModalAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {activeModalAlert.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-400">
                  <span>Authority: <strong>{activeModalAlert.issuingAuthority}</strong></span>
                  <span>•</span>
                  <span>Issued: {new Date(activeModalAlert.issuedAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>Affected: {activeModalAlert.affectedArea}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl text-slate-200 leading-relaxed border border-slate-700">
                {activeModalAlert.description}
              </div>

              {/* Recommended Safety Actions */}
              {activeModalAlert.recommendedActions && activeModalAlert.recommendedActions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Mandatory Safety Instructions:
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-300">
                    {activeModalAlert.recommendedActions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evacuation Instructions */}
              {activeModalAlert.evacuationInstructions && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-1">
                  <h4 className="font-bold text-rose-300 uppercase tracking-wider text-[11px]">
                    Evacuation Notice:
                  </h4>
                  <p className="text-rose-100">{activeModalAlert.evacuationInstructions}</p>
                </div>
              )}

              {/* AI Simplification Tool */}
              <div className="p-4 bg-indigo-950/40 border border-indigo-700/50 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI Plain-Language Clarification (Gemini)</span>
                  </div>
                  <button
                    onClick={() => handleExplain(activeModalAlert)}
                    disabled={isExplaining}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] transition"
                  >
                    {isExplaining ? 'Analyzing...' : 'Explain Simply'}
                  </button>
                </div>

                {aiExplanation ? (
                  <div className="p-3 bg-slate-900/90 rounded-lg text-slate-200 leading-relaxed whitespace-pre-line border border-indigo-900">
                    {aiExplanation}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">
                    Need this advisory translated into simple conversational steps or Kannada/Hindi? Click Explain Simply.
                  </p>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <a
                  href={activeModalAlert.sourceUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Original Source
                </a>

                <button
                  onClick={() => setActiveModalAlert(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
