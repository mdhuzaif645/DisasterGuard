export type UserRole =
  | 'guest'
  | 'citizen'
  | 'emergency_responder'
  | 'shelter_manager'
  | 'disaster_authority'
  | 'system_administrator';

export type LanguageCode = 'en' | 'kn' | 'hi';

export type AlertSeverity = 'critical' | 'high' | 'moderate' | 'minor' | 'informational';
export type AlertStatus = 'draft' | 'pending_verification' | 'verified' | 'published' | 'updated' | 'expired' | 'cancelled';

export interface Alert {
  id: string;
  title: string;
  category: 'flood' | 'cyclone' | 'earthquake' | 'wildfire' | 'landslide' | 'severe_storm' | 'extreme_heat' | 'drought' | 'tsunami' | 'other';
  severity: AlertSeverity;
  status: AlertStatus;
  description: string;
  issuingAuthority: string;
  sourceUrl?: string;
  sourceIdentifier: string;
  isOfficial: boolean;
  isSimulated: boolean;
  issuedAt: string;
  expiresAt: string;
  affectedArea: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  recommendedActions: string[];
  evacuationInstructions?: string;
  languagesAvailable: string[];
  updatedAt: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  contactPhone: string;
  contactEmail?: string;
  operatingStatus: 'open' | 'near_capacity' | 'full' | 'temporarily_closed';
  totalCapacity: number;
  currentOccupancy: number;
  hasMedicalSupport: boolean;
  hasFoodWater: boolean;
  allowsPets: boolean;
  familyFriendly: boolean;
  isAccessible: boolean;
  managedBy?: string;
  verifiedAt: string;
  lastUpdated: string;
  distanceKm?: number;
}

export interface SOSRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'submitted' | 'acknowledged' | 'assigned' | 'responder_en_route' | 'in_progress' | 'resolved' | 'cancelled';
  description: string;
  peopleCount: number;
  hasInjuries: boolean;
  lat: number;
  lng: number;
  addressApprox: string;
  assignedResponderId?: string;
  assignedResponderName?: string;
  assignedAgency?: string;
  incidentNotes?: string[];
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface DisasterReport {
  id: string;
  reporterId: string;
  reporterName: string;
  category: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  photoUrl?: string;
  status: 'submitted' | 'under_review' | 'verified' | 'rejected' | 'resolved';
  adminNotes?: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Responder {
  id: string;
  profileId: string;
  name: string;
  agency: string;
  badgeNumber: string;
  specialization: string;
  phone: string;
  currentLat: number;
  currentLng: number;
  status: 'available' | 'busy' | 'off_duty';
  activeIncidentId?: string;
}

export interface FamilyMember {
  userId: string;
  name: string;
  role: string;
  phone: string;
  status: 'safe' | 'needs_help' | 'unknown';
  message?: string;
  lastLat?: number;
  lastLng?: number;
  updatedAt: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  members: FamilyMember[];
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notifyOnSos: boolean;
}

export interface SavedLocation {
  id: string;
  userId: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  notifyAlerts: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'alert' | 'sos_status' | 'family_checkin' | 'shelter_update';
  severity: AlertSeverity;
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
}

export interface ReliefResource {
  id: string;
  shelterId: string;
  shelterName: string;
  resourceType: string;
  unit: string;
  totalQuantity: number;
  availableQuantity: number;
  lastRestockedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
}
