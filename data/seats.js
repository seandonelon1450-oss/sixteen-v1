'use strict';
/* =====================================================================
 * Sixteen™ V1 — the 16 seats (shared server-side by server.js and the
 * providers). Order is the founder's canonical order.
 *
 * Legal framing (per the Arbor build brief): each seat is an ARCHETYPE —
 * a named temperament and mandate. NO real people's names, likenesses,
 * endorsements, or affiliations are used anywhere in this product.
 * MBTI letters describe each archetype's temperament profile.
 * =================================================================== */
const SEATS = [
  { seat: 1,  archetype: 'The Throne',     mbti: 'ENTJ', mandate: 'Macro-strategy, scaling, execution at the highest level.' },
  { seat: 2,  archetype: 'The Voice',      mbti: 'ENFJ', mandate: 'Communication, negotiation: say it clean, land it calm.' },
  { seat: 3,  archetype: 'The Standard',   mbti: 'ESTJ', mandate: 'Operational discipline and leadership: own every outcome.' },
  { seat: 4,  archetype: 'The Edge',       mbti: 'ESTP', mandate: 'Competitive fire and toughness: refuse to back down.' },
  { seat: 5,  archetype: 'The Arena',      mbti: 'ESTP', mandate: 'Deal-making and high-stakes competition: know the terms, play the stakes.' },
  { seat: 6,  archetype: 'The Polymath',   mbti: 'ENTP', mandate: 'Invention, diplomacy, and wit across every discipline.' },
  { seat: 7,  archetype: 'The Master',     mbti: 'INTJ', mandate: 'Craft and relentless standards: the work is never finished until it is excellent.' },
  { seat: 8,  archetype: 'The Visionary',  mbti: 'INTJ', mandate: 'First-principles thinking: see the future, then build it.' },
  { seat: 9,  archetype: 'The Builder',    mbti: 'INTJ', mandate: 'Scale through physics and will: constraints first, then leverage.' },
  { seat: 10, archetype: 'The Philosopher', mbti: 'ENFP', mandate: 'Authenticity and storytelling: choose the path that is honest.' },
  { seat: 11, archetype: 'The Mentor',     mbti: 'ENFJ', mandate: 'Gravitas and principled leadership: carry the room, lift the people in it.' },
  { seat: 12, archetype: 'The Allocator',  mbti: 'INTJ', mandate: 'Capital, patience, and long-term value: time is the final asset.' },
  { seat: 13, archetype: 'The Purpose',    mbti: 'ENFJ', mandate: 'Mindfulness and service-driven influence: lead from meaning.' },
  { seat: 14, archetype: 'The Ignition',   mbti: 'ENFJ', mandate: 'Action over hesitation: decide and move.' },
  { seat: 15, archetype: 'The Order',      mbti: 'INFJ', mandate: 'Responsibility, meaning, and psychological depth.' },
  { seat: 16, archetype: 'The Peak',       mbti: 'ENFJ', mandate: 'Human motivation at scale: raise the state, raise the standard.' }
];

module.exports = SEATS;
