/**
 * DisasterGuard SOS Triage and Incident Management Rules
 */

export type EmergencyCategory =
  | 'trapped_person'
  | 'medical_emergency'
  | 'flood_rescue'
  | 'fire_related'
  | 'missing_person'
  | 'food_water_assistance'
  | 'shelter_assistance'
  | 'other';

export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'submitted'
  | 'acknowledged'
  | 'assigned'
  | 'responder_en_route'
  | 'in_progress'
  | 'resolved'
  | 'cancelled';

/**
 * Classifies the priority level of an SOS request based on category, reported severity, and vulnerable persons count.
 */
export function classifyPriority(
  category: EmergencyCategory,
  reportedPeopleCount: number = 1,
  hasInjuriesOrTrapped: boolean = false
): IncidentPriority {
  if (
    category === 'trapped_person' ||
    category === 'medical_emergency' ||
    hasInjuriesOrTrapped ||
    reportedPeopleCount >= 5
  ) {
    return 'critical';
  }

  if (category === 'flood_rescue' || category === 'fire_related') {
    return 'high';
  }

  if (category === 'missing_person' || category === 'shelter_assistance') {
    return 'medium';
  }

  return 'low';
}

/**
 * Checks if a status transition is valid according to the incident lifecycle:
 * submitted -> acknowledged -> assigned -> responder_en_route -> in_progress -> resolved
 * or cancelled from any non-resolved state.
 */
export function isValidStatusTransition(
  current: IncidentStatus,
  next: IncidentStatus
): boolean {
  if (current === next) return true;
  if (current === 'resolved') return false; // resolved is terminal
  if (next === 'cancelled') return true;

  const order: IncidentStatus[] = [
    'submitted',
    'acknowledged',
    'assigned',
    'responder_en_route',
    'in_progress',
    'resolved'
  ];

  const currentIndex = order.indexOf(current);
  const nextIndex = order.indexOf(next);

  // Can move forward or reassign if currently assigned/in-progress
  return nextIndex > currentIndex || (next === 'assigned' && current === 'responder_en_route');
}

/**
 * Detects whether an SOS request is a duplicate of a recent pending request from the same user or location.
 */
export function isDuplicateRequest(
  newRequest: { userId: string; category: string; timestamp: number },
  existingRequests: Array<{ userId: string; category: string; timestamp: number; status: IncidentStatus }>,
  timeWindowMs: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  return existingRequests.some((req) => {
    const isSameUser = req.userId === newRequest.userId;
    const isSameCategory = req.category === newRequest.category;
    const isRecent = Math.abs(newRequest.timestamp - req.timestamp) < timeWindowMs;
    const isActive = req.status !== 'resolved' && req.status !== 'cancelled';
    return isSameUser && isSameCategory && isRecent && isActive;
  });
}
