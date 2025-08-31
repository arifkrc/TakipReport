// Preload - expose a minimal, safe API for renderer to request saves
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // save production record (returns a promise)
  saveUretim: (data) => ipcRenderer.invoke('save-uretim', data),
  listUretim: () => ipcRenderer.invoke('list-uretim'),
  savePaketleme: (data) => ipcRenderer.invoke('save-paketleme', data),
  listPaketleme: () => ipcRenderer.invoke('list-paketleme'),
  // product (urun)
  saveUrun: (data) => ipcRenderer.invoke('save-urun', data),
  listUrun: () => ipcRenderer.invoke('list-urun'),
  // operasyon (operations)
  saveOperasyon: (data) => ipcRenderer.invoke('save-operasyon', data),
  listOperasyon: () => ipcRenderer.invoke('list-operasyon'),
  // siparis (orders)
  saveSiparis: (data) => ipcRenderer.invoke('save-siparis', data),
  listSiparis: () => ipcRenderer.invoke('list-siparis'),
  importSiparis: (filePaths) => ipcRenderer.invoke('import-siparis', filePaths),
  previewSiparis: () => ipcRenderer.invoke('preview-siparis')
  ,
  // deletes by savedAt timestamp
  deleteUretim: (savedAt) => ipcRenderer.invoke('delete-uretim', savedAt),
  deletePaketleme: (savedAt) => ipcRenderer.invoke('delete-paketleme', savedAt),
  deleteUrun: (savedAt) => ipcRenderer.invoke('delete-urun', savedAt),
  deleteOperasyon: (savedAt) => ipcRenderer.invoke('delete-operasyon', savedAt),
  deleteSiparis: (savedAt) => ipcRenderer.invoke('delete-siparis', savedAt)
});

// Minimal API bridge for REST backend (realtime API)
(() => {
  let API_BASE = 'https://localhost:7196';
  let accessToken = null;

  function setBaseURL(url) { API_BASE = String(url || '').replace(/\/+$/, ''); }
  function setAccessToken(token) { accessToken = token; }

  async function apiFetch(path, opts = {}) {
    const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    try {
      const res = await fetch(url, Object.assign({}, opts, { headers, credentials: 'include' }));
      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) data = await res.json(); else data = await res.text();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  // (connection helpers removed)

  contextBridge.exposeInMainWorld('api', {
    setBaseURL,
    setAccessToken,
    // list endpoints
    listUretim: async () => {
      const r = await apiFetch('/uretim', { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    saveUretim: async (payload) => {
      const r = await apiFetch('/uretim', { method: 'POST', body: JSON.stringify(payload) });
      return r.ok ? { ok: true, data: r.data } : { ok: false, error: r.data || r.error || `status ${r.status}` };
    },
    listPaketleme: async () => {
      const r = await apiFetch('/paketleme', { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    // new: fetch packing records from API endpoint /api/Packing
    // accepts options: { onlyActive: true }
    listPacking: async (options = {}) => {
      const qs = options && options.onlyActive ? '?onlyActive=true' : '';
      const r = await apiFetch(`/api/Packing${qs}`, { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    listSiparis: async () => {
      const r = await apiFetch('/siparis', { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    // list orders from /api/Orders — accepts options { onlyOpen: true|false }
    listOrders: async (options = {}) => {
      const onlyOpen = options && options.onlyOpen ? true : false;
      const qs = `?onlyOpen=${onlyOpen ? 'true' : 'false'}`;
      const r = await apiFetch(`/api/Orders${qs}`, { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    listUrun: async () => {
      const r = await apiFetch('/urun', { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    // new: fetch products from API endpoint /api/Product
    // accepts an optional options object: { onlyActive: true }
  listProducts: async (options = {}) => {
      const qs = options && options.onlyActive ? '?onlyActive=true' : '';
      const r = await apiFetch(`/api/Product${qs}`, { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    listOperasyon: async () => {
      const r = await apiFetch('/operasyon', { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    // new: fetch operations from API endpoint /api/Operation
    // accepts an optional options object: { onlyActive: true }
    listOperations: async (options = {}) => {
      const qs = options && options.onlyActive ? '?onlyActive=true' : '';
      const r = await apiFetch(`/api/Operation${qs}`, { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    // fetch operation types from API endpoint /api/OperationType
    // accepts an optional options object: { onlyActive: true }
    listOperationTypes: async (options = {}) => {
      const qs = options && options.onlyActive ? '?onlyActive=true' : '';
      const r = await apiFetch(`/api/OperationType${qs}`, { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
    // list UTF (production) records from /api/Utf
    // options: { onlyActive: true|false, from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
    listUtf: async (options = {}) => {
      const onlyActive = options && typeof options.onlyActive !== 'undefined' ? !!options.onlyActive : true;
      const parts = [`onlyActive=${onlyActive ? 'true' : 'false'}`];
      if (options && typeof options.from !== 'undefined' && options.from !== '') parts.push(`from=${encodeURIComponent(String(options.from))}`);
      if (options && typeof options.to !== 'undefined' && options.to !== '') parts.push(`to=${encodeURIComponent(String(options.to))}`);
      const qs = parts.length ? `?${parts.join('&')}` : '';
      const r = await apiFetch(`/api/Utf${qs}`, { method: 'GET' });
      if (!r.ok) return { ok: false, error: r.data || r.error || `status ${r.status}` };
      return { ok: true, records: r.data || [] };
    },
  // (connection helpers removed)
    // delete helpers (by savedAt or id depending on API)
    deleteUretim: async (id) => {
      const r = await apiFetch(`/uretim/${encodeURIComponent(String(id || ''))}`, { method: 'DELETE' });
      return r.ok ? { ok: true } : { ok: false, error: r.data || r.error || `status ${r.status}` };
    }
  });
})();
