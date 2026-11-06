export const config = {
  runtime: 'nodejs18.x',
};

function getClientHeaders(req) {
  const forwarded = new Headers();

  for (const [key, value] of Object.entries(req.headers || {})) {
    if (!value) continue;
    if (['host', 'connection', 'content-length'].includes(key)) continue;
    if (['origin', 'referer'].includes(key)) continue;

    const headerValue = Array.isArray(value) ? value.join(', ') : String(value);
    if (headerValue) {
      forwarded.set(key, headerValue);
    }
  }

  return forwarded;
}

function getTargetUrl(req) {
  const raw = Array.isArray(req.query?.path) ? req.query.path.join('/') : req.query.path ?? '';
  const path = raw ? `/${raw.replace(/^\/+/, '')}` : '/';
  return `https://api.mail.tm${path}`;
}

export default async function handler(req, res) {
  const method = req.method || 'GET';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const upstreamUrl = getTargetUrl(req);
  const headers = getClientHeaders(req);

  const init = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'HEAD') {
    const payload = req.body;

    if (payload !== undefined) {
      if (typeof payload === 'string') {
        init.body = payload;
      } else {
        init.body = JSON.stringify(payload);
      }
    }
  }

  try {
    const upstreamRes = await fetch(upstreamUrl, init);
    const text = await upstreamRes.text();

    const contentType = upstreamRes.headers.get('content-type') || 'application/json';
    res.status(upstreamRes.status);
    res.setHeader('Content-Type', contentType);

    for (const [key, value] of upstreamRes.headers.entries()) {
      if (['content-length', 'transfer-encoding', 'content-encoding'].includes(key)) {
        continue;
      }
      res.setHeader(key, value);
    }

    if (text) {
      res.send(text);
      return;
    }

    res.end();
  } catch (error) {
    console.error('Mail.tm proxy error:', error);
    res.status(502).json({
      error: 'Mail.tm proxy failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
