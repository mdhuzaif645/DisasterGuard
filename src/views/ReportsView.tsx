/**
 * DisasterGuard Community Hazard Reporting & Crowdsourced Feeds
 * Section 11: Hazard submission, GPS capture, moderation status, and upvoting.
 */

import React, { useState } from 'react';
import { DisasterReport, UserRole } from '../types';
import { api } from '../api/client';
import {
  FileText,
  AlertTriangle,
  MapPin,
  Camera,
  ThumbsUp,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';

interface ReportsViewProps {
  reports: DisasterReport[];
  currentRole: UserRole;
  onRefreshReports: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  currentRole,
  onRefreshReports,
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [category, setCategory] = useState('flooded_roads');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Bengaluru Local Area');
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    { id: 'flooded_roads', label: 'Flooded Road / Waterlogging' },
    { id: 'blocked_roads', label: 'Fallen Tree / Road Blockage' },
    { id: 'damaged_infrastructure', label: 'Bridge / Wall Structural Fissure' },
    { id: 'landslides', label: 'Landslide / Slope Failure' },
    { id: 'fire_outbreaks', label: 'Fire Outbreak / Gas Leak' },
    { id: 'missing_persons', label: 'Missing Person Report' },
    { id: 'other', label: 'Other Hazard' },
  ];

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createReport({
        category,
        title,
        description,
        lat,
        lng,
        address,
      });
      setShowSubmitModal(false);
      setTitle('');
      setDescription('');
      onRefreshReports();
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      await api.upvoteReport(id);
      onRefreshReports();
    } catch (_err) {
      // Ignored
    }
  };

  const filtered = reports.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-400" />
            Citizen Hazard Reporting
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Crowdsourced ground intelligence reviewed and verified by municipal disaster teams.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-950 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Report Ground Hazard
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="p-4 bg-slate-850 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300 font-semibold">Filter Hazard Type:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
          >
            <option value="all">All Hazards ({reports.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
            {reports.filter((r) => r.status === 'verified').length} Officially Verified
          </span>
          <span className="text-[11px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/20">
            {reports.filter((r) => r.status === 'under_review' || r.status === 'submitted').length} In Review
          </span>
        </div>
      </div>

      {/* Reports Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((rep) => {
          const isVerified = rep.status === 'verified';
          const isReview = rep.status === 'under_review' || rep.status === 'submitted';

          return (
            <div
              key={rep.id}
              className="p-5 bg-slate-850 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {rep.category.replace('_', ' ')}
                  </span>

                  {isVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Verified by Authority
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" /> Under Review
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{rep.title}</h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {rep.description}
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="truncate">{rep.address}</span>
                </div>

                {rep.adminNotes && (
                  <div className="mt-2.5 p-2 bg-slate-900 rounded-lg text-[11px] text-emerald-300 border border-slate-800">
                    <strong>Authority Action:</strong> {rep.adminNotes}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>By {rep.reporterName}</span>
                <button
                  onClick={() => handleUpvote(rep.id)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                  title="Confirm this hazard report"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>{rep.upvotes} Confirmations</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Submit Citizen Hazard Report
              </h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Hazard Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Report Title / Summary:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Uprooted electric pole blocking Outer Ring Road..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">Location & Landmark:</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-[11px] font-bold text-purple-400 hover:underline"
                  >
                    Use GPS
                  </button>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, landmark, near hospital/school..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Detailed Description:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe severity, traffic blockage, risk to pedestrians or property..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition"
                >
                  {isSubmitting ? 'Transmitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
