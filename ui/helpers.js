export function showToast(message, type = 'info') {
  const el = document.createElement('div');
  el.textContent = message;
  el.className = `fixed bottom-6 right-6 px-4 py-2 rounded shadow ${type==='success' ? 'bg-green-600' : type==='error' ? 'bg-rose-600' : 'bg-neutral-700'}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

export function showFormErrors(form, errors) {
  errors.forEach(err => {
    const field = form.querySelector(`[name="${err.field}"]`);
    if (!field) return;
    field.classList.add('border', 'border-rose-500');
    let note = field.parentElement.querySelector('.field-error');
    if (!note) {
      note = document.createElement('div');
      note.className = 'field-error text-rose-400 text-sm mt-1';
      field.parentElement.appendChild(note);
    }
    note.textContent = err.msg;
  });
}

export function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach(n => n.remove());
  form.querySelectorAll('.border-rose-500').forEach(el => el.classList.remove('border', 'border-rose-500'));
}

export function createRowCountSelector(initial = 20) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mb-2 flex items-center gap-2';
  const label = document.createElement('label');
  label.className = 'text-sm text-neutral-400';
  label.textContent = 'Satır:';
  const select = document.createElement('select');
  select.className = 'px-2 py-1 bg-neutral-800 rounded text-neutral-100';
  const options = [5,10,15,20,50,100,'All'];

  // prefer saved preference if available
  let saved = null;
  try { saved = localStorage.getItem('rowCountPref'); } catch(e) { saved = null; }
  const initialValue = saved || (initial === 'All' ? 'all' : String(initial));

  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o === 'All' ? 'all' : String(o);
    opt.textContent = o === 'All' ? 'All' : String(o);
    if (opt.value === String(initialValue)) opt.selected = true;
    select.appendChild(opt);
  });

  // persist on change
  select.addEventListener('change', () => {
    try { localStorage.setItem('rowCountPref', select.value); } catch(e) { /* ignore */ }
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return { wrapper, select };
}

export function createPaginationControls(totalItems = 0, pageSize = 20, currentPage = 1, onPage = () => {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mt-2 flex items-center gap-2';

  const prev = document.createElement('button');
  prev.className = 'px-2 py-1 bg-neutral-800 rounded text-neutral-200 disabled:opacity-50';
  prev.textContent = '<';

  const pages = document.createElement('div');
  pages.className = 'flex items-center gap-1';

  const info = document.createElement('div');
  info.className = 'text-sm text-neutral-400 ml-2';

  const next = document.createElement('button');
  next.className = 'px-2 py-1 bg-neutral-800 rounded text-neutral-200 disabled:opacity-50';
  next.textContent = '>';

  let totalPages = Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 1)));
  let current = Math.min(Math.max(1, Number(currentPage || 1)), totalPages);

  function buildPages() {
    pages.innerHTML = '';
    // show up to 7 page buttons centered on current
    const maxButtons = 7;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    for (let p = start; p <= end; p++) {
      const b = document.createElement('button');
      b.className = `px-2 py-1 rounded ${p===current ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-200'}`;
      b.textContent = String(p);
      b.addEventListener('click', () => { if (p !== current) { current = p; onPage(current); render(); } });
      pages.appendChild(b);
    }
  }

  function render() {
    totalPages = Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 1)));
    current = Math.min(Math.max(1, Number(current || 1)), totalPages);
    prev.disabled = current <= 1;
    next.disabled = current >= totalPages;
    info.textContent = `Sayfa ${current} / ${totalPages} (Toplam ${totalItems})`;
    buildPages();
  }

  prev.addEventListener('click', () => { if (current > 1) { current -= 1; onPage(current); render(); } });
  next.addEventListener('click', () => { if (current < totalPages) { current += 1; onPage(current); render(); } });

  wrapper.appendChild(prev);
  wrapper.appendChild(pages);
  wrapper.appendChild(info);
  wrapper.appendChild(next);

  // expose update method to refresh total/pageSize/current
  wrapper.update = (newTotal = totalItems, newPageSize = pageSize, newCurrent = 1) => {
    totalItems = Number(newTotal || 0);
    pageSize = Number(newPageSize || 20) || 20;
    totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    current = Math.min(Math.max(1, Number(newCurrent || 1)), totalPages);
    render();
  };

  // initial render
  wrapper.update(totalItems, pageSize, currentPage);
  return wrapper;
}

// Export utilities: CSV, XLSX (uses SheetJS when available), and print
export function exportToCSV(filename = 'export.csv', rows = [], columns = []) {
  // columns: array of { key, label }
  const cols = (columns && columns.length) ? columns : (rows[0] ? Object.keys(rows[0]).map(k => ({ key: k, label: k })) : []);
  const header = cols.map(c => `"${String(c.label).replace(/"/g,'""')}"`).join(',');
  const lines = rows.map(r => cols.map(c => {
    const v = r[c.key] == null ? '' : String(r[c.key]);
    return `"${v.replace(/"/g,'""')}"`;
  }).join(','));
  const csv = [header].concat(lines).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportToXLSX(filename = 'export.xlsx', rows = [], columns = []) {
  // Try to use SheetJS if available; otherwise fall back to CSV with a warning
  const XLSX = window.XLSX || (typeof require === 'function' ? (() => { try { return require('xlsx'); } catch(e){ return null; } })() : null);
  if (!XLSX) {
    exportToCSV(filename.replace(/\.xlsx?$/i, '.csv'), rows, columns);
    return;
  }
  const cols = (columns && columns.length) ? columns : (rows[0] ? Object.keys(rows[0]).map(k => ({ key: k, label: k })) : []);
  const data = [cols.map(c => c.label)];
  for (const r of rows) data.push(cols.map(c => r[c.key] == null ? '' : r[c.key]));
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

export function printTable(title = '', rows = [], columns = []) {
  const cols = (columns && columns.length) ? columns : (rows[0] ? Object.keys(rows[0]).map(k => ({ key: k, label: k })) : []);
  const html = `
    <html><head><title>${String(title || '')}</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#ddd;background:#111}table{width:100%;border-collapse:collapse}th,td{border:1px solid #444;padding:6px;text-align:left}th{background:#222}</style></head><body>
      <h2 style="color:#fff">${String(title || '')}</h2>
      <table>
        <thead><tr>${cols.map(c=>`<th>${String(c.label)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${String(r[c.key] == null ? '' : r[c.key]).replace(/</g,'&lt;')}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </body></html>
  `;
  const w = window.open('', '_blank');
  if (!w) { alert('Açılan pencere engellendi. Lütfen pop-up engelleyiciyi devre dışı bırakın.'); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 200);
}

// Chart helper: loads Chart.js from CDN if not present and provides a render function
export async function ensureChartJS() {
  if (window.Chart) return window.Chart;
  // try to use global (preloaded) or dynamic import
  try {
    // attempt to load via CDN
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      s.onload = () => res(); s.onerror = (e) => rej(e);
      document.head.appendChild(s);
    });
    return window.Chart;
  } catch (e) {
    console.warn('Chart.js load failed', e);
    return null;
  }
}

export async function renderChart(container, config) {
  const Chart = await ensureChartJS();
  if (!Chart) {
    container.innerHTML = '<div class="text-rose-400">Chart.js yüklenemedi</div>';
    return null;
  }
  // clear container and add canvas
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  // dispose existing chart instance on the canvas
  if (canvas._chartInstance) try { canvas._chartInstance.destroy(); } catch(e){}
  const chart = new Chart(ctx, config);
  canvas._chartInstance = chart;
  return chart;
}
