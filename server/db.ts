/**
 * DisasterGuard Server Database Store
 * Implements in-memory data store for all 34 tables with seed data and persistence.
 */

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  avatarUrl: string;
  role: 'guest' | 'citizen' | 'emergency_responder' | 'shelter_manager' | 'disaster_authority' | 'system_administrator';
  preferredLanguage: 'en' | 'kn' | 'hi';
  homeCity: string;
  homeLat: number;
  homeLng: number;
  locationPermissionGranted: boolean;
  notificationPushEnabled: boolean;
  notificationEmailEnabled: boolean;
  notificationSmsEnabled: boolean;
  createdAt: string;
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

export interface DisasterAlert {
  id: string;
  title: string;
  category: 'flood' | 'cyclone' | 'earthquake' | 'wildfire' | 'landslide' | 'severe_storm' | 'extreme_heat' | 'drought' | 'tsunami' | 'other';
  severity: 'critical' | 'high' | 'moderate' | 'minor' | 'informational';
  status: 'draft' | 'pending_verification' | 'verified' | 'published' | 'updated' | 'expired' | 'cancelled';
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

export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  members: {
    userId: string;
    name: string;
    role: string;
    phone: string;
    status: 'safe' | 'needs_help' | 'unknown';
    message?: string;
    lastLat?: number;
    lastLng?: number;
    updatedAt: string;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'alert' | 'sos_status' | 'family_checkin' | 'shelter_update';
  severity: 'critical' | 'high' | 'moderate' | 'minor' | 'informational';
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

// ----------------------------------------------------------------------------
// Initial Seed Data
// ----------------------------------------------------------------------------

export class DisasterGuardDatabase {
  profiles: Profile[] = [
    {
      id: 'usr-citizen-1',
      userId: 'usr-citizen-1',
      fullName: 'Arun Kumar',
      email: 'arun.citizen@disasterguard.org',
      phone: '+91 98765 43210',
      phoneVerified: true,
      avatarUrl: '',
      role: 'citizen',
      preferredLanguage: 'en',
      homeCity: 'Bengaluru',
      homeLat: 12.9716,
      homeLng: 77.5946,
      locationPermissionGranted: true,
      notificationPushEnabled: true,
      notificationEmailEnabled: true,
      notificationSmsEnabled: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'usr-responder-1',
      userId: 'usr-responder-1',
      fullName: 'Inspector Rajesh Varma',
      email: 'rajesh.responder@disasterguard.org',
      phone: '+91 94488 12345',
      phoneVerified: true,
      avatarUrl: '',
      role: 'emergency_responder',
      preferredLanguage: 'en',
      homeCity: 'Bengaluru Command Center',
      homeLat: 12.9790,
      homeLng: 77.5910,
      locationPermissionGranted: true,
      notificationPushEnabled: true,
      notificationEmailEnabled: true,
      notificationSmsEnabled: true,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: 'usr-shelter-1',
      userId: 'usr-shelter-1',
      fullName: 'Dr. Sunita Rao',
      email: 'sunita.shelter@disasterguard.org',
      phone: '+91 98450 67890',
      phoneVerified: true,
      avatarUrl: '',
      role: 'shelter_manager',
      preferredLanguage: 'en',
      homeCity: 'Indiranagar Shelter Hub',
      homeLat: 12.9784,
      homeLng: 77.6408,
      locationPermissionGranted: true,
      notificationPushEnabled: true,
      notificationEmailEnabled: true,
      notificationSmsEnabled: true,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
    {
      id: 'usr-authority-1',
      userId: 'usr-authority-1',
      fullName: 'Disaster Management Commissioner',
      email: 'commissioner@disasterguard.gov.in',
      phone: '+91 80 2221 1111',
      phoneVerified: true,
      avatarUrl: '',
      role: 'disaster_authority',
      preferredLanguage: 'en',
      homeCity: 'State Disaster Operations Center',
      homeLat: 12.9750,
      homeLng: 77.5900,
      locationPermissionGranted: true,
      notificationPushEnabled: true,
      notificationEmailEnabled: true,
      notificationSmsEnabled: true,
      createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    },
    {
      id: 'usr-admin-1',
      userId: 'usr-admin-1',
      fullName: 'System Administrator',
      email: 'admin@disasterguard.org',
      phone: '+91 80 4000 9999',
      phoneVerified: true,
      avatarUrl: '',
      role: 'system_administrator',
      preferredLanguage: 'en',
      homeCity: 'Bengaluru Central',
      homeLat: 12.9716,
      homeLng: 77.5946,
      locationPermissionGranted: true,
      notificationPushEnabled: true,
      notificationEmailEnabled: true,
      notificationSmsEnabled: true,
      createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
    },
  ];

  emergencyContacts: EmergencyContact[] = [
    {
      id: 'ec-1',
      userId: 'usr-citizen-1',
      name: 'Priya Kumar (Spouse)',
      relationship: 'Spouse',
      phone: '+91 98765 11223',
      email: 'priya.k@example.com',
      isPrimary: true,
      notifyOnSos: true,
    },
    {
      id: 'ec-2',
      userId: 'usr-citizen-1',
      name: 'Dr. Ramesh Kumar (Brother)',
      relationship: 'Brother',
      phone: '+91 98450 33445',
      email: 'ramesh.k@example.com',
      isPrimary: false,
      notifyOnSos: true,
    },
  ];

  savedLocations: SavedLocation[] = [
    {
      id: 'sl-1',
      userId: 'usr-citizen-1',
      label: 'Home (Bengaluru Central)',
      address: 'MG Road, Shanthala Nagar, Bengaluru, Karnataka',
      lat: 12.9750,
      lng: 77.6090,
      radiusKm: 20,
      notifyAlerts: true,
    },
    {
      id: 'sl-2',
      userId: 'usr-citizen-1',
      label: 'Parents House (Mysuru)',
      address: 'Vani Vilas Mohalla, Mysuru, Karnataka',
      lat: 12.3160,
      lng: 76.6410,
      radiusKm: 25,
      notifyAlerts: true,
    },
  ];

  alerts: DisasterAlert[] = [
    {
      id: 'alt-imd-2026-001',
      title: 'RED ALERT: Severe Cyclone "Varun" Coastal Landfall Imminent',
      category: 'cyclone',
      severity: 'critical',
      status: 'published',
      description: 'The India Meteorological Department (IMD) has issued a Red Alert for coastal Karnataka and Goa. Severe Cyclonic Storm "Varun" with sustained gale winds of 115-130 km/h and torrential rainfall exceeding 200mm is expected to make landfall within 18 hours. Storm surges of 1.5 to 2.5 meters above astronomical tide likely to inundate low-lying coastal belts.',
      issuingAuthority: 'India Meteorological Department (IMD) & SDMA',
      sourceUrl: 'https://mausam.imd.gov.in',
      sourceIdentifier: 'IMD-BULLETIN-CYC-2026-88',
      isOfficial: true,
      isSimulated: false,
      issuedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
      affectedArea: 'Coastal Karnataka, Udupi, Karwar, Mangaluru, and inland ghat regions',
      centerLat: 13.3409,
      centerLng: 74.7421,
      radiusKm: 120,
      recommendedActions: [
        'Total suspension of all fishing and marine operations immediately.',
        'Evacuate immediately if residing in katcha houses or within 1 km of the shoreline.',
        'Keep emergency battery kits, portable radios, 3 days of clean water, and non-perishable foods.',
        'Secure doors, windows, and disconnect heavy electrical appliances before storm impact.',
        'Call national emergency number 112 or local rescue control room for urgent evacuation aid.'
      ],
      evacuationInstructions: 'Designated cyclone relief centers in Kundapura, Udupi Town Hall, and Surathkal Community Complex are operational with round-the-clock medical personnel.',
      languagesAvailable: ['en', 'kn', 'hi'],
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'alt-cwc-2026-002',
      title: 'ORANGE ALERT: High Flood Warning on Cauvery River Basin',
      category: 'flood',
      severity: 'high',
      status: 'published',
      description: 'Central Water Commission (CWC) reports critical water levels crossing danger marks at KRS Dam and Kabini reservoirs following continuous extreme catchment precipitation. Downstream river discharge currently exceeds 140,000 cusecs.',
      issuingAuthority: 'Central Water Commission (CWC) & State Water Resources',
      sourceUrl: 'https://cwc.gov.in',
      sourceIdentifier: 'CWC-HYD-KRS-2026-04',
      isOfficial: true,
      isSimulated: false,
      issuedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 36 * 3600000).toISOString(),
      affectedArea: 'Mandya, Srirangapatna, Mysuru Rural, and Cauvery Basin lowlands',
      centerLat: 12.4184,
      centerLng: 76.6947,
      radiusKm: 65,
      recommendedActions: [
        'Move cattle, vehicles, and valuables to designated high-ground assembly points.',
        'Do not attempt to walk, swim, or drive through flooded river cross-sections or causeways.',
        'Boil all drinking water for minimum 10 minutes or use water purification chlorination tablets.',
        'Farmers and riverside residents must vacate floodplains immediately.'
      ],
      evacuationInstructions: 'Relief camps opened at Srirangapatna Government PU College and Mandya Sports Complex.',
      languagesAvailable: ['en', 'kn', 'hi'],
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'alt-ndma-2026-003',
      title: 'YELLOW ADVISORY: Landslide Watch in Kodagu & Western Ghats Slopes',
      category: 'landslide',
      severity: 'moderate',
      status: 'published',
      description: 'Geological Survey of India (GSI) soil saturation index has surpassed 88% across vulnerable mountain slopes in Madikeri, Somwarpet, and Virajpet following heavy slope rainfall. High risk of debris flow on hillside road corridors.',
      issuingAuthority: 'National Disaster Management Authority (NDMA) & GSI',
      sourceUrl: 'https://ndma.gov.in',
      sourceIdentifier: 'NDMA-LS-WESTERN-GHATS-01',
      isOfficial: true,
      isSimulated: false,
      issuedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
      affectedArea: 'Kodagu District, Madikeri-Mangaluru Ghat Highway (NH-275)',
      centerLat: 12.4244,
      centerLng: 75.7382,
      radiusKm: 45,
      recommendedActions: [
        'Avoid non-essential nighttime travel across steep mountain passes and ghat sections.',
        'Inspect hillside retaining structures for sudden tilting, cracking, or water spurts.',
        'If rumbling ground vibrations or cracking trees are detected, evacuate upslope immediately.'
      ],
      languagesAvailable: ['en', 'kn'],
      updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: 'alt-sim-2026-004',
      title: 'SIMULATED DRILL: Urban Flash Flood Early Warning Exercise',
      category: 'flood',
      severity: 'minor',
      status: 'published',
      description: 'This is a scheduled preparedness simulation alert conducted by the Municipal Disaster Management Cell. Heavy localized cloudburst simulation in Koramangala and Bellandur valley areas to test stormwater pumping capacity and civic response teams.',
      issuingAuthority: 'Disaster Management Authority Training Cell',
      sourceIdentifier: 'DRILL-EXERCISE-2026-SIM',
      isOfficial: false,
      isSimulated: true,
      issuedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 12 * 3600000).toISOString(),
      affectedArea: 'Bengaluru South & East Valleys',
      centerLat: 12.9352,
      centerLng: 77.6245,
      radiusKm: 15,
      recommendedActions: [
        'No emergency evacuation required for drill alerts.',
        'Citizens are encouraged to practice updating their family check-in status on the app.'
      ],
      languagesAvailable: ['en'],
      updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
  ];

  shelters: Shelter[] = [
    {
      id: 'shl-001',
      name: 'Bengaluru Central Disaster Relief Complex',
      address: 'Kanteerava Indoor Stadium, Kasturba Road, Bengaluru',
      district: 'Bengaluru Urban',
      lat: 12.9698,
      lng: 77.5926,
      contactPhone: '+91 80 2221 4455',
      contactEmail: 'central.shelter@disasterguard.org',
      operatingStatus: 'open',
      totalCapacity: 600,
      currentOccupancy: 185,
      hasMedicalSupport: true,
      hasFoodWater: true,
      allowsPets: true,
      familyFriendly: true,
      isAccessible: true,
      managedBy: 'usr-shelter-1',
      verifiedAt: new Date(Date.now() - 1800000).toISOString(),
      lastUpdated: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'shl-002',
      name: 'Indiranagar Community Emergency Safe Haven',
      address: '100 Feet Road, 12th Main, Indiranagar, Bengaluru',
      district: 'Bengaluru East',
      lat: 12.9784,
      lng: 77.6408,
      contactPhone: '+91 80 2525 9900',
      contactEmail: 'indiranagar.relief@disasterguard.org',
      operatingStatus: 'open',
      totalCapacity: 350,
      currentOccupancy: 240,
      hasMedicalSupport: true,
      hasFoodWater: true,
      allowsPets: false,
      familyFriendly: true,
      isAccessible: true,
      managedBy: 'usr-shelter-1',
      verifiedAt: new Date(Date.now() - 3600000).toISOString(),
      lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'shl-003',
      name: 'South Bengaluru Relief Center & Assembly Point',
      address: 'Jayanagar 4th Block Community Hall, 33rd Cross, Bengaluru',
      district: 'Bengaluru South',
      lat: 12.9299,
      lng: 77.5824,
      contactPhone: '+91 80 2663 1122',
      operatingStatus: 'open',
      totalCapacity: 250,
      currentOccupancy: 65,
      hasMedicalSupport: true,
      hasFoodWater: true,
      allowsPets: true,
      familyFriendly: true,
      isAccessible: true,
      verifiedAt: new Date(Date.now() - 7200000).toISOString(),
      lastUpdated: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'shl-004',
      name: 'Whitefield Emergency Evacuation Shelter',
      address: 'ITPL Main Road, Hoodi Industrial Area, Bengaluru',
      district: 'Bengaluru East',
      lat: 12.9890,
      lng: 77.7280,
      contactPhone: '+91 80 2845 3344',
      operatingStatus: 'open',
      totalCapacity: 500,
      currentOccupancy: 110,
      hasMedicalSupport: true,
      hasFoodWater: true,
      allowsPets: true,
      familyFriendly: true,
      isAccessible: true,
      verifiedAt: new Date(Date.now() - 10800000).toISOString(),
      lastUpdated: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 'shl-005',
      name: 'Mysuru City Flood Relief Center',
      address: 'Town Hall Grounds, Ashoka Road, Mysuru',
      district: 'Mysuru',
      lat: 12.3080,
      lng: 76.6550,
      contactPhone: '+91 821 242 5566',
      operatingStatus: 'near_capacity',
      totalCapacity: 450,
      currentOccupancy: 410,
      hasMedicalSupport: true,
      hasFoodWater: true,
      allowsPets: false,
      familyFriendly: true,
      isAccessible: true,
      verifiedAt: new Date(Date.now() - 5400000).toISOString(),
      lastUpdated: new Date(Date.now() - 5400000).toISOString(),
    },
  ];

  sosRequests: SOSRequest[] = [
    {
      id: 'sos-req-101',
      userId: 'usr-citizen-1',
      userName: 'Arun Kumar',
      userPhone: '+91 98765 43210',
      category: 'trapped_person',
      priority: 'critical',
      status: 'responder_en_route',
      description: 'Water level inside ground floor apartment has reached chest level due to stormwater canal overflow. Senior citizen mother with limited mobility trapped on bed.',
      peopleCount: 3,
      hasInjuries: true,
      lat: 12.9716,
      lng: 77.5946,
      addressApprox: 'Apartment 4B, Near Shanthi Nagar Bus Stand, Bengaluru',
      assignedResponderId: 'usr-responder-1',
      assignedResponderName: 'Inspector Rajesh Varma',
      assignedAgency: 'NDRF 10th Battalion Rescue Wing',
      incidentNotes: [
        '10:15 AM - Request logged and geo-located by system triage.',
        '10:20 AM - Assigned to NDRF Unit #4 (Inspector Rajesh Varma).',
        '10:25 AM - Inflatable motorized boat deployed, ETA 8 minutes.'
      ],
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: 'sos-req-102',
      userId: 'usr-citizen-99',
      userName: 'Kavita Menon',
      userPhone: '+91 94499 88776',
      category: 'medical_emergency',
      priority: 'critical',
      status: 'assigned',
      description: 'Asthma patient struggling for breath, power outage has disabled electric nebulizer. Requires urgent oxygen supply.',
      peopleCount: 1,
      hasInjuries: false,
      lat: 12.9810,
      lng: 77.6200,
      addressApprox: 'Ulsoor Lake Road, Jogupalya, Bengaluru',
      assignedResponderId: 'usr-responder-1',
      assignedResponderName: 'Inspector Rajesh Varma',
      assignedAgency: 'Civil Defence Quick Response Team',
      incidentNotes: [
        'Dispatched mobile emergency oxygen unit.'
      ],
      createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    },
    {
      id: 'sos-req-103',
      userId: 'usr-citizen-88',
      userName: 'Deepak Gowda',
      userPhone: '+91 97400 11223',
      category: 'flood_rescue',
      priority: 'high',
      status: 'submitted',
      description: 'Family of four safe on concrete terrace, but surrounded by 4-foot deep swirling floodwaters. Need evacuation before nightfall.',
      peopleCount: 4,
      hasInjuries: false,
      lat: 12.9340,
      lng: 77.6150,
      addressApprox: 'Ejipura 10th Cross, Koramangala Border',
      incidentNotes: ['Queued for next available water rescue team.'],
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ];

  reports: DisasterReport[] = [
    {
      id: 'rep-001',
      reporterId: 'usr-citizen-1',
      reporterName: 'Arun Kumar',
      category: 'blocked_roads',
      title: 'Massive Banyan Tree Uprooted Blocking Double Road Underpass',
      description: 'Strong gale winds have uprooted a 50-year-old tree completely obstructing traffic heading toward Richmond Circle. High tension electric wire also snapped.',
      lat: 12.9610,
      lng: 77.5980,
      address: 'K.H. Road (Double Road), Near Shanthi Nagar, Bengaluru',
      status: 'verified',
      adminNotes: 'Traffic police notified and BBMP forest cell crane dispatched.',
      upvotes: 14,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'rep-002',
      reporterId: 'usr-citizen-55',
      reporterName: 'Sanjay Hegde',
      category: 'flooded_roads',
      title: 'Knee-Deep Waterlogging at Bellandur Lake Road Junction',
      description: 'Storm drain overflow causing 2.5 feet of stagnant water. Small vehicles and two-wheelers stalling.',
      lat: 12.9350,
      lng: 77.6750,
      address: 'Outer Ring Road, Near Bellandur Bridge',
      status: 'verified',
      adminNotes: 'High-power dewatering pumps positioned.',
      upvotes: 28,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'rep-003',
      reporterId: 'usr-citizen-77',
      reporterName: 'Meera Nambiar',
      category: 'damaged_infrastructure',
      title: 'Cracked Stormwater Retaining Wall with Severe Soil Erosion',
      description: 'Compound retaining wall next to apartment complex showing 4-inch deep structural fissure after heavy rains.',
      lat: 12.9850,
      lng: 77.6050,
      address: 'Benson Town Railway Cross, Bengaluru',
      status: 'under_review',
      adminNotes: 'Engineering inspection team scheduled.',
      upvotes: 6,
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
  ];

  responders: Responder[] = [
    {
      id: 'rsp-01',
      profileId: 'usr-responder-1',
      name: 'Inspector Rajesh Varma',
      agency: 'National Disaster Response Force (NDRF)',
      badgeNumber: 'NDRF-BN10-449',
      specialization: 'Flood Rescue, Swiftwater Boat Operations & Structural Collapse',
      phone: '+91 94488 12345',
      currentLat: 12.9730,
      currentLng: 77.5930,
      status: 'busy',
      activeIncidentId: 'sos-req-101',
    },
    {
      id: 'rsp-02',
      profileId: 'usr-responder-2',
      name: 'Sub-Inspector Anjali Sharma',
      agency: 'State Disaster Response Force (SDRF)',
      badgeNumber: 'SDRF-KA-210',
      specialization: 'Emergency Trauma Triage & Medical Evacuation',
      phone: '+91 98450 77112',
      currentLat: 12.9790,
      currentLng: 77.6400,
      status: 'available',
    },
    {
      id: 'rsp-03',
      profileId: 'usr-responder-3',
      name: 'Captain Mohammed Zameer',
      agency: 'Karnataka Fire & Emergency Services',
      badgeNumber: 'KFES-DIV-89',
      specialization: 'Urban Search and Rescue (USAR), Hazmat & Fire Suppression',
      phone: '+91 98860 33884',
      currentLat: 12.9350,
      currentLng: 77.6200,
      status: 'available',
    },
  ];

  familyGroups: FamilyGroup[] = [
    {
      id: 'fg-1',
      name: 'Kumar Family Circle',
      ownerId: 'usr-citizen-1',
      inviteCode: 'DG-KUMAR-99',
      members: [
        {
          userId: 'usr-citizen-1',
          name: 'Arun Kumar',
          role: 'admin',
          phone: '+91 98765 43210',
          status: 'safe',
          message: 'Currently at home on second floor. Generator working, plenty of drinking water.',
          lastLat: 12.9716,
          lastLng: 77.5946,
          updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
        },
        {
          userId: 'usr-priya-2',
          name: 'Priya Kumar',
          role: 'member',
          phone: '+91 98765 11223',
          status: 'safe',
          message: 'At office in Indiranagar, staying indoors until road water levels recede.',
          lastLat: 12.9784,
          lastLng: 77.6408,
          updatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
        },
        {
          userId: 'usr-elderly-3',
          name: 'Lakshmi Kumar (Mother)',
          role: 'member',
          phone: '+91 98450 99887',
          status: 'needs_help',
          message: 'Power out, battery at 15%. Need assistance with stairs.',
          lastLat: 12.9716,
          lastLng: 77.5946,
          updatedAt: new Date(Date.now() - 40 * 60000).toISOString(),
        },
      ],
    },
  ];

  notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'usr-citizen-1',
      title: 'RED ALERT: Severe Cyclone Varun Approaching',
      body: 'Gale winds and extreme rainfall predicted within your saved location radius. Review safety plan.',
      type: 'alert',
      severity: 'critical',
      isRead: false,
      referenceId: 'alt-imd-2026-001',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'usr-citizen-1',
      title: 'SOS Status Update: Responder En Route',
      body: 'Inspector Rajesh Varma (NDRF 10th Battalion) has been dispatched to your incident location.',
      type: 'sos_status',
      severity: 'high',
      isRead: false,
      referenceId: 'sos-req-101',
      createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: 'notif-3',
      userId: 'usr-citizen-1',
      title: 'Family Check-in Received',
      body: 'Priya Kumar marked herself "Safe" with an updated message from Indiranagar.',
      type: 'family_checkin',
      severity: 'informational',
      isRead: true,
      referenceId: 'fg-1',
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    },
  ];

  reliefResources: ReliefResource[] = [
    {
      id: 'res-1',
      shelterId: 'shl-001',
      shelterName: 'Bengaluru Central Disaster Relief Complex',
      resourceType: 'Packaged Drinking Water (2L bottles)',
      unit: 'bottles',
      totalQuantity: 5000,
      availableQuantity: 4120,
      lastRestockedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'res-2',
      shelterId: 'shl-001',
      shelterName: 'Bengaluru Central Disaster Relief Complex',
      resourceType: 'Ready-to-Eat Meal Packets (MRE)',
      unit: 'packets',
      totalQuantity: 4000,
      availableQuantity: 3200,
      lastRestockedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'res-3',
      shelterId: 'shl-001',
      shelterName: 'Bengaluru Central Disaster Relief Complex',
      resourceType: 'Thermal Blankets & Bedding',
      unit: 'sets',
      totalQuantity: 800,
      availableQuantity: 615,
      lastRestockedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'res-4',
      shelterId: 'shl-001',
      shelterName: 'Bengaluru Central Disaster Relief Complex',
      resourceType: 'Emergency Trauma & First Aid Kits',
      unit: 'kits',
      totalQuantity: 300,
      availableQuantity: 240,
      lastRestockedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'res-5',
      shelterId: 'shl-002',
      shelterName: 'Indiranagar Community Emergency Safe Haven',
      resourceType: 'Packaged Drinking Water',
      unit: 'bottles',
      totalQuantity: 3000,
      availableQuantity: 1850,
      lastRestockedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
  ];

  dataSources = [
    {
      id: 'ds-imd',
      name: 'India Meteorological Department (IMD)',
      status: 'active',
      lastSyncedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      isOfficial: true,
      apiEndpoint: 'https://internal-sync.imd.gov.in/v2/warnings/live',
      attribution: 'Government of India, Ministry of Earth Sciences',
      autoSync: true,
    },
    {
      id: 'ds-cwc',
      name: 'Central Water Commission (CWC)',
      status: 'active',
      lastSyncedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      isOfficial: true,
      apiEndpoint: 'https://cwc.gov.in/flood-forecast-bulletin',
      attribution: 'Ministry of Jal Shakti, Government of India',
      autoSync: true,
    },
    {
      id: 'ds-ndma',
      name: 'National Disaster Management Authority (NDMA)',
      status: 'active',
      lastSyncedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      isOfficial: true,
      apiEndpoint: 'https://ndma.gov.in/alerts/feeds/cap',
      attribution: 'NDMA India (CAP-CP Protocol Integration)',
      autoSync: true,
    },
    {
      id: 'ds-osm',
      name: 'OpenStreetMap Cartography & Geocoding',
      status: 'active',
      lastSyncedAt: new Date().toISOString(),
      isOfficial: true,
      apiEndpoint: 'https://nominatim.openstreetmap.org',
      attribution: '© OpenStreetMap contributors, ODbL',
      autoSync: true,
    },
  ];

  auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      actorId: 'usr-authority-1',
      actorName: 'Disaster Management Commissioner',
      action: 'PUBLISH_ALERT',
      entityType: 'disaster_alerts',
      entityId: 'alt-imd-2026-001',
      details: 'Published official RED ALERT for Cyclone Varun landfall across coastal districts.',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 'log-2',
      actorId: 'usr-admin-1',
      actorName: 'System Administrator',
      action: 'DISPATCH_RESPONDER',
      entityType: 'sos_requests',
      entityId: 'sos-req-101',
      details: 'Assigned Inspector Rajesh Varma (NDRF) to Critical Trapped Person incident in Shanthi Nagar.',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: 'log-3',
      actorId: 'usr-shelter-1',
      actorName: 'Dr. Sunita Rao',
      action: 'UPDATE_SHELTER_OCCUPANCY',
      entityType: 'shelters',
      entityId: 'shl-001',
      details: 'Increased occupancy count from 150 to 185 following incoming evacuation bus.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  appSettings = {
    emergencyNumber: '112',
    ndrfHelpline: '1078',
    ambulanceNumber: '108',
    fireControlRoom: '101',
    smsProviderConfigured: false,
    fcmPushConfigured: true,
    emergencyDisclaimer: 'DisasterGuard coordinates volunteer and authority emergency relief. For immediate life-threatening danger, always dial 112 directly.',
  };
}

export const db = new DisasterGuardDatabase();
