# Tjoomde — hitographic.github.io/Tjoomde

Website parfum Tjoomde. Minimal modern, bilingual ID/EN, katalog 6 parfum dummy + order via WhatsApp. Static site, siap GitHub Pages.

Live: https://hitographic.github.io/Tjoomde/

## 1. Edit cepat

- Nomor WA: sudah `6281384812214` di `script.js` (`WA_NUMBER`).
- Produk/harga: edit array `PRODUCTS` di `script.js`.
- Bahasa default: `id`. Toggle ID/EN otomatis tersimpan di localStorage.

## 2. Deploy ke GitHub Pages

1. Push repo ini ke `https://github.com/hitographic/Tjoomde.git` branch `main`.
2. GitHub → repo Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `/ (root)`.
3. Tunggu 1-2 menit, cek `https://hitographic.github.io/Tjoomde/` jalan.

Custom domain nonaktif untuk sekarang (file `CNAME` dihapus). File `.nojekyll` agar Pages serve file statis apa adanya.

## 3. Custom domain (ditunda)

Pernah dicoba `tjoomde.is-a.dev` (ditolak: syarat non-komersial/dev-only) dan `tjoomde.is-a.page` (PR https://github.com/is-a-page/register/pull/4, admin tidak aktif).
File contoh tersimpan di `register-domains/tjoomde.json`. Kalau nanti dapat domain (mis. via `dash.is-pro.dev`), buat lagi file `CNAME` berisi domainnya + set di Settings → Pages → Custom domain → Enforce HTTPS.

## Struktur

- `index.html` — struktur + teks ID/EN (`data-id` / `data-en`)
- `styles.css` — tema minimal modern
- `script.js` — produk, filter, bilingual, order WA
- `CNAME`, `.nojekyll`
