import client from './client.js';

// Packing API

/**
 * Simulate packing allocation (does not commit)
 * @param {Object} payload PackingSimulationRequest
 * @returns {Promise<PackingSimulationResult>}
 */
export async function simulatePacking(payload) {
  const res = await client.post('/api/packing/simulate', payload);
  return res.data;
}

/**
 * Commit packing (creates a packing record)
 * @param {Object} payload PackingCreateRequest
 * @returns {Promise<PackingCreateResponse>}
 */
export async function commitPacking(payload) {
  const res = await client.post('/api/packing', payload);
  return res.data;
}
