#!/usr/bin/env python3
"""
Skrip Bantu 1-Klik: Tukar Sampul Buku Web Al Muttaqin Kids v6.0
dengan File Bentangan Cetak Asli (A4 Landscape -> Potong 50% Sisi Kanan Depan ISO A5).

Cara Pakai di Windows 11 / Laptop:
1. Pastikan Python 3 & Pillow terpasang: pip install pillow
2. Taruh file cover asli Anda (.png / .jpg / .jfif) di folder 'cover_asli_lokal'
   (di sebelah file ini). Contoh nama file yang dikenali otomatis:
     - *MAM_I_01* atau *Fiqih*      -> assets/covers/MAM_COV_MAMI01_V6.webp
     - *ke 2* / *MAM_I_02* / *Tajwid* -> assets/covers/MAM_COV_MAMI02_V6.webp
     - *ke 3* / *MAM_I_03* / *Aqidah* -> assets/covers/MAM_COV_MAMI03_V6.webp
     - *ke 4* / *MAM_I_04* / *Akhlaq* -> assets/covers/MAM_COV_MAMI04_V6.webp
     - *ke 5* / *MAM_I_05* / *Tarikh* -> assets/covers/MAM_COV_MAMI05_V6.webp
     - *Ke 6* / *MAM_I_06* / *Kerja*  -> assets/covers/MAM_COV_MAMI06_V6.webp
     - *IQRO*                        -> assets/covers/MAM_COV_IQRO_V6.webp
     - *IMLA*                        -> assets/covers/MAM_COV_IMLA_V6.webp
     - *JUZ_AMMA* / *JUZ AMMA*       -> assets/covers/MAM_COV_JUZAMMA_V6.webp
3. Jalankan: python tukar_cover_asli.py
   - Jika gambar berbentuk bentangan landscape (lebar > tinggi), skrip otomatis memotong
     sisi kanan 48.5% (sampul depan ISO A5, menghindari garis punggung tengah).
   - Jika gambar sudah potret (tinggi > lebar), skrip langsung mengonversi ke A5 WebP tajam.
"""
import os
from PIL import Image, ImageOps

SRC_DIR = "cover_asli_lokal"
DST_DIR = os.path.join("assets", "covers")
TARGET_SIZE = (480, 680)  # ISO A5 portrait

RULES = [
    (["mam_i_01", "mam-i-01", "fiqih"], "MAM_COV_MAMI01_V6.webp"),
    (["mam_i_02", "mam-i-02", "ke 2", "tajwid"], "MAM_COV_MAMI02_V6.webp"),
    (["mam_i_03", "mam-i-03", "ke 3", "aqidah", "tauhid"], "MAM_COV_MAMI03_V6.webp"),
    (["mam_i_04", "mam-i-04", "ke 4", "akhlaq", "akhlak"], "MAM_COV_MAMI04_V6.webp"),
    (["mam_i_05", "mam-i-05", "ke 5", "tarikh"], "MAM_COV_MAMI05_V6.webp"),
    (["mam_i_06", "mam-i-06", "ke 6", "kerja"], "MAM_COV_MAMI06_V6.webp"),
    (["iqro"], "MAM_COV_IQRO_V6.webp"),
    (["imla"], "MAM_COV_IMLA_V6.webp"),
    (["juz_amma", "juz amma", "juzamma"], "MAM_COV_JUZAMMA_V6.webp"),
]

def main():
    os.makedirs(SRC_DIR, exist_ok=True)
    files = [f for f in os.listdir(SRC_DIR) if f.lower().endswith((".png", ".jpg", ".jpeg", ".jfif", ".webp"))]
    if not files:
        print(f"Folder '{SRC_DIR}' masih kosong. Salin file cover asli Anda ke dalamnya lalu jalankan ulang.")
        return
    converted = 0
    for fn in sorted(files):
        low = fn.lower()
        target = None
        for keys, out_name in RULES:
            if any(k in low for k in keys):
                target = out_name
                break
        if not target:
            print(f"[LEWATI] Nama file tidak cocok aturan: {fn}")
            continue
        im = Image.open(os.path.join(SRC_DIR, fn)).convert("RGB")
        w, h = im.size
        if w > h * 1.15:
            # Bentangan A4 landscape -> ambil 48.5% sisi kanan (sampul depan A5)
            im = im.crop((int(w * 0.515), 0, w, h))
        im = ImageOps.fit(im, TARGET_SIZE, Image.Resampling.LANCZOS)
        out_path = os.path.join(DST_DIR, target)
        im.save(out_path, "WEBP", quality=88, method=6)
        print(f"[OK] {fn} -> {out_path}")
        converted += 1
    print(f"Selesai! {converted} sampul berhasil diperbarui. Unggah folder assets/covers ke GitHub.")

if __name__ == "__main__":
    main()
