import { createRowCountSelector, createPaginationControls, exportToCSV, exportToXLSX, printTable } from '../ui/helpers.js';

export async function mount(container, { setHeader }) {
  setHeader('Ürünler', 'Rapor görünümü (sadece liste)');
  container.innerHTML = `
    <div class="mt-2">
      <h3 class="text-xl font-semibold mb-2">Ürünler</h3>
      <div id="urun-list-placeholder"></div>
    </div>
  `;

  const placeholder = container.querySelector('#urun-list-placeholder');
  // charts summary area
  const chartsWrap = document.createElement('div'); chartsWrap.className = 'mb-4 grid grid-cols-2 gap-4';
  const prodBar = document.createElement('div'); prodBar.className = 'bg-neutral-800 p-3 rounded'; prodBar.innerHTML = '<h4 class="text-sm mb-2">Top Ürünler</h4>';
  const typePie = document.createElement('div'); typePie.className = 'bg-neutral-800 p-3 rounded'; typePie.innerHTML = '<h4 class="text-sm mb-2">Tür Dağılımı</h4>';
  placeholder.parentNode.insertBefore(chartsWrap, placeholder);
  chartsWrap.appendChild(prodBar); chartsWrap.appendChild(typePie);

  async function loadList() {
    const res = await window.electronAPI.listUrun();
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
        return ['urunKodu','urunAciklamasi','urunTipi'].some(k => String(r[k] || '').toLowerCase().includes(q));
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
                <th class="p-2">Açıklama</th>
                <th class="p-2">Tipi</th>
                <th class="p-2">Aktif</th>
                <th class="p-2">Kaydedildi</th>
              </tr>
            </thead>
            <tbody>
              ${slice.map(r => `
                <tr class="border-t border-neutral-700">
                  <td class="p-2">${r.urunKodu || ''}</td>
                  <td class="p-2">${r.urunAciklamasi || ''}</td>
                  <td class="p-2">${r.urunTipi || ''}</td>
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
    };

    const updateCharts = async () => {
      try {
        const prodAgg = {};
        const typeAgg = {};
        for (const r of records) {
          prodAgg[r.kod || r.name || ''] = (prodAgg[r.kod || r.name || ''] || 0) + 1;
          typeAgg[r.tur || r.type || ''] = (typeAgg[r.tur || r.type || ''] || 0) + 1;
        }
        const prodPairs = Object.entries(prodAgg).sort((a,b)=> b[1]-a[1]).slice(0,10);
        const prodLabels = prodPairs.map(p=>p[0]); const prodData = prodPairs.map(p=>p[1]);
        const typePairs = Object.entries(typeAgg).sort((a,b)=> b[1]-a[1]).slice(0,10);
        const typeLabels = typePairs.map(p=>p[0]); const typeData = typePairs.map(p=>p[1]);
        const { renderChart } = await import('../ui/helpers.js');
        renderChart(prodBar, { type:'bar', data:{ labels: prodLabels, datasets:[{ label:'Count', data: prodData, backgroundColor:'#60a5fa' }] }, options:{responsive:true, scales:{y:{beginAtZero:true}}} });
        renderChart(typePie, { type:'pie', data:{ labels: typeLabels, datasets:[{ data: typeData, backgroundColor: typeLabels.map((_,i)=>['#60a5fa','#f472b6','#34d399','#f59e0b','#a78bfa'][i%5]) }] }, options:{responsive:true, plugins:{legend:{position:'right'}}} });
      } catch(e){}
    };

    setTimeout(() => {
      const csvBtn = topRow.querySelector('#export-csv');
      const xlsxBtn = topRow.querySelector('#export-xlsx');
      const printBtn = topRow.querySelector('#print-table');
      csvBtn && csvBtn.addEventListener('click', () => { try { exportToCSV('urun-export.csv', records); } catch(e){} });
      xlsxBtn && xlsxBtn.addEventListener('click', async () => { try { await exportToXLSX('urun-export.xlsx', records); } catch(e){} });
      printBtn && printBtn.addEventListener('click', () => { try { printTable('Ürünler', records); } catch(e){} });
    }, 80);

  pager.update(records.length, pageSize, currentPage);
  renderTable();
  try { updateCharts(); } catch(e){}
  select.addEventListener('change', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); try { updateCharts(); } catch(e){} });
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; pager.update(records.length, (select.value==='all'?records.length:Number(select.value)), currentPage); renderTable(); try { updateCharts(); } catch(e){} });
  }

  await loadList();
}

export async function unmount(container) { try { container.innerHTML = ''; } catch(e) {} }
