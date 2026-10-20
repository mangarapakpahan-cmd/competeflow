"use client";

import { usePathname } from "next/navigation";
import { Plus, User, Sun, Moon, ShieldCheck, Search, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import Link from "next/link";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dasbor Utama", subtitle: "Pantau kompetisi & agenda harianmu" },
  "/kompetisi": { title: "Kompetisi", subtitle: "Kelola semua lomba & tahapan milestone" },
  "/tugas": { title: "Tugas Harian", subtitle: "Smart Daily Agenda & prioritas otomatis" },
  "/vault": { title: "Dokumen & Link", subtitle: "Vault berkas & bookmark cloud drive" },
  "/keuangan": { title: "Keuangan & Hadiah", subtitle: "Budget, pengeluaran & hadiah lomba" },
  "/prestasi": { title: "Prestasi & CV", subtitle: "Achievement vault & ekspor CV/LinkedIn" },
  "/notifikasi": { title: "Notifikasi Bot", subtitle: "Konfigurasi Telegram reminder otomatis" },
  "/pengaturan": { title: "Pengaturan Akun", subtitle: "Profil & preferensi tema tampilan" },
  "/admin": { title: "Admin Panel", subtitle: "Pusat kendali database, backup & diagnostik" },
};

interface TopNavProps {
  onQuickAdd?: () => void;
  userName?: string;
}

export function TopNav({ onQuickAdd, userName }: TopNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const pageInfo = PAGE_TITLES[pathname] || {
    title: "CompeteFlow",
    subtitle: "Platform manajemen kompetisi pribadi",
  };

  return (
    <header className="sticky top-0 z-30 h-[68px] bg-white/80 dark:bg-[#181d33]/80 backdrop-blur-md border-b border-slate-100/90 dark:border-slate-800/80 flex items-center px-4 sm:px-6 gap-3 transition-colors">
      {/* Page title — desktop */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
            {pageInfo.title}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
            <Sparkles className="w-2.5 h-2.5" />
            Active
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-400 hidden sm:block truncate mt-0.5">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Center Search Pill (Inspired by reference search bar) */}
      <div className="hidden md:flex items-center relative w-72 max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari lomba, tugas, dokumen..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add Button with Friendly Gradient */}
        {onQuickAdd && (
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Tambah Lomba</span>
          </button>
        )}

        {/* White / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
          title={theme === "dark" ? "Ganti ke White Mode (Tema Terang)" : "Ganti ke Dark Mode (Tema Gelap)"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notification Center Dropdown */}
        <NotificationCenter />

        {/* User Profile Avatar with Friendly Dot */}
        <Link
          href="/pengaturan"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              M
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#181d33] absolute -bottom-0.5 -right-0.5" />
          </div>
        </Link>
      </div>
    </header>
  );
}
