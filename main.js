const { app, BrowserWindow } = require('electron');
const { ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// When switching to realtime data, enable REALTIME_MODE to disable file-based persistence
const REALTIME_MODE = true;

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadFile('index.html');
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// IPC handler to save üretim records to a JSON file in app.getPath('userData')
ipcMain.handle('save-uretim', async (event, record) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'uretim-records.json');
    let existing = [];
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        existing = JSON.parse(raw || '[]');
      }
    } catch (e) {
      // if parse fails, overwrite
      existing = [];
    }

    // append record with timestamp
    const toSave = Object.assign({}, record, { savedAt: new Date().toISOString() });
    existing.push(toSave);
    fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf8');
    return { ok: true, path: file };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

// IPC handler to list üretim records
ipcMain.handle('list-uretim', async () => {
  if (REALTIME_MODE) return { ok: true, records: [] };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'uretim-records.json');
    if (!fs.existsSync(file)) return { ok: true, records: [] };
    const raw = fs.readFileSync(file, 'utf8');
    const records = JSON.parse(raw || '[]');
    return { ok: true, records };
  } catch (err) {
    return { ok: false, error: String(err), records: [] };
  }
});

// IPC handlers for paketleme (packing) records
ipcMain.handle('save-paketleme', async (event, record) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'paketleme-records.json');
    let existing = [];
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        existing = JSON.parse(raw || '[]');
      }
    } catch (e) {
      existing = [];
    }

    const toSave = Object.assign({}, record, { savedAt: new Date().toISOString() });
    existing.push(toSave);
    fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf8');
    return { ok: true, path: file };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('list-paketleme', async () => {
  if (REALTIME_MODE) return { ok: true, records: [] };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'paketleme-records.json');
    if (!fs.existsSync(file)) return { ok: true, records: [] };
    const raw = fs.readFileSync(file, 'utf8');
    const records = JSON.parse(raw || '[]');
    return { ok: true, records };
  } catch (err) {
    return { ok: false, error: String(err), records: [] };
  }
});

// IPC handlers for product (urun) records
ipcMain.handle('save-urun', async (event, record) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'urun-records.json');
    let existing = [];
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        existing = JSON.parse(raw || '[]');
      }
    } catch (e) { existing = []; }

    const toSave = Object.assign({}, record, { savedAt: new Date().toISOString() });
    existing.push(toSave);
    fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf8');
    return { ok: true, path: file };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('list-urun', async () => {
  if (REALTIME_MODE) return { ok: true, records: [] };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'urun-records.json');
    if (!fs.existsSync(file)) return { ok: true, records: [] };
    const raw = fs.readFileSync(file, 'utf8');
    const records = JSON.parse(raw || '[]');
    return { ok: true, records };
  } catch (err) {
    return { ok: false, error: String(err), records: [] };
  }
});

// IPC handlers for operasyon (operations) records
ipcMain.handle('save-operasyon', async (event, record) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'operasyon-records.json');
    let existing = [];
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        existing = JSON.parse(raw || '[]');
      }
    } catch (e) { existing = []; }

    const toSave = Object.assign({}, record, { savedAt: new Date().toISOString() });
    existing.push(toSave);
    fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf8');
    return { ok: true, path: file };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('list-operasyon', async () => {
  if (REALTIME_MODE) return { ok: true, records: [] };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'operasyon-records.json');
    if (!fs.existsSync(file)) return { ok: true, records: [] };
    const raw = fs.readFileSync(file, 'utf8');
    const records = JSON.parse(raw || '[]');
    return { ok: true, records };
  } catch (err) {
    return { ok: false, error: String(err), records: [] };
  }
});

