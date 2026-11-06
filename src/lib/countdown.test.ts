import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCountdown } from './countdown.ts';

test('formats 10 minutes correctly and sets level ok', () => {
  const now = 1000000;
  const expiresAt = now + 10 * 60 * 1000; // 10 min
  const res = computeCountdown(expiresAt, now);
  assert.equal(res.formatted, '10:00');
  assert.equal(res.level, 'ok');
});

test('detects warn level at 2 minutes or less', () => {
  const now = 1000000;
  const expiresAt = now + 115 * 1000; // 1 min 55s
  const res = computeCountdown(expiresAt, now);
  assert.equal(res.formatted, '01:55');
  assert.equal(res.level, 'warn');
});

test('detects critical level at 30 seconds or less', () => {
  const now = 1000000;
  const expiresAt = now + 25 * 1000; // 25s
  const res = computeCountdown(expiresAt, now);
  assert.equal(res.formatted, '00:25');
  assert.equal(res.level, 'critical');
});

test('detects expired when past expiresAt', () => {
  const now = 1000000;
  const expiresAt = now - 5000;
  const res = computeCountdown(expiresAt, now);
  assert.equal(res.formatted, '00:00');
  assert.equal(res.level, 'expired');
  assert.equal(res.remainingMs, 0);
});

test('formats 2 hours, 6 hours, and 24 hours correctly', () => {
  const now = 1000000;
  const twoHours = computeCountdown(now + 2 * 3600 * 1000, now);
  assert.equal(twoHours.formatted, '02:00:00');
  assert.equal(twoHours.level, 'ok');

  const sixHours = computeCountdown(now + 6 * 3600 * 1000, now);
  assert.equal(sixHours.formatted, '06:00:00');

  const twentyFourHours = computeCountdown(now + 24 * 3600 * 1000, now);
  assert.equal(twentyFourHours.formatted, '24:00:00');
});
