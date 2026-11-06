import DOMPurify from 'dompurify';

export interface SanitizeOptions {
  allowRemoteImages: boolean;
  imagesBlockedText: string;
}

/**
 * Sanitizes HTML using DOMPurify with strict HTML profile:
 * - Forbids <style>, <form>, <script>, <object>, <embed>, <iframe>
 * - Blocks remote images unless allowRemoteImages is true
 * - Sets alt text on blocked images
 */
function getPurify(): typeof DOMPurify | null {
  if (typeof DOMPurify.sanitize === 'function') {
    return DOMPurify;
  }
  if (typeof window !== 'undefined') {
    return (DOMPurify as unknown as (w: Window) => typeof DOMPurify)(window);
  }
  return null;
}

export function sanitizeEmailHtml(rawHtml: string, options: SanitizeOptions): string {
  if (!rawHtml) return '';

  const purify = getPurify();
  if (!purify) {
    // Basic regex sanitization fallback for non-DOM / test environments
    let fallback = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
    if (!options.allowRemoteImages) {
      fallback = fallback.replace(/<img\s+([^>]*?)src=["'](?!data:)([^"']*)["']([^>]*?)>/gi, (_m, p1, _src, p2) => {
        return `<img ${p1} alt="${options.imagesBlockedText}" title="${options.imagesBlockedText}" style="display:inline-block; padding: 4px 8px; border: 1px dashed #CBD5E1; color: #64748B; font-size: 12px; background: #F8FAFC;" ${p2}>`;
      });
    }
    return fallback;
  }

  // Setup DOMPurify with strict profile forbidding style and form tags
  const sanitized = purify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'script', 'object', 'embed', 'iframe', 'frame', 'base'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    RETURN_DOM_FRAGMENT: true,
  });

  const fragment = sanitized as DocumentFragment;

  // Process images
  const images = fragment.querySelectorAll('img');
  images.forEach((img) => {
    const src = img.getAttribute('src') || '';
    const isDataUri = src.trim().toLowerCase().startsWith('data:');

    if (!options.allowRemoteImages && !isDataUri) {
      // Remove remote image source
      img.removeAttribute('src');
      img.removeAttribute('srcset');
      img.setAttribute('alt', options.imagesBlockedText);
      img.setAttribute('title', options.imagesBlockedText);
      // Give it an unobtrusive placeholder style
      img.setAttribute(
        'style',
        'display:inline-block; padding: 4px 8px; border: 1px dashed #CBD5E1; color: #64748B; font-size: 12px; background: #F8FAFC;'
      );
    }

    // Force secure attributes on all images
    img.setAttribute('referrerpolicy', 'no-referrer');
    img.setAttribute('loading', 'lazy');
  });

  // Ensure all anchor tags open in new tab with rel="noopener noreferrer"
  const links = fragment.querySelectorAll('a');
  links.forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  // Convert fragment back to HTML string
  const container = document.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
}

/**
 * Generates the full srcdoc document for the sandboxed iframe
 */
export function buildSandboxedSrcDoc(bodyHtml: string, dir: 'ltr' | 'rtl' = 'ltr'): string {
  return `<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0F1B3D;
      background-color: #FFFFFF;
      font-size: 14px;
      line-height: 1.6;
    }
    body {
      margin: 0;
      padding: 16px;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #2563EB;
      text-decoration: underline;
    }
    table {
      max-width: 100% !important;
    }
    blockquote {
      border-inline-start: 3px solid #BFDBFE;
      margin: 8px 0;
      padding-inline-start: 12px;
      color: #5B6B8C;
    }
    pre, code {
      font-family: monospace;
      white-space: pre-wrap;
      background: #F0F7FF;
      padding: 2px 4px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}
