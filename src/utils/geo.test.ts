import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineDistance, formatDistance, isWithinRadius } from './geo';

test('calculateHaversineDistance returns 0 for identical points', () => {
  const p = { lat: 12.9716, lng: 77.5946 };
  assert.equal(calculateHaversineDistance(p, p), 0);
});

test('calculateHaversineDistance calculates accurate distance between Bengaluru and Mysuru', () => {
  const bengaluru = { lat: 12.9716, lng: 77.5946 };
  const mysuru = { lat: 12.2958, lng: 76.6394 };
  const dist = calculateHaversineDistance(bengaluru, mysuru);
  // Real distance is ~128-130 km
  assert.ok(dist > 120 && dist < 140, `Distance should be ~130km, got ${dist}`);
});

test('formatDistance handles sub-kilometer and kilometer ranges', () => {
  assert.equal(formatDistance(0.45), '450 m');
  assert.equal(formatDistance(12.34), '12.3 km');
});

test('isWithinRadius properly boundaries points', () => {
  const center = { lat: 12.9716, lng: 77.5946 };
  const nearby = { lat: 12.9750, lng: 77.5980 }; // ~0.5 km away
  const far = { lat: 13.5, lng: 78.5 }; // ~100 km away

  assert.equal(isWithinRadius(center, nearby, 5), true);
  assert.equal(isWithinRadius(center, far, 5), false);
});
