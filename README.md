# Tjoomde — tjoomde.is-a.page

Website parfum Tjoomde. Minimal modern, bilingual ID/EN, katalog 6 parfum dummy + order via WhatsApp. Static site, siap GitHub Pages.

Live (setelah domain aktif): https://tjoomde.is-a.page
Sementara: https://hitographic.github.io/Tjoomde/

## 1. Edit cepat

- Nomor WA: sudah `6281384812214` di `script.js` (`WA_NUMBER`).
- Produk/harga: edit array `PRODUCTS` di `script.js`.
- Bahasa default: `id`. Toggle ID/EN otomatis tersimpan di localStorage.

## 2. Deploy ke GitHub Pages

1. Push repo ini ke `https://github.com/hitographic/Tjoomde.git` branch `main`.
2. GitHub → repo Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `/ (root)`.
3. Tunggu 1-2 menit, cek `https://hitographic.github.io/Tjoomde/` jalan.

File `CNAME` berisi `tjoomde.is-a.page` — jangan dihapus. File `.nojekyll` agar Pages serve file statis apa adanya.

## 3. Daftar domain tjoomde.is-a.page

File siap PR ada di `register-domains/tjoomde.json`:

```json
{
  "description": "Tjoomde perfume brand store",
  "type": "CNAME",
  "cname": "hitographic.github.io",
  "proxied": true,
  "owner": { "username": "hitographic", "email": "hitographic@gmail.com" }
}
```

Status: PR https://github.com/is-a-page/register/pull/4 (menunggu review + merge).
Setelah merge, DNS + redirect otomatis push ke Cloudflare.

1. Setelah PR merge: repo Settings → Pages → Custom domain → isi `tjoomde.is-a.page` → Save → centang Enforce HTTPS.
2. Tunggu propagasi DNS ±10 menit, cek `https://tjoomde.is-a.page`.

Catatan: repo `is-a-page/register` public, jadi JSON pendaftar (username/email) terlihat publik. Repo website ini tetap public (wajib public untuk GitHub Pages Free).

## Struktur

- `index.html` — struktur + teks ID/EN (`data-id` / `data-en`)
- `styles.css` — tema minimal modern
- `script.js` — produk, filter, bilingual, order WA
- `CNAME`, `.nojekyll`
