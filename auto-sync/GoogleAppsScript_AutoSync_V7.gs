/**
 * ============================================================================
 * AL MUTTAQIN KIDS v7.0 — GOOGLE APPS SCRIPT AUTO-SYNC ENGINE (OPSI A + B)
 * ============================================================================
 * Dua fungsi utama dalam 1 skrip gratis:
 *   [A] WEB APP API (doGet) : Mengubah Google Sheet CMS menjadi API JSON live
 *       untuk Portal Web Al Muttaqin Kids (Buku, Merchandise, Kas BKU, Shorts, Game).
 *   [B] DRIVE -> GITHUB SYNC: Memindai folder khusus gambar publik di Google Drive
 *       dan otomatis mengunggah gambar baru/diperbarui ke folder assets/ di GitHub!
 *
 * CARA PASANG (5 MENIT):
 *   1. Unggah 'Template_CMS_Web_Al_Muttaqin_Kids_V7.xlsx' ke Google Drive Anda,
 *      lalu klik File -> Simpan sebagai Google Spreadsheet.
 *   2. Buka menu Ekstensi -> Apps Script, hapus isi bawaan, lalu tempel SEMUA kode ini.
 *   3. Untuk mengaktifkan [A] CMS Web Live:
 *      - Klik Terapkan (Deploy) -> Deployment Baru -> Jenis: Aplikasi Web.
 *      - Jalankan sebagai: Saya (email Anda) | Yang memiliki akses: Siapa saja.
 *      - Salin URL Web App (.../exec) lalu tempel ke file 'cms-config.js' di GitHub
 *        pada baris CMS_WEBAPP_URL.
 *   4. Untuk mengaktifkan [B] Auto-Upload Gambar Drive -> GitHub (Opsional):
 *      - Buat 1 folder di Drive bernama '00_PUBLISH_WEB_GAMBAR' (boleh berisi subfolder
 *        'covers', 'merch', 'hero', 'locations', 'characters' atau langsung taruh file).
 *      - Salin ID Folder Drive tersebut (teks setelah /folders/ pada URL Drive).
 *      - Buat GitHub Personal Access Token (Fine-grained, izin Contents: Read & Write
 *        khusus repo 'al-muttaqin-kids').
 *      - Di Apps Script, buka Pengaturan Proyek -> Properti Skrip, tambahkan 2 properti:
 *          GITHUB_TOKEN    = <token_github_anda>
 *          DRIVE_FOLDER_ID = <id_folder_00_PUBLISH_WEB_GAMBAR>
 *      - Kembali ke Google Sheet, muat ulang halaman -> klik menu
 *        "Al Muttaqin Auto-Sync" -> "Aktifkan Auto-Sync Gambar Tiap 1 Jam".
 */

const GITHUB_OWNER  = "ahmadizzuddinalqosam-bot";
const GITHUB_REPO   = "al-muttaqin-kids";
const GITHUB_BRANCH = "main";

// Menu khusus di toolbar Google Sheets
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Al Muttaqin Auto-Sync")
    .addItem("Sinkronkan Gambar Drive -> GitHub Sekarang", "syncDriveImagesToGitHub")
    .addItem("Aktifkan Jadwal Otomatis (Tiap 1 Jam)", "setupHourlyImageSyncTrigger")
    .addItem("Hentikan Jadwal Otomatis", "removeSyncTriggers")
    .addToUi();
}

// ============================================================================
// BAGIAN A: JSON API UNTUK WEBSITE AL MUTTAQIN KIDS (doGet)
// ============================================================================
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = {
      ok: true,
      version: "7.0",
      updatedAt: new Date().toISOString(),
      games:  readTabAsObjects_(ss, "GAMES"),
      books:  readTabAsObjects_(ss, "BUKU"),
      merch:  readTabAsObjects_(ss, "MERCH"),
      kpi:    readTabAsObjects_(ss, "KAS_KPI"),
      shorts: readTabAsObjects_(ss, "SHORTS")
    };
    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function readTabAsObjects_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every(cell => String(cell).trim() === "")) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = String(row[idx] || "").trim();
    });
    // Abaikan baris yang kolom AKTIF-nya bernilai TIDAK / FALSE / 0
    if (obj.AKTIF && ["TIDAK", "FALSE", "0", "NO"].indexOf(obj.AKTIF.toUpperCase()) !== -1) {
      continue;
    }
    rows.push(obj);
  }
  return rows;
}

