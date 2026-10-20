"use client";

import { useState } from "react";
import {
  Settings, User, Bell, Shield, LogOut, Save, Camera, Zap,
  Key, Eye, EyeOff, CheckCircle2, Sun, Moon, Palette, Database, Cloud, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/context/ThemeContext";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export default function PengaturanPage() {
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("Pejuang Prestasi");
  const [email] = useState("demo@competeflow.app");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">
          Pengaturan Akun & Tampilan
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola profil pengguna, tema tampilan (White/Dark Mode), dan preferensi akun
        </p>
      </div>

      {/* Theme Selection: White Mode vs Dark Mode */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-green-600 dark:text-green-400" />
          Tema & Tampilan Aplikasi
        </h2>
        <p className="text-xs text-slate-500">
          Pilih tema tampilan yang paling nyaman untuk mata Anda saat bekerja.
        </p>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between",
              theme === "dark"
                ? "bg-slate-900 text-white border-green-400 ring-2 ring-green-400/20 shadow-lg"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 opacity-70"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                <Moon className="w-4 h-4" />
              </div>
              {theme === "dark" && (
                <span className="w-2 h-2 rounded-full bg-green-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Dark Mode</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gelap pekat dengan aksen hijau neon.
              </p>
            </div>
          </button>

          {/* White Mode Card */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between",
              theme === "light"
                ? "bg-white text-slate-900 border-green-600 ring-2 ring-green-600/20 shadow-md"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 opacity-70"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-amber-500">
                <Sun className="w-4 h-4" />
              </div>
              {theme === "light" && (
                <span className="w-2 h-2 rounded-full bg-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">White Mode</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Putih bersih, kontras tinggi & nyaman di siang hari.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-green-600 dark:text-green-400" />
          Profil Pengguna
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-slate-950 text-2xl font-black shadow-md">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{fullName}</p>
              <p className="text-[11px] text-slate-500">{email}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                ⚡ Database Lokal Aktif
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              className="input-base opacity-60 cursor-not-allowed"
              disabled
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Email tidak dapat diubah di mode demo database lokal.
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Notifikasi Pengingat
              </p>
              <p className="text-[10px] text-slate-500">
                Terima pengingat deadline melalui bot Telegram & desktop browser
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotifEnabled(!notifEnabled)}
              className={cn(
                "w-10 h-5 rounded-full transition-colors flex items-center",
                notifEnabled ? "bg-green-500 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
              )}
            >
              <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
            </button>
          </div>

          <button type="submit" className="btn-primary text-xs flex items-center gap-1.5">
            {isSaved ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSaved ? "Tersimpan!" : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* Database & Cloud Sync (Google Firebase & Vercel) */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            Cloud Database & Hosting
          </h2>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Vercel + Google Firebase
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Google Firebase (Firestore)
                {isFirebaseConfigured() ? (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Terhubung
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    Mode Lokal / Standby
                  </span>
                )}
              </p>
              <p className="text-[10px] text-slate-500">
                {isFirebaseConfigured()
                  ? "Data tersinkronisasi otomatis secara realtime ke Cloud Firestore"
                  : "Berjalan aman dengan penyimpanan offline browser (LocalStorage). Masukkan kredensial Firebase di Vercel untuk sinkronisasi cloud."}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Hosting Vercel
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  Siap Deploy
                </span>
              </p>
              <p className="text-[10px] text-slate-500">
                Arsitektur Next.js 14 App Router dioptimalkan 100% untuk serverless deployment di Vercel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" />
          Keamanan & Autentikasi
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Kata Sandi</p>
              <p className="text-[10px] text-slate-500">Kelola kata sandi masuk</p>
            </div>
            <button className="btn-secondary text-xs">Ubah Password</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Google OAuth</p>
              <p className="text-[10px] text-slate-500">Masuk cepat dengan akun Google</p>
            </div>
            <button className="btn-secondary text-xs">Hubungkan</button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-5 border-red-500/20 bg-red-500/5 space-y-3">
        <h2 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Sesi Akun
        </h2>
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Keluar Akun</p>
            <p className="text-[10px] text-slate-500">Logout dari sesi ini dan kembali ke halaman login</p>
          </div>
          <button
            onClick={() => window.location.href = "/login"}
            className="btn-danger text-xs flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
