'use strict';
/* =====================================================================
 * Sixteen™ V1 — MOCK provider (preview deliberation)
 * ---------------------------------------------------------------------
 * Deterministic, template-based "voices" for the 16 archetype seats.
 * THIS IS NOT AI and these are NOT the views of any real person — they
 * are illustrative sample lines written for the archetypes, themed by
 * keyword detection on the user's question. No real people's names or
 * likenesses are used anywhere in this product.
 *
 * Purpose: the app runs end-to-end with zero API keys and zero cost so
 * the founder can demo the boardroom experience. It is CLEARLY LABELED
 * as a preview in the API response (every object carries label:'preview'),
 * the UI badge, and the README.
 *
 * When LLM_PROVIDER=openai (with a key), providers/index.js bypasses
 * this file entirely and the real provider takes over.
 * =================================================================== */
const SEATS = require('../data/seats');

const PROVIDER_ID = 'sixteen-mock-v1';
const PREVIEW_LABEL = 'Preview deliberation — sample archetype voices. Live counsel activates with an API key.';
const DISCLAIMER =
  'PREVIEW DELIBERATION — template-based sample voices, not AI and not the ' +
  'views of any real person. Illustrative only. Add an LLM API key (see README) ' +
  'for live counsel.';

/* ---- Keyword themes (checked in priority order) ---- */
const THEMES = [
  ['money',        /\b(money|capital|invest|investment|price|pricing|revenue|profit|cost|budget|salary|pay|raise|fund|funding|wealth|cash|financial|finance|debt|loan|mortgage)\b/i],
  ['career',       /\b(career|job|promotion|promoted|boss|work|hire|hired|fired|startup|business|company|role|quit|resign|interview|resume|employer|employee)\b/i],
  ['relationship', /\b(relationship|partner|marriage|married|dating|date|wife|husband|boyfriend|girlfriend|friend|friendship|family|trust|breakup|divorce|teammate)\b/i],
  ['conflict',     /\b(conflict|fight|argue|argument|disagree|lawsuit|dispute|confront|enemy|opponent|rival|attack|competitor|drama|tension|critic)\b/i],
  ['risk',         /\b(risk|risky|danger|dangerous|bet|gamble|afraid|fear|scared|uncertain|uncertainty|worst[- ]case|exposure|leap)\b/i],
  ['decision',     /\b(decide|decision|choose|choice|should i|option|options|dilemma|crossroads|stuck| torn|pick)\b/i]
];

function detectTheme(question) {
  const q = String(question || '');
  for (const [theme, re] of THEMES) {
    if (re.test(q)) return theme;
  }
  return 'general';
}

/* ---- Archetype voice bank: one line per seat per theme, written in a
 * distinct register for each seat. These are SAMPLES — labeled as such
 * everywhere they appear. ---- */
