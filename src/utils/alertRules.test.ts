import test from 'node:test';
import assert from 'node:assert/strict';
import { getSeverityWeight, isAlertActive, sortAlertsByUrgency, AlertData } from './alertRules';

test('getSeverityWeight orders critical > high > moderate > minor > informational', () => {
  assert.ok(getSeverityWeight('critical') > getSeverityWeight('high'));
  assert.ok(getSeverityWeight('high') > getSeverityWeight('moderate'));
  assert.ok(getSeverityWeight('moderate') > getSeverityWeight('minor'));
  assert.ok(getSeverityWeight('minor') > getSeverityWeight('informational'));
});

test('isAlertActive correctly checks status and expiration timestamp', () => {
  const activeAlert: AlertData = {
    id: 'a1',
    title: 'Flash Flood Warning',
    category: 'flood',
    severity: 'critical',
    status: 'published',
    issuedAt: '2026-11-01T10:00:00Z',
    expiresAt: '2026-11-02T10:00:00Z',
    affectedArea: 'Coastal District',
  };

  const expiredAlert: AlertData = {
    ...activeAlert,
    expiresAt: '2026-10-30T10:00:00Z',
  };

  const draftAlert: AlertData = {
    ...activeAlert,
    status: 'draft',
  };

  const checkTime = '2026-11-01T12:00:00Z';
  assert.equal(isAlertActive(activeAlert, checkTime), true);
  assert.equal(isAlertActive(expiredAlert, checkTime), false);
  assert.equal(isAlertActive(draftAlert, checkTime), false);
});

test('sortAlertsByUrgency prioritizes critical over minor alerts', () => {
  const alerts: AlertData[] = [
    {
      id: '1',
      title: 'Minor Rain',
      category: 'storm',
      severity: 'minor',
      status: 'published',
      issuedAt: '2026-11-01T10:00:00Z',
      expiresAt: '2026-11-02T10:00:00Z',
      affectedArea: 'Zone A',
    },
    {
      id: '2',
      title: 'Major Cyclone',
      category: 'cyclone',
      severity: 'critical',
      status: 'published',
      issuedAt: '2026-11-01T08:00:00Z',
      expiresAt: '2026-11-02T10:00:00Z',
      affectedArea: 'Zone B',
    },
  ];

  const sorted = sortAlertsByUrgency(alerts);
  assert.equal(sorted[0].id, '2');
  assert.equal(sorted[1].id, '1');
});
