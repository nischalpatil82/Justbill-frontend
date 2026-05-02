const https = require('node:https');
const { URL } = require('node:url');

function getBackendBaseUrl() {
  return (process.env.VOICE_AGENT_BACKEND_URL || 'https://13.51.255.22').replace(/\/+$/, '');
}

function buildHeaders(eventHeaders = {}) {
  const headers = {};
  for (const [key, value] of Object.entries(eventHeaders)) {
    const lower = key.toLowerCase();
    if (!value) continue;
    if (['host', 'content-length', 'connection', 'accept-encoding'].includes(lower)) continue;
    headers[key] = value;
  }
  return headers;
}

function proxyRequest(event, targetPath, options = {}) {
  const baseUrl = new URL(getBackendBaseUrl());
  const outboundUrl = new URL(targetPath, baseUrl);
  const bodyBuffer = event.body
    ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
    : undefined;

  const headers = buildHeaders(event.headers);
  if (bodyBuffer && bodyBuffer.length && !headers['content-length'] && !headers['Content-Length']) {
    headers['content-length'] = String(bodyBuffer.length);
  }

  return new Promise((resolve) => {
    const request = https.request(
      outboundUrl,
      {
        method: event.httpMethod,
        headers,
        rejectUnauthorized: false,
        timeout: options.timeoutMs || 20000,
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        response.on('end', () => {
          const responseBuffer = Buffer.concat(chunks);
          resolve({
            statusCode: response.statusCode || 502,
            headers: {
              'content-type': response.headers['content-type'] || 'application/json',
              'cache-control': 'no-store',
            },
            body: options.binary ? responseBuffer.toString('base64') : responseBuffer.toString('utf8'),
            isBase64Encoded: Boolean(options.binary),
          });
        });
      },
    );

    request.on('error', (error) => {
      resolve({
        statusCode: 502,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        body: JSON.stringify({ error: 'Upstream AI service unavailable', detail: String(error.message || error) }),
      });
    });

    if (bodyBuffer && bodyBuffer.length) {
      request.write(bodyBuffer);
    }

    request.end();
  });
}

module.exports = { proxyRequest };