# Sixteen™ V1 — Build Report (Arbor program, phase 2, priority 4)

Built 2026-10-10 by the phase-2 build worker. Authoritative brief:
`~/workspace/handoffs/MUSE-HANDOFF.md` (§9E, §9A, §10).

## What was built

**Full §10 design-system restyle.** Paper `#FAF8F4`, ink `#1C1A17`
(one accent — ink, per instructions; no accent invented), Fraunces +
Inter + JetBrains Mono **self-hosted as WOFF2** (no Google Fonts links
shipped), tabular figures on all prices. Dark theme follows the OS with
a header toggle (choice stored on device). Every motion technique used
has a reduced-motion state (OS setting on → nothing moves, everything
visible). WCAG 2.2 AA basics: skip link, visible focus ring, 44px touch
targets, body ≥16px.

**Home page is now a single page, waitlist-first** (the clear offer —
per brief, acceptable as the first screen). Hero headline:
**"Sixteen minds. One decision."** AI is never led with; there is no
blank chat box. Below the hero: How it works (4 steps), Try the room
(the 10-question calibration → boardroom reveal → consultation, all
restyled), the sixteen seats grid, a one-tap **sample consultation**
(finished work), pricing, founding waitlist, the 10-point charter word
for word, and an FAQ that answers **"Does Arbor use AI?"** plainly.
Zero avoid-list words (AI-powered, chatbot, copilot, revolutionary,
seamless, cutting-edge, unleash, supercharge, magic, synergy,
"How can I help you today?") anywhere in customer code — CI enforces
this on every push.

**No real people's names or likenesses.** All 16 seats are archetype
titles only (The Throne … The Peak); the 112-line mock voice bank was
rewritten as original archetype voices; the OpenAI provider's system
prompt forbids referencing any real person and scrubs avoid-list
phrasing from model output. MBTI letters now describe each archetype's
temperament profile.

**Prices displayed only** — $9.99/mo · $59.99/yr · $299 lifetime.
All checkout wiring was removed (no Stripe links in code, config, or
env docs). Every plan points to the founding waitlist.

**"powered by Arbor" badge** — pill with inline-SVG arch mark and live
text in the footer (always) and the header (≥1200px). Footer line:
*Powered by Arbor · The Arbor Group · She owns her data.* The badge is
currently a non-link pill — see "Blocked on Sean" for the URL.

**`/data` page** with the charter word for word, the public provider
list, and **working Export and Delete**: `GET /api/my-data?email=`
(exports one email's waitlist entries as a JSON download) and
`POST /api/my-data/delete` (removes them from the live file). The only
personal data Sixteen stores is the waitlist email.

**Waitlist contract preserved exactly.** `GET /api/waitlist?token=<token>`
keeps its path, token query-param contract, and `{ok, count,
entries:[{ts,email,source}]}` shape; unset token → 503, wrong token →
403. The background watcher's mechanism is untouched.

**Deploy prep.** `render.yaml` (Node 24, auto-deploy on `main`,
`healthCheckPath: /healthz`; `SIXTEEN_ADMIN_TOKEN` declared
value-less — set in the Render dashboard). `GET /healthz` → 200.
CI (`.github/workflows/ci.yml`) runs four brand guards (ephemeral-
registry hostname, avoid-list words, registered-mark symbol, real-person
advisor names) plus a full smoke test: boot with a throwaway token,
pages, seats, a preview deliberation, waitlist signup → token-gated
read → wrong-token 403 → delete. The ephemeral-registry hostname
literal appears in the CI YAML only, nowhere else.

## Verification actually run (local, throwaway admin token)

- `GET /healthz` → 200 `{"ok":true,"service":"sixteen-v1"}`.
- `GET /` → 200, contains "Sixteen minds. One decision."; `GET /data`
  → 200, contains "You own your data"; `GET /api/seats` → 16 seats.
- `POST /api/deliberate` → 200, `mode: "preview"`, 16 voices.
- `POST /api/waitlist` → `{"ok":true}`; token-gated GET returned the
  test entry in the frozen shape; wrong token → 403.
- `POST /api/my-data/delete` → `{"ok":true,"removed":1}`; follow-up
  token read confirmed the test entry was gone (count back to 0).
- Greps: zero real-person advisor names, zero avoid-list words, zero
  registered-mark symbols, zero secrets in code, ephemeral-registry
  hostname present only in the CI YAML.
- All modules load (`data/seats`, `providers/*`, `server.js` boots).
- Git: committed locally; working tree clean.

## Blocked on Sean — what he needs to do

1. **Sixteen accent color.** Shipped with ink `#1C1A17`; swap it the
   moment he OKs an accent (one token change in `styles.css`).
2. **Render deploy.** `render.yaml` is ready but `plan` is deliberately
   omitted (defaults to free): the brief requires Starter+ for demo
   services, and that is a purchase — do not apply until he says go.
   On deploy he must also set `SIXTEEN_ADMIN_TOKEN` in Render's
   Environment page (the pending rotation item: paste the new token
   from `~/workspace/sixteen-v1/hidden/admin_token`, save, redeploy).
3. **Stripe.** Prices are display-only by design. No checkout until he
   provides the Stripe account + webhook secrets and the real test
   charge + refund passes (brief §0.9).
4. **Arbor Technologies site URL.** The badge pill is a non-link until
   this exists; then point the badge at it (brief §2).
5. **Lawyer review** (per brief §13): data charter, Sixteen advisor
   naming (now archetype-only), commercial.

## Notes for the parent agent

- "Talk to a person" links to `seandonelon.apps@gmail.com` (the
  decided business contact email).
- Fonts follow-up from the task is **done** — WOFF2 is self-hosted in
  `public/fonts/`; nothing to record.
- No GitHub push was made (auth paused); one local commit, tree clean.
- `hidden/admin_token` is git-ignored; its value was never read,
  printed, or committed.
