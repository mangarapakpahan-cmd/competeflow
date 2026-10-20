"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/lib/context/AppStateContext";
import {
  calculateCompetitionProgress,
  formatDate,
  formatRupiah,
  getCountdown,
  COMPETITION_STATUS_LABELS,
  COMPETITION_LEVEL_LABELS,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Calendar,
  ExternalLink,
  Link2,
  FileText,
  DollarSign,
  Edit3,
  Trash2,
  Plus,
  Globe,
  Mail,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Flame,
  Star,
} from "lucide-react";
import Link from "next/link";
import { NewCompetitionModal } from "@/components/competition/NewCompetitionModal";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { Competition, Stage } from "@/types";

const LINK_TYPE_CONFIG: Record<
  string,
  { color: string; bg: string; icon: string }
> = {
  drive: { color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", icon: "📁" },
  figma: { color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10", icon: "🎨" },
  github: { color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-700/50", icon: "💻" },
  docs: { color: "text-blue-600 dark:text-blue-300", bg: "bg-blue-500/10", icon: "📄" },
  portal: { color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", icon: "🌐" },
  other: { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-700/50", icon: "🔗" },
};

export default function KompetisiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"milestone" | "vault" | "finance">("milestone");

  const comp = state.competitions.find((c) => c.id === params.id);

  if (!comp) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <h2 className="text-sm font-semibold text-slate-400">Kompetisi tidak ditemukan</h2>
        <Link href="/kompetisi" className="btn-primary text-xs mt-4 inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const progress = calculateCompetitionProgress(comp.stages);
  const completedStages = comp.stages.filter((s) => s.is_completed).length;

  const expenses = state.expenses.filter((e) => e.competition_id === comp.id);
  const totalExpense = expenses
    .filter((e) => e.type === "registration" || e.type === "operational")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses
    .filter((e) => e.type === "prize" || e.type === "reimbursement")
    .reduce((sum, e) => sum + e.amount, 0);

  const vaultFiles = state.vaultFiles.filter(
    (f) => f.competition_id === comp.id
  );

  function handleToggleStage(stageId: string) {
    dispatch({ type: "TOGGLE_STAGE", payload: { compId: comp!.id, stageId } });
  }

  function handleDelete() {
    if (confirm(`Hapus "${comp!.title}"? Semua data terkait akan hilang.`)) {
      dispatch({ type: "DELETE_COMPETITION", payload: comp!.id });
      router.push("/kompetisi");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/kompetisi"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Lomba
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="card p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg font-black text-slate-900 dark:text-white">{comp.title}</h1>
              <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full", `status-${comp.status}`)}>
                {COMPETITION_STATUS_LABELS[comp.status]}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{comp.organizer}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {comp.category}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {COMPETITION_LEVEL_LABELS[comp.level]}
              </span>
              {comp.contact_person && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {comp.contact_person}
                </span>
              )}
              {comp.official_url && (
                <a
                  href={comp.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  Portal Resmi
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Progress + Finance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Progress Tahapan ({completedStages}/{comp.stages.length})
              </span>
              <span className="text-sm font-black text-green-600 dark:text-green-400">{progress}%</span>
            </div>
            <div className="progress-bar h-2">
              <div
                className="progress-bar-fill bg-gradient-to-r from-green-600 to-green-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            {comp.notes && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{comp.notes}</p>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between">
              <span className="text-slate-500">Biaya Daftar</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{formatRupiah(comp.registration_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Hadiah</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">{formatRupiah(comp.target_prize)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Net ROI</span>
              <span className={cn("font-bold", totalIncome - totalExpense >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                {formatRupiah(totalIncome - totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(["milestone", "vault", "finance"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-colors",
              activeTab === tab
                ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            {tab === "milestone"
              ? `Milestone (${comp.stages.length})`
              : tab === "vault"
              ? `Vault (${vaultFiles.length + comp.links.length})`
              : "Keuangan"}
          </button>
        ))}
      </div>

      {/* MILESTONE TAB */}
      {activeTab === "milestone" && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tahapan Kompetisi</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="btn-secondary text-xs flex items-center gap-1 py-1 px-2.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Tugas Lomba
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-slate-500 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Tahapan
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="space-y-3">
              {comp.stages
                .slice()
                .sort((a, b) => a.stage_order - b.stage_order)
                .map((stage, i) => {
                  const countdown = getCountdown(stage.deadline);
                  return (
                    <div
                      key={stage.id}
                      className={cn(
                        "flex items-start gap-4 pl-2 py-3 rounded-xl transition-colors",
                        stage.is_completed ? "opacity-60" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggleStage(stage.id)}
                        className="flex-shrink-0 z-10"
                      >
                        {stage.is_completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
                        ) : (
                          <Circle
                            className={cn(
                              "w-6 h-6",
                              countdown.daysLeft <= 1 ? "text-red-500 dark:text-red-400" : countdown.daysLeft <= 3 ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-600"
                            )}
                          />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              stage.is_completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
                            )}
                          >
                            {stage.stage_name}
                          </p>
                          {!stage.is_completed && countdown.daysLeft <= 3 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                              MENDESAK
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(stage.deadline, "d MMM yyyy, HH:mm")}
                          </span>
                          {!stage.is_completed && (
                            <span
                              className={cn(
                                "font-semibold",
                                countdown.isPast
                                  ? "text-red-500 dark:text-red-400"
                                  : countdown.daysLeft <= 3
                                  ? "text-amber-500 dark:text-amber-400"
                                  : "text-slate-600 dark:text-slate-400"
                              )}
                            >
                              {countdown.label}
                            </span>
                          )}
                          {stage.is_completed && stage.completed_at && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Selesai {formatDate(stage.completed_at, "d MMM")}
                            </span>
                          )}
                        </div>
                        {stage.notes && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {stage.notes}
                          </p>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 dark:text-slate-600 flex-shrink-0">
                        #{i + 1}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* VAULT TAB */}
      {activeTab === "vault" && (
        <div className="space-y-4">
          {/* Cloud Links */}
          {comp.links.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Link & Bookmark Cloud
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {comp.links.map((link) => {
                  const config = LINK_TYPE_CONFIG[link.link_type] ?? LINK_TYPE_CONFIG.other;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group",
                        config.bg
                      )}
                    >
                      <span className="text-lg">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-semibold truncate", config.color)}>
                          {link.label}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{link.url}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-400 flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Files */}
          {vaultFiles.length === 0 && comp.links.length === 0 && (
            <div className="card p-8 text-center">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Belum ada file atau link yang disimpan untuk kompetisi ini.
              </p>
              <Link
                href="/vault"
                className="btn-secondary text-xs mt-3 inline-flex items-center gap-1"
              >
                Buka Vault
              </Link>
            </div>
          )}
        </div>
      )}

      {/* FINANCE TAB */}
      {activeTab === "finance" && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Rekap Keuangan</h2>
            <Link
              href="/keuangan"
              className="text-xs text-slate-500 hover:text-green-600 dark:hover:text-green-400 font-medium"
            >
              Kelola keuangan →
            </Link>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-6">
              <DollarSign className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Belum ada catatan keuangan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">{e.description}</p>
                    <p className="text-[10px] text-slate-500">
                      {formatDate(e.date, "d MMM yyyy")} &bull;{" "}
                      {e.type === "prize"
                        ? "Hadiah"
                        : e.type === "reimbursement"
                        ? "Reimbursement"
                        : e.type === "registration"
                        ? "Pendaftaran"
                        : "Operasional"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      e.type === "prize" || e.type === "reimbursement"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    )}
                  >
                    {e.type === "prize" || e.type === "reimbursement" ? "+" : "-"}
                    {formatRupiah(e.amount)}
                  </span>
                </div>
              ))}

              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Total Pengeluaran</span>
                  <span className="text-red-500 dark:text-red-400 font-bold">{formatRupiah(totalExpense)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Total Pemasukan</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">{formatRupiah(totalIncome)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span className="text-slate-900 dark:text-white font-bold">Net ROI</span>
                  <span className={cn("font-black", totalIncome - totalExpense >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                    {totalIncome - totalExpense >= 0 ? "+" : ""}
                    {formatRupiah(totalIncome - totalExpense)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <NewCompetitionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editCompetition={comp}
      />
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        competitions={state.competitions}
        defaultCategory="competition"
      />
    </div>
  );
}