// ============================================================================
// BAGIAN B: AUTO-SYNC GAMBAR DARI GOOGLE DRIVE KE GITHUB (assets/...)
// ============================================================================
function syncDriveImagesToGitHub() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("GITHUB_TOKEN");
  const rootFolderId = props.getProperty("DRIVE_FOLDER_ID");

  if (!token || !rootFolderId) {
    throw new Error("Harap isi Properti Skrip 'GITHUB_TOKEN' dan 'DRIVE_FOLDER_ID' di Pengaturan Proyek Apps Script.");
  }

  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const allowedExt = /\.(webp|png|jpg|jpeg)$/i;
  const targets = [];

  // 1. Scan file langsung di root folder (auto-routing berdasarkan awalan nama file)
  collectFiles_(rootFolder, "", targets, allowedExt);

  // 2. Scan subfolder opsional: covers, merch, hero, locations, characters, storyboard
  const subFolders = rootFolder.getFolders();
  while (subFolders.hasNext()) {
    const sf = subFolders.next();
    const sfName = sf.getName().toLowerCase().trim();
    if (["covers", "merch", "hero", "locations", "characters", "storyboard", "logo"].indexOf(sfName) !== -1) {
      collectFiles_(sf, sfName, targets, allowedExt);
    }
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName("LOG_SYNC") || ss.insertSheet("LOG_SYNC");
  let uploadedCount = 0;
  let skippedCount = 0;

  targets.forEach(item => {
    const ghPath = resolveGitHubAssetPath_(item.subfolder, item.file.getName());
    const bytes = item.file.getBlob().getBytes();
    const b64 = Utilities.base64Encode(bytes);
    const localSha = computeGitBlobSha_(bytes);

    const existingSha = getGitHubFileSha_(ghPath, token);
    if (existingSha && existingSha === localSha) {
      skippedCount++;
      return; // File identik, lewati tanpa membuat commit baru
    }

    const ok = pushFileToGitHub_(ghPath, b64, existingSha, token, "Auto-sync gambar dari Drive: " + item.file.getName());
    if (ok) {
      uploadedCount++;
      logSheet.appendRow([
        new Date(),
        item.file.getName(),
        ghPath,
        existingSha ? "DIPERBARUI" : "BARU",
        Math.round(bytes.length / 1024) + " KB"
      ]);
    }
  });

  Logger.log("Sinkronisasi selesai. Diunggah/Diperbarui: " + uploadedCount + " | Dilewati (sama): " + skippedCount);
  try {
    SpreadsheetApp.getUi().alert(
      "Sinkronisasi Gambar Selesai!\n" +
      "- Diunggah/Diperbarui ke GitHub: " + uploadedCount + " file\n" +
      "- Sudah sama (dilewati): " + skippedCount + " file"
    );
  } catch (e) {
    // Dijalankan lewat trigger otomatis (tanpa UI)
  }
}

function collectFiles_(folder, subfolderName, bucket, regex) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (regex.test(f.getName())) {
      bucket.push({ file: f, subfolder: subfolderName });
    }
  }
}

function resolveGitHubAssetPath_(subfolder, fileName) {
  if (subfolder) return "assets/" + subfolder + "/" + fileName;
  const upper = fileName.toUpperCase();
  if (upper.indexOf("COV_") !== -1 || upper.indexOf("COVER") !== -1) return "assets/covers/" + fileName;
  if (upper.indexOf("MERCH") !== -1) return "assets/merch/" + fileName;
  if (upper.indexOf("CHR_") !== -1) return "assets/characters/" + fileName;
  if (upper.indexOf("LOC") !== -1 || upper.indexOf("WORLD") !== -1) return "assets/locations/" + fileName;
  if (upper.indexOf("HERO") !== -1) return "assets/hero/" + fileName;
  if (upper.indexOf("LOGO") !== -1) return "assets/logo/" + fileName;
  return "assets/merch/" + fileName;
}

function computeGitBlobSha_(bytes) {
  const header = Utilities.newBlob("blob " + bytes.length + "\0").getBytes();
  const combined = header.concat(bytes);
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, combined);
  return digest.map(b => ("0" + ((b < 0 ? b + 256 : b).toString(16))).slice(-2)).join("");
}

function getGitHubFileSha_(path, token) {
  const url = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + encodeURI(path) + "?ref=" + GITHUB_BRANCH;
  const res = UrlFetchApp.fetch(url, {
    method: "get",
    muteHttpExceptions: true,
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json"
    }
  });
  if (res.getResponseCode() === 200) {
    const data = JSON.parse(res.getContentText());
    return data.sha || null;
  }
  return null;
}

function pushFileToGitHub_(path, base64Content, existingSha, token, message) {
  const url = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + encodeURI(path);
  const body = {
    message: message,
    content: base64Content,
    branch: GITHUB_BRANCH
  };
  if (existingSha) body.sha = existingSha;

  const res = UrlFetchApp.fetch(url, {
    method: "put",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json"
    },
    payload: JSON.stringify(body)
  });
  const code = res.getResponseCode();
  return code === 200 || code === 201;
}

function setupHourlyImageSyncTrigger() {
  removeSyncTriggers();
  ScriptApp.newTrigger("syncDriveImagesToGitHub")
    .timeBased()
    .everyHours(1)
    .create();
  SpreadsheetApp.getUi().alert("Jadwal Auto-Sync aktif! Gambar di folder Drive akan dicek dan disinkronkan ke GitHub otomatis setiap 1 jam.");
}

function removeSyncTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "syncDriveImagesToGitHub") {
      ScriptApp.deleteTrigger(t);
    }
  });
}
