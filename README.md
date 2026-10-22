# Tjoomde — tjoomde.my.id

Website parfum Tjoomde. Static site, GitHub Pages.

Live: https://tjoomde.my.id (juga https://www.tjoomde.my.id)

## Status live (launch fase 1)

- `index.html` = halaman **Coming Soon** (tanpa foto).
- **Hanya `/Hawas-Ice/` yang berisi halaman varian nyata** — Extrait de Parfum 30ML, tanpa foto botol/notes, link referensi Fragrantica, order via WhatsApp (`6281384812214`).
- Semua halaman lain (35 folder varian + `admin/`) = **stub redirect** (meta refresh) ke Coming Soon.
- `404.html` juga mengalihkan ke Coming Soon untuk path yang tidak dikenal.

> ⚠️ **Jangan jalankan `python3 scripts/build_variants.py`** tanpa membaca bagian bawah —
> script itu akan menimpa Coming Soon/redirect di 36 folder varian dan halaman Hawas Ice.

## Edit cepat

- Nomor WA: konstanta `WA_NUMBER` di `script.js` + `WA` di `scripts/build_variants.py` + teks tombol WA di `index.html` & `Hawas-Ice/index.html`.
- Data varian: `Data/Tjoomde.xlsx`, lalu `python3 scripts/build_variants.py`.
- Koreksi per varian: `Data/overrides.json`, cth `{"Hawas-Ice": {"gender": ["Men", "Pria"]}}`.
- Nilai longevity/sillage/gender/day/season di halaman varian = **estimasi** dari komposisi notes.

## Struktur

- `index.html` — Coming Soon (root)
- `Hawas-Ice/index.html` — satu-satunya halaman varian yang aktif
- `<Slug>/index.html` — 35 stub redirect (konten lama masih ada di git history)
- `404.html` — redirect ke Coming Soon
- `scripts/build_variants.py` — generator halaman varian dari Excel (memanggil ulang akan menimpa redirect!)
- `Data/` — `Tjoomde.xlsx`, `fragrantica_accords.json`, `overrides.json`
- `assets/` — `logo.png`, `variants.js`, `notes-db.js`, `note-images.js` (dipakai halaman Hawas Ice)
- `styles.css`, `script.js`, `admin/`, `CNAME` (`tjoomde.my.id`), `.nojekyll`
