import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeEmailHtml, buildSandboxedSrcDoc } from './safeHtml.ts';

test('removes dangerous script tags and forms', () => {
  const hostile = '<div>Hello <script>alert("xss")</script><form action="/steal"><input /></form></div>';
  const clean = sanitizeEmailHtml(hostile, {
    allowRemoteImages: false,
    imagesBlockedText: '[Images blocked]',
  });
  assert.ok(!clean.includes('<script'));
  assert.ok(!clean.includes('alert('));
  assert.ok(!clean.includes('<form'));
  assert.ok(clean.includes('Hello'));
});

test('blocks remote images when allowRemoteImages is false', () => {
  const html = '<p>Photo: <img src="https://tracker.com/pixel.png" alt="tracker" /></p>';
  const clean = sanitizeEmailHtml(html, {
    allowRemoteImages: false,
    imagesBlockedText: '[Blocked]',
  });
  assert.ok(!clean.includes('https://tracker.com/pixel.png'));
  assert.ok(clean.includes('alt="[Blocked]"'));
});

test('preserves data: inline images even when remote images are blocked', () => {
  const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const html = `<p><img src="${dataUri}" alt="icon" /></p>`;
  const clean = sanitizeEmailHtml(html, {
    allowRemoteImages: false,
    imagesBlockedText: '[Blocked]',
  });
  assert.ok(clean.includes('data:image/png;base64,'));
});

test('buildSandboxedSrcDoc wraps in complete HTML document', () => {
  const doc = buildSandboxedSrcDoc('<p>Test email</p>', 'rtl');
  assert.ok(doc.includes('<!DOCTYPE html>'));
  assert.ok(doc.includes('dir="rtl"'));
  assert.ok(doc.includes('<p>Test email</p>'));
});
