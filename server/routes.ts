/**
 * DisasterGuard REST API Routes
 * Implements Section 20 of the Master Specification
 */

import { Router, Request, Response } from 'express';
import { db, DisasterAlert, SOSRequest, DisasterReport, Shelter } from './db.js';
import { askDisasterAssistant, explainAlertSimply } from './ai.js';
import { calculateHaversineDistance, isWithinRadius } from '../src/utils/geo.js';
import { classifyPriority, isValidStatusTransition, isDuplicateRequest } from '../src/utils/triage.js';

export const apiRouter = Router();

// Current active session mock / state (defaults to citizen, switchable by UI)
let currentUserId = 'usr-citizen-1';

// ----------------------------------------------------------------------------
// AUTHENTICATION & PROFILE
// ----------------------------------------------------------------------------

apiRouter.get('/auth/session', (req: Request, res: Response) => {
  const user = db.profiles.find((p) => p.id === currentUserId) || db.profiles[0];
  res.json({ user, isAuthenticated: true });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const targetUser = db.profiles.find((p) => p.role === role);
  if (targetUser) {
    currentUserId = targetUser.id;
    return res.json({ success: true, user: targetUser });
  }
  return res.status(404).json({ error: `User with role ${role} not found` });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  let user = db.profiles.find((p) => p.email === email);
  if (!user && role) {
    user = db.profiles.find((p) => p.role === role);
  }
  if (!user) {
    user = db.profiles[0];
  }
  currentUserId = user.id;
  res.json({ success: true, user });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  // Reset to guest / citizen
  currentUserId = 'usr-citizen-1';
  res.json({ success: true });
});

