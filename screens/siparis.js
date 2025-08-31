import { createRowCountSelector, createPaginationControls, exportToCSV, exportToXLSX, printTable } from '../ui/helpers.js';

export async function mount(container, { setHeader }) {
  setHeader('Siparişler', 'Rapor görünümü (sadece liste)');
  container.innerHTML = `
    <div class="mt-2">
      <h3 class="text-xl font-semibold mb-2">Siparişler</h3>
      <div id="siparis-list-placeholder"></div>
    </div>
  `;

  const placeholder = container.querySelector('#siparis-list-placeholder');
  // charts removed — list-only view

  // user-controlled flag: whether to request only open orders
  let onlyOpen = false;

  async function loadList() {
    // prefer realtime API for orders
    let resOrders;
    try {
      if (window.api && window.api.listOrders) {
        resOrders = await window.api.listOrders({ onlyOpen: onlyOpen });
      } else {
        // fallback to legacy ipc
        resOrders = await window.electronAPI.listSiparis();
      }
    } catch (e) {
      placeholder.innerHTML = '<div class="text-rose-400">Liste yüklenemedi</div>'; return;
    }
    const records = Array.isArray(resOrders) ? resOrders : (resOrders && (resOrders.records || resOrders.items || resOrders.data) ? (resOrders.records || resOrders.items || resOrders.data) : []);

    // build product lookup and aggregate packed/produced quantities so we can show Packed/Produced/Remaining
    const productMap = {};
    const packedMap = {};
    const producedMap = {};
    try {
      let prodRes;
      if (window.api && window.api.listProducts) prodRes = await window.api.listProducts(); else prodRes = await window.electronAPI.listUrun();
      const prodRecords = Array.isArray(prodRes) ? prodRes : (prodRes && prodRes.records ? prodRes.records : []);
      for (const p of (prodRecords || [])) {
        const id = p.id || p.productId || p._id || p.id;
        if (id != null) productMap[id] = p;
      }
    } catch (e) {}

    try {
      let packRes;
      if (window.api && window.api.listPacking) packRes = await window.api.listPacking({ onlyActive: false }); else packRes = await window.electronAPI.listPaketleme();
      const packRecords = Array.isArray(packRes) ? packRes : (packRes && packRes.records ? packRes.records : []);
      for (const pk of (packRecords || [])) {
        const qty = Number(pk.adet || pk.miktar || pk.quantity || pk.packedQuantity || 0) || 0;
        const doc = pk.documentNumber || pk.siparisBelgeNo || pk.siparisNo || pk.document || pk.orderDocumentNumber || '';
        if (doc) packedMap[doc] = (packedMap[doc] || 0) + qty;
        const pid = pk.productId || pk.urunId || pk.product || null;
        if (pid) packedMap[pid] = (packedMap[pid] || 0) + qty;
      }
    } catch (e) {}

    try {
      let urRes;
      if (window.api && window.api.listUretim) urRes = await window.api.listUretim(); else urRes = await window.electronAPI.listUretim();
      const urRecords = Array.isArray(urRes) ? urRes : (urRes && urRes.records ? urRes.records : []);
      for (const u of (urRecords || [])) {
        const qty = Number(u.uretimAdedi || u.adet || u.quantity || 0) || 0;
        const doc = u.siparisBelgeNo || u.documentNumber || u.belgeNo || u.orderDocument || '';
        if (doc) producedMap[doc] = (producedMap[doc] || 0) + qty;
        const pid = u.productId || u.urunId || u.product || null;
        if (pid) producedMap[pid] = (producedMap[pid] || 0) + qty;
      }
    } catch (e) {}

    const { wrapper: selectorWrap, select } = createRowCountSelector(20);
    const searchWrap = document.createElement('div');
    searchWrap.className = 'ml-2';
    searchWrap.innerHTML = `<input type="search" placeholder="Tabloda ara..." class="px-3 py-2 rounded bg-neutral-800 text-neutral-200" />`;
    const searchInput = searchWrap.querySelector('input');

    placeholder.innerHTML = '';
  const topRow = document.createElement('div'); topRow.className = 'flex items-center gap-2'; topRow.appendChild(selectorWrap); topRow.appendChild(searchWrap);
  // onlyOpen toggle
  const onlyWrap = document.createElement('label'); onlyWrap.className = 'ml-2 flex items-center gap-2 text-sm';
  onlyWrap.innerHTML = `<input type="checkbox" id="only-open-checkbox" class="rounded"> Sadece açık siparişler`;
  topRow.appendChild(onlyWrap);
  const onlyCheckbox = onlyWrap.querySelector('input'); onlyCheckbox.checked = onlyOpen;
  onlyCheckbox.addEventListener('change', () => { onlyOpen = !!onlyCheckbox.checked; loadList(); });

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
        return ['productCode','productDescription','options','documentNumber','customerName'].some(k => String(r[k] || '').toLowerCase().includes(q));
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
                <th class="p-2">Seçenekler</th>
                <th class="p-2">Müşteri</th>
                <th class="p-2">Belge / Sipariş No</th>
                <th class="p-2">Toplam Sipariş Adedi</th>
                <th class="p-2">Paketlenen (Adet)</th>
                <th class="p-2">Kalan (Adet)</th>
                <th class="p-2">Devir (Adet)</th>
                <th class="p-2">Üretilen Toplam</th>
                <th class="p-2">Durum</th>
                <th class="p-2">Kaydedilme Zamanı</th>
              </tr>
            </thead>
            <tbody>
              ${slice.map(r => {
                // compute display fields if pre-computed
                const productCode = r.productCode || r.urunKodu || '';
                const productDesc = r.productDescription || r.urunAciklamasi || (r.productId && productMap[r.productId] ? productMap[r.productId].description : '');
                const options = r.options || r.secenekler || '';
                const customer = r.customerName || r.musteriAdi || '';
                const docNo = r.documentNumber || r.belgeNo || r.document || '';
                // prefer API fields if present
                const orderQty = Number((r.OrderQuantity != null ? r.OrderQuantity : (r.orderQuantity != null ? r.orderQuantity : (r.siparisAdet || r.orderQty))) || 0);
                const carryOver = Number((r.CarryOverQuantity != null ? r.CarryOverQuantity : (r.carryOverQuantity != null ? r.carryOverQuantity : (r.devirSayisi || r.carryOver))) || 0);
                const packed = Number((r.PackedQuantity != null ? r.PackedQuantity : (packedMap[docNo] || packedMap[r.productId] || 0)) || 0);
                const produced = Number(producedMap[docNo] || producedMap[r.productId] || 0);
                const remaining = orderQty - packed;
                const status = (r.isCompleted === true || r.isCompleted === 'true' || r.isCompleted === 1) ? 'Tamamlandı' : 'Devam Ediyor';
                const saved = r.savedDate || r.savedAt || r.createdAt || '';
                const pct = orderQty > 0 ? Math.max(0, Math.min(100, Math.round((packed / orderQty) * 100))) : 0;
                return `\n                <tr class="border-t border-neutral-700">\n                  <td class="p-2">${productCode}</td>\n                  <td class="p-2">${productDesc}</td>\n                  <td class="p-2">${options}</td>\n                  <td class="p-2">${customer}</td>\n                  <td class="p-2">${docNo}</td>\n                  <td class="p-2">${orderQty}</td>\n                  <td class="p-2">\n                    <div class=\"w-48\">\n                      <div class=\"bg-neutral-700 h-3 rounded overflow-hidden\">\n                        <div style=\"width:${pct}%\" class=\"bg-emerald-500 h-3\"></div>\n                      </div>\n                      <div class=\"text-xs text-neutral-300 mt-1\">${packed}/${orderQty} (${pct}%)</div>\n                    </div>\n                  </td>\n                  <td class=\"p-2\">${remaining}</td>\n                  <td class=\"p-2\">${carryOver}</td>\n                  <td class=\"p-2\">${produced}</td>\n                  <td class=\"p-2\">${status}</td>\n                  <td class=\"p-2 text-neutral-400\">${saved ? new Date(saved).toLocaleString() : ''}</td>\n                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  const existingTable = placeholder.querySelector('.mt-4');
  if (existingTable) existingTable.outerHTML = html; else placeholder.insertAdjacentHTML('beforeend', html);
  };
  // charts removed — no-op

    setTimeout(() => {
      const csvBtn = topRow.querySelector('#export-csv');
      const xlsxBtn = topRow.querySelector('#export-xlsx');
      const printBtn = topRow.querySelector('#print-table');
      csvBtn && csvBtn.addEventListener('click', () => {
        try {
          const rows = records.map(r => {
            const productCode = r.productCode || r.urunKodu || '';
            const productDesc = r.productDescription || r.urunAciklamasi || '';
            const options = r.options || r.secenekler || '';
            const customer = r.customerName || r.musteriAdi || '';
            const docNo = r.documentNumber || r.belgeNo || r.document || '';
            const orderQty = Number((r.OrderQuantity != null ? r.OrderQuantity : (r.orderQuantity != null ? r.orderQuantity : (r.siparisAdet || r.orderQty))) || 0);
            const packed = Number((r.PackedQuantity != null ? r.PackedQuantity : 0) || 0);
            const remaining = orderQty - packed;
            const carryOver = Number((r.CarryOverQuantity != null ? r.CarryOverQuantity : (r.carryOverQuantity != null ? r.carryOverQuantity : (r.devirSayisi || r.carryOver))) || 0);
            const produced = Number((r.ProducedQuantity != null ? r.ProducedQuantity : 0) || 0);
            const status = (r.isCompleted === true || r.isCompleted === 'true' || r.isCompleted === 1) ? 'Tamamlandı' : 'Devam Ediyor';
            const saved = r.savedDate || r.savedAt || r.createdAt || '';
            return { productCode, productDesc, options, customer, documentNumber: docNo, orderQuantity: orderQty, packedQuantity: packed, remaining, carryOverQuantity: carryOver, producedQuantity: produced, status, savedAt: saved };
          });
          exportToCSV('siparis-export.csv', rows, [
            { key: 'productCode', label: 'Ürün Kodu' },{ key: 'productDesc', label: 'Ürün Açıklaması' },{ key: 'options', label: 'Seçenekler' },{ key: 'customer', label: 'Müşteri' },{ key: 'documentNumber', label: 'Belge/Sipariş No' },{ key: 'orderQuantity', label: 'Toplam Sipariş Adedi' },{ key: 'packedQuantity', label: 'Paketlenen (Adet)' },{ key: 'remaining', label: 'Kalan (Adet)' },{ key: 'carryOverQuantity', label: 'Devir (Adet)' },{ key: 'producedQuantity', label: 'Üretilen Toplam' },{ key: 'status', label: 'Durum' },{ key: 'savedAt', label: 'Kaydedilme Zamanı' }
          ]);
        } catch(e){}
      });
      xlsxBtn && xlsxBtn.addEventListener('click', async () => {
        try {
          const rows = records.map(r => {
            const productCode = r.productCode || r.urunKodu || '';
            const productDesc = r.productDescription || r.urunAciklamasi || '';
            const options = r.options || r.secenekler || '';
            const customer = r.customerName || r.musteriAdi || '';
            const docNo = r.documentNumber || r.belgeNo || r.document || '';
            const orderQty = Number((r.OrderQuantity != null ? r.OrderQuantity : (r.orderQuantity != null ? r.orderQuantity : (r.siparisAdet || r.orderQty))) || 0);
            const packed = Number((r.PackedQuantity != null ? r.PackedQuantity : 0) || 0);
            const remaining = orderQty - packed;
            const carryOver = Number((r.CarryOverQuantity != null ? r.CarryOverQuantity : (r.carryOverQuantity != null ? r.carryOverQuantity : (r.devirSayisi || r.carryOver))) || 0);
            const produced = Number((r.ProducedQuantity != null ? r.ProducedQuantity : 0) || 0);
            const status = (r.isCompleted === true || r.isCompleted === 'true' || r.isCompleted === 1) ? 'Tamamlandı' : 'Devam Ediyor';
            const saved = r.savedDate || r.savedAt || r.createdAt || '';
            return { productCode, productDesc, options, customer, documentNumber: docNo, orderQuantity: orderQty, packedQuantity: packed, remaining, carryOverQuantity: carryOver, producedQuantity: produced, status, savedAt: saved };
          });
          await exportToXLSX('siparis-export.xlsx', rows, [
            { key: 'productCode', label: 'Ürün Kodu' },{ key: 'productDesc', label: 'Ürün Açıklaması' },{ key: 'options', label: 'Seçenekler' },{ key: 'customer', label: 'Müşteri' },{ key: 'documentNumber', label: 'Belge/Sipariş No' },{ key: 'orderQuantity', label: 'Toplam Sipariş Adedi' },{ key: 'packedQuantity', label: 'Paketlenen (Adet)' },{ key: 'remaining', label: 'Kalan (Adet)' },{ key: 'carryOverQuantity', label: 'Devir (Adet)' },{ key: 'producedQuantity', label: 'Üretilen Toplam' },{ key: 'status', label: 'Durum' },{ key: 'savedAt', label: 'Kaydedilme Zamanı' }
          ]);
        } catch(e){}
      });
      printBtn && printBtn.addEventListener('click', () => {
        try {
          const rows = records.map(r => {
            const productCode = r.productCode || r.urunKodu || '';
            const productDesc = r.productDescription || r.urunAciklamasi || '';
            const options = r.options || r.secenekler || '';
            const customer = r.customerName || r.musteriAdi || '';
            const docNo = r.documentNumber || r.belgeNo || r.document || '';
            const orderQty = Number((r.OrderQuantity != null ? r.OrderQuantity : (r.orderQuantity != null ? r.orderQuantity : (r.siparisAdet || r.orderQty))) || 0);
            const packed = Number((r.PackedQuantity != null ? r.PackedQuantity : 0) || 0);
            const remaining = orderQty - packed;
            const carryOver = Number((r.CarryOverQuantity != null ? r.CarryOverQuantity : (r.carryOverQuantity != null ? r.carryOverQuantity : (r.devirSayisi || r.carryOver))) || 0);
            const produced = Number((r.ProducedQuantity != null ? r.ProducedQuantity : 0) || 0);
            const status = (r.isCompleted === true || r.isCompleted === 'true' || r.isCompleted === 1) ? 'Tamamlandı' : 'Devam Ediyor';
            const saved = r.savedDate || r.savedAt || r.createdAt || '';
            return { productCode, productDesc, options, customer, documentNumber: docNo, orderQuantity: orderQty, packedQuantity: packed, remaining, carryOverQuantity: carryOver, producedQuantity: produced, status, savedAt: saved };
          });
          printTable('Siparişler', rows, [
            { key: 'productCode', label: 'Ürün Kodu' },{ key: 'productDesc', label: 'Ürün Açıklaması' },{ key: 'options', label: 'Seçenekler' },{ key: 'customer', label: 'Müşteri' },{ key: 'documentNumber', label: 'Belge/Sipariş No' },{ key: 'orderQuantity', label: 'Toplam Sipariş Adedi' },{ key: 'packedQuantity', label: 'Paketlenen (Adet)' },{ key: 'remaining', label: 'Kalan (Adet)' },{ key: 'carryOverQuantity', label: 'Devir (Adet)' },{ key: 'producedQuantity', label: 'Üretilen Toplam' },{ key: 'status', label: 'Durum' },{ key: 'savedAt', label: 'Kaydedilme Zamanı' }
          ]);
        } catch(e){}
      });
    }, 80);

  pager.update(records.length, pageSize, currentPage);
  renderTable();
  // charts removed
    select.addEventListener('change', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); });
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); });
  }
  // charts removed

  await loadList();
}

export async function unmount(container) { try { container.innerHTML = ''; } catch(e) {} }
