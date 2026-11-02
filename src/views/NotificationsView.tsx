/**
 * DisasterGuard Notification Center
 * Section 16: In-app notifications, delivery logs, read/unread states, and preference toggles.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { NotificationItem } from '../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Radio,
  LifeBuoy,
  Users,
  Settings,
  ShieldAlert,
} from 'lucide-react';

interface NotificationsViewProps {
  onRefreshCount: () => void;
  onNavigate: (view: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onRefreshCount,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (_err) {
      // Ignored
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifs();
      onRefreshCount();
    } catch (_err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifs();
      onRefreshCount();
    } catch (_err) {}
  };

  const filtered = filterUnread ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-rose-500" />
            Emergency Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official emergency alerts, responder dispatches, and family circle safety updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              filterUnread
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {filterUnread ? 'Showing Unread' : 'Show Only Unread'}
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-850 rounded-2xl border border-slate-800 text-xs text-slate-400">
            No notifications matching this view.
          </div>
        ) : (
          filtered.map((notif) => {
            const isUnread = !notif.isRead;
            return (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-slate-850 border-rose-500/50 shadow-md'
                    : 'bg-slate-850/60 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notif.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400'
                        : notif.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {notif.type === 'alert' && <Radio className="w-4 h-4" />}
                    {notif.type === 'sos_status' && <LifeBuoy className="w-4 h-4" />}
                    {notif.type === 'family_checkin' && <Users className="w-4 h-4" />}
                    {notif.type === 'shelter_update' && <ShieldAlert className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{notif.body}</p>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Channel: In-App & Web Push
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      notif.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400'
                        : notif.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {notif.severity}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
