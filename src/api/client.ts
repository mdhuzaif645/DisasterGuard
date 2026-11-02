/**
 * DisasterGuard API Client
 */

import { Alert, Shelter, SOSRequest, DisasterReport, Responder, FamilyGroup, NotificationItem, ReliefResource, AuditLog } from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  getSession: () => fetchJson<{ user: any; isAuthenticated: boolean }>('/api/auth/session'),
  switchRole: (role: string) => fetchJson<{ success: boolean; user: any }>('/api/auth/switch-role', {
    method: 'POST',
    body: JSON.stringify({ role }),
  }),
  login: (email: string, role?: string) => fetchJson<{ success: boolean; user: any }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  }),
  logout: () => fetchJson<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  // Alerts
  getAlerts: (params?: { category?: string; severity?: string; status?: string; search?: string; lat?: number; lng?: number; radiusKm?: number }) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
      });
    }
    return fetchJson<Alert[]>(`/api/alerts?${q.toString()}`);
  },
  getAlertById: (id: string) => fetchJson<Alert>(`/api/alerts/${id}`),
  createAlert: (data: Partial<Alert>) => fetchJson<Alert>('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAlert: (id: string, data: Partial<Alert>) => fetchJson<Alert>(`/api/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  acknowledgeAlert: (id: string) => fetchJson<{ success: boolean; message: string }>(`/api/alerts/${id}/acknowledge`, {
    method: 'POST',
  }),

  // Shelters
  getShelters: () => fetchJson<Shelter[]>('/api/shelters'),
  getNearbyShelters: (lat: number, lng: number) => fetchJson<Shelter[]>(`/api/shelters/nearby?lat=${lat}&lng=${lng}`),
  createShelter: (data: Partial<Shelter>) => fetchJson<Shelter>('/api/shelters', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateShelterOccupancy: (id: string, newOccupancy: number, notes?: string) => fetchJson<{ success: boolean; shelter: Shelter }>(`/api/shelters/${id}/occupancy`, {
    method: 'PUT',
    body: JSON.stringify({ newOccupancy, notes }),
  }),

  // SOS
  getSOSRequests: () => fetchJson<SOSRequest[]>('/api/sos'),
  getSOSById: (id: string) => fetchJson<SOSRequest>(`/api/sos/${id}`),
  createSOS: (data: { category: string; description: string; peopleCount: number; hasInjuries: boolean; lat?: number; lng?: number; addressApprox?: string }) => fetchJson<SOSRequest>('/api/sos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSOSStatus: (id: string, nextStatus: string, note?: string) => fetchJson<{ success: boolean; incident: SOSRequest }>(`/api/sos/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ nextStatus, note }),
  }),
  assignSOS: (id: string, responderId: string) => fetchJson<{ success: boolean; incident: SOSRequest }>(`/api/sos/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ responderId }),
  }),
  cancelSOS: (id: string, reason?: string) => fetchJson<{ success: boolean; incident: SOSRequest }>(`/api/sos/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),

  // Reports
  getReports: (status?: string, category?: string) => {
    const q = new URLSearchParams();
    if (status) q.set('status', status);
    if (category) q.set('category', category);
    return fetchJson<DisasterReport[]>(`/api/reports?${q.toString()}`);
  },
  createReport: (data: { category: string; title: string; description: string; lat: number; lng: number; address: string; photoUrl?: string }) => fetchJson<DisasterReport>('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  verifyReport: (id: string, status: string, adminNotes?: string) => fetchJson<{ success: boolean; report: DisasterReport }>(`/api/reports/${id}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ status, adminNotes }),
  }),
  upvoteReport: (id: string) => fetchJson<{ success: boolean; upvotes: number }>(`/api/reports/${id}/upvote`, {
    method: 'POST',
  }),

  // Responders
  getResponders: () => fetchJson<Responder[]>('/api/responders'),
  getResponderAssignments: () => fetchJson<SOSRequest[]>('/api/responders/assignments'),
  setResponderAvailability: (status: 'available' | 'busy' | 'off_duty') => fetchJson<{ success: boolean; status: string }>('/api/responders/availability', {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  // Family Safety
  getFamilyGroup: () => fetchJson<FamilyGroup>('/api/family'),
  markSafe: (status: 'safe' | 'needs_help' | 'unknown', message?: string, lat?: number, lng?: number) => fetchJson<{ success: boolean; group: FamilyGroup }>('/api/family/mark-safe', {
    method: 'POST',
    body: JSON.stringify({ status, message, lat, lng }),
  }),
  requestFamilyCheckin: () => fetchJson<{ success: boolean; message: string }>('/api/family/request-checkin', {
    method: 'POST',
  }),

  // Emergency Contacts
  getEmergencyContacts: () => fetchJson<any[]>('/api/emergency-contacts'),
  addEmergencyContact: (data: any) => fetchJson<any>('/api/emergency-contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteEmergencyContact: (id: string) => fetchJson<{ success: boolean }>(`/api/emergency-contacts/${id}`, {
    method: 'DELETE',
  }),

  // Notifications
  getNotifications: () => fetchJson<NotificationItem[]>('/api/notifications'),
  markNotificationRead: (id: string) => fetchJson<{ success: boolean }>(`/api/notifications/${id}/read`, {
    method: 'PUT',
  }),
  markAllNotificationsRead: () => fetchJson<{ success: boolean }>('/api/notifications/mark-all-read', {
    method: 'POST',
  }),

  // Resources
  getResources: () => fetchJson<ReliefResource[]>('/api/resources'),

  // AI Assistant
  askAI: (prompt: string, context?: { alertTitle?: string; disasterType?: string; language?: string }) => fetchJson<{ reply: string }>('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, context }),
  }),
  explainAlert: (title: string, description: string, language?: string) => fetchJson<{ explanation: string }>('/api/ai/explain-alert', {
    method: 'POST',
    body: JSON.stringify({ title, description, language }),
  }),

  // Admin & Analytics
  getAnalytics: () => fetchJson<any>('/api/admin/analytics'),
  getUsers: () => fetchJson<any[]>('/api/admin/users'),
  getAuditLogs: () => fetchJson<AuditLog[]>('/api/admin/audit-logs'),
  getDataSources: () => fetchJson<any[]>('/api/admin/data-sources'),
  syncDataSource: (id: string) => fetchJson<{ success: boolean; dataSource: any }>(`/api/admin/data-sources/${id}/sync`, {
    method: 'POST',
  }),
  getAppSettings: () => fetchJson<any>('/api/app-settings'),
};
