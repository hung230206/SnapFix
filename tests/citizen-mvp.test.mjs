import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareSubmission, currentSubmission } from '../src/domain/citizen-mvp.ts';

const draft = (id, lat = 0, lng = 0, category = 'Ổ gà') => ({ id, category, location: { lat, lng, text: '' }, status: 'Đã chuẩn bị' });

test('keeps independent reports, groups nearby coordinates including zero, updates all counts', () => {
  const first = prepareSubmission(draft('a'), []);
  const second = prepareSubmission(draft('b', 0, 0.0001), [first]);
  const third = prepareSubmission(draft('c'), [first, second]);
  assert.notEqual(first.id, second.id);
  assert.equal(first.submission.incidentId, second.submission.incidentId);
  assert.equal(third.submission.reportCount, 3);
  assert.equal(third.submission.priority, 'MEDIUM');
  assert.equal(currentSubmission(first, [first, second, third]).submission.reportCount, 3);
  assert.equal(third.submission.confidence, null);
});

test('retries same report without incrementing count', () => {
  const first = prepareSubmission(draft('a'), []);
  assert.deepEqual(prepareSubmission(draft('a'), [first]), first);
});

test('does not group far, missing GPS, different category, unknown category or stale reports', () => {
  const first = prepareSubmission(draft('a'), []);
  for (const candidate of [draft('b', 1, 1), draft('c', 0, 0, 'Rác thải'), { ...draft('d'), location: { text: 'Cùng đường' } }]) {
    assert.notEqual(prepareSubmission(candidate, [first]).submission.incidentId, first.submission.incidentId);
  }
  const old = { ...first, submission: { ...first.submission, submittedAt: '2000-01-01T00:00:00Z' } };
  assert.notEqual(prepareSubmission(draft('e'), [old]).submission.incidentId, first.submission.incidentId);
  const unknown = prepareSubmission(draft('f', 0, 0, 'Khác / không nhận diện được'), []);
  assert.notEqual(prepareSubmission(draft('g', 0, 0, unknown.category), [unknown]).submission.incidentId, unknown.submission.incidentId);
});

test('five reports raise demo priority to high', () => {
  const reports = [];
  for (let i = 0; i < 5; i++) reports.push(prepareSubmission(draft(String(i)), reports));
  assert.equal(currentSubmission(reports[0], reports).submission.priority, 'HIGH');
});
