# Tjoomde — tjoomde.my.id

Website parfum Tjoomde. Minimal modern, bilingual ID/EN, katalog 35 varian + order via WhatsApp (`6281384812214`). Static site, GitHub Pages.

Live: https://tjoomde.my.id (juga https://www.tjoomde.my.id)

## Edit cepat

- Nomor WA: konstanta `WA_NUMBER` di `script.js` + `WA` di `scripts/build_variants.py`.
- Data varian: `Data/Tjoomde.xlsx`, lalu `python3 scripts/build_variants.py`.
- Koreksi per varian: `Data/overrides.json`, cth `{"Marshmallow": {"longevity_h": "8-10", "sillage": 4}}`.
- Nilai longevity/sillage/gender/day/season di halaman varian = **estimasi** dari komposisi notes.

## Struktur

- `index.html`, `styles.css`, `script.js` (+ `assets/variants.js`)
- `<Slug>/index.html` — 35 halaman varian (main accords, pyramid, longevity, sillage, gender, day/night, season)
- `scripts/build_variants.py` — generator dari Excel
- `CNAME` (`tjoomde.my.id`), `.nojekyll`