apiRouter.get('/profile', (_req: Request, res: Response) => {
  const profile = db.profiles.find((p) => p.id === currentUserId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

apiRouter.put('/profile', (req: Request, res: Response) => {
  const profileIndex = db.profiles.findIndex((p) => p.id === currentUserId);
  if (profileIndex === -1) return res.status(404).json({ error: 'Profile not found' });

  db.profiles[profileIndex] = {
    ...db.profiles[profileIndex],
    ...req.body,
  };
  res.json(db.profiles[profileIndex]);
});

// ----------------------------------------------------------------------------
// EMERGENCY CONTACTS
// ----------------------------------------------------------------------------

apiRouter.get('/emergency-contacts', (_req: Request, res: Response) => {
  const contacts = db.emergencyContacts.filter((c) => c.userId === currentUserId);
  res.json(contacts);
});

apiRouter.post('/emergency-contacts', (req: Request, res: Response) => {
  const { name, relationship, phone, email, isPrimary, notifyOnSos } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  const newContact = {
    id: `ec-${Date.now()}`,
    userId: currentUserId,
    name,
    relationship: relationship || 'Family',
    phone,
    email: email || '',
    isPrimary: !!isPrimary,
    notifyOnSos: notifyOnSos !== false,
  };

  db.emergencyContacts.push(newContact);
  res.status(201).json(newContact);
});

apiRouter.delete('/emergency-contacts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.emergencyContacts = db.emergencyContacts.filter((c) => c.id !== id);
  res.json({ success: true });
});

// ----------------------------------------------------------------------------
// SAVED LOCATIONS
// ----------------------------------------------------------------------------

apiRouter.get('/saved-locations', (_req: Request, res: Response) => {
  const locations = db.savedLocations.filter((l) => l.userId === currentUserId);
  res.json(locations);
});

apiRouter.post('/saved-locations', (req: Request, res: Response) => {
  const { label, address, lat, lng, radiusKm } = req.body;
  if (!label || !address || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing required location fields.' });
  }

  const newLoc = {
    id: `sl-${Date.now()}`,
    userId: currentUserId,
    label,
    address,
    lat: Number(lat),
    lng: Number(lng),
    radiusKm: Number(radiusKm) || 25,
    notifyAlerts: true,
  };

  db.savedLocations.push(newLoc);
  res.status(201).json(newLoc);
});

apiRouter.delete('/saved-locations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.savedLocations = db.savedLocations.filter((l) => l.id !== id);
  res.json({ success: true });
});

// ----------------------------------------------------------------------------
// DISASTER ALERTS
// ----------------------------------------------------------------------------

apiRouter.get('/alerts', (req: Request, res: Response) => {
  let filtered = [...db.alerts];
  const { category, severity, status, search, lat, lng, radiusKm } = req.query;

  if (category && category !== 'all') {
    filtered = filtered.filter((a) => a.category === category);
  }
  if (severity && severity !== 'all') {
    filtered = filtered.filter((a) => a.severity === severity);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((a) => a.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.affectedArea.toLowerCase().includes(q)
    );
  }
  if (lat && lng && radiusKm) {
    const userCoord = { lat: Number(lat), lng: Number(lng) };
    const r = Number(radiusKm);
    filtered = filtered.filter((a) =>
      isWithinRadius(userCoord, { lat: a.centerLat, lng: a.centerLng }, r + a.radiusKm)
    );
  }

  res.json(filtered);
});

apiRouter.get('/alerts/:id', (req: Request, res: Response) => {
  const alert = db.alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

apiRouter.post('/alerts', (req: Request, res: Response) => {
  const {
    title,
    category,
    severity,
    description,
    issuingAuthority,
    affectedArea,
    centerLat,
    centerLng,
    radiusKm,
    recommendedActions,
    evacuationInstructions,
    expiresAt,
    isSimulated,
  } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, category, and description are required.' });
  }

  const newAlert: DisasterAlert = {
    id: `alt-${Date.now()}`,
    title,
    category,
    severity: severity || 'moderate',
    status: 'published',
    description,
    issuingAuthority: issuingAuthority || 'District Disaster Management Authority',
    sourceIdentifier: `OFFICIAL-${Date.now()}`,
    isOfficial: !isSimulated,
    isSimulated: !!isSimulated,
    issuedAt: new Date().toISOString(),
    expiresAt: expiresAt || new Date(Date.now() + 48 * 3600000).toISOString(),
    affectedArea: affectedArea || 'Regional Area',
    centerLat: Number(centerLat) || 12.9716,
    centerLng: Number(centerLng) || 77.5946,
    radiusKm: Number(radiusKm) || 30,
    recommendedActions: recommendedActions || ['Stay alert and monitor local authorities.'],
    evacuationInstructions: evacuationInstructions || '',
    languagesAvailable: ['en', 'kn', 'hi'],
    updatedAt: new Date().toISOString(),
  };

  db.alerts.unshift(newAlert);

  // Add audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorId: currentUserId,
    actorName: 'Disaster Authority / Admin',
    action: 'CREATE_ALERT',
    entityType: 'disaster_alerts',
    entityId: newAlert.id,
    details: `Alert created: ${newAlert.title}`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(newAlert);
});

apiRouter.put('/alerts/:id', (req: Request, res: Response) => {
  const index = db.alerts.findIndex((a) => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Alert not found' });

  db.alerts[index] = {
    ...db.alerts[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json(db.alerts[index]);
});

apiRouter.post('/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const alert = db.alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  // Record acknowledgement
  res.json({ success: true, message: 'Alert acknowledged by user', alertId: alert.id });
});

apiRouter.get('/alerts/:id/history', (req: Request, res: Response) => {
  const alert = db.alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const history = [
    { timestamp: alert.issuedAt, event: 'Alert issued by ' + alert.issuingAuthority },
    { timestamp: alert.updatedAt, event: 'Alert updated with latest geospatial parameters' },
  ];
  res.json(history);
});

// ----------------------------------------------------------------------------
// SHELTERS & RELIEF RESOURCES
// ----------------------------------------------------------------------------

apiRouter.get('/shelters', (_req: Request, res: Response) => {
  res.json(db.shelters);
});

apiRouter.get('/shelters/nearby', (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  const userLat = Number(lat) || 12.9716;
  const userLng = Number(lng) || 77.5946;

  const withDistances = db.shelters.map((s) => ({
    ...s,
    distanceKm: calculateHaversineDistance({ lat: userLat, lng: userLng }, { lat: s.lat, lng: s.lng }),
  }));

  withDistances.sort((a, b) => a.distanceKm - b.distanceKm);
  res.json(withDistances);
});

apiRouter.get('/shelters/:id', (req: Request, res: Response) => {
  const shelter = db.shelters.find((s) => s.id === req.params.id);
  if (!shelter) return res.status(404).json({ error: 'Shelter not found' });
  res.json(shelter);
});

apiRouter.post('/shelters', (req: Request, res: Response) => {
  const { name, address, district, lat, lng, totalCapacity, contactPhone } = req.body;
  if (!name || !address || !lat || !lng) {
    return res.status(400).json({ error: 'Missing required shelter details.' });
  }

  const newShelter: Shelter = {
    id: `shl-${Date.now()}`,
    name,
    address,
    district: district || 'Central District',
    lat: Number(lat),
    lng: Number(lng),
    contactPhone: contactPhone || '+91 80 2222 3333',
    operatingStatus: 'open',
    totalCapacity: Number(totalCapacity) || 200,
    currentOccupancy: 0,
    hasMedicalSupport: true,
    hasFoodWater: true,
    allowsPets: false,
    familyFriendly: true,
    isAccessible: true,
    verifiedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  db.shelters.push(newShelter);
  res.status(201).json(newShelter);
});

apiRouter.put('/shelters/:id/occupancy', (req: Request, res: Response) => {
  const shelter = db.shelters.find((s) => s.id === req.params.id);
  if (!shelter) return res.status(404).json({ error: 'Shelter not found' });

  const { newOccupancy, notes } = req.body;
  if (newOccupancy === undefined || newOccupancy < 0) {
    return res.status(400).json({ error: 'Valid occupancy count required.' });
  }

  shelter.currentOccupancy = Number(newOccupancy);
  if (shelter.currentOccupancy >= shelter.totalCapacity) {
    shelter.operatingStatus = 'full';
  } else if (shelter.currentOccupancy >= shelter.totalCapacity * 0.85) {
    shelter.operatingStatus = 'near_capacity';
  } else {
    shelter.operatingStatus = 'open';
  }
  shelter.lastUpdated = new Date().toISOString();

  // Log audit
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorId: currentUserId,
    actorName: 'Shelter Manager',
    action: 'UPDATE_SHELTER_OCCUPANCY',
    entityType: 'shelters',
    entityId: shelter.id,
    details: `Updated occupancy to ${newOccupancy} (${notes || 'Routine check'})`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, shelter });
});

apiRouter.get('/resources', (_req: Request, res: Response) => {
  res.json(db.reliefResources);
});

// ----------------------------------------------------------------------------
// SOS & EMERGENCY INCIDENTS
// ----------------------------------------------------------------------------

apiRouter.get('/sos', (_req: Request, res: Response) => {
  const user = db.profiles.find((p) => p.id === currentUserId);
  if (user?.role === 'citizen') {
    // Citizens see their own requests
    return res.json(db.sosRequests.filter((r) => r.userId === currentUserId));
  }
  // Responders and Admins see all requests
  res.json(db.sosRequests);
});

apiRouter.get('/sos/:id', (req: Request, res: Response) => {
  const reqItem = db.sosRequests.find((r) => r.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'SOS incident not found' });
  res.json(reqItem);
});

apiRouter.post('/sos', (req: Request, res: Response) => {
  const { category, description, peopleCount, hasInjuries, lat, lng, addressApprox } = req.body;

  if (!category || !description) {
    return res.status(400).json({ error: 'Category and description are required.' });
  }

  const user = db.profiles.find((p) => p.id === currentUserId) || db.profiles[0];

  // Duplicate check
  const isDup = isDuplicateRequest(
    { userId: user.id, category, timestamp: Date.now() },
    db.sosRequests.map((r) => ({
      userId: r.userId,
      category: r.category,
      timestamp: new Date(r.createdAt).getTime(),
      status: r.status,
    }))
  );

  if (isDup) {
    return res.status(409).json({
      error: 'An active SOS request of this emergency category was already submitted recently. Please track existing incident or contact 112 directly.',
    });
  }

  const priority = classifyPriority(
    category as any,
    Number(peopleCount) || 1,
    !!hasInjuries
  );

  const newSOS: SOSRequest = {
    id: `sos-${Date.now().toString().slice(-6)}`,
    userId: user.id,
    userName: user.fullName,
    userPhone: user.phone,
    category,
    priority,
    status: 'submitted',
    description,
    peopleCount: Number(peopleCount) || 1,
    hasInjuries: !!hasInjuries,
    lat: Number(lat) || user.homeLat || 12.9716,
    lng: Number(lng) || user.homeLng || 77.5946,
    addressApprox: addressApprox || user.homeCity || 'Bengaluru Local Area',
    incidentNotes: [`Emergency SOS request logged at ${new Date().toLocaleTimeString()}.`],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.sosRequests.unshift(newSOS);

  // Add notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'SOS Request Dispatched',
    body: `Your request (${newSOS.id}) is submitted. Incident triage has flagged it as ${newSOS.priority.toUpperCase()} priority.`,
    type: 'sos_status',
    severity: 'critical',
    isRead: false,
    referenceId: newSOS.id,
    createdAt: new Date().toISOString(),
  });

  // Audit
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorId: user.id,
    actorName: user.fullName,
    action: 'CREATE_SOS',
    entityType: 'sos_requests',
    entityId: newSOS.id,
    details: `SOS created: ${newSOS.category} (${newSOS.priority})`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(newSOS);
});

apiRouter.post('/sos/:id/assign', (req: Request, res: Response) => {
  const reqItem = db.sosRequests.find((r) => r.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Incident not found' });

  const { responderId } = req.body;
  const responder = db.responders.find((rsp) => rsp.id === responderId || rsp.profileId === responderId);
  if (!responder) return res.status(404).json({ error: 'Responder not found' });

  reqItem.assignedResponderId = responder.profileId;
  reqItem.assignedResponderName = responder.name;
  reqItem.assignedAgency = responder.agency;
  reqItem.status = 'assigned';
  reqItem.incidentNotes = reqItem.incidentNotes || [];
  reqItem.incidentNotes.push(`Assigned to ${responder.name} (${responder.agency})`);
  reqItem.updatedAt = new Date().toISOString();

  responder.status = 'busy';
  responder.activeIncidentId = reqItem.id;

  res.json({ success: true, incident: reqItem });
});

apiRouter.put('/sos/:id/status', (req: Request, res: Response) => {
  const reqItem = db.sosRequests.find((r) => r.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Incident not found' });

  const { nextStatus, note } = req.body;
  if (!isValidStatusTransition(reqItem.status, nextStatus)) {
    return res.status(400).json({ error: `Invalid status transition from ${reqItem.status} to ${nextStatus}` });
  }

  reqItem.status = nextStatus;
  reqItem.incidentNotes = reqItem.incidentNotes || [];
  if (note) {
    reqItem.incidentNotes.push(`${new Date().toLocaleTimeString()} - ${note}`);
  }
  if (nextStatus === 'resolved') {
    reqItem.resolvedAt = new Date().toISOString();
  }
  reqItem.updatedAt = new Date().toISOString();

  res.json({ success: true, incident: reqItem });
});

apiRouter.post('/sos/:id/cancel', (req: Request, res: Response) => {
  const reqItem = db.sosRequests.find((r) => r.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Incident not found' });

  const { reason } = req.body;
  reqItem.status = 'cancelled';
  reqItem.cancelledReason = reason || 'Cancelled by citizen';
  reqItem.updatedAt = new Date().toISOString();

  res.json({ success: true, incident: reqItem });
});

// ----------------------------------------------------------------------------
// COMMUNITY HAZARD REPORTS
// ----------------------------------------------------------------------------

apiRouter.get('/reports', (req: Request, res: Response) => {
  let list = [...db.reports];
  const { status, category } = req.query;
  if (status && status !== 'all') {
    list = list.filter((r) => r.status === status);
  }
  if (category && category !== 'all') {
    list = list.filter((r) => r.category === category);
  }
  res.json(list);
});

apiRouter.post('/reports', (req: Request, res: Response) => {
  const { category, title, description, lat, lng, address, photoUrl } = req.body;
  if (!category || !title || !description) {
    return res.status(400).json({ error: 'Category, title, and description are required.' });
  }

  const user = db.profiles.find((p) => p.id === currentUserId) || db.profiles[0];

  const newReport: DisasterReport = {
    id: `rep-${Date.now().toString().slice(-6)}`,
    reporterId: user.id,
    reporterName: user.fullName,
    category,
    title,
    description,
    lat: Number(lat) || 12.9716,
    lng: Number(lng) || 77.5946,
    address: address || 'Reported Location, Bengaluru',
    photoUrl: photoUrl || '',
    status: 'submitted',
    upvotes: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.reports.unshift(newReport);
  res.status(201).json(newReport);
});

apiRouter.put('/reports/:id/verify', (req: Request, res: Response) => {
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const { status, adminNotes } = req.body;
  report.status = status;
  if (adminNotes) report.adminNotes = adminNotes;
  report.updatedAt = new Date().toISOString();

  res.json({ success: true, report });
});

apiRouter.post('/reports/:id/upvote', (req: Request, res: Response) => {
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  report.upvotes += 1;
  res.json({ success: true, upvotes: report.upvotes });
});

// ----------------------------------------------------------------------------
// RESPONDERS
// ----------------------------------------------------------------------------

apiRouter.get('/responders', (_req: Request, res: Response) => {
  res.json(db.responders);
});

apiRouter.get('/responders/assignments', (_req: Request, res: Response) => {
  const responderIncidents = db.sosRequests.filter(
    (r) => r.assignedResponderId === currentUserId || r.status === 'submitted'
  );
  res.json(responderIncidents);
});

apiRouter.put('/responders/availability', (req: Request, res: Response) => {
  const responder = db.responders.find((r) => r.profileId === currentUserId);
  if (responder) {
    responder.status = req.body.status || 'available';
    return res.json({ success: true, status: responder.status });
  }
  res.json({ success: true, status: req.body.status });
});

// ----------------------------------------------------------------------------
// FAMILY SAFETY & CHECK-IN
// ----------------------------------------------------------------------------

apiRouter.get('/family', (_req: Request, res: Response) => {
  const group = db.familyGroups[0];
  res.json(group);
});

apiRouter.post('/family/mark-safe', (req: Request, res: Response) => {
  const { status, message, lat, lng } = req.body;
  const group = db.familyGroups[0];
  const member = group.members.find((m) => m.userId === currentUserId);

  if (member) {
    member.status = status || 'safe';
    member.message = message || 'I am safe and accounted for.';
    if (lat && lng) {
      member.lastLat = Number(lat);
      member.lastLng = Number(lng);
    }
    member.updatedAt = new Date().toISOString();
  }

  res.json({ success: true, group });
});

apiRouter.post('/family/request-checkin', (_req: Request, res: Response) => {
  // Broadcast request to group members
  res.json({
    success: true,
    message: 'Check-in request sent to all family members via push and in-app alerts.',
  });
});

// ----------------------------------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------------------------------

apiRouter.get('/notifications', (_req: Request, res: Response) => {
  res.json(db.notifications);
});

apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', (_req: Request, res: Response) => {
  db.notifications.forEach((n) => (n.isRead = true));
  res.json({ success: true });
});

// ----------------------------------------------------------------------------
// AI DISASTER ASSISTANT
// ----------------------------------------------------------------------------

apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const reply = await askDisasterAssistant(prompt, context);
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'AI assistant error' });
  }
});

