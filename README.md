# Portal Web Al Muttaqin Kids v7.0 (Full Auto-Sync Edition) — Majelis Ta'lim Al Muttaqin

Portal Edukasi Islam Anak — **Semesta Kisah Kampung Al-Muttaqin** di bawah naungan **Majelis Ta'lim Al Muttaqin** (*Biro Publikasi & Kurikulum Media Pembelajaran — Majelis Al-Muttaqin Press*).

## Fitur Baru di v7.0 (Auto-Sync Tanpa Edit Kode Lagi)
1. **Arena 3 Serial Game Live + Auto-Deteksi Game Baru dari GitHub**:
   - Memuat langsung 3 seri game resmi yang sudah rilis:
     - **V1**: `https://ahmadizzuddinalqosam-bot.github.io/Game-Jejak-Kisah-Kampung-Al-Muttaqin/`
     - **V2**: `https://ahmadizzuddinalqosam-bot.github.io/Game-al-muttaqin-kids-V2/`
     - **V3**: `https://ahmadizzuddinalqosam-bot.github.io/Game-Al-Muttaqin-Kids-V3/`
   - Dilengkapi mesin **GitHub Public API Auto-Sync** (`cms-config.js`): setiap kali Anda membuat repositori baru di akun `ahmadizzuddinalqosam-bot` yang mengandung kata `Game` dan mengaktifkan GitHub Pages (misal `Game-Al-Muttaqin-Kids-V4`), kartu pintasannya **otomatis muncul** di Arena Game!
2. **Auto-Sync Konten Web via Google Sheets CMS (Opsi A)**:
   - Ubah harga, status buku (`Roadmap` -> `SELESAI 100%`), tambah produk merchandise `#19+`, tambah episode YouTube Shorts, atau update angka Kas BKU & ZISWAF cukup lewat **Google Sheets** (`auto-sync/Template_CMS_Web_Al_Muttaqin_Kids_V7.xlsx`).
   - Tempel 1 URL Web App ke `cms-config.js` -> website otomatis menarik data terbaru.
3. **Auto-Sync Gambar Final Drive -> GitHub (Opsi B)**:
   - Skrip **`auto-sync/GoogleAppsScript_AutoSync_V7.gs`** juga memiliki fitur 1-klik & jadwal otomatis tiap 1 jam untuk memindai folder khusus Drive (`00_PUBLISH_WEB_GAMBAR`) dan langsung mendorong gambar baru/final ke folder `assets/` GitHub tanpa menimpa file yang tidak berubah.

## Cara Update ke GitHub Pages (`al-muttaqin-kids`)
1. Ekstrak seluruh isi `al-muttaqin-kids-web-github-v7.zip`.
2. Buka repositori `al-muttaqin-kids` -> **Add file -> Upload files**.
3. Seret seluruh isi hasil ekstrak (`index.html`, `cms-config.js`, `README.md`, `tukar_cover_asli.py`, folder `assets`, `auto-sync`, `buku`, `bab`) -> **Commit changes**.
4. Tunggu 1–2 menit lalu tekan `Ctrl + Shift + R` di `https://ahmadizzuddinalqosam-bot.github.io/al-muttaqin-kids/`.
