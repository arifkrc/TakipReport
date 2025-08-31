const screens = {
  uretim: {
    title: 'Üretim',
    sub: 'Günlük üretim verileri',
    render: () => {
      return `
        <div class="mt-2">
          <h3 class="text-xl font-semibold mb-2">Üretim Kayıt Formu</h3>
          <form id="uretim-form" class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <label class="flex flex-col text-sm">
                Tarih
                <input name="tarih" type="date" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" required />
              </label>

              <label class="flex flex-col text-sm">
                Vardiya
                <select name="vardiya" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100">
                  <option>1 00-08</option>
                  <option>2 08-16</option>
                  <option>3 16-24</option>
                </select>
              </label>

              <label class="flex flex-col text-sm">
                Üstabaşı
                <input name="ustabasi" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <label class="flex flex-col text-sm">
                Bölüm Sorumlusu
                <input name="bolum" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Operator
                <input name="operator" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Ürün Kodu
                <input name="urunKodu" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <label class="flex flex-col text-sm">
                Üretim Adedi
                <input name="uretimAdedi" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                İş Başlangıç Saati
                <input name="baslangic" type="time" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                İş Bitiş Saati
                <input name="bitis" type="time" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
            </div>

            <div class="grid grid-cols-4 gap-4">
              <label class="flex flex-col text-sm">
                Döküm Hatası
                <input name="dokumHatasi" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Operatör Hatası
                <input name="operatorHatasi" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Tezgah Arızası
                <input name="tezgahArizasi" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Tezgah Ayarı
                <input name="tezgahAyari" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
            </div>

            <div class="grid grid-cols-4 gap-4">
              <label class="flex flex-col text-sm">
                Elmas Değişimi
                <input name="elmasDegisimi" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Parça Bekleme
                <input name="parcaBekleme" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Temizlik
                <input name="temizlik" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Mola
                <input name="mola" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
            </div>

            <div class="flex items-center gap-3">
              <button type="submit" class="px-4 py-2 rounded bg-green-600 hover:bg-green-500">Kaydet</button>
              <button type="button" id="uretim-reset" class="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600">Temizle</button>
            </div>
          </form>
        </div>
      `
    }
  },

  paketleme: {
    title: 'Paketleme',
    sub: 'Paketleme hattı durumu',
    render: () => {
      return `
        <div class="mt-2">
          <h3 class="text-xl font-semibold mb-2">Paketleme Kayıt Formu</h3>
          <form id="paketleme-form" class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <label class="flex flex-col text-sm">
                Tarih
                <input name="tarih" type="date" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" required />
              </label>
              <label class="flex flex-col text-sm">
                Vardiya
                <select name="vardiya" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100"><option>1 00-08</option><option>2 08-16</option><option>3 16-24</option></select>
              </label>
              <label class="flex flex-col text-sm">
                Üstabaşı
                <input name="ustabasi" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <label class="flex flex-col text-sm">
                Ürün Kodu
                <input name="urunKodu" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Açıklama
                <input name="aciklama" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Müşteri
                <input name="musteri" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <label class="flex flex-col text-sm">
                Adet
                <input name="adet" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Fire
                <input name="fire" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Patlatılan Kutu Sayısı
                <input name="patlatilanKutu" type="number" min="0" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <label class="flex flex-col text-sm">
                Patlatılan Firma
                <input name="patlatilanFirma" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <label class="flex flex-col text-sm">
                Hazırlanan Firma
                <input name="hazirlananFirma" type="text" class="mt-1 px-3 py-2 bg-neutral-800 rounded text-neutral-100" />
              </label>
              <div></div>
            </div>

            <div class="flex items-center gap-3">
              <button type="submit" class="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500">Kaydet</button>
              <button type="button" id="paketleme-reset" class="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600">Temizle</button>
            </div>
          </form>

          <div id="paketleme-list-container"></div>
        </div>
      `
    }
  },

  farki: {
    title: 'Üretim - Paket Farkı',
    sub: 'Üretim ile paketleme arasındaki farklar',
    render: () => {
      return `
        <div class="p-4 bg-neutral-800 rounded-lg">
          <div class="text-neutral-400">Veri bekleniyor — gerçek zamanlı üretim vs. paketleme farkları burada görünecek.</div>
        </div>
      `;
    }
  },

  siparis: {
    title: 'Siparişler',
    sub: 'Açık siparişler ve durumları',
    render: () => {
      return `
        <div class="p-4 bg-neutral-800 rounded-lg">
          <div class="text-neutral-400">Veri bekleniyor — sipariş bilgileri gerçek zamanlı olarak yüklendiğinde burada görünecek.</div>
        </div>
      `;
    }
  }
}