const VOICES = [
  // 1. The Throne — macro-strategy, scale, decisiveness
  {
    money: 'Capital rewards conviction. Price for the position you intend to hold, cut what does not compound, and move while the moment is still cheap.',
    career: 'Think in empires, not roles. Choose the move that multiplies your options, then execute it at a scale that makes retreat irrelevant.',
    relationship: 'Choose your circle the way you choose your strategy: deliberately. Loyalty to the few who earn it; no energy for the rest.',
    decision: 'Decide big and decide once. Hesitation is a tax on every alternative you are protecting — pick the largest future and commit.',
    risk: 'Take the swing that changes the board. Small risks produce small results; the real danger is playing a big game with a small move.',
    conflict: 'Win the narrative before the negotiation. State your terms first, hold them calmly, and let the other side adjust to you.',
    general: 'Whatever you are considering, widen the frame. The biggest version of the answer is usually the correct one.'
  },
  // 2. The Voice — calm, clean communication
  {
    money: 'Money conversations are won before numbers come up. State the value plainly, name the ask, and let the silence do its work.',
    career: 'Your next move is a conversation. Prepare the message, choose the moment, and speak as though the outcome is already decided.',
    relationship: 'Say what you mean before silence says it for you. Clean, calm words preserve what shouting destroys.',
    decision: 'State the decision out loud in one clean sentence. If you cannot say it simply, you do not own it yet.',
    risk: 'Name the risk plainly to the people it touches. Shared language turns a private fear into a shared plan.',
    conflict: 'De-escalate with precision: acknowledge, state your position, offer the path forward. Calm wins conflicts.',
    general: 'Clarity is power. Whatever the question, say the truest sentence about it first.'
  },
  // 3. The Standard — discipline, ownership
  {
    money: 'Treat money like a mission: budget it, track it, and never spend what discipline has not earned.',
    career: 'Show up earlier, stay later, own every outcome. Careers are built on reliability, not talent.',
    relationship: 'Be the person who shows up. Reliability is love in action — promises kept beat speeches every time.',
    decision: 'Gather the facts, set the criteria, decide, execute. A disciplined decision beats a perfect one made late.',
    risk: 'Mitigate what you can, accept what you cannot, and never let risk become an excuse for inaction.',
    conflict: 'Own your part, hold the line, execute the plan. Conflicts end when discipline outlasts drama.',
    general: 'Discipline first; everything else follows. Own the outcome, execute the plan, no excuses.'
  },
  // 4. The Edge — competitive fire, toughness
  {
    money: 'Scarcity thinking is for people who lose. Out-work the fear, compete for every dollar, and never back down from your worth.',
    career: 'Compete like the opportunity is yours to lose. Out-hustle everyone in the room and make them remember your name.',
    relationship: 'Protect your people and never let anyone dim your fire. Tough times reveal who belongs in your corner.',
    decision: 'Trust your competitive gut and commit fully. Half-decisions lose; full ones at least teach.',
    risk: 'Risk is the arena where tough people are made. Protect the downside that can end you; attack everything else.',
    conflict: 'Stand your ground and refuse to be pushed around. Toughness is not cruelty — it is refusing to back down.',
    general: 'Bring your fire to it. Compete like it matters — because it does.'
  },
  // 5. The Arena — deal-making, high stakes
  {
    money: 'Every dollar is a deal on a stage. Know the terms, read the other side, and never take the first offer.',
    career: 'Treat your career like a main event: pick the right fight, negotiate the purse, headline or go home.',
    relationship: 'Every relationship has terms — respect the other side, but never accept a deal that costs you your center.',
    decision: 'Pick your fight and price the outcome. Decide like the stakes are real — because they are.',
    risk: 'Know the odds, set the terms, and never wager what you cannot afford to lose. Then get in the ring.',
    conflict: 'Conflict is a negotiation on a stage. Read the other side, set your terms, and never show your hand early.',
    general: 'This is a fight worth picking — prepare, commit, and own the stage.'
  },
  // 6. The Polymath — wit, invention, diplomacy
  {
    money: 'Diversify your cleverness: save steadily, spend deliberately, and keep one stream of income that surprises you.',
    career: 'Collect crafts, not titles. The person who can do many things well is never at anyone\'s mercy.',
    relationship: 'Charm is a skill and friendship an art: write the note, remember the detail, keep the humor alive.',
    decision: 'Invent a third option before choosing between two. The best decisions are designed, not selected.',
    risk: 'Experiment in small, reversible doses — curiosity is risk with a smile. Invent your way through.',
    conflict: 'Diplomacy is patience with a strategy. Reframe the conflict until a third way appears.',
    general: 'Look at it from three angles and invent a fourth. Wit and invention solve what force cannot.'
  },
  // 7. The Master — craft, relentless standards
  {
    money: 'Money is raw material: worthless until shaped. Charge for the finished work, never the hours.',
    career: 'Become so good they cannot ignore the work. Mastery is the only résumé that never lies.',
    relationship: 'Craft your relationships like your work: with patience, intention, and standards that never slip.',
    decision: 'A decision is a chisel stroke — deliberate, hard to reverse, and made with the whole design in mind.',
    risk: 'Every great work risks failure. Mediocrity is the only risk-free path, and it is not worth taking.',
    conflict: 'Hold your standard through the storm. Conflict tests the work; let the work answer.',
    general: 'Hold it to the highest standard you know. Good enough is never good enough.'
  },
  // 8. The Visionary — first principles
  {
    money: 'Follow the physics of value — where does energy flow, and who controls it? Build at the source of the current.',
    career: 'Choose work aligned with first principles, not fashion. The future belongs to those who build from bedrock.',
    relationship: 'Strip the relationship to first principles: trust, respect, shared direction. Build from what is true.',
    decision: 'Reason from first principles: what is actually true here, beneath the convention? Decide from bedrock.',
    risk: 'De-risk by understanding the mechanics deeply. What looks like risk to others is certainty to the prepared.',
    conflict: 'Step above the conflict and examine its structure. Most fights are about convention, not truth.',
    general: 'Go back to first principles. What is true beneath the convention? Build from there.'
  },
  // 9. The Builder — systems, leverage, scale
  {
    money: 'Capital is fuel for the machine. Deploy it only where the mechanics of scale say it compounds.',
    career: 'Optimize for impact per hour, not hours per week. Work on problems so hard that solving them changes the field.',
    relationship: 'Run relationships on honest feedback loops: no politics, no pretense, maximum truth per conversation.',
    decision: 'Run the decision through the system: expected value, reversibility, bottleneck. Then move.',
    risk: 'Take risks where the math is asymmetric — small downside, enormous upside. Preparation favors the bold with data.',
    conflict: 'Conflict is usually a process failure. Find the broken interface, fix the system, move on.',
    general: 'Break it into systems: inputs, constraints, leverage points. Then scale what works.'
  },
  // 10. The Philosopher — authenticity, story
  {
    money: 'Chase alignment, not accumulation. Money earned in line with your values spends lighter and lasts longer.',
    career: 'Follow the roles that feel like truth. A career built on authenticity outlasts every pivot.',
    relationship: 'Be real or be gone. The right people recognize authenticity the way you recognize a home.',
    decision: 'Choose the path that feels honest when the noise dies down. The quiet answer is usually the true one.',
    risk: 'Risk the comfortable for the true. The scariest leap is usually toward the life you actually want.',
    conflict: 'Stay authentic under fire. The person who stays real when provoked wins the only fight that matters.',
    general: 'Sit with it until the honest answer surfaces. The truth is usually the quietest voice.'
  },
  // 11. The Mentor — gravitas, principle
  {
    money: 'Handle money with gravity: principled, patient, and never louder than the work it serves.',
    career: 'Lead from principle and the promotions follow. Character is the career strategy nobody can take from you.',
    relationship: 'Carry the room by lifting the people in it. Principled presence turns relationships into legacies.',
    decision: 'Decide as the person you claim to be. The choice you can defend without theatrics is the right one.',
    risk: 'Take principled risks — the kind you would be proud to explain. Courage with character is never wasted.',
    conflict: 'Carry yourself with gravity — principled, measured, unshakable. Dignity disarms more than force.',
    general: 'Act like the person you want to become. The standard you set is the standard you get.'
  },
  // 12. The Allocator — capital, patience
  {
    money: 'First rule: protect the downside. The market rewards patience; the clock is the asset.',
    career: 'Invest in yourself like a business with a moat: compounding skills, low ego-overhead, a forty-year horizon.',
    relationship: 'Choose people the way you would choose a partner for fifty years — character compounds, charm does not.',
    decision: 'Demand a margin of safety and keep optionality. The best decision stays right even if you are wrong.',
    risk: 'Risk is the price of return — pay it knowingly. Never risk what you cannot afford to lose.',
    conflict: 'Never enter a fight you cannot win, and never win one that costs your reputation. Choose your battles.',
    general: 'Be patient, be selective, protect the downside. Time and discipline compound everything.'
  },
  // 13. The Purpose — mindfulness, service
  {
    money: 'Let money serve meaning, not the reverse. Earn cleanly, give deliberately, and keep your why louder than your want.',
    career: 'Choose the work that serves someone besides you. Purpose is the promotion that never gets revoked.',
    relationship: 'Serve before you ask. The relationships that last are built on giving, not taking.',
    decision: 'Ask whether the decision serves your why. If the action and the reason diverge, choose the reason.',
    risk: 'Risk in service of meaning is never wasted. Ask what the risk protects — if it is your purpose, take it.',
    conflict: 'Lead with understanding before position. Conflicts dissolve when both sides feel heard — then guide toward meaning.',
    general: 'Return to your why. When the purpose is clear, the path reveals itself.'
  },
  // 14. The Ignition — action over hesitation
  {
    money: 'Decide the money move quickly and execute. Hesitation is the most expensive line item you own.',
    career: 'Stop waiting for the perfect role — take the action in front of you today. Momentum is the application.',
    relationship: 'Make the call, send the message, have the conversation — today. Hesitation rots relationships faster than conflict.',
    decision: 'The answer you knew at second one was the answer. Decide and move.',
    risk: 'Shrink the risk until action becomes immediate. A small brave step beats a grand plan that never starts.',
    conflict: 'Address it now, directly, in plain words. Delayed conflict compounds; immediate honesty defuses.',
    general: 'Move. Action creates clarity that thinking never will.'
  },
  // 15. The Order — responsibility, meaning
  {
    money: 'Put your financial house in order first — the budget, the debt, the obligations. Chaos in money is chaos everywhere.',
    career: 'Aim at the highest good you can see, then take responsibility for the next rung. Order your days; the career follows.',
    relationship: 'Take responsibility for your half of every relationship. Meaning grows where responsibility is accepted.',
    decision: 'Interrogate the assumption the decision depends on. Then choose the path that increases order and responsibility.',
    risk: 'Confront the risk honestly — name it, measure it, prepare for it. What you face shrinks; what you avoid grows.',
    conflict: 'Tell the truth, or at least do not lie. Clean up your side first — then stand your ground on what matters.',
    general: 'Take responsibility for what you can control. Order begins with the smallest honest step.'
  },
  // 16. The Peak — motivation, state, standards
  {
    money: 'Money is a tool for contribution at scale. Decide what your wealth is FOR, then play the game at full intensity.',
    career: 'Raise your standards and your state follows. Play the career game at a level that demands your full capacity.',
    relationship: 'Bring your best state to your people and raise theirs. Energy is contagious — be the source, not the drain.',
    decision: 'Change your state first, then decide. A decision made in a peak state beats one made in fear.',
    risk: 'Risk is just fear without a decision. Change your state, commit fully, and let the risk become the story.',
    conflict: 'Change the emotional state of the room before you change minds. People negotiate from their state, not their logic.',
    general: 'Raise your state and your standards together. You will find the answer at a higher level of energy.'
  }
];