apiRouter.post('/ai/explain-alert', async (req: Request, res: Response) => {
  const { title, description, language } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Alert title is required.' });
  }

  try {
    const explanation = await explainAlertSimply(title, description || '', language || 'en');
    res.json({ explanation });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to explain alert' });
  }
});

// ----------------------------------------------------------------------------
// ADMIN & SYSTEM OVERVIEW
// ----------------------------------------------------------------------------

apiRouter.get('/admin/analytics', (_req: Request, res: Response) => {
  const stats = {
    totalUsers: db.profiles.length,
    activeAlerts: db.alerts.filter((a) => a.status === 'published').length,
    criticalAlerts: db.alerts.filter((a) => a.status === 'published' && a.severity === 'critical').length,
    incomingSos: db.sosRequests.filter((r) => r.status === 'submitted').length,
    activeIncidents: db.sosRequests.filter((r) => r.status !== 'resolved' && r.status !== 'cancelled').length,
    pendingReports: db.reports.filter((r) => r.status === 'submitted' || r.status === 'under_review').length,
    totalShelters: db.shelters.length,
    shelterOccupancyRate: Math.round(
      (db.shelters.reduce((acc, s) => acc + s.currentOccupancy, 0) /
        db.shelters.reduce((acc, s) => acc + s.totalCapacity, 1)) *
        100
    ),
    respondersOnline: db.responders.filter((r) => r.status !== 'off_duty').length,
  };
  res.json(stats);
});

apiRouter.get('/admin/users', (_req: Request, res: Response) => {
  res.json(db.profiles);
});

apiRouter.get('/admin/audit-logs', (_req: Request, res: Response) => {
  res.json(db.auditLogs);
});

apiRouter.get('/admin/data-sources', (_req: Request, res: Response) => {
  res.json(db.dataSources);
});

apiRouter.post('/admin/data-sources/:id/sync', (req: Request, res: Response) => {
  const ds = db.dataSources.find((d) => d.id === req.params.id);
  if (ds) {
    ds.lastSyncedAt = new Date().toISOString();
  }
  res.json({ success: true, dataSource: ds });
});

apiRouter.get('/app-settings', (_req: Request, res: Response) => {
  res.json(db.appSettings);
});