function setScreen(name) {
  const screen = screens[name] || screens.uretim;
  document.getElementById('screen-title').textContent = screen.title;
  document.getElementById('screen-sub').textContent = screen.sub;
  document.getElementById('content').innerHTML = screen.render();
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('bg-indigo-600'));
      btn.classList.add('bg-indigo-600');
  setScreen(btn.dataset.screen);
    })
  });

  document.getElementById('refresh').addEventListener('click', () => {
    // In a real app, you'd re-fetch data from backend
    const flash = document.createElement('div');
    flash.textContent = 'Veriler güncellendi';
    flash.className = 'fixed bottom-6 right-6 bg-green-600 px-4 py-2 rounded shadow';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1800);
  });

  // default
  document.querySelector('.nav-btn[data-screen="uretim"]').classList.add('bg-indigo-600');
  setScreen('uretim');

  // attach form handlers after initial render
  function attachUretimHandlers() {
    const form = document.getElementById('uretim-form');
    if (!form) return;

    // set default date to today if empty
    const dateInput = form.querySelector('[name="tarih"]');
    if (dateInput && !dateInput.value) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormErrors(form);
      const data = Object.fromEntries(new FormData(form).entries());
      // convert numeric fields
      ['uretimAdedi','dokumHatasi','operatorHatasi','tezgahArizasi','tezgahAyari','elmasDegisimi','parcaBekleme','temizlik','mola'].forEach(k => {
        if (data[k] !== undefined) data[k] = Number(data[k]) || 0;
      });

      // Basic validation
      const errors = [];
      if (!data.tarih) errors.push({ field: 'tarih', msg: 'Tarih gerekli' });
      if (!data.operator) errors.push({ field: 'operator', msg: 'Operator girin' });

      if (errors.length) {
        showFormErrors(form, errors);
        return;
      }

      // disable submit while saving
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Kaydediliyor...';

      try {
        const res = await window.electronAPI.saveUretim(data);
        if (res && res.ok) {
          showToast('Kayıt başarıyla kaydedildi', 'success');
          // preserve selected fields so they remain after reset
          const keepDate = (form.querySelector('[name="tarih"]') || {}).value || '';
          const keepVardiya = (form.querySelector('[name="vardiya"]') || {}).value || '';
          const keepUstabasi = (form.querySelector('[name="ustabasi"]') || {}).value || '';

          form.reset();

          // restore preserved values
          const dateInput = form.querySelector('[name="tarih"]');
          if (dateInput) dateInput.value = keepDate;
          const vardiyaInput = form.querySelector('[name="vardiya"]');
          if (vardiyaInput) vardiyaInput.value = keepVardiya;
          const ustabasiInput = form.querySelector('[name="ustabasi"]');
          if (ustabasiInput) ustabasiInput.value = keepUstabasi;

          // reload list
          loadUretimList();
        } else {
          showToast('Kaydetme başarısız: ' + (res && res.error ? res.error : 'bilinmeyen hata'), 'error');
        }
      } catch (err) {
        showToast('Kaydetme hatası: ' + String(err), 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kaydet';
      }
    });

    const resetBtn = document.getElementById('uretim-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      form.reset();
      // restore default date immediately after reset
      const dateInput = form.querySelector('[name="tarih"]');
      if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
      }
    });
  }

  // Paketleme handlers
  function attachPaketlemeHandlers() {
    const form = document.getElementById('paketleme-form');
    if (!form) return;

    // default date
    const dateInput = form.querySelector('[name="tarih"]');
    if (dateInput && !dateInput.value) {
      const today = new Date();
      dateInput.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      // numeric conversions
      ['adet','fire','patlatilanKutu'].forEach(k => { if (data[k] !== undefined) data[k] = Number(data[k]) || 0; });

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true; submitBtn.textContent = 'Kaydediliyor...';
      try {
        const res = await window.electronAPI.savePaketleme(data);
        if (res && res.ok) {
          showToast('Paketleme kaydı kaydedildi', 'success');
          form.reset();
          // restore date
          if (dateInput) {
            const today = new Date();
            dateInput.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
          }
          loadPaketlemeList();
        } else {
          showToast('Kaydetme başarısız: ' + (res && res.error ? res.error : 'bilinmeyen hata'), 'error');
        }
      } catch (err) {
        showToast('Kaydetme hatası: ' + String(err), 'error');
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = 'Kaydet';
      }
    });

    const resetBtn = document.getElementById('paketleme-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => form.reset());
  }

  // Re-attach when navigation happens and load appropriate lists
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(b => b.addEventListener('click', () => {
    setTimeout(() => {
      attachUretimHandlers();
      attachPaketlemeHandlers();
      const screen = b.dataset && b.dataset.screen;
      if (screen === 'uretim') loadUretimList();
      if (screen === 'paketleme') loadPaketlemeList();
    }, 40);
  }));
  attachUretimHandlers();
  attachPaketlemeHandlers();
  // initial list load for Üretim
  loadUretimList();

  // helpers
  function showToast(message, type = 'info') {
    const el = document.createElement('div');
    el.textContent = message;
    el.className = `fixed bottom-6 right-6 px-4 py-2 rounded shadow ${type==='success' ? 'bg-green-600' : type==='error' ? 'bg-rose-600' : 'bg-neutral-700'}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  function showFormErrors(form, errors) {
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

  function clearFormErrors(form) {
    form.querySelectorAll('.field-error').forEach(n => n.remove());
    form.querySelectorAll('.border-rose-500').forEach(el => el.classList.remove('border', 'border-rose-500'));
  }

  // load saved records and render table
  async function loadUretimList() {
    const content = document.getElementById('content');
    const res = await window.electronAPI.listUretim();
    if (!res || !res.ok) {
      // show error inline
      const err = document.getElementById('uretim-list-error');
      if (err) err.textContent = res && res.error ? res.error : 'Liste yüklenemedi';
      return;
    }

    const records = res.records || [];
    // build table HTML
    const tableHtml = `
      <div id="uretim-list" class="mt-6">
        <h3 class="text-xl font-semibold mb-2">Kayıtlı Üretimler</h3>
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
              ${records.map(r => `
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

    // replace or append the list container directly after the form
    const container = document.getElementById('content');
    let old = document.getElementById('uretim-list');
    if (old) old.remove();
    container.insertAdjacentHTML('beforeend', tableHtml);
  }

    // load paketleme records
    async function loadPaketlemeList() {
      const res = await window.electronAPI.listPaketleme();
      const container = document.getElementById('paketleme-list-container');
      if (!container) return;
      if (!res || !res.ok) {
        container.innerHTML = `<div class="text-rose-400">Yükleme hatası: ${res && res.error ? res.error : 'bilinmeyen'}</div>`;
        return;
      }
      const records = res.records || [];
      const html = `
        <div class="mt-4">
          <h4 class="text-lg font-medium mb-2">Kayıtlı Paketlemeler</h4>
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
                ${records.map(r => `
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
      container.innerHTML = html;
    }
});
