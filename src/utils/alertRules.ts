/**
 * DisasterGuard Alert Management Rules
 */

export type AlertSeverity = 'critical' | 'high' | 'moderate' | 'minor' | 'informational';

export type AlertStatus =
  | 'draft'
  | 'pending_verification'
  | 'verified'
  | 'published'
  | 'updated'
  | 'expired'
  | 'cancelled';

export interface AlertData {
  id: string;
  title: string;
  category: string;
  severity: AlertSeverity;
  status: AlertStatus;
  issuedAt: string;
  expiresAt: string;
  affectedArea: string;
  isSimulated?: boolean;
}

const SEVERITY_WEIGHTS: Record<AlertSeverity, number> = {
  critical: 5,
  high: 4,
  moderate: 3,
  minor: 2,
  informational: 1,
};

/**
 * Returns numeric weight for comparing and sorting alert severity.
 */
export function getSeverityWeight(severity: AlertSeverity): number {
  return SEVERITY_WEIGHTS[severity] || 0;
}

/**
 * Checks if an alert is currently active (published/updated, not expired or cancelled).
 */
export function isAlertActive(alert: AlertData, nowIso: string = new Date().toISOString()): boolean {
  if (alert.status !== 'published' && alert.status !== 'updated') {
    return false;
  }
  const now = new Date(nowIso).getTime();
  const expiry = new Date(alert.expiresAt).getTime();
  return expiry > now;
}

/**
 * Sorts alerts by severity descending (most critical first), then by issue time descending.
 */
export function sortAlertsByUrgency(alerts: AlertData[]): AlertData[] {
  return [...alerts].sort((a, b) => {
    const weightDiff = getSeverityWeight(b.severity) - getSeverityWeight(a.severity);
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
  });
}
