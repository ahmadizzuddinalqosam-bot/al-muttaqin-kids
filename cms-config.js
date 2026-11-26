/**
 * KONFIGURASI AUTO-SYNC — PORTAL AL MUTTAQIN KIDS v7.0
 * ----------------------------------------------------
 * 1. AUTO-SYNC GAME GITHUB: Sudah aktif otomatis! Setiap repo baru dengan kata
 *    "game" di akun GitHub Anda yang mengaktifkan GitHub Pages akan otomatis
 *    muncul di seksi Arena Game.
 * 2. AUTO-SYNC GOOGLE SHEETS CMS (Buku, Merchandise, Kas BKU, Shorts, Game):
 *    Tempel URL Web App hasil Deploy Google Apps Script di CMS_WEBAPP_URL di bawah.
 *    Jika dibiarkan kosong (""), portal tetap berjalan normal memakai data bawaan v7.0.
 */
window.AL_MUTTAQIN_SYNC_CONFIG = {
  GITHUB_USERNAME: "ahmadizzuddinalqosam-bot",
  AUTO_SYNC_GITHUB_GAMES: true,
  GAME_REPO_KEYWORD: "game",
  GITHUB_CACHE_MINUTES: 360, // 6 jam (bisa klik tombol 'Cek Game Baru' kapan saja)

  // Tempel URL Web App Google Apps Script di bawah ini (contoh: "https://script.google.com/macros/s/AKfycb.../exec")
  CMS_WEBAPP_URL: "",
  CMS_CACHE_MINUTES: 15
};
