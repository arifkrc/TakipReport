import { createRowCountSelector, createPaginationControls, exportToCSV, exportToXLSX, printTable } from '../ui/helpers.js';

export async function mount(container, { setHeader }) {
  setHeader('Operasyonlar', 'Rapor görünümü (sadece liste)');
  container.innerHTML = `
    <div class="mt-2">
      <h3 class="text-xl font-semibold mb-2">Operasyonlar</h3>
      <div id="operasyon-list-placeholder"></div>
    </div>
  `;

  const placeholder = container.querySelector('#operasyon-list-placeholder');
  // charts removed for Operasyonlar view (list-only)

  async function loadList() {
    let res;
    // Prefer operation types endpoint with onlyActive filter if available
    if (window.api && typeof window.api.listOperationTypes === 'function') {
      res = await window.api.listOperationTypes({ onlyActive: true });
      if (res && res.ok && Array.isArray(res.records)) {
        res.records = res.records.map(o => ({
          operasyonKodu: o.operationCode || o.code || o.operasyonKodu || '',
          operasyonAdi: o.operationName || o.name || o.operasyonAdi || '',
          aktif: (typeof o.isActive === 'boolean') ? o.isActive : (o.aktif || false),
          savedAt: o.updatedAt || o.createdAt || o.savedAt || null,
          _raw: o
        }));
      }
    } else if (window.api && typeof window.api.listOperations === 'function') {
      res = await window.api.listOperations();
      if (res && res.ok && Array.isArray(res.records)) {
        res.records = res.records.map(o => ({
          operasyonKodu: o.operationCode || o.operasyonKodu || '',
          operasyonAdi: o.operationName || o.operasyonAdi || '',
          aktif: (typeof o.isActive === 'boolean') ? o.isActive : (o.aktif || false),
          savedAt: o.updatedAt || o.createdAt || o.savedAt || null,
          _raw: o
        }));
      }
    } else {
      res = await window.electronAPI.listOperasyon();
    }
    if (!res || !res.ok) { placeholder.innerHTML = '<div class="text-rose-400">Liste yüklenemedi</div>'; return; }
    const records = res.records || [];

    const { wrapper: selectorWrap, select } = createRowCountSelector(20);
    const searchWrap = document.createElement('div');
    searchWrap.className = 'ml-2';
    searchWrap.innerHTML = `<input type="search" placeholder="Tabloda ara..." class="px-3 py-2 rounded bg-neutral-800 text-neutral-200" />`;
    const searchInput = searchWrap.querySelector('input');

    placeholder.innerHTML = '';
  const topRow = document.createElement('div'); topRow.className = 'flex items-center gap-2'; topRow.appendChild(selectorWrap); topRow.appendChild(searchWrap);
  const tools = document.createElement('div'); tools.className = 'ml-auto flex items-center gap-2';
  tools.innerHTML = `<button id="export-csv" class="px-3 py-1 bg-neutral-800 rounded">CSV</button><button id="export-xlsx" class="px-3 py-1 bg-neutral-800 rounded">XLSX</button><button id="print-table" class="px-3 py-1 bg-neutral-800 rounded">Yazdır</button>`;
  topRow.appendChild(tools);
  placeholder.appendChild(topRow);

  let pageSize = (select.value === 'all') ? records.length || 1 : Number(select.value || 20);
  let currentPage = 1;
  // sorting state
  let sortKey = null;
  let sortDir = 'asc';
    const pager = createPaginationControls(records.length, pageSize, currentPage, (p) => { currentPage = p; renderTable(); });
    placeholder.appendChild(pager);
    const debugInfo = document.createElement('div'); debugInfo.className = 'text-sm text-neutral-400 mt-1'; placeholder.appendChild(debugInfo);

  const renderTable = () => {
      const limit = select.value;
      pageSize = (limit === 'all') ? records.length || 1 : Number(limit || 20);
      const q = (searchInput && searchInput.value || '').trim().toLowerCase();
      const filtered = q ? records.filter(r => {
        return ['operasyonKodu','operasyonAdi'].some(k => String(r[k] || '').toLowerCase().includes(q));
      }) : records;
      // apply sorting
      const sorted = (() => {
        if (!sortKey) return filtered;
        const copy = filtered.slice();
        copy.sort((a,b) => {
          const va = (a && a[sortKey] != null) ? a[sortKey] : '';
          const vb = (b && b[sortKey] != null) ? b[sortKey] : '';
          if (typeof va === 'boolean' || typeof vb === 'boolean') {
            const na = va ? 1 : 0; const nb = vb ? 1 : 0; return (na - nb) * (sortDir === 'asc' ? 1 : -1);
          }
          const na = Number(va); const nb = Number(vb);
          if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * (sortDir === 'asc' ? 1 : -1);
          const da = Date.parse(String(va)); const db = Date.parse(String(vb));
          if (!Number.isNaN(da) && !Number.isNaN(db)) return (da - db) * (sortDir === 'asc' ? 1 : -1);
          return String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' }) * (sortDir === 'asc' ? 1 : -1);
        });
        return copy;
      })();
      const start = (currentPage - 1) * pageSize;
      const slice = (limit === 'all') ? sorted : sorted.slice(start, start + pageSize);
      const html = `
      <div class="mt-4">
        <div class="overflow-auto bg-neutral-800 p-2 rounded">
          <table class="w-full text-left text-sm">
            <thead class="text-neutral-400">
              <tr>
                <th class="p-2" data-key="operasyonKodu">Operasyon Kodu</th>
                <th class="p-2" data-key="operasyonAdi">Operasyon Adı</th>
                <th class="p-2" data-key="aktif">Aktif</th>
                <th class="p-2" data-key="savedAt">Kaydedildi</th>
              </tr>
            </thead>
            <tbody>
              ${slice.map(r => `
                <tr class="border-t border-neutral-700">
                  <td class="p-2">${r.operasyonKodu || ''}</td>
                  <td class="p-2">${r.operasyonAdi || ''}</td>
                  <td class="p-2">${r.aktif ? 'Evet' : 'Hayır'}</td>
                  <td class="p-2 text-neutral-400">${r.savedAt ? new Date(r.savedAt).toLocaleString() : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
      const existingTable = placeholder.querySelector('.mt-4');
      if (existingTable) existingTable.outerHTML = html; else placeholder.insertAdjacentHTML('beforeend', html);
      // attach sort handlers and indicators
      const headerCells = placeholder.querySelectorAll('th[data-key]');
      headerCells.forEach(h => {
        const key = h.getAttribute('data-key');
        h.style.cursor = 'pointer';
        const indicator = (sortKey === key) ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
        h.textContent = h.textContent.replace(/\s*[▲▼]\s*$/, '') + indicator;
        h.onclick = () => {
          if (sortKey !== key) { sortKey = key; sortDir = 'asc'; }
          else if (sortDir === 'asc') { sortDir = 'desc'; }
          else { sortKey = null; sortDir = 'asc'; }
          renderTable();
        };
      });
    };

  // charts intentionally removed; no-op

    setTimeout(() => {
      const csvBtn = topRow.querySelector('#export-csv');
      const xlsxBtn = topRow.querySelector('#export-xlsx');
      const printBtn = topRow.querySelector('#print-table');
      csvBtn && csvBtn.addEventListener('click', () => { try { exportToCSV('operasyon-export.csv', records); } catch(e){} });
      xlsxBtn && xlsxBtn.addEventListener('click', async () => { try { await exportToXLSX('operasyon-export.xlsx', records); } catch(e){} });
      printBtn && printBtn.addEventListener('click', () => { try { printTable('Operasyonlar', records); } catch(e){} });
    }, 80);

  pager.update(records.length, pageSize, currentPage);
  renderTable();
  // charts removed
  select.addEventListener('change', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); });
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); });
  }

  await loadList();
}

export async function unmount(container) { try { container.innerHTML = ''; } catch(e) {} }