// IPC handlers for siparis (orders)
ipcMain.handle('save-siparis', async (event, record) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'siparis-records.json');
    let existing = [];
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        existing = JSON.parse(raw || '[]');
      }
    } catch (e) { existing = []; }

    const toSave = Object.assign({}, record, { savedAt: new Date().toISOString() });
    existing.push(toSave);
    fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf8');
    return { ok: true, path: file };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('list-siparis', async () => {
  if (REALTIME_MODE) return { ok: true, records: [] };
  try {
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'siparis-records.json');
    if (!fs.existsSync(file)) return { ok: true, records: [] };
    const raw = fs.readFileSync(file, 'utf8');
    const records = JSON.parse(raw || '[]');
    return { ok: true, records };
  } catch (err) {
    return { ok: false, error: String(err), records: [] };
  }
});

// import-siparis: open dialog, parse .csv and .xlsx files and append rows to siparis-records.json
ipcMain.handle('import-siparis', async (event, filePathsArg) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    let filePaths = filePathsArg;
    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      const { canceled, filePaths: picked } = await dialog.showOpenDialog({
        title: 'Dosya seç (CSV veya XLSX)',
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Sheets & CSV', extensions: ['csv', 'xlsx', 'xls'] }
        ]
      });
      if (canceled || !picked || picked.length === 0) return { ok: true, imported: [] };
      filePaths = picked;
    }

    // lazy-require xlsx so app still runs if package missing
    let XLSX = null;
    try { XLSX = require('xlsx'); } catch (e) { /* will handle below for xlsx files */ }

    const rows = [];
    for (const p of filePaths) {
      const ext = path.extname(p || '').toLowerCase();
      if (ext === '.csv') {
        const raw = fs.readFileSync(p, 'utf8');
        const lines = raw.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) continue;
        const headers = lines[0].split(',').map(h => h.trim());
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          const obj = {};
          headers.forEach((h, idx) => { obj[h] = (cols[idx] || '').trim(); });
          rows.push(obj);
        }
      } else if (ext === '.xlsx' || ext === '.xls') {
        if (!XLSX) {
          return { ok: false, error: 'xlsx parser not installed. run npm install xlsx' };
        }
        const workbook = XLSX.readFile(p);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        for (const r of json) rows.push(r);
      }
    }

    // helper: normalize keys for robust matching
    const normalize = (s) => String(s || '').toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[^\w]/g, '');
    const buildNormMap = (obj) => {
      const map = {};
      Object.keys(obj || {}).forEach(k => { map[normalize(k)] = obj[k]; });
      return map;
    };

    const mapRow = (r) => {
      const norm = buildNormMap(r);
      const pick = (variants, fallback='') => {
        for (const v of variants) if (norm[v] !== undefined) return norm[v];
        return fallback;
      };
      return {
        urunKodu: pick(['urunkodu','ürünkodu','urunkod','productcode','product_code']),
        aciklama: pick(['aciklama','açıklama','description','desc']),
        secenekler: pick(['secenekler','seçenekler','options']),
        belgeNo: pick(['belgeno','belgeno','belgeno','docno','belgeno']),
        musteriAdi: pick(['musteriadi','müşteriadı','musteri','customer']),
        siparisAdet: pick(['siparisadet','siparişadet','qty','quantity'], '0'),
        devirSayisi: pick(['devirsayisi','devirsayısı','turns'], '0')
      };
    };

    const mappedAll = rows.map(mapRow);

    // append to siparis-records.json
    const dataDir = app.getPath('userData');
    const file = path.join(dataDir, 'siparis-records.json');
    let existing = [];
    try { if (fs.existsSync(file)) { existing = JSON.parse(fs.readFileSync(file, 'utf8') || '[]'); } } catch(e) { existing = []; }
    const toSave = mappedAll.map(r => Object.assign({}, r, { savedAt: new Date().toISOString() }));
    existing = existing.concat(toSave);
    fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf8');

    return { ok: true, imported: toSave, filePaths };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

