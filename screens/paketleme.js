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
  // charts summary area: top products bar + customers pie
  const chartsWrap = document.createElement('div'); chartsWrap.className = 'mb-4 grid grid-cols-2 gap-4';
  const prodBar = document.createElement('div'); prodBar.className = 'bg-neutral-800 p-3 rounded'; prodBar.innerHTML = '<h4 class="text-sm mb-2">Top Ürünler</h4>';
  const custPie = document.createElement('div'); custPie.className = 'bg-neutral-800 p-3 rounded'; custPie.innerHTML = '<h4 class="text-sm mb-2">Müşteri Dağılımı</h4>';
  placeholder.parentNode.insertBefore(chartsWrap, placeholder);
  chartsWrap.appendChild(prodBar); chartsWrap.appendChild(custPie);

  async function loadList() {
    const res = await window.electronAPI.listPaketleme();
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
                <th class="p-2">Tarih</th>
                <th class="p-2">Vardiya</th>
                <th class="p-2">Üstabaşı</th>
                <th class="p-2">Ürün Kodu</th>
                <th class="p-2">Açıklama</th>
                <th class="p-2">Müşteri</th>
                <th class="p-2">Adet</th>
                <th class="p-2">Fire</th>
                <th class="p-2">Patlatılan Kutu</th>
                <th class="p-2">Patlatılan Firma</th>
                <th class="p-2">Hazırlanan Firma</th>
                <th class="p-2">Kaydedildi</th>
              </tr>
            </thead>
            <tbody>
              ${slice.map(r => `
                <tr class="border-t border-neutral-700">
                  <td class="p-2">${r.tarih || ''}</td>
                  <td class="p-2">${r.vardiya || ''}</td>
                  <td class="p-2">${r.ustabasi || ''}</td>
                  <td class="p-2">${r.urunKodu || ''}</td>
                  <td class="p-2">${r.aciklama || ''}</td>
                  <td class="p-2">${r.musteri || ''}</td>
                  <td class="p-2">${r.adet || ''}</td>
                  <td class="p-2">${r.fire || ''}</td>
                  <td class="p-2">${r.patlatilanKutu || ''}</td>
                  <td class="p-2">${r.patlatilanFirma || ''}</td>
                  <td class="p-2">${r.hazirlananFirma || ''}</td>
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

    // update charts
    const updateCharts = async () => {
      try {
        const prodAgg = {};
        const custAgg = {};
        for (const r of records) {
          prodAgg[r.urunKodu || ''] = (prodAgg[r.urunKodu || ''] || 0) + (Number(r.adet) || 0);
          custAgg[r.musteri || ''] = (custAgg[r.musteri || ''] || 0) + (Number(r.adet) || 0);
        }
        const prodPairs = Object.entries(prodAgg).sort((a,b)=> b[1]-a[1]).slice(0,10);
        const prodLabels = prodPairs.map(p=>p[0]); const prodData = prodPairs.map(p=>p[1]);
        const custPairs = Object.entries(custAgg).sort((a,b)=> b[1]-a[1]).slice(0,10);
        const custLabels = custPairs.map(p=>p[0]); const custData = custPairs.map(p=>p[1]);
        const { renderChart } = await import('../ui/helpers.js');
        renderChart(prodBar, { type:'bar', data:{ labels: prodLabels, datasets:[{ label:'Adet', data: prodData, backgroundColor:'#60a5fa' }] }, options:{responsive:true, scales:{y:{beginAtZero:true}}} });
        renderChart(custPie, { type:'pie', data:{ labels: custLabels, datasets:[{ data: custData, backgroundColor: custLabels.map((_,i)=>['#60a5fa','#f472b6','#34d399','#f59e0b','#a78bfa'][i%5]) }] }, options:{responsive:true, plugins:{legend:{position:'right'}}} });
      } catch(e){}
    };

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
  try { updateCharts(); } catch(e){}
  select.addEventListener('change', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); try { updateCharts(); } catch(e){} });
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); try { updateCharts(); } catch(e){} });
  }

  await loadList();
}

export async function unmount(container) {
  try { container.innerHTML = ''; } catch (e) {}
}

