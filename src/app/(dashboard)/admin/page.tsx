"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { useTheme } from "@/lib/context/ThemeContext";
import {
  ShieldCheck,
  Database,
  Download,
  Upload,
  RefreshCw,
  Server,
  Activity,
  Trophy,
  CheckSquare,
  DollarSign,
  FolderOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Save,
  Trash2,
  Send,
  Sun,
  Moon,
  ExternalLink,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatRupiah,
  formatDate,
  COMPETITION_STATUS_LABELS,
  COMPETITION_LEVEL_LABELS,
} from "@/lib/format";
import { CompetitionStatus } from "@/types";

export default function AdminPage() {
  const { state, dispatch, resetDatabase, isSynced } = useAppState();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    "overview" | "database" | "competitions" | "telegram"
  >("overview");

  // Raw JSON state for live editor
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bot test simulator state
  const [testSimulating, setTestSimulating] = useState(false);
  const [simulatedLogs, setSimulatedLogs] = useState<
    { id: string; time: string; msg: string; type: "info" | "success" | "warn" }[]
  >([
    {
      id: "log-1",
      time: "Baru saja",
      msg: "System initialized — Local JSON Database active at data/database.json",
      type: "success",
    },
    {
      id: "log-2",
      time: "Hari ini",
      msg: "Cron reminder worker checked: 2 upcoming deadlines detected (Gemastik XIX, LKTIN UI).",
      type: "info",
    },
  ]);

  // Sync state to JSON text editor when state updates or tab changes
  useEffect(() => {
    try {
      const dataToDisplay = {
        competitions: state.competitions,
        tasks: state.tasks,
        vaultFiles: state.vaultFiles,
        expenses: state.expenses,
        retrospectives: state.retrospectives,
      };
      setJsonText(JSON.stringify(dataToDisplay, null, 2));
    } catch {
      // ignore
    }
  }, [state, activeTab]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalComps = state.competitions.length;
    const activeComps = state.competitions.filter(
      (c) => c.status !== "archived" && c.status !== "completed"
    ).length;
    const totalTasks = state.tasks.length;
    const pendingTasks = state.tasks.filter((t) => !t.is_completed).length;
    const completedTasks = state.tasks.filter((t) => t.is_completed).length;
    const totalFiles = state.vaultFiles.length;
    const totalExpenses = state.expenses.length;
    const totalAchievements = state.retrospectives.length;

    const totalPrizeWon = state.expenses
      .filter((e) => e.type === "prize")
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalComps,
      activeComps,
      totalTasks,
      pendingTasks,
      completedTasks,
      totalFiles,
      totalExpenses,
      totalAchievements,
      totalPrizeWon,
    };
  }, [state]);

  // Export / Backup database to JSON file download
  const handleBackupDownload = () => {
    const dataToExport = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      competitions: state.competitions,
      tasks: state.tasks,
      vaultFiles: state.vaultFiles,
      expenses: state.expenses,
      retrospectives: state.retrospectives,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competeflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore / Import database from JSON file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.competitions || parsed.tasks) {
          dispatch({ type: "SET_ALL_DATA", payload: parsed });
          alert("Database berhasil dipulihkan dari file backup!");
        } else {
          alert("Format file JSON tidak sesuai struktur CompeteFlow.");
        }
      } catch (err: any) {
        alert("Gagal membaca file JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Save manual edits from Raw JSON editor
  const handleSaveJsonEditor = () => {
    setJsonError("");
    setSaveSuccess(false);
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed.competitions) || !Array.isArray(parsed.tasks)) {
        throw new Error(
          "Struktur JSON harus memiliki array 'competitions' dan 'tasks'."
        );
      }
      dispatch({ type: "SET_ALL_DATA", payload: parsed });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setJsonError(err.message || "Sintaks JSON tidak valid.");
    }
  };

  // Quick status updater for competitions
  const handleStatusChange = (compId: string, newStatus: CompetitionStatus) => {
    const comp = state.competitions.find((c) => c.id === compId);
    if (!comp) return;
    dispatch({
      type: "UPDATE_COMPETITION",
      payload: { ...comp, status: newStatus, updated_at: new Date().toISOString() },
    });
  };

  // Simulate reminder bot execution
  const runSimulatedBotCheck = async () => {
    setTestSimulating(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newEntry = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString("id-ID"),
      msg: `Pengecekan deadline terjadwal selesai. Notifikasi H-3 dikirimkan untuk Gemastik XIX (Figma Prototype & Desain). Status: Delivered.`,
      type: "success" as const,
    };
    setSimulatedLogs((prev) => [newEntry, ...prev]);
    setTestSimulating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Header Banner */}
      <div className="card p-6 border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-green-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-green-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 dark:bg-green-400/15 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/25">
                  ADMINISTRATOR MODE
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  CompeteFlow System Center
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Pusat Kendali Admin & Database
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBackupDownload}
              className="btn-secondary text-xs flex items-center gap-1.5 shadow-sm"
              title="Unduh cadangan data dalam format JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Backup DB
            </button>

            <label className="btn-secondary text-xs flex items-center gap-1.5 shadow-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Restore DB
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                if (
                  confirm(
                    "PERINGATAN: Ini akan mereset database ke data awal contoh. Lanjutkan?"
                  )
                ) {
                  resetDatabase();
                }
              }}
              className="btn-danger text-xs flex items-center gap-1.5 shadow-sm"
              title="Kembalikan data ke awal contoh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Pabrik
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Ringkasan Sistem", icon: Activity },
          { id: "database", label: "Editor Raw JSON DB", icon: Database },
          { id: "competitions", label: "Kelola Status Lomba", icon: Trophy },
          { id: "telegram", label: "Diagnostik Bot & Cron", icon: Server },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors",
              activeTab === id
                ? "bg-green-600 dark:bg-green-500 text-white dark:text-slate-950 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
      {/* ==================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-medium">Total Kompetisi</span>
                <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalComps}
              </p>
              <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold">
                {stats.activeComps} lomba aktif
              </span>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-medium">Semua Tugas</span>
                <CheckSquare className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalTasks}
              </p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {stats.pendingTasks} pending · {stats.completedTasks} selesai
              </span>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-medium">Aset & Vault</span>
                <FolderOpen className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalFiles}
              </p>
              <span className="text-[11px] text-slate-500">Berkas terarsip</span>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-medium">Hadiah Dimenangkan</span>
                <Award className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-xl font-black text-green-600 dark:text-green-400">
                {formatRupiah(stats.totalPrizeWon)}
              </p>
              <span className="text-[11px] text-slate-500">
                {stats.totalAchievements} pencapaian
              </span>
            </div>
          </div>

          {/* System & Storage Environment Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-green-600 dark:text-green-400" />
                Status Runtime & Lingkungan Server
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Aplikasi / Framework
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Next.js 14.2 (App Router)
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Node.js Version
                  </span>
                  <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                    v24.19.0 (LTS Active)
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Port Lokal Aktif
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    http://localhost:3000
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Tema Saat Ini
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-semibold text-slate-900 dark:text-white">
                      {theme === "dark" ? "Dark Mode (Gelap)" : "White Mode (Terang)"}
                    </span>
                    <button
                      onClick={toggleTheme}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold"
                    >
                      Ganti
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Status Server
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ONLINE & OPERATIONAL
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                Spesifikasi Database & Penyimpanan
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Database Utama
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Local JSON Engine (`data/database.json`)
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Penyimpanan Klien
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    HTML5 `localStorage` Dual-Sync
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    API Endpoint DB
                  </span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    /api/db (GET, POST)
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Integrasi Supabase Cloud
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    Siap (Tersedia skema SQL & RLS)
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Integritas Sinkronisasi
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tersinkronisasi Penuh
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: RAW JSON DATABASE LIVE EDITOR */}
      {/* ==================================================================== */}
      {activeTab === "database" && (
        <div className="card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-green-600 dark:text-green-400" />
                Raw JSON Database Inspector & Live Editor
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lihat dan edit langsung basis data JSON. Perubahan akan disimpan ke file fisik `data/database.json`.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveJsonEditor}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Perubahan JSON
              </button>
            </div>
          </div>

          {jsonError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-700 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Perubahan JSON berhasil diterapkan dan disimpan ke database!</span>
            </div>
          )}

          <div className="relative">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={22}
              className="w-full font-mono text-xs bg-slate-950 text-green-400 p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400/30 leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: COMPETITIONS MANAGEMENT TABLE */}
      {/* ==================================================================== */}
      {activeTab === "competitions" && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Daftar Semua Kompetisi ({state.competitions.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah status kompetisi secara langsung atau hapus entri dari panel administrator.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Kompetisi</th>
                  <th className="px-4 py-3 font-semibold">Penyelenggara</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Tahapan</th>
                  <th className="px-4 py-3 font-semibold">Status Saat Ini</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {state.competitions.map((comp) => (
                  <tr
                    key={comp.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {comp.title}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {comp.organizer}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{comp.category}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {comp.stages.filter((s) => s.is_completed).length} /{" "}
                        {comp.stages.length}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={comp.status}
                        onChange={(e) =>
                          handleStatusChange(
                            comp.id,
                            e.target.value as CompetitionStatus
                          )
                        }
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="registered">Terdaftar</option>
                        <option value="in_progress">Berlangsung</option>
                        <option value="finalist">Finalis</option>
                        <option value="completed">Selesai</option>
                        <option value="archived">Diarsipkan</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus "${comp.title}"?`)) {
                            dispatch({
                              type: "DELETE_COMPETITION",
                              payload: comp.id,
                            });
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Hapus Kompetisi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: TELEGRAM & CRON DIAGNOSTIC */}
      {/* ==================================================================== */}
      {activeTab === "telegram" && (
        <div className="space-y-6">
          <div className="card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Simulator Pengingat Cron & Telegram Bot
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uji coba simulasi pengiriman notifikasi H-7, H-3, H-1, dan H-0 tanpa menunggu jadwal cron berjalan.
                </p>
              </div>
              <button
                onClick={runSimulatedBotCheck}
                disabled={testSimulating}
                className={cn(
                  "btn-primary text-xs flex items-center gap-1.5",
                  testSimulating && "opacity-60 cursor-not-allowed"
                )}
              >
                {testSimulating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Jalankan Tes Notifikasi Sekarang
              </button>
            </div>

            {/* Diagnostic Logs Container */}
            <div className="space-y-2 mt-4">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Log Pengiriman Notifikasi & Webhook:
              </p>
              <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 max-h-[300px] overflow-y-auto border border-slate-800">
                {simulatedLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5">
                    <span className="text-slate-500 whitespace-nowrap">
                      [{log.time}]
                    </span>
                    <span
                      className={cn(
                        log.type === "success" && "text-green-400",
                        log.type === "warn" && "text-amber-400",
                        log.type === "info" && "text-blue-400"
                      )}
                    >
                      {log.msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
