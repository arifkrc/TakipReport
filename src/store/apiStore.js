import * as packingApi from '../api/packing.js';
import * as utfApi from '../api/utf.js';

// Minimal event-emitter style store
const state = {
  packing: {
    lastSimulation: null,
    lastCommit: null,
    loading: false,
    error: null
  },
  utf: {
    lastBulkResult: null,
    lastCreated: null,
    loading: false,
    error: null
  }
};

const listeners = new Set();
function notify() { listeners.forEach(fn => { try { fn(state); } catch(e){} }); }

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function getState() { return state; }

// Packing actions
export async function simulatePacking(payload) {
  state.packing.loading = true; state.packing.error = null; notify();
  try {
    const res = await packingApi.simulatePacking(payload);
    state.packing.lastSimulation = res;
    state.packing.loading = false;
    notify();
    return res;
  } catch (err) {
    state.packing.error = err && err.message ? err.message : String(err);
    state.packing.loading = false; notify();
    throw err;
  }
}

export async function commitPacking(payload) {
  state.packing.loading = true; state.packing.error = null; notify();
  try {
    const res = await packingApi.commitPacking(payload);
    state.packing.lastCommit = res;
    state.packing.loading = false; notify();
    return res;
  } catch (err) {
    state.packing.error = err && err.message ? err.message : String(err);
    state.packing.loading = false; notify();
    throw err;
  }
}

// UTF actions
export async function bulkUtf(payload) {
  state.utf.loading = true; state.utf.error = null; notify();
  try {
    const res = await utfApi.bulkUtf(payload);
    state.utf.lastBulkResult = res;
    state.utf.loading = false; notify();
    return res;
  } catch (err) {
    state.utf.error = err && err.message ? err.message : String(err);
    state.utf.loading = false; notify();
    throw err;
  }
}

export async function createUtf(payload) {
  state.utf.loading = true; state.utf.error = null; notify();
  try {
    const res = await utfApi.createUtf(payload);
    state.utf.lastCreated = res;
    state.utf.loading = false; notify();
    return res;
  } catch (err) {
    state.utf.error = err && err.message ? err.message : String(err);
    state.utf.loading = false; notify();
    throw err;
  }
}

export default {
  getState, subscribe, simulatePacking, commitPacking, bulkUtf, createUtf
};
