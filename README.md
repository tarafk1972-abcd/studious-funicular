# WargaJagaWarga — Tanggap Darurat untuk Komunitas yang Lebih Aman

**WargaJagaWarga** adalah aplikasi perumahan dan platform tanggap darurat berbasis komunitas yang dirancang dan diimplementasikan dari konsep situs resmi [WargaJagaWarga Durable](https://wargajagawarga-mk7j928e.durable.site/). Aplikasi ini dibangun sebagai aplikasi **Full-Stack Next.js (App Router)** lengkap dengan sistem penyimpanan database persisten, simulasi interaktif peta klaster, notifikasi audio darurat, dan manajemen keamanan komunitas.

---

## 🌟 Tagline & Visi Platform
> **"Satu sentuhan, Satpam dan tetanggamu datang."**

Kami membangun sistem peringatan komunitas yang langsung ke pokok masalah. Satu tombol, Satpam dan semua tetangga tahu, bantuan datang secepat kilat.

---

## 🚀 Fitur Utama (Sesuai Spesifikasi Website & Aplikasi Interaktif)

### 1. 🏠 Beranda & Halaman Pemasaran (Landing Page)
- **Hero Banner:** Tagline utama *"Satu sentuhan, Satpam dan tetanggamu datang"*, tombol panggilan bertindak (CTA), serta pratinjau interaktif tombol SOS.
- **Teknologi Kami ("Keamanan yang tidak perlu rumit"):**
  - **Peringatan satu sentuhan (One-touch Emergency Button):** Tekan tombol darurat, dan seluruh blok Anda mendapat notifikasi langsung.
  - **Peta kejadian langsung (Live Incident Map):** Lihat di mana bantuan dibutuhkan dan siapa yang merespons di sekitar Anda.
- **Tetangga Bicara (Testimoni Warga & RT):**
  - **Rina Wijaya** (Ibu RT 04, Menteng): *"Dulu kalau ada apa-apa di blok, kami harus WA dulu. Sekarang sekali klik di WargaJagaWarga, semua Satpam dan tetangga langsung tahu. Rasanya aman banget."*
  - **Bambang Sutanto** (Warga, Kebayoran Baru): *"Pas malam-malam listrik mati dan ada suara mencurigakan, saya langsung pakai fitur darurat. Dalam 3 menit, tiga tetangga sudah di depan rumah. Cepat sekali."*
  - **Sari Dewi** (Ibu Rumah Tangga, Kelapa Gading): *"Saya ibu rumah tangga dengan dua anak kecil. Sejak pakai WargaJagaWarga, saya tidur lebih tenang. Anak-anak juga tahu cara minta tolong lewat aplikasi."*
- **Data Keamanan ("WargaJagaWarga dalam angka"):**
  - **150+** Warga terdaftar
  - **5** Klaster terhubung
  - **10+** Satpam aktif
  - **1** Platform terpadu
  - Rata-rata waktu tanggap darurat **2.4 Menit**
- **Formulir Kontak & Pendaftaran Komunitas ("Hubungi Kami"):** Formulir lengkap untuk mendaftarkan komunitas/klaster dengan pencatatan langsung ke database server.

### 2. 🚨 Aplikasi Darurat Core (Dashboard SOS Interaktif)
- **Tombol Darurat SOS Satu Sentuhan:** Memicu alarm darurat dengan pilihan 4 kategori bahaya:
  - 🚨 **Darurat Keamanan** (Penyusupan / Suara Mencurigakan)
  - 🚑 **Darurat Medis** (Kebutuhan Ambulans / Darurat Kesehatan)
  - 🚒 **Darurat Kebakaran** (Api / Asap / Bencana)
  - ⚡ **Darurat Listrik / Utilitas** (Korsleting / Masalah Utilitas)
- **Pengubah Peran Pengguna (Role Switcher Demo):** Gunakan aplikasi sebagai **Bambang Sutanto** (Warga), **Pak Yanto** (Kepala Satpam), atau **Rina Wijaya** (Ibu RT/Admin) dari menu dropdown di kanan atas.
- **Riwayat Kejadian & Thread Komentar Real-time:** Warga dan satpam dapat berdiskusi memantau perkembangan situasi dan mengklik **"Saya Meluncur!"** sebagai responden di lokasi.
- **Siaran Suara Otomatis:** Fitur pemutaran audio pengumuman darurat dan konfirmasi situasi aman.
- **Celebration Confetti:** Animasi perayaan ketika situasi darurat telah dinyatakan **"Selesai / Situasi Aman"**.

### 3. 🗺️ Peta Klaster Langsung (Interactive Cluster Map)
- Representasi grafis klaster perumahan (*Klaster Menteng Asri / Kebayoran Baru*) yang mencakup:
  - **Gerbang Utama & Pos Satpam 24 Jam**
  - **Blok A (A-01 s/d A-06)**
  - **Blok B (B-01 s/d B-06)**
  - **Blok C (C-01 s/d C-12)**
- Ikon blok rumah yang mengalami kejadian darurat akan menyala dengan animasi alarm sirene merah/kuning.
- Klik ikon rumah manapun untuk memantau status atau mensimulasikan darurat di blok tersebut.

### 4. 👥 Direktori Warga & Satpam Siaga
- Daftar 12 Satpam aktif dengan status patroli yang dapat diubah secara langsung (*Siaga di Pos*, *Patroli Keliling*, *Merespons Darurat*, *Istirahat*).
- Tombol telepon cepat darurat dan integrasi WhatsApp.
- Formulir penambahan anggota/warga baru atau satpam ke direktori klaster.

### 5. 📊 Data Keamanan & Statistik Analitis
- Grafik dan persentase jenis laporan darurat komunitas.
- Indeks Keamanan Klaster (skor **98.6 / 100**).
- Unduh Laporan Keamanan dalam format JSON.

---

## 🛠️ Arsitektur Full-Stack & Database

- **Framework:** [Next.js 14 App Router](https://nextjs.org/) (TypeScript, React 18)
- **Styling & UI:** Tailwind CSS, Lucide Icons, Framer-motion inspired CSS keyframes, Canvas Confetti
- **Penyimpanan Database:** Modular persistent storage di `data/wargajagawarga.json` melalui `src/lib/db.ts`
- **REST API Endpoints:**
  - `GET /api/state` & `POST /api/state` — Mengambil seluruh state aplikasi atau mereset ke data demo awal.
  - `GET /api/incidents` & `POST /api/incidents` — Daftar dan pembuatan laporan SOS baru.
  - `PATCH /api/incidents/[id]` — Pemutakhiran status kejadian, penambahan responden, dan komentar.
  - `GET /api/users` & `POST /api/users` — Direktori Warga dan Satpam.
  - `PATCH /api/users/[id]` — Ubah status siaga/patroli Satpam.
  - `GET /api/contacts` & `POST /api/contacts` — Pengiriman dan manajemen formulir pendaftaran komunitas.

---

## 💻 Cara Menjalankan Aplikasi

### 1. Mode Pengembangan (Development)
```bash
npm run dev
```
Aplikasi akan aktif di [http://localhost:3000](http://localhost:3000).

### 2. Build & Produksi (Production)
```bash
npm run build
npm start
```

---

## 🎨 Aset Visual & Audio
- `public/images/hero.jpg` — Ilustrasi sore warga klaster dan satpam yang terkoneksi.
- `public/images/sos-app.jpg` — Ilustrasi layar aplikasi darurat SOS satu sentuhan.
- `public/images/community-patrol.jpg` — Ilustrasi gerbang dan pos pengamanan satpam klaster.
- `public/audio/sos-alert.mp3` — Siaran audio pengumuman aktivasi darurat SOS.
- `public/audio/sos-resolved.mp3` — Siaran audio pengumuman situasi aman terkendali.

---
*Dikembangkan dengan penuh dedikasi untuk rasa aman dan konektivitas komunitas WargaJagaWarga.*
