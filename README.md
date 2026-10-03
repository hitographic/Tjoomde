# Tjoomde — tjoomde.is-a.dev

Website parfum Tjoomde. Minimal modern, bilingual ID/EN, katalog 6 parfum dummy + order via WhatsApp. Static site, siap GitHub Pages.

Live (setelah domain aktif): https://tjoomde.is-a.dev
Sementara: https://hitographic.github.io/Tjoomde/

## 1. Edit cepat

- Nomor WA: buka `script.js` → ganti `WA_NUMBER = "6281234567890"` dengan nomor asli (format 62...).
- Produk/harga: edit array `PRODUCTS` di `script.js`.
- Bahasa default: `id`. Toggle ID/EN otomatis tersimpan di localStorage.

## 2. Deploy ke GitHub Pages

1. Push repo ini ke `https://github.com/hitographic/Tjoomde.git` branch `main`.
2. GitHub → repo Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `/ (root)`.
3. Tunggu 1-2 menit, cek `https://hitographic.github.io/Tjoomde/` jalan.

File `CNAME` berisi `tjoomde.is-a.dev` — jangan dihapus. File `.nojekyll` agar Pages serve file statis apa adanya.

## 3. Daftar domain tjoomde.is-a.dev

File siap PR ada di `register-domains/tjoomde.json`:

```json
{
  "owner": { "username": "hitographic", "email": "..." },
  "records": { "CNAME": "hitographic.github.io" }
}
```

Langkah (sesuai docs.is-a.dev/guides/github-pages):

1. Fork https://github.com/is-a-dev/register
2. Buat file `domains/tjoomde.json` di fork, isi dari `register-domains/tjoomde.json` (ganti email dengan email kamu).
3. Open PR ke is-a-dev/register. Tunggu review + merge (biasanya <24 jam).
4. Opsional tapi disarankan: verifikasi domain di GitHub Settings → Pages → Add a domain → `tjoomde.is-a.dev` (tambah TXT record sesuai instruksi GitHub).
5. Setelah PR merge: repo Settings → Pages → Custom domain → isi `tjoomde.is-a.dev` → Save → centang Enforce HTTPS.

Catatan: repo `is-a-dev/register` public, jadi JSON pendaftar (username/email) terlihat publik. Repo website ini boleh tetap public (wajib public untuk GitHub Pages Free).

## Struktur

- `index.html` — struktur + teks ID/EN (`data-id` / `data-en`)
- `styles.css` — tema minimal modern
- `script.js` — produk, filter, bilingual, order WA
- `CNAME`, `.nojekyll`
