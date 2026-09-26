# MOVE UP — Cloud Storage Web App

Aplikasi web cloud storage (demo/frontend) dibangun dengan **Vite + React + Tailwind**.
Semua data (user, file, produk toko, kode redeem, audit log) disimpan di **localStorage**
browser, jadi aplikasi ini bisa langsung dijalankan dan di-deploy sebagai situs statis
tanpa perlu setup database/backend apapun — cocok untuk demo, prototipe, atau
dikembangkan lebih lanjut dengan backend sungguhan (lihat bagian "Next Steps").

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Akun demo yang sudah tersedia (dibuat otomatis saat pertama kali dibuka):
- **Admin 1**: username `admin`, password `admin123`
- **User**: username `andi`, password `user123`

Kode redeem demo: `MOVEUP-GIFT-2026` (menambah 10GB storage).

## Build production

```bash
npm run build
npm run preview
```

## Deploy ke Vercel

1. Push folder ini ke repo GitHub (atau upload langsung lewat Vercel CLI/dashboard).
2. Di Vercel, import project ini. Vercel otomatis mendeteksi framework **Vite**:
   - Build Command: `npm run build` (auto)
   - Output Directory: `dist` (auto)
3. Klik **Deploy**. Tidak ada environment variable yang dibutuhkan karena semua
   data tersimpan di localStorage browser pengguna.

Atau via CLI:

```bash
npm i -g vercel
vercel --prod
```

File `vercel.json` sudah disertakan agar routing SPA (`/beranda`, `/stora`, dst)
tidak 404 saat direfresh — meski aplikasi ini juga sudah pakai `HashRouter`
(`#/beranda`) sehingga aman di hosting statis manapun tanpa konfigurasi rewrite.

## Struktur fitur

- **Auth**: login, register, password diverifikasi di layer `src/lib/api.js`
  (mensimulasikan backend — validasi tidak hanya di UI).
- **Beranda**: ringkasan kuota, statistik file, aktivitas terbaru.
- **My Stora**: upload (drag & drop), kategori, folder, rename, pindah,
  copy link, trash, hapus permanen.
- **Volt Settings**: akun, ganti password/foto, tema, redeem kode, koleksi item.
- **Toko**: beli efek/tema pakai koin, otomatis masuk Koleksi + tercatat transaksi.
- **Ruang Admin** (role `admin1`/`admin2`/`admin3`): dashboard statistik,
  kelola user (tambah storage, aktif/nonaktif, ubah role — Admin 1 saja),
  Bos Toko (kelola produk, buat gift code, buat kode redeem admin).
- Semua tindakan berisiko (nonaktifkan akun, hapus permanen, logout) memakai
  modal konfirmasi. Permission role dicek di `src/lib/api.js`, bukan hanya
  disembunyikan di UI.

## Next steps (kalau mau backend sungguhan)

Ganti isi `src/lib/api.js` (fungsi-fungsinya sudah dipisah rapi per fitur)
dengan pemanggilan REST/API sungguhan (mis. Vercel Postgres/Supabase +
Vercel Serverless Functions untuk auth & permission check di server),
tanpa perlu mengubah komponen halaman.
