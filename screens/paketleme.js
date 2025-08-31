import { createRowCountSelector, createPaginationControls, exportToCSV, exportToXLSX, printTable } from '../ui/helpers.js';

export async function mount(container, { setHeader }) {
  setHeader('Paketleme', 'Rapor görünümü (sadece liste)');
  container.innerHTML = `
    <div class="mt-2">
      <h3 class="text-xl font-semibold mb-2">Paketleme Kayıtları</h3>
      <div id="paketleme-list-placeholder"></div>
    </div>
  `;

  const placeholder = container.querySelector('#paketleme-list-placeholder');
  // charts removed for Paketleme view (list-only)

  async function loadList() {
    let res;
    if (window.api && typeof window.api.listPacking === 'function') {
      res = await window.api.listPacking({ onlyActive: true });
    } else {
      res = await window.electronAPI.listPaketleme();
    }
    if (!res || !res.ok) { placeholder.innerHTML = '<div class="text-rose-400">Liste yüklenemedi</div>'; return; }
    let records = res.records || [];

    // try to resolve product codes/descriptions and order document numbers via batch fetch
    const productMap = {};
    const orderMap = {};
    try {
      if (window.api && typeof window.api.listProducts === 'function') {
        const p = await window.api.listProducts();
        if (p && p.ok && Array.isArray(p.records)) p.records.forEach(pp => { productMap[pp.id || pp.productId || pp.productId] = pp; productMap[pp.productId || pp.id || pp.productId] = pp; });
      }
      if (window.api && typeof window.api.listSiparis === 'function') {
        const o = await window.api.listSiparis();
        if (o && o.ok && Array.isArray(o.records)) o.records.forEach(or => { orderMap[or.id || or.orderId || or.id] = or; orderMap[or.orderId || or.id || or.orderId] = or; });
      }
    } catch (e) { /* swallow product/order fetch errors */ }

    // map packing records to display fields
    records = records.map(r => {
      const prod = productMap[r.productId] || productMap[r.productId] || null;
      const ord = orderMap[r.orderId] || orderMap[r.orderId] || null;
      return Object.assign({}, r, {
        urunKodu: (prod && (prod.productCode || prod.productCode)) || r.productCode || '',
        urunAciklamasi: (prod && (prod.description || prod.description)) || r.productDescription || '',
        paketAciklama: r.packageDescription || r.paketAciklama || '',
        musteri: r.customer || r.musteri || '',
        miktar: r.quantity || r.miktar || 0,
        tarih: r.date ? new Date(r.date).toLocaleString() : (r.tarih || ''),
        vardiya: r.shift || r.vardiya || '',
        sorumlu: r.supervisor || r.sorumlu || '',
        siparisNo: ord ? (ord.documentNumber || ord.documentNo || ord.DocumentNumber) : (r.orderDocumentNumber || ''),
        savedAt: r.updatedAt || r.createdAt || r.savedAt || null,
        _raw: r
      });
    });

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
    const pager = createPaginationControls(records.length, pageSize, currentPage, (p) => { currentPage = p; renderTable(); });
    placeholder.appendChild(pager);
    const debugInfo = document.createElement('div'); debugInfo.className = 'text-sm text-neutral-400 mt-1'; placeholder.appendChild(debugInfo);

  const renderTable = () => {
      const limit = select.value;
      pageSize = (limit === 'all') ? records.length || 1 : Number(limit || 20);
      const q = (searchInput && searchInput.value || '').trim().toLowerCase();
      const filtered = q ? records.filter(r => {
        return ['tarih','vardiya','ustabasi','urunKodu','aciklama','musteri'].some(k => String(r[k] || '').toLowerCase().includes(q));
      }) : records;
      const start = (currentPage - 1) * pageSize;
      const slice = (limit === 'all') ? filtered : filtered.slice(start, start + pageSize);

      const html = `
      <div class="mt-4">
        <div class="overflow-auto bg-neutral-800 p-2 rounded">
          <table class="w-full text-left text-sm">
            <thead class="text-neutral-400">
              <tr>
                <th class="p-2">Ürün Kodu</th>
                <th class="p-2">Ürün Açıklaması</th>
                <th class="p-2">Paket Açıklaması</th>
                <th class="p-2">Müşteri</th>
                <th class="p-2">Miktar</th>
                <th class="p-2">Tarih ve Saat</th>
                <th class="p-2">Vardiya</th>
                <th class="p-2">Sorumlu</th>
                <th class="p-2">Kaydedildi</th>
              </tr>
            </thead>
            <tbody>
              ${slice.map(r => `
                <tr class="border-t border-neutral-700">
                  <td class="p-2">${r.urunKodu || ''}</td>
                  <td class="p-2">${r.urunAciklamasi || ''}</td>
                  <td class="p-2">${r.paketAciklama || ''}</td>
                  <td class="p-2">${r.musteri || ''}</td>
                  <td class="p-2">${r.miktar || ''}</td>
                  <td class="p-2">${r.tarih || ''}</td>
                  <td class="p-2">${r.vardiya || ''}</td>
                  <td class="p-2">${r.sorumlu || ''}</td>
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
    };

  // charts intentionally removed; no-op

    setTimeout(() => {
      const csvBtn = topRow.querySelector('#export-csv');
      const xlsxBtn = topRow.querySelector('#export-xlsx');
      const printBtn = topRow.querySelector('#print-table');
      csvBtn && csvBtn.addEventListener('click', () => { try { exportToCSV('paketleme-export.csv', records); } catch(e){} });
      xlsxBtn && xlsxBtn.addEventListener('click', async () => { try { await exportToXLSX('paketleme-export.xlsx', records); } catch(e){} });
      printBtn && printBtn.addEventListener('click', () => { try { printTable('Paketleme Kayıtları', records); } catch(e){} });
    }, 80);

  pager.update(records.length, pageSize, currentPage);
  renderTable();
  // charts removed
  select.addEventListener('change', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); });
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); });
  }

  await loadList();
}

export async function unmount(container) {
  try { container.innerHTML = ''; } catch (e) {}
}

