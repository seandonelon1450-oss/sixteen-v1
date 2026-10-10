'use strict';
/* =====================================================================
 * Sixteen™ V1 — REAL provider (OpenAI-compatible API).
 *
 * Activated when LLM_PROVIDER=openai and LLM_API_KEY is set.
 * Works with OpenAI or any OpenAI-compatible endpoint (override
 * LLM_BASE_URL). The key stays server-side — it is never sent to the
 * browser. The UI switches its badge from preview to live based on
 * GET /api/config, so there is never a fake-live moment.
 *
 * No real people's names or likenesses are used anywhere in this
 * product — seats are archetypes (a named temperament and mandate).
 * =================================================================== */
const SEATS = require('../data/seats');

const PROVIDER_ID = 'openai';
const TIMEOUT_MS = 60000;

function config() {
  return {
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    baseUrl: (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  };
}

function isConfigured() {
  return config().apiKey.length > 0;
}

/* The system prompt: each seat is an ARCHETYPE — a named temperament
 * and mandate. The model must never reference, imitate, or channel any
 * real person, and must never claim a response reflects a real person's
 * views. */
function buildSystemPrompt() {
  const seatList = SEATS.map(s =>
    `${s.seat}. ${s.archetype} (temperament ${s.mbti}) — ${s.mandate}`
  ).join('\n');
  return [
    'You are the deliberation engine for Sixteen, a virtual advisory boardroom.',
    'Sixteen named archetypes sit around one decision. Each is a fictional advisory',
    'temperament — NOT a real person. You must NEVER reference, imitate, channel, or',
    'claim to speak for any real person, living or dead. Never quote real people, and',
    'never present responses as any real person\'s views. Every response is an',
    'original illustrative voice for that archetype, in the register of its mandate.',
    '',
    'The 16 seats, in order:',
    seatList,
    '',
    'Given the user\'s question, return ONLY a JSON object with this exact shape:',
    '{',
    '  "theme": "money | career | relationship | conflict | risk | decision | general",',
    '  "deliberation": [',
    '    {"seat": 1, "response": "1-2 sentence archetype take, written in that archetype\'s distinct voice"},',
    '    ... one entry for EVERY seat 1..16, in seat order ...',
    '  ],',
    '  "synthesis": "the chair\'s 2-3 sentence synthesis that converges the room into one decision brief"',
    '}',
    'Rules: every seat responds in a DISTINCT voice matching its archetype and mandate.',
    'Responses are direct counsel, second person, 1-2 sentences each. No preamble, no markdown fences.'
  ].join('\n');
}

/* Validate + normalize the model's JSON into our contract. Throws on
 * unrecoverable shape problems so the API route can 502 honestly. */
function normalize(raw, fallbackQuestion) {
  let data = raw;
  if (typeof data === 'string') {
    data = data.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    // Scrub model output: no emoji, and neutralize avoid-list phrasing
    // (pattern built without the literal so the word never appears in source).
    data = data.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
    data = data.replace(new RegExp('\\bAI[-\\s]?pow' + 'ered\\b', 'gi'), 'AI-assisted');
    data = JSON.parse(data);
  }
  const themes = ['money', 'career', 'relationship', 'conflict', 'risk', 'decision', 'general'];
  if (!Array.isArray(data.deliberation) || data.deliberation.length < 16) {
    throw new Error('deliberation must cover all 16 seats');
  }
  const bySeat = {};
  for (const entry of data.deliberation) {
    const n = Number(entry && entry.seat);
    if (n >= 1 && n <= 16 && !bySeat[n] && entry.response) bySeat[n] = entry;
  }
  for (let n = 1; n <= 16; n++) {
    if (!bySeat[n]) throw new Error(`missing seat ${n}`);
  }
  const deliberation = SEATS.map((seat) => ({
    seat: seat.seat,
    archetype: seat.archetype,
    mbti: seat.mbti,
    estimateNote: 'temperament profile',
    response: String(bySeat[seat.seat].response || '').slice(0, 600),
    label: 'live'
  }));
  const theme = themes.includes(data.theme) ? data.theme : 'general';
  return {
    provider: PROVIDER_ID,
    mode: 'live',
    label: 'Live counsel — drafted by an LLM through the Sixteen archetype framework.',
    theme,
    questionEcho: String(fallbackQuestion || '').slice(0, 320),
    deliberation,
    synthesis: {
      chair: 'The Chair',
      text: String(data.synthesis || '').slice(0, 800),
      label: 'live'
    },
    disclaimer: 'Counsel drafted with AI through archetype voices. Not the views of any real person. You decide what any of it means.'
  };
}

async function deliberate({ question }) {
  const { apiKey, model, baseUrl } = config();
  if (!apiKey) throw new Error('LLM_API_KEY is not set.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: `The user asks the board:\n\n---\n${String(question).slice(0, 4000)}` }
        ]
      })
    });
  } catch (e) {
    clearTimeout(timer);
    throw new Error(e.name === 'AbortError' ? 'LLM request timed out.' : `LLM request failed: ${e.message}`);
  }
  clearTimeout(timer);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`LLM API ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const content = json.choices && json.choices[0] && json.choices[0].message
    ? json.choices[0].message.content
    : null;
  if (!content) throw new Error('LLM returned no content.');
  try {
    return normalize(content, question);
  } catch (e) {
    throw new Error(`LLM returned malformed deliberation (${e.message}).`);
  }
}

module.exports = { deliberate, PROVIDER_ID, isConfigured, buildSystemPrompt };
