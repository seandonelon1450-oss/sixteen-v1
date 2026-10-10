'use strict';
/* =====================================================================
 * Sixteen™ V1 — server.
 *
 * A thin backend:
 *  - serves the static frontend (public/)
 *  - GET  /healthz        -> liveness probe (200)
 *  - GET  /api/config    -> provider status, so the UI labels itself honestly
 *  - GET  /api/seats     -> the 16 seats (canonical order)
 *  - POST /api/deliberate -> runs the configured provider (mock or real LLM)
 *  - POST /api/waitlist   -> email capture (founding access waitlist)
 *  - GET  /api/waitlist   -> token-gated waitlist read (contract frozen;
 *                            a background watcher depends on it — do not
 *                            change the path, token param, or shape)
 *  - GET  /api/my-data    -> export one email's waitlist entries (JSON)
 *  - POST /api/my-data/delete -> delete one email's waitlist entries
 *
 * Secrets live in environment variables only — never in code, logs, or chat.
 * =================================================================== */
const express = require('express');
const path = require('path');
const fs = require('fs');
const { getProvider, providerInfo } = require('./providers');
const SEATS = require('./data/seats');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.disable('x-powered-by');

app.use(express.json({ limit: '256kb' }));

/* Liveness probe for the host (Render healthCheckPath: /healthz). */
app.get('/healthz', (req, res) => {
  res.json({ ok: true, service: 'sixteen-v1' });
});

/* Serve the app. */
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders(res, filePath) {
    // Never cache the shell; assets are fine to cache briefly.
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

/* Which brain is plugged in? The UI uses this for its honesty badge. */
app.get('/api/config', (req, res) => {
  const info = providerInfo();
  res.json({
    app: 'Sixteen',
    version: '1.1.0-sixteen-v1',
    provider: info,
    demoMode: info.demoMode
  });
});

/* The 16 seats, canonical order. */
app.get('/api/seats', (req, res) => {
  res.json({ count: SEATS.length, seats: SEATS, framingNote: framingNote() });
});

function framingNote() {
  return 'Each seat is an archetype — a named temperament and mandate. ' +
    'No real people\'s names, likenesses, endorsements, or affiliations are used. ' +
    'MBTI letters describe each archetype\'s temperament profile.';
}

/* Deliberate: convene the board on a real question. */
app.post('/api/deliberate', async (req, res) => {
  const question = String((req.body && req.body.question) || '').slice(0, 4000);
  if (!question.trim()) {
    return res.status(400).json({ error: 'Ask the board something first — the room needs a real question.' });
  }
  try {
    const provider = getProvider();
    const result = await provider.deliberate({ question });
    res.json(result);
  } catch (err) {
    // Log the failure mode, never the question.
    console.error('[sixteen] deliberate failed:', err.message);
    res.status(502).json({
      error: 'The board could not convene. Check your connection and try again. ' +
        (providerInfo().demoMode ? '' : 'If this persists, verify LLM_API_KEY / LLM_BASE_URL.')
    });
  }
});

/* ---- Founding-access waitlist: simple email capture to data/waitlist.jsonl.
 * Stored on the server's ephemeral disk (Render free tier resets on
 * restart) — export regularly. ---- */
const WAITLIST_FILE = path.join(__dirname, 'data', 'waitlist.jsonl');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readWaitlist() {
  try {
    return fs.readFileSync(WAITLIST_FILE, 'utf8').split('\n').filter(Boolean)
      .map((ln) => { try { return JSON.parse(ln); } catch (e) { return null; } })
      .filter(Boolean);
  } catch (e) { return []; /* no data yet */ }
}

app.post('/api/waitlist', (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase().slice(0, 160);
  const source = String((req.body && req.body.source) || 'paywall').slice(0, 40);
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'That email address does not look valid — check and try again.' });
  }
  try {
    fs.mkdirSync(path.dirname(WAITLIST_FILE), { recursive: true });
  } catch (e) { /* best effort */ }
  const line = JSON.stringify({ ts: new Date().toISOString(), email, source }) + '\n';
  try {
    fs.appendFileSync(WAITLIST_FILE, line);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Could not save — try again.' });
  }
  res.json({ ok: true });
});

/* Token-gated read. If SIXTEEN_ADMIN_TOKEN is unset the endpoint is
 * disabled (503) — never hardcode a token.
 *
 * CONTRACT (frozen): GET /api/waitlist?token=<token>
 * -> { ok: true, count, entries: [{ ts, email, source }] } */
app.get('/api/waitlist', (req, res) => {
  const token = process.env.SIXTEEN_ADMIN_TOKEN;
  if (!token) {
    return res.status(503).json({ ok: false, error: 'Waitlist export is disabled — SIXTEEN_ADMIN_TOKEN is not configured.' });
  }
  if (req.query.token !== token) {
    return res.status(403).json({ ok: false });
  }
  const entries = readWaitlist();
  res.json({ ok: true, count: entries.length, entries });
});

/* ---- Your data: the only personal data Sixteen stores is the founding
 * waitlist above. Export and Delete operate on it. Export matches on the
 * exact email address (this app has no user accounts). ---- */
app.get('/api/my-data', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase().slice(0, 160);
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Enter the email address you used for the waitlist.' });
  }
  const entries = readWaitlist().filter((e) => e.email === email);
  res.json({ ok: true, count: entries.length, entries });
});

app.post('/api/my-data/delete', (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase().slice(0, 160);
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Enter the email address you used for the waitlist.' });
  }
  const before = readWaitlist();
  const remaining = before.filter((e) => e.email !== email);
  try {
    fs.mkdirSync(path.dirname(WAITLIST_FILE), { recursive: true });
    fs.writeFileSync(WAITLIST_FILE, remaining.map((e) => JSON.stringify(e)).join('\n') + (remaining.length ? '\n' : ''));
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Could not delete — try again.' });
  }
  res.json({ ok: true, removed: before.length - remaining.length });
});

/* Friendly 404 for API typos. */
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API endpoint.' }));

/* JSON error responses for the API (malformed JSON bodies, etc.)
 * instead of Express's default HTML error page. */
app.use('/api', (err, req, res, next) => {
  console.error('[sixteen] api error:', err.message);
  res.status(err.status || 400).json({ error: 'Bad request — expected JSON.' });
});

app.listen(PORT, () => {
  const info = providerInfo();
  console.log(`[sixteen] Sixteen V1 listening on port ${PORT}`);
  console.log(`[sixteen] provider=${info.id} demoMode=${info.demoMode} model=${info.model}`);
});
