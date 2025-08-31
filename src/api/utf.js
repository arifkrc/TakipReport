import client from './client.js';

/**
 * Bulk import UTF items
 * @param {Object} payload BulkUtfRequest
 * @returns {Promise<BulkUtfResponse>}
 */
export async function bulkUtf(payload) {
  const res = await client.post('/api/utf/bulk', payload);
  return res.data;
}

/**
 * Create single UTF record
 * @param {Object} payload UtfCreateUpdateDto
 * @returns {Promise<Object>} created DTO
 */
export async function createUtf(payload) {
  const res = await client.post('/api/utf', payload);
  return res.data;
}
