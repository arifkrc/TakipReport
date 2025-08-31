// Module-based renderer entry (ESM)
import { showToast } from './ui/helpers.js';

const content = document.getElementById('content');
const headerTitle = document.getElementById('screen-title');
const headerSub = document.getElementById('screen-sub');
const tabsContainer = document.querySelector('.tabs');
const logoutBtn = document.getElementById('logout');

// track current loaded module so we can unmount it before loading another
let currentModule = null;
let currentScreenName = null;

async function loadScreen(name) {
  if (!name) return;
  // if same screen, noop
  if (name === currentScreenName) return;

  headerTitle.textContent = name === 'uretim' ? '\u00dcretim' : name === 'paketleme' ? 'Paketleme' : name;
  headerSub.textContent = '';

  // if current module exports unmount, call it
  try {
    if (currentModule && typeof currentModule.unmount === 'function') {
      await currentModule.unmount(content);
    } else {
      // default: clear content
      content.innerHTML = '';
    }
  } catch (err) {
    console.warn('error during unmount', err);
  }

  content.innerHTML = '<div class="p-4 text-neutral-400">Y\u00fckleniyor...</div>';
  try {
    const module = await import(`./screens/${name}.js`);
    currentModule = module;
    currentScreenName = name;
    if (module && typeof module.mount === 'function') {
      await module.mount(content, { setHeader: (t, s) => { headerTitle.textContent = t; headerSub.textContent = s }});
    } else {
      content.innerHTML = '<div class="text-rose-400">Ekran y\u00fcklenemedi</div>';
    }
  } catch (err) {
    console.error('loadScreen error', err);
    const msg = (err && (err.message || String(err))) || 'Bilinmeyen hata';
    const stack = (err && err.stack) ? `<pre class="text-xs text-neutral-400 mt-2">${String(err.stack).replace(/</g,'&lt;')}</pre>` : '';
    content.innerHTML = `
      <div class="text-rose-400">
        <div class="font-semibold">Ekran yüklenirken hata oluştu:</div>
        <div class="mt-2">${msg}</div>
        ${stack}
        <div class="mt-3"><button id="copy-error" class="px-2 py-1 bg-neutral-800 rounded">Hata kopyala</button></div>
      </div>
    `;
    showToast('Ekran yükleme hatası: ' + msg, 'error');
    // wire copy button
    setTimeout(() => {
      const btn = document.getElementById('copy-error');
      if (btn) btn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText((err && err.stack) ? err.stack : msg); showToast('Hata panoya kopyalandı', 'success'); } catch(e) { showToast('Kopyalama başarısız', 'error'); }
      });
    }, 50);
  }
}

function setActiveNav(screen) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('bg-indigo-600', b.dataset && b.dataset.screen === screen);
  });
}

function navigateTo(screen) {
  if (!screen) screen = 'uretim';
  location.hash = `#${screen}`;
}

window.addEventListener('hashchange', () => {
  const screen = (location.hash || '#uretim').replace('#','');
  setActiveNav(screen);
  loadScreen(screen);
});

window.addEventListener('DOMContentLoaded', async () => {
  // Report client: no login screen — show tabs and load last/default report
  if (tabsContainer) tabsContainer.style.display = '';
  if (logoutBtn) logoutBtn.style.display = 'none';

  // wire tab buttons under the header
  document.querySelectorAll('.tabs .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset && btn.dataset.screen;
      navigateTo(screen);
    });
  });

  // wire refresh button to reload current screen data
  const refreshBtn = document.getElementById('refresh');
  if (refreshBtn) refreshBtn.addEventListener('click', async () => {
    showToast('Veriler yenileniyor...', 'info');
    // trigger reload of current screen
    try { if (currentModule && typeof currentModule.mount === 'function') { await currentModule.mount(content, { setHeader: (t, s) => { headerTitle.textContent = t; headerSub.textContent = s }}); } } catch(e) { console.warn('refresh mount failed', e); }
  });

  // restore last screen from hash or localStorage and load it
  const initial = (location.hash || (localStorage.getItem('lastScreen') ? `#${localStorage.getItem('lastScreen')}` : '#uretim')).replace('#','');
  setActiveNav(initial);
  loadScreen(initial);

  // persist last screen on hash change
  window.addEventListener('hashchange', () => {
    const screen = (location.hash || '#uretim').replace('#','');
    try { localStorage.setItem('lastScreen', screen); } catch(e) {}
  });

  // keyboard shortcut: Ctrl+Tab -> next tab, Ctrl+Shift+Tab -> previous tab
  function handleCtrlTab(e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const btns = Array.from(document.querySelectorAll('.tabs .nav-btn'));
    if (!btns.length) return;
    const screens = btns.map(b => b.dataset && b.dataset.screen).filter(Boolean);
    const current = currentScreenName || (location.hash ? location.hash.replace('#','') : screens[0]);
    const idx = Math.max(0, screens.indexOf(current));
    const forward = !e.shiftKey;
    const nextIdx = forward ? (idx + 1) % screens.length : (idx - 1 + screens.length) % screens.length;
    navigateTo(screens[nextIdx]);
  }
  window.addEventListener('keydown', handleCtrlTab);
});
