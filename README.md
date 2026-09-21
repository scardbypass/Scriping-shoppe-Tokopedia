<div align="center">
<img src="assets/icon.png" width="150" alt="SCARD-PROJECT">

# ✦ Ambil Produk Toko

### Shopee & Tokopedia Product Collector

**SCARD-PROJECT**

*Ideas Today • A Better Tomorrow*

<br>

![Windows](https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=windows11&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Required-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Shopee](https://img.shields.io/badge/Shopee-Supported-EE4D2D?style=for-the-badge)
![Tokopedia](https://img.shields.io/badge/Tokopedia-Supported-42B549?style=for-the-badge)

<br>

> Desktop application untuk mengambil dan mengelola data produk  
> **Shopee & Tokopedia** dengan workflow yang sederhana dan modern.

</div>

---

## ✨ Overview

**Ambil Produk Toko** adalah aplikasi desktop Windows dari **SCARD-PROJECT**
untuk mengumpulkan informasi produk dari toko online.

Aplikasi menggunakan browser Chrome milik pengguna sehingga proses login atau
verifikasi marketplace tetap dilakukan melalui browser secara normal.

Data yang berhasil dikumpulkan dapat disimpan sebagai:

- 📦 JSON
- 📊 Microsoft Excel
- ☁️ Dikirim langsung ke server / cPanel
- 🗄️ Disimpan ke database MySQL melalui API

---

## 🛍️ Marketplace

| Marketplace | Status |
|---|:---:|
| 🟠 Shopee | ✅ Supported |
| 🟢 Tokopedia | ✅ Supported |

---

## 💎 Features

| Feature | Description |
|---|---|
| 🛒 Store Collector | Mengambil beberapa produk dari satu toko |
| 🌐 Chrome Session | Menggunakan Chrome yang dibuka oleh aplikasi |
| 🖼️ Product Images | Gambar utama dan galeri produk |
| 💰 Price | Harga dan harga diskon |
| ⭐ Rating | Informasi rating produk jika tersedia |
| 📦 Stock | Status/stok jika tersedia |
| 🔥 Sold | Informasi jumlah terjual |
| 🎨 Variations | Warna, model, ukuran, dan opsi produk |
| 🔗 Product URL | URL produk asli |
| 📄 JSON Export | Export hasil ke JSON |
| 📊 Excel Export | Export hasil ke `.xlsx` |
| ☁️ cPanel Sync | Kirim produk ke REST API |
| 🔐 API Token | Authorization menggunakan Bearer Token |
| 📟 Live Terminal | Monitoring proses secara realtime |
| ⏹️ Start / Stop | Kontrol proses collector |
| ☑️ Field Selector | Pilih data yang ingin diexport |

---

# 🖥️ Requirements

Untuk menjalankan source code:

| Software | Requirement |
|---|---|
| Windows | Windows 10 / 11 |
| Node.js | 18+ / versi LTS terbaru |
| npm | Included with Node.js |
| Google Chrome | Required |
| Internet | Required |

> Untuk pengguna yang menggunakan **installer `.exe`**, Node.js tidak perlu
> dijalankan secara manual.

---

# 🚀 Run From Source

## 1. Clone Repository

Buka **CMD / PowerShell / Terminal VS Code**:

```bash
git clone https://github.com/scardbypass/Scriping-shoppe-Tokopedia.git

Masuk ke project:

cd Scriping-shoppe-Tokopedia


---

2. Install Dependencies

npm install

Tunggu sampai seluruh dependency selesai terinstall.


---

3. Jalankan Aplikasi

npm run start

Aplikasi Ambil Produk Toko akan terbuka.


---

⚡ Quick Start

Jika source sudah pernah di-install:

npm run start

Tidak perlu menjalankan npm install setiap kali membuka aplikasi.

Jalankan kembali npm install apabila dependency atau package.json mengalami perubahan.


---

🔨 Build Windows Installer

Pastikan dependency sudah tersedia:

npm install

Kemudian:

npm run build:win

Tunggu proses build selesai.

Output biasanya berada di:

dist/

Contoh:

dist/
├── Ambil Produk Toko Setup 13.0.0.exe
└── win-unpacked/
    └── Ambil Produk Toko.exe

File yang dibagikan ke pengguna

Gunakan:

Ambil Produk Toko Setup 13.0.0.exe

Bukan seluruh folder win-unpacked.


---

📦 Install Aplikasi

Setelah mendapatkan installer:

Ambil Produk Toko Setup x.x.x.exe

Buka installer kemudian:

Next
  ↓
Install
  ↓
Finish

Setelah terinstall, aplikasi dapat dibuka langsung dari Windows.

Pengguna akhir tidak perlu VS Code dan tidak perlu menjalankan:

npm install
npm run start


---

🛒 Cara Menggunakan

01 — Pilih Marketplace

Pilih:

Shopee

atau:

Tokopedia

02 — Buka Chrome

Tekan:

BUKA CHROME

Chrome khusus aplikasi akan terbuka.

Jika marketplace meminta login/verifikasi, selesaikan melalui Chrome tersebut.

Jangan tutup Chrome.

03 — Masukkan Link Toko

Contoh Shopee:

https://shopee.co.id/nama_toko

Contoh Tokopedia:

https://tokopedia.com/nama_toko

04 — Tentukan Jumlah

Contoh:

10

05 — Pilih Data

Gunakan:

☑ PILIH DATA

Kamu dapat menggunakan:

PILIH SEMUA

atau memilih field satu per satu.

06 — Start

Tekan:

▶ START

Progress produk dapat dipantau melalui Live Product dan Activity Terminal.


---

📋 Data Produk

Aplikasi dapat mengambil:

Item ID
Shop ID
Nama Produk
Harga
Harga Diskon
Status / Stock
Rating
Terjual
Gambar Utama
Galeri Gambar
URL Produk
Kategori
Variasi
Waktu Scrape
Marketplace


---

📄 Export JSON

Tekan:

JSON

Contoh:

{
  "item_id": "123456789",
  "shop_id": "1006545612",
  "name": "Nama Produk",
  "price": 43700,
  "rating": 4.9,
  "image_main": "https://...",
  "images": [
    "https://...",
    "https://..."
  ],
  "marketplace": "Shopee"
}


---

📊 Export Excel

Tekan:

EXCEL

Aplikasi akan menghasilkan file:

.xlsx

yang dapat dibuka menggunakan Microsoft Excel atau aplikasi spreadsheet lainnya.


---

☁️ cPanel / API Sync

Aplikasi juga dapat mengirim hasil langsung ke website.

Contoh endpoint:

https://domain.com/api/import-products.php

Request:

POST /api/import-products.php
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

Kemudian gunakan:

☁ KIRIM CPANEL


---

🔐 Security

Jangan upload data sensitif ke GitHub.

Pastikan .gitignore berisi:

node_modules/
dist/
out/

.env
.env.*
!.env.example

chrome-profiles/
profiles/
user-data/
session/
sessions/

*.log
npm-debug.log*

.vscode/
.DS_Store
Thumbs.db

Jangan commit:

Database Password
API Token produksi
Chrome Session
Cookies
.env


---

📂 Project Structure

Ambil-Produk-Toko/
│
├── src/
│   ├── main.js
│   ├── preload.js
│   ├── renderer.js
│   ├── index.html
│   └── style.css
│
├── assets/
│   └── icon.png
│
├── api/
│   ├── import-products.php
│   └── database.sql
│
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── DOCS.md


---

📤 Update GitHub

Setelah mengubah source:

git add .
git status

Commit:

git commit -m "Update Ambil Produk Toko"

Push:

git push


---

📦 Cara Upload File EXE

Jangan masukkan installer ke repository source.

File:

dist/

tetap berada di .gitignore.

Installer didistribusikan melalui GitHub Releases.

Membuat Release

Buka repository:

Scriping-shoppe-Tokopedia → Releases → Create a new release

Isi tag:

v1.0.0

Judul:

Ambil Produk Toko v1.0.0

Deskripsi contoh:

Ambil Produk Toko — SCARD-PROJECT

✨ Shopee Support
✨ Tokopedia Support
✨ Product Images
✨ JSON Export
✨ Excel Export
✨ cPanel Sync
✨ Windows Installer

Upload:

Ambil Produk Toko Setup 13.0.0.exe

Kemudian tekan:

Publish release


---

🧑‍💻 Development

Development:

npm run start

Production build:

npm run build:win


---

<div align="center"><br>SCARD-PROJECT

Ideas Today • A Better Tomorrow

Built with ❤️ for productivity and automation.

<br>Windows • Electron • Shopee • Tokopedia

</div>
```Biar README lebih glossy

Logo yang kamu buat kemarin taruh sebagai:

assets/icon.png

GitHub tidak mengizinkan CSS backdrop-filter, gradient CSS, animasi glass, dll di README. Kalau mau bagian atasnya benar-benar seperti iOS 26 Liquid Glass, solusi paling bagus adalah membuat banner PNG transparan/glossy sekitar 1600×500, lalu README menampilkan banner tersebut.

Cara kirim .exe

Setelah:

npm run build:win

ambil installer dari dist, bukan win-unpacked.

Lalu buka [GitHub repository kamu](https://github.com/scardbypass/Scriping-shoppe-Tokopedia?utm_source=chatgpt.com) → Releases → Draft a new release → pilih tag → upload Setup.exe → Publish release.