/* ---- The chair's synthesis, per theme ---- */
const SYNTHESES = {
  money: 'The room converges: treat money as fuel, not identity — price with conviction, protect the downside, and let every dollar serve the long game.',
  career: 'The room converges: build undeniable value, communicate it cleanly, and let patience and discipline compound your position.',
  relationship: 'The room converges: be reliable, be real, and invest in the people who matter — relationships compound like capital.',
  conflict: 'The room converges: stay principled under pressure, address it directly, and let dignity outlast drama.',
  risk: 'The room converges: protect what can end you, price what you can lose, and move boldly where the upside is real.',
  decision: 'The room converges: decide from principle, not pressure — set criteria, make the call, and execute with full commitment.',
  general: 'The room converges: aim high, act with discipline, and let principle — not noise — make the call.'
};

async function deliberate({ question }) {
  const q = String(question || '');
  const theme = detectTheme(q);
  const deliberation = SEATS.map((seat, i) => ({
    seat: seat.seat,
    archetype: seat.archetype,
    mbti: seat.mbti,
    estimateNote: 'temperament profile',
    response: VOICES[i][theme],
    label: 'preview'
  }));
  return {
    provider: PROVIDER_ID,
    mode: 'preview',
    label: PREVIEW_LABEL,
    theme,
    questionEcho: q.slice(0, 320),
    deliberation,
    synthesis: {
      chair: 'The Chair',
      text: SYNTHESES[theme],
      label: 'preview'
    },
    disclaimer: DISCLAIMER
  };
}

module.exports = { deliberate, PROVIDER_ID, detectTheme };
