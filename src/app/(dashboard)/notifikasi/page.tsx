"use client";

import { useState } from "react";
import {
  Bell, Bot, MessageCircle, CheckCircle2, AlertTriangle, Copy,
  ExternalLink, Zap, Clock, Send, Terminal, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REMINDER_TYPES = [
  {
    type: "H-7",
    label: "H-7 (7 Hari Sebelum)",
    description: "Pemberitahuan awal dan cek progress milestone",
    icon: "📅",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10 border border-blue-500/20",
  },
  {
    type: "H-3",
    label: "H-3 (3 Hari Sebelum)",
    description: "Peringatan verifikasi berkas administrasi",
    icon: "⚠️",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10 border border-amber-500/20",
  },
  {
    type: "H-1",
    label: "H-1 (1 Hari Sebelum)",
    description: "Peringatan darurat submission berkas",
    icon: "🚨",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10 border border-red-500/20",
  },
  {
    type: "H-0",
    label: "H-0 (Hari H)",
    description: "Rekap agenda pagi hari + semua deadline hari ini",
    icon: "🔥",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 border border-rose-500/20",
  },
];

const BOT_COMMANDS = [
  { cmd: "/agenda", desc: "Tampilkan daftar tugas hari ini + deadline terdekat" },
  { cmd: "/deadline", desc: "Tampilkan semua deadline dalam 7 hari ke depan" },
  { cmd: "/done <task_id>", desc: "Tandai tugas selesai langsung dari chat Telegram" },
];

export default function NotifikasiPage() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState({
    "H-7": true,
    "H-3": true,
    "H-1": true,
    "H-0": true,
  });

  async function handleTest() {
    setIsTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    setTestResult("error");
    setIsTesting(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Notifikasi Telegram Bot</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Konfigurasi bot Telegram untuk pengingat otomatis deadline kompetisi
        </p>
      </div>

      {/* Status Banner */}
      <div className="card p-4 border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Konfigurasi Diperlukan</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            Bot Telegram belum dikonfigurasi. Ikuti panduan di bawah untuk menghubungkan bot dan
            mengaktifkan pengingat otomatis. Pengiriman notifikasi nyata memerlukan{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">TELEGRAM_BOT_TOKEN</span> yang valid.
          </p>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-500" />
          Panduan Setup Bot Telegram
        </h2>
        <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">Buat Bot Telegram baru</p>
              <p className="mt-0.5">
                Buka Telegram, cari{" "}
                <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  @BotFather
                </a>
                , ketik <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">/newbot</code> dan ikuti instruksi.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">Dapatkan Bot Token</p>
              <p className="mt-0.5">Salin token yang diberikan @BotFather (format: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">1234567890:AAAA...</code>)</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">Dapatkan Chat ID kamu</p>
              <p className="mt-0.5">
                Kirim pesan ke bot kamu, lalu buka{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">
                  https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates
                </code>{" "}
                untuk melihat Chat ID.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
            <div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">Tambahkan ke .env.local</p>
              <div className="mt-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                TELEGRAM_BOT_TOKEN=your_bot_token<br />
                # Chat ID disimpan di profil pengguna
              </div>
            </div>
          </li>
        </ol>
      </div>

      {/* Configuration Form */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-blue-500" />
          Konfigurasi Koneksi
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Telegram Chat ID *
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="contoh: 123456789"
              className="input-base"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Ini adalah ID chat personal kamu di Telegram
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Telegram Username (opsional)
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="@username_kamu"
              className="input-base"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className={cn("btn-secondary text-xs flex items-center gap-1.5", isTesting && "opacity-60")}
            >
              {isTesting ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Test Kirim Pesan
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary text-xs flex items-center gap-1.5">
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Simpan Konfigurasi
            </button>
          </div>
          {testResult === "error" && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 dark:text-red-400">
              ⚠️ Pengiriman pesan gagal. Pastikan TELEGRAM_BOT_TOKEN diisi dengan benar di file .env.local
              dan Chat ID valid.
            </div>
          )}
          {testResult === "success" && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400">
              ✅ Pesan test berhasil dikirim! Bot Telegram aktif.
            </div>
          )}
        </form>
      </div>

      {/* Reminder Types */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Jadwal Pengingat Otomatis
        </h2>
        <div className="space-y-3">
          {REMINDER_TYPES.map((r) => (
            <div key={r.type} className={cn("flex items-center gap-3 p-3 rounded-xl", r.bg)}>
              <span className="text-xl select-none">{r.icon}</span>
              <div className="flex-1">
                <p className={cn("text-xs font-bold", r.color)}>{r.label}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{r.description}</p>
              </div>
              <button
                onClick={() =>
                  setReminderEnabled((prev) => ({
                    ...prev,
                    [r.type]: !prev[r.type as keyof typeof prev],
                  }))
                }
                className={cn(
                  "w-10 h-5 rounded-full transition-colors flex items-center",
                  reminderEnabled[r.type as keyof typeof reminderEnabled]
                    ? "bg-green-500 justify-end"
                    : "bg-slate-300 dark:bg-slate-700 justify-start"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bot Commands */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-violet-500" />
          Perintah Bot Interaktif
        </h2>
        <div className="space-y-2">
          {BOT_COMMANDS.map((cmd) => (
            <div key={cmd.cmd} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <code className="text-xs font-mono text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-lg flex-shrink-0 font-semibold">
                {cmd.cmd}
              </code>
              <p className="text-xs text-slate-600 dark:text-slate-400">{cmd.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-300 font-semibold">Keamanan:</strong> Perintah <code className="text-green-600 dark:text-green-400">/done</code> memverifikasi
            bahwa Chat ID pengirim cocok dengan pengguna yang terautentikasi sebelum mengubah status tugas.
            Token bot disimpan hanya di sisi server (environment variable) dan tidak pernah dikirim ke client.
          </p>
        </div>
      </div>
    </div>
  );
}
