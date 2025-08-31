// Login screen module - auto-login for report client
export async function mount(container, { setHeader, onLogin }) {
  setHeader('Raporlar', 'Otomatik giriş (rapor modu)');
  // mark as logged in and immediately call onLogin to show reports
  try { localStorage.setItem('isLoggedIn', '1'); } catch (e) {}
  container.innerHTML = `<div class="p-6 text-neutral-400">Otomatik giriş yapıldı. Raporlara yönlendiriliyorsunuz...</div>`;
  if (onLogin) setTimeout(onLogin, 50);
}

export async function unmount(container) {
  try { container.innerHTML = ''; } catch (e) {}
}
