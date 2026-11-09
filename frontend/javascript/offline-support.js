/* FITK SIBER AHSAN — registrasi Service Worker dan sinyal offline.
 * Letakkan setelah script dashboard.js/detail-pengaduan.js/buat-pengaduan.js.
 */
(() => {
  'use strict';

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      const swURL = new URL('./sw.js', document.baseURI);
      navigator.serviceWorker.register(swURL.href, {
        scope: new URL('./', document.baseURI).pathname
      }).catch(error => console.warn('Service Worker tidak terpasang:', error));
    });
  }

  // `offline` membantu UI berubah TANPA refresh. Saat refresh offline,
  // Service Worker yang memberikan shell HTML/CSS/JS dari cache.
  function onOffline() {
    document.documentElement.dataset.network = 'offline';

    // Dashboard: gunakan handler dan UI Figma yang sudah dibuat di dashboard.js.
    const dashboardRetry = document.getElementById('btnRetry');
    if (dashboardRetry && document.getElementById('errorState')) {
      dashboardRetry.click(); // GET dashboard gagal lalu showError() bawaan dipanggil.
      return;
    }

    // Detail: gunakan showError() bawaan melalui handler Retry milik detail-pengaduan.js.
    const detailRetry = document.getElementById('detailRetryBtn');
    if (detailRetry && document.getElementById('detailState')) {
      detailRetry.click();
    }
    // Halaman lain: kirim sinyal tanpa memicu POST atau merusak form.
    // Riwayat yang nanti dibuat dapat mendengarkan event fitk:offline.
    window.dispatchEvent(new CustomEvent('fitk:offline'));
  }

  function onOnline() {
    document.documentElement.dataset.network = 'online';
    // Sengaja tidak auto-submit ulang form atau POST voting.
    window.dispatchEvent(new CustomEvent('fitk:online'));
    // Tidak auto-submit POST. Pengguna menekan Coba Lagi untuk GET terbaru.
  }

  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);
  if (!navigator.onLine) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onOffline, { once: true });
    } else {
      onOffline();
    }
  }
})();
