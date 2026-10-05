# Tjoomde — tjoomde.my.id

Website parfum Tjoomde. Minimal modern, bilingual ID/EN, katalog 6 parfum dummy + order via WhatsApp. Static site, siap GitHub Pages.

Live: https://tjoomde.my.id (juga https://www.tjoomde.my.id)
Cadangan: https://hitographic.github.io/Tjoomde/

## 1. Edit cepat

- Nomor WA: sudah `6281384812214` di `script.js` (`WA_NUMBER`).
- Produk/harga: edit array `PRODUCTS` di `script.js`.
- Bahasa default: `id`. Toggle ID/EN otomatis tersimpan di localStorage.

## 2. Deploy ke GitHub Pages

1. Push repo ini ke `https://github.com/hitographic/Tjoomde.git` branch `main`.
2. GitHub → repo Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `/ (root)`.
3. Tunggu 1-2 menit, cek `https://hitographic.github.io/Tjoomde/` jalan.

Custom domain aktif via file `CNAME` (`tjoomde.my.id`). File `.nojekyll` agar Pages serve file statis apa adanya.

## 3. Custom domain tjoomde.my.id (aktif)

DNS: 4x A `@` → `185.199.108-111.153` + CNAME `www` → `hitographic.github.io`.
Setelah ganti domain: buat file `CNAME`, push, lalu Settings → Pages → pastikan custom domain + Enforce HTTPS.

## Struktur

- `index.html` — struktur + teks ID/EN (`data-id` / `data-en`)
- `styles.css` — tema minimal modern
- `script.js` — produk, filter, bilingual, order WA
- `CNAME`, `.nojekyll`
