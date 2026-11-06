import test from 'node:test';
import assert from 'node:assert/strict';
import { findVerificationCodes } from './codeFinder.ts';

test('extracts 6-digit verification code with context', () => {
  const text = 'Your verification code is 549122. Do not share this with anyone.';
  const codes = findVerificationCodes(text);
  assert.deepEqual(codes, ['549122']);
});

test('extracts OTP code with Arabic context', () => {
  const text = 'رمز التحقق الخاص بك هو 948214 صالح لمدة 10 دقائق.';
  const codes = findVerificationCodes(text);
  assert.deepEqual(codes, ['948214']);
});

test('handles hyphenated verification codes', () => {
  const text = 'Use code 123-456 to verify your email account.';
  const codes = findVerificationCodes(text);
  assert.deepEqual(codes, ['123456']);
});

test('returns empty array when no valid code exists', () => {
  const text = 'Welcome to our service! Please visit our website.';
  const codes = findVerificationCodes(text);
  assert.deepEqual(codes, []);
});
