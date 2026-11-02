import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPriority, isValidStatusTransition, isDuplicateRequest } from './triage';

test('classifyPriority classifies trapped person or medical emergency as critical', () => {
  assert.equal(classifyPriority('trapped_person', 1, false), 'critical');
  assert.equal(classifyPriority('medical_emergency', 1, false), 'critical');
  assert.equal(classifyPriority('food_water_assistance', 1, true), 'critical');
  assert.equal(classifyPriority('flood_rescue', 1, false), 'high');
  assert.equal(classifyPriority('missing_person', 1, false), 'medium');
  assert.equal(classifyPriority('other', 1, false), 'low');
});

test('isValidStatusTransition validates natural emergency lifecycle', () => {
  assert.equal(isValidStatusTransition('submitted', 'acknowledged'), true);
  assert.equal(isValidStatusTransition('acknowledged', 'assigned'), true);
  assert.equal(isValidStatusTransition('assigned', 'responder_en_route'), true);
  assert.equal(isValidStatusTransition('responder_en_route', 'in_progress'), true);
  assert.equal(isValidStatusTransition('in_progress', 'resolved'), true);

  // Can cancel from submitted or in_progress
  assert.equal(isValidStatusTransition('submitted', 'cancelled'), true);
  assert.equal(isValidStatusTransition('in_progress', 'cancelled'), true);

  // Cannot transition once resolved
  assert.equal(isValidStatusTransition('resolved', 'in_progress'), false);
  assert.equal(isValidStatusTransition('resolved', 'cancelled'), false);
});

test('isDuplicateRequest catches spam or repeated clicks within time window', () => {
  const now = Date.now();
  const existing = [
    {
      userId: 'user-1',
      category: 'flood_rescue',
      timestamp: now - 60000, // 1 min ago
      status: 'submitted' as const,
    },
  ];

  const duplicate = {
    userId: 'user-1',
    category: 'flood_rescue',
    timestamp: now,
  };

  const differentCategory = {
    userId: 'user-1',
    category: 'medical_emergency',
    timestamp: now,
  };

  assert.equal(isDuplicateRequest(duplicate, existing), true);
  assert.equal(isDuplicateRequest(differentCategory, existing), false);
});
