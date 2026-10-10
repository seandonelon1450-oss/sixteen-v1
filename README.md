# Sixteen™ V1 — a 16-seat advisory boardroom

**Sixteen minds. One decision.** A private boardroom for consequential
choices: calibrate with a 10-question quiz, watch the room assemble,
ask a real question, and get sixteen distinct advisory voices plus the
chair's synthesis.

Part of the Arbor Group · powered by Arbor.

## Brand

- Arbor design system: paper `#FAF8F4`, ink `#1C1A17`, Fraunces +
  Inter (self-hosted WOFF2), one accent (ink). Tabular figures on all
  prices.
- Headline never leads with AI. No real people's names or likenesses —
  the sixteen seats are archetype titles only (The Throne, The Voice,
  …). MBTI letters describe each archetype's temperament profile.
- "powered by Arbor" badge: footer always, header at ≥1200px.
- Footer line: *Powered by Arbor · The Arbor Group · She owns her data.*
- FAQ answers "Does Arbor use AI?" plainly.
- ™ only (never the registered-mark symbol).

## What works (no keys needed)

- **Onboarding quiz** — 10 questions (decision-style + MBTI-lite).
- **Boardroom reveal** — all 16 seats assemble seat by seat ("a
  boardroom you sit in, not a chat window").
- **Consultation** — `POST /api/deliberate` runs the configured
  provider. Default is the template mock (clearly labeled preview).
- **Sample consultation** — a finished deliberation you can run with
  one tap from the home page.
- **Pricing** — $9.99/mo · $59.99/yr · $299 lifetime, displayed only;
  no checkout wiring. Every plan points to the founding waitlist.
- **Waitlist** — `POST /api/waitlist` appends to `data/waitlist.jsonl`;
  `GET /api/waitlist?token=` reads it, token-gated. **This contract is
  frozen** (path, token query param, and `{ok, count, entries:[{ts,
  email, source}]}` shape) — a background watcher depends on it.
- **Your data page** (`/data`) — the 10-point charter word for word,
  working Export (`GET /api/my-data?email=`) and Delete
  (`POST /api/my-data/delete`) for the waitlist email, plus the public
  provider list.
- **Health probe** — `GET /healthz` → 200.

## Honesty posture

Every seat is an **archetype** — a named temperament and mandate. No
real people's names, likenesses, endorsements, or affiliations are used
anywhere. Sample voices carry `label: 'preview'` and the UI badge reads
*"Preview deliberation"* until a real LLM key is configured, when it
switches to *"Live counsel."* Nothing fakes a live brain.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no (default 3000) | listen port |
| `LLM_PROVIDER` | no (default mock) | `openai` activates the real provider |
| `LLM_API_KEY` | for real LLM | server-side key, never sent to browser |
| `LLM_MODEL` | no (default `gpt-4o-mini`) | chat model |
| `LLM_BASE_URL` | no (default OpenAI) | OpenAI-compatible endpoint |
| `SIXTEEN_ADMIN_TOKEN` | for waitlist export | token gating `GET /api/waitlist`; if unset the endpoint returns 503 (disabled) — never hardcoded |

Secrets live in environment variables only — never in code, logs, or
chat. The local admin-token file (`hidden/`) is git-ignored.

## Run

```sh
npm install
node server.js        # http://localhost:3000
```

Docker: `docker build -t sixteen-v1 .` (`FROM node:24-slim`, reads
`PORT` from the environment).

Deploy: `render.yaml` (Node, auto-deploy on `main`, `healthCheckPath:
/healthz`). CI (`.github/workflows/ci.yml`) runs brand guards and a
full smoke test on every push to `main`. CI also fails if the
ephemeral-registry hostname appears anywhere in the repo.

## Accessibility

WCAG 2.2 AA basics: skip link, visible focus ring, 44px touch targets,
body ≥16px. Every motion technique has a reduced-motion state (OS
setting on → nothing moves, everything visible).

## What's stubbed

- **LLM counsel** — default is the template mock. Set
  `LLM_PROVIDER=openai` + `LLM_API_KEY` for real deliberation
  (providers/openai.js builds a system prompt from the 16 archetypes
  and expects structured JSON; fully implemented).
- **Checkout** — prices are displayed only. The waitlist is the only
  conversion path until Stripe is wired and the webhook test passes.
- **Daily briefing** — sample card only; the live retention mechanic is
  a future build.
- **data/waitlist.jsonl** — lives on the host's disk (ephemeral on
  Render free tier); export via `GET /api/waitlist?token=` regularly.

## File tree

```
sixteen-v1/
├── server.js             # Express: static + /api/{config,seats,deliberate,waitlist,my-data} + /healthz
├── package.json
├── render.yaml           # GitHub -> Render, autoDeploy, /healthz
├── Dockerfile
├── README.md
├── .github/workflows/ci.yml  # brand guards + smoke tests
├── data/
│   └── seats.js          # canonical 16 seats (server-side source of truth)
├── providers/
│   ├── index.js          # selector: openai (keyed) else mock
│   ├── mock.js           # template deliberation engine + theme detection
│   └── openai.js         # real OpenAI-compatible deliberation
└── public/
    ├── index.html        # home: hero / how / demo / seats / sample / pricing / waitlist / charter / faq
    ├── data.html         # /data: charter + working export/delete
    ├── app.js
    ├── styles.css        # Arbor design system
    └── fonts/            # self-hosted WOFF2 (Fraunces, Inter, JetBrains Mono)
```
