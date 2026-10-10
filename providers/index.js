'use strict';
/* =====================================================================
 * Sixteen™ V1 — provider selector.
 *
 * LLM_PROVIDER=openai + LLM_API_KEY set  -> real provider
 * anything else                            -> mock (preview) provider
 *
 * The mock is the default so the app runs end-to-end with zero keys.
 * =================================================================== */
const mock = require('./mock');
const openai = require('./openai');

function providerInfo() {
  const id = (process.env.LLM_PROVIDER || 'mock').toLowerCase().trim();
  if (id === 'openai' && openai.isConfigured()) {
    return {
      id: 'openai',
      demoMode: false,
      model: process.env.LLM_MODEL || 'gpt-4o-mini'
    };
  }
  if (id === 'openai' && !openai.isConfigured()) {
    console.warn('[sixteen] LLM_PROVIDER=openai but LLM_API_KEY is missing — falling back to mock provider.');
  }
  return { id: 'mock', demoMode: true, model: 'sixteen-mock-v1 (template preview voices)' };
}

function getProvider() {
  return providerInfo().id === 'openai' ? openai : mock;
}

module.exports = { getProvider, providerInfo };
