# CompeteFlow — Personal Competition & Task OS 🎯

Sistem manajemen terpadu untuk solo competitor: mengelola tahapan lomba bertingkat, tugas harian, berkas administrasi, pencatatan keuangan (ROI), dan pengingat deadline otomatis.

---

## 🚀 Memulai Aplikasi

### 1. Jalankan Development Server
Aplikasi sudah terinstal dan berhasil diverifikasi build produksinya. Untuk menjalankan server lokal:

```bash
cd "C:\Users\manga\.gemini\antigravity\scratch\competeflow"
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Menghubungkan Supabase Database (Opsional untuk Persistensi Cloud)

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Buka tab **SQL Editor** di Supabase.
3. Salin dan jalankan seluruh query SQL dari file:
   `supabase/schema.sql`
4. Buka **Project Settings > API**, salin `Project URL` dan `anon key`.
5. Salin `.env.local.example` menjadi `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
6. Masukkan kredensial ke `.env.local`.

---

## 🤖 Integrasi Notifikasi Bot Telegram

1. Buka Telegram dan cari `@BotFather`.
2. Ketik `/newbot` dan ikuti instruksi untuk mendapatkan API Token.
3. Masukkan token ke `.env.local` pada `TELEGRAM_BOT_TOKEN`.
4. Bot siap mengirimkan notifikasi H-7, H-3, H-1, dan rekap agenda pagi setiap hari.

---

## 📁 Struktur Direktori Proyek

```
competeflow/
├── supabase/
│   └── schema.sql             # Skema DDL lengkap + RLS Security Policies
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout & dark mode theme
│   │   ├── globals.css        # Styling Tailwind
│   │   └── page.tsx           # Hybrid Dashboard Utama
│   ├── components/
│   │   ├── Navbar.tsx         # Navigasi & status bot
│   │   ├── DeadlinesWidget.tsx# Countdown deadline kritis terdekat
│   │   ├── CompetitionCard.tsx# Kartu lomba & progres tahapan
│   │   ├── DailyAgenda.tsx    # To-do list cerdas berprioritas
│   │   ├── VaultQuickAccess.tsx# Repositori link & berkas
│   │   ├── BudgetSummary.tsx  # Pelacakan biaya & hadiah (ROI)
│   │   └── NewCompetitionModal.tsx # Dialog tambah lomba baru
│   ├── lib/
│   │   ├── utils.ts           # Format mata uang & sisa hari
│   │   └── mock-data.ts       # Data awal siap pakai
│   └── types/
│       └── index.ts           # Definisi interface TypeScript
```
