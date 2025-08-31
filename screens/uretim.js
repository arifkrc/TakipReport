import { showToast, createRowCountSelector, createPaginationControls, exportToCSV, exportToXLSX, printTable } from '../ui/helpers.js';

export async function mount(container, { setHeader }) {
  setHeader('Üretim', 'Rapor görünümü (sekmeler)');
  container.innerHTML = `
    <div class="mt-2">
  <div class="flex items-center justify-between">
  </div>

      <div class="tabs flex gap-2 mb-3">
        <button data-tab="tab-list" class="tab-btn px-3 py-1 bg-neutral-800 rounded text-sm">Kayıtlar</button>
        <button data-tab="tab-daily" class="tab-btn px-3 py-1 bg-neutral-700/40 rounded text-sm">Günlük Üretim Raporu</button>
      </div>

      <div id="tab-list" class="tab-content">
        <div class="mb-2"><h4 class="text-sm font-medium">Üretim Kayıtları</h4></div>
        <div id="uretim-list-placeholder"></div>
      </div>

      <div id="tab-daily" class="tab-content hidden">
        <div class="mb-2"><h4 class="text-sm font-medium">Günlük Üretim Raporu</h4></div>
        <div id="uretim-daily-placeholder"></div>
      </div>
    </div>
  `;

  const listPlaceholder = container.querySelector('#uretim-list-placeholder');
  const dailyPlaceholder = container.querySelector('#uretim-daily-placeholder');
  const tabButtons = Array.from(container.querySelectorAll('.tab-btn'));

  function showTab(id) {
    container.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const active = container.querySelector('#' + id);
    if (active) active.classList.remove('hidden');
    tabButtons.forEach(b => {
      const isActive = b.dataset.tab === id;
      b.classList.toggle('bg-neutral-800', isActive);
      // add a white border to the active tab
      if (isActive) {
        b.classList.add('border', 'border-white');
      } else {
        b.classList.remove('border', 'border-white');
      }
    });
  }
  tabButtons.forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
  showTab('tab-list');
    const chartsWrap = document.createElement('div'); chartsWrap.className = 'mb-4 grid grid-cols-1 gap-4';
    const barWrap = document.createElement('div'); barWrap.className = 'bg-neutral-800 p-3 rounded'; barWrap.innerHTML = '<h4 class="text-sm mb-2">Top Ürünler</h4>';
    listPlaceholder.parentNode.insertBefore(chartsWrap, listPlaceholder);
    chartsWrap.appendChild(barWrap);

  async function loadList() {
    const res = await window.electronAPI.listUretim();
    if (!res || !res.ok) { listPlaceholder.innerHTML = '<div class="text-rose-400">Liste yüklenemedi</div>'; return; }
    const records = res.records || [];

    const { wrapper: selectorWrap, select } = createRowCountSelector(20);
    const searchWrap = document.createElement('div');
    searchWrap.className = 'ml-2';
    searchWrap.innerHTML = `<input type="search" placeholder="Tabloda ara..." class="px-3 py-2 rounded bg-neutral-800 text-neutral-200" />`;
    const searchInput = searchWrap.querySelector('input');

    listPlaceholder.innerHTML = '';
    const topRow = document.createElement('div'); topRow.className = 'flex items-center gap-2'; topRow.appendChild(selectorWrap); topRow.appendChild(searchWrap);
    // export / print controls
    const tools = document.createElement('div'); tools.className = 'ml-auto flex items-center gap-2';
    tools.innerHTML = `
      <button id="export-csv" class="px-3 py-1 bg-neutral-800 rounded">CSV</button>
      <button id="export-xlsx" class="px-3 py-1 bg-neutral-800 rounded">XLSX</button>
      <button id="print-table" class="px-3 py-1 bg-neutral-800 rounded">Yazdır</button>
    `;
    topRow.appendChild(tools);
    listPlaceholder.appendChild(topRow);

    let pageSize = (select.value === 'all') ? records.length || 1 : Number(select.value || 20);
    let currentPage = 1;
    const pager = createPaginationControls(records.length, pageSize, currentPage, (p) => { currentPage = p; renderTable(); });
    listPlaceholder.appendChild(pager);
    const debugInfo = document.createElement('div'); debugInfo.className = 'text-sm text-neutral-400 mt-1'; listPlaceholder.appendChild(debugInfo);

    // prepare daily tab UI
    if (dailyPlaceholder) {
      dailyPlaceholder.innerHTML = '';
      const dailyControls = document.createElement('div');
      dailyControls.className = 'flex items-center gap-2 mb-2';
      const todayStr = new Date().toISOString().slice(0,10);
      dailyControls.innerHTML = `
        <input id="daily-date" type="date" value="${todayStr}" class="px-2 py-1 rounded bg-neutral-800 text-neutral-200" />
        <button id="daily-show" class="px-3 py-1 bg-neutral-800 rounded">Göster</button>
        <button id="daily-export" class="px-3 py-1 bg-neutral-800 rounded">CSV</button>
      `;
      dailyPlaceholder.appendChild(dailyControls);
      const dailyResultWrap = document.createElement('div'); dailyResultWrap.id = 'daily-result'; dailyPlaceholder.appendChild(dailyResultWrap);

      function renderDaily(dateStr) {
        const filtered = records.filter(r => (r.tarih || '').slice(0,10) === dateStr);
        const agg = {};
        for (const r of filtered) {
          const key = r.urunKodu || 'UNKNOWN';
          agg[key] = (agg[key] || 0) + (Number(r.uretimAdedi) || 0);
        }
        const rows = Object.entries(agg).sort((a,b)=> b[1]-a[1]);
        if (rows.length === 0) {
          dailyResultWrap.innerHTML = '<div class="text-neutral-400">Seçilen gün için kayıt bulunamadı.</div>';
          return;
        }
        const tableHtml = `
          <div class="overflow-auto bg-neutral-800 p-2 rounded">
            <table class="w-full text-left text-sm">
              <thead class="text-neutral-400"><tr><th class="p-2">Ürün Kodu</th><th class="p-2">Toplam Üretim</th></tr></thead>
              <tbody>
                ${rows.map(r => `<tr class="border-t border-neutral-700"><td class="p-2">${r[0]}</td><td class="p-2">${r[1]}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        `;
        dailyResultWrap.innerHTML = tableHtml;
      }

      dailyPlaceholder.querySelector('#daily-show').addEventListener('click', () => {
        const d = dailyPlaceholder.querySelector('#daily-date').value;
        renderDaily(d);
      });
      dailyPlaceholder.querySelector('#daily-export').addEventListener('click', () => {
        const d = dailyPlaceholder.querySelector('#daily-date').value;
        const filtered = records.filter(r => (r.tarih || '').slice(0,10) === d);
        if (!filtered.length) { showToast('Seçilen gün için veri yok'); return; }
        // export aggregated CSV
        const agg = {};
        for (const r of filtered) { const k = r.urunKodu || 'UNKNOWN'; agg[k] = (agg[k] || 0) + (Number(r.uretimAdedi) || 0); }
        const arr = Object.entries(agg).map(([k,v]) => ({ urunKodu: k, toplam: v }));
        try { exportToCSV(`günluk-uretim-${d}.csv`, arr, [{ key:'urunKodu', label:'Ürün Kodu' }, { key:'toplam', label:'Toplam Üretim' }]); } catch (e) { showToast('CSV export failed'); }
      });

      // render default
      const defDate = dailyPlaceholder.querySelector('#daily-date').value;
      renderDaily(defDate);
    }

  const renderTable = () => {
      const q = (searchInput && searchInput.value || '').trim().toLowerCase();
      const filtered = q ? records.filter(r => {
        return ['tarih','vardiya','ustabasi','bolum','operator','urunKodu'].some(k => String(r[k] || '').toLowerCase().includes(q));
      }) : records;
      const limit = select.value;
      pageSize = (limit === 'all') ? filtered.length || 1 : Number(limit || 20);
      try { pager.update(filtered.length, pageSize, currentPage); } catch (e) {}
      const start = (currentPage - 1) * pageSize;
      const slice = (limit === 'all') ? filtered : filtered.slice(start, start + pageSize);

  const html = `
      <div class="mt-4">
        <div class="overflow-auto bg-neutral-800 p-2 rounded">
          <table class="w-full text-left text-sm">
            <thead class="text-neutral-400">
              <tr>
                <th class="p-2">Tarih</th>
                <th class="p-2">Vardiya</th>
                <th class="p-2">Üstabaşı</th>
                <th class="p-2">Bölüm</th>
                <th class="p-2">Operator</th>
                <th class="p-2">Ürün Kodu</th>
                <th class="p-2">Üretim Adedi</th>
                <th class="p-2">Başlangıç</th>
                <th class="p-2">Bitiş</th>
                <th class="p-2">Döküm</th>
                <th class="p-2">Operatör Hata</th>
                <th class="p-2">Tezgah Arıza</th>
                <th class="p-2">Tezgah Ayar</th>
                <th class="p-2">Elmas</th>
                <th class="p-2">Parça Bekleme</th>
                <th class="p-2">Temizlik</th>
                <th class="p-2">Mola</th>
                <th class="p-2">Kaydedildi</th>
              </tr>
            </thead>
            <tbody>
              ${slice.map(r => `
                <tr class="border-t border-neutral-700">
                  <td class="p-2">${r.tarih || ''}</td>
                  <td class="p-2">${r.vardiya || ''}</td>
                  <td class="p-2">${r.ustabasi || ''}</td>
                  <td class="p-2">${r.bolum || ''}</td>
                  <td class="p-2">${r.operator || ''}</td>
                  <td class="p-2">${r.urunKodu || ''}</td>
                  <td class="p-2">${r.uretimAdedi || ''}</td>
                  <td class="p-2">${r.baslangic || ''}</td>
                  <td class="p-2">${r.bitis || ''}</td>
                  <td class="p-2">${r.dokumHatasi || ''}</td>
                  <td class="p-2">${r.operatorHatasi || ''}</td>
                  <td class="p-2">${r.tezgahArizasi || ''}</td>
                  <td class="p-2">${r.tezgahAyari || ''}</td>
                  <td class="p-2">${r.elmasDegisimi || ''}</td>
                  <td class="p-2">${r.parcaBekleme || ''}</td>
                  <td class="p-2">${r.temizlik || ''}</td>
                  <td class="p-2">${r.mola || ''}</td>
                  <td class="p-2 text-neutral-400">${r.savedAt ? new Date(r.savedAt).toLocaleString() : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

      const existingTable = listPlaceholder.querySelector('.mt-4');
      if (existingTable) existingTable.outerHTML = html; else listPlaceholder.insertAdjacentHTML('beforeend', html);
    };

    // update charts based on current filtered rows (only top-products bar)
    const updateCharts = async () => {
      try {
        const productAgg = {};
        for (const r of records) {
          productAgg[r.urunKodu || ''] = (productAgg[r.urunKodu || ''] || 0) + (Number(r.uretimAdedi) || 0);
        }
        const prodPairs = Object.entries(productAgg).sort((a,b)=> b[1]-a[1]).slice(0,10);
        const prodLabels = prodPairs.map(p=>p[0]);
        const prodData = prodPairs.map(p=>p[1]);
        const { renderChart } = await import('../ui/helpers.js');
        renderChart(barWrap, { type: 'bar', data: { labels: prodLabels, datasets:[{ label: 'Üretim Adedi', data: prodData, backgroundColor: '#34d399' }] }, options:{responsive:true, scales:{y:{beginAtZero:true}}} });
      } catch (e) { /* ignore chart errors */ }
    };

    // wire export/print actions
    setTimeout(() => {
      const csvBtn = topRow.querySelector('#export-csv');
      const xlsxBtn = topRow.querySelector('#export-xlsx');
      const printBtn = topRow.querySelector('#print-table');
      csvBtn && csvBtn.addEventListener('click', () => {
        try { exportToCSV('uretim-export.csv', records, [
          { key: 'tarih', label: 'Tarih' },{ key: 'vardiya', label: 'Vardiya' },{ key: 'ustabasi', label: 'Üstabaşı' },{ key: 'bolum', label: 'Bölüm' },{ key: 'operator', label: 'Operator' },{ key: 'urunKodu', label: 'Ürün Kodu' },{ key: 'uretimAdedi', label: 'Üretim Adedi' },{ key: 'baslangic', label: 'Başlangıç' },{ key: 'bitis', label: 'Bitiş' },{ key: 'dokumHatasi', label: 'Döküm' },{ key: 'operatorHatasi', label: 'Operatör Hata' },{ key: 'tezgahArizasi', label: 'Tezgah Arıza' },{ key: 'tezgahAyari', label: 'Tezgah Ayar' },{ key: 'elmasDegisimi', label: 'Elmas' },{ key: 'parcaBekleme', label: 'Parça Bekleme' },{ key: 'temizlik', label: 'Temizlik' },{ key: 'mola', label: 'Mola' },{ key: 'savedAt', label: 'Kaydedildi' }
        ]); } catch (e) { showToast('CSV export failed'); }
      });
      xlsxBtn && xlsxBtn.addEventListener('click', async () => {
        try { await exportToXLSX('uretim-export.xlsx', records, [
          { key: 'tarih', label: 'Tarih' },{ key: 'vardiya', label: 'Vardiya' },{ key: 'ustabasi', label: 'Üstabaşı' },{ key: 'bolum', label: 'Bölüm' },{ key: 'operator', label: 'Operator' },{ key: 'urunKodu', label: 'Ürün Kodu' },{ key: 'uretimAdedi', label: 'Üretim Adedi' },{ key: 'baslangic', label: 'Başlangıç' },{ key: 'bitis', label: 'Bitiş' },{ key: 'dokumHatasi', label: 'Döküm' },{ key: 'operatorHatasi', label: 'Operatör Hata' },{ key: 'tezgahArizasi', label: 'Tezgah Arıza' },{ key: 'tezgahAyari', label: 'Tezgah Ayar' },{ key: 'elmasDegisimi', label: 'Elmas' },{ key: 'parcaBekleme', label: 'Parça Bekleme' },{ key: 'temizlik', label: 'Temizlik' },{ key: 'mola', label: 'Mola' },{ key: 'savedAt', label: 'Kaydedildi' }
        ]); } catch (e) { showToast('XLSX export failed'); }
      });
      printBtn && printBtn.addEventListener('click', () => { try { printTable('Üretim Kayıtları', records, [
        { key: 'tarih', label: 'Tarih' },{ key: 'vardiya', label: 'Vardiya' },{ key: 'ustabasi', label: 'Üstabaşı' },{ key: 'bolum', label: 'Bölüm' },{ key: 'operator', label: 'Operator' },{ key: 'urunKodu', label: 'Ürün Kodu' },{ key: 'uretimAdedi', label: 'Üretim Adedi' },{ key: 'baslangic', label: 'Başlangıç' },{ key: 'bitis', label: 'Bitiş' },{ key: 'dokumHatasi', label: 'Döküm' },{ key: 'operatorHatasi', label: 'Operatör Hata' },{ key: 'tezgahArizasi', label: 'Tezgah Arıza' },{ key: 'tezgahAyari', label: 'Tezgah Ayar' },{ key: 'elmasDegisimi', label: 'Elmas' },{ key: 'parcaBekleme', label: 'Parça Bekleme' },{ key: 'temizlik', label: 'Temizlik' },{ key: 'mola', label: 'Mola' },{ key: 'savedAt', label: 'Kaydedildi' }
      ]); } catch (e) { showToast('Yazdırma başarısız'); } });
    }, 80);

    pager.update(records.length, pageSize, currentPage);
    renderTable();
    select.addEventListener('change', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); });
    if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); });
  }

  await loadList();
}

export async function unmount(container) {
  try { container.innerHTML = ''; } catch (e) {}
}