// preview-siparis: open dialog, parse .csv and .xlsx files but DO NOT save; return parsed rows and filePaths (limit to first 20 rows)
ipcMain.handle('preview-siparis', async () => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Dosya seç (CSV veya XLSX)',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Sheets & CSV', extensions: ['csv', 'xlsx', 'xls'] }
      ]
    });
    if (canceled || !filePaths || filePaths.length === 0) return { ok: true, rows: [], filePaths: [] };

    let XLSX = null;
    try { XLSX = require('xlsx'); } catch (e) { }

    const rows = [];
    for (const p of filePaths) {
      const ext = path.extname(p || '').toLowerCase();
      if (ext === '.csv') {
        const raw = fs.readFileSync(p, 'utf8');
        const lines = raw.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) continue;
        const headers = lines[0].split(',').map(h => h.trim());
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          const obj = {};
          headers.forEach((h, idx) => { obj[h] = (cols[idx] || '').trim(); });
          rows.push(obj);
        }
      } else if (ext === '.xlsx' || ext === '.xls') {
        if (!XLSX) {
          return { ok: false, error: 'xlsx parser not installed. run npm install xlsx' };
        }
        const workbook = XLSX.readFile(p);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        for (const r of json) rows.push(r);
      }
    }

    // normalize + map using robust normalization (matches variants like "Seçenekler", "Belge No", "Müşteri" etc.)
    const normalize = (s) => String(s || '').toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[^\w]/g, '');
    const buildNormMap = (obj) => {
      const map = {};
      Object.keys(obj || {}).forEach(k => { map[normalize(k)] = obj[k]; });
      return map;
    };

    const mapRow = (r) => {
      const norm = buildNormMap(r);
      const pick = (variants, fallback='') => {
        for (const v of variants) if (norm[v] !== undefined) return norm[v];
        return fallback;
      };
      return {
        urunKodu: pick(['urunkodu','ürünkodu','urunkod','productcode','product_code','urunkodu','urun kodu']),
        aciklama: pick(['aciklama','açıklama','description','desc']),
        secenekler: pick(['secenekler','seçenekler','options','secenek','secenekler']),
        belgeNo: pick(['belgeno','belge_no','belgeno','docno','doc_no','belge','belgeno','belge no']),
        musteriAdi: pick(['musteriadi','müşteriadı','musteri','customer','musteri adi','müşteri']),
        siparisAdet: pick(['siparisadet','siparişadet','qty','quantity','adet'], '0'),
        devirSayisi: pick(['devirsayisi','devirsayısı','devir','turns'], '0')
      };
    };

    const mapped = rows.map(mapRow);
    return { ok: true, rows: mapped, filePaths };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

// Generic delete handlers for records by savedAt timestamp
const tryDeleteByFile = (filePath, savedAt) => {
  try {
    if (!fs.existsSync(filePath)) return { ok: true, removed: false };
    const raw = fs.readFileSync(filePath, 'utf8');
    const arr = JSON.parse(raw || '[]');
    const filtered = arr.filter(r => String(r.savedAt || '') !== String(savedAt || ''));
    if (filtered.length === arr.length) return { ok: true, removed: false };
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
    return { ok: true, removed: true };
  } catch (err) { return { ok: false, error: String(err) }; }
};

ipcMain.handle('delete-uretim', async (event, savedAt) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const file = path.join(app.getPath('userData'), 'uretim-records.json');
    return tryDeleteByFile(file, savedAt);
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('delete-paketleme', async (event, savedAt) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const file = path.join(app.getPath('userData'), 'paketleme-records.json');
    return tryDeleteByFile(file, savedAt);
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('delete-urun', async (event, savedAt) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const file = path.join(app.getPath('userData'), 'urun-records.json');
    return tryDeleteByFile(file, savedAt);
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('delete-operasyon', async (event, savedAt) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const file = path.join(app.getPath('userData'), 'operasyon-records.json');
    return tryDeleteByFile(file, savedAt);
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('delete-siparis', async (event, savedAt) => {
  if (REALTIME_MODE) return { ok: false, error: 'disabled in realtime mode' };
  try {
    const file = path.join(app.getPath('userData'), 'siparis-records.json');
    return tryDeleteByFile(file, savedAt);
  } catch (err) { return { ok: false, error: String(err) }; }
});
