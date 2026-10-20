"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { getPrioritizedTasks } from "@/lib/priority";
import {
  getCountdown,
  calculateCompetitionProgress,
  formatDate,
  formatRupiah,
  COMPETITION_STATUS_LABELS,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Trophy,
  CheckSquare,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Plus,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flame,
  Star,
  DollarSign,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Layers,
  Palette,
  Code2,
  BookOpen,
  Briefcase,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { NewCompetitionModal } from "@/components/competition/NewCompetitionModal";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ============================================================================
// Top Category Definition (Inspired by Top Companies circles in reference)
// ============================================================================
const TOP_CATEGORIES = [
  {
    name: "UI/UX Design",
    icon: Palette,
    iconBg: "bg-pink-500/10 text-pink-500 dark:bg-pink-500/20",
    example: "Gemastik, UX Open",
    estPrize: "Rp 25.000.000",
  },
  {
    name: "Hackathon",
    icon: Code2,
    iconBg: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
    example: "CompFest, FindIT",
    estPrize: "Rp 50.000.000",
  },
  {
    name: "KTI & Riset",
    icon: BookOpen,
    iconBg: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20",
    example: "PIMNAS, LKTIN",
    estPrize: "Rp 15.000.000",
  },
  {
    name: "Business Plan",
    icon: Briefcase,
    iconBg: "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20",
    example: "BMC, Pitching",
    estPrize: "Rp 20.000.000",
  },
  {
    name: "AI & Sains",
    icon: Cpu,
    iconBg: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20",
    example: "KRI, Gemastik",
    estPrize: "Rp 30.000.000",
  },
];

// Gradient card styles for Featured Competitions (Inspired by Featured Jobs in reference)
const GRADIENT_CARD_STYLES = [
  {
    gradient: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600",
    shadow: "shadow-lg shadow-blue-500/25",
    icon: "🎨",
  },
  {
    gradient: "bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600",
    shadow: "shadow-lg shadow-purple-500/25",
    icon: "🔬",
  },
  {
    gradient: "bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500",
    shadow: "shadow-lg shadow-rose-500/25",
    icon: "💡",
  },
];

// ============================================================================
// Interactive Task Item Component
// ============================================================================
function FriendlyTaskRow({
  task,
  onToggle,
}: {
  task: any;
  onToggle: () => void;
}) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "competition":
        return { icon: Trophy, bg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" };
      case "college":
        return { icon: BookOpen, bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" };
      case "work":
        return { icon: Briefcase, bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" };
      default:
        return { icon: Star, bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" };
    }
  };

  const { icon: CatIcon, bg: catBg } = getCategoryIcon(task.category);

  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all border border-slate-100/80 dark:border-slate-800/80 group">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Toggle checkbox */}
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
        >
          {task.is_completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Category circle */}
        <div
          className={cn(
            "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0",
            catBg
          )}
        >
          <CatIcon className="w-4 h-4" />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p
            className={cn(
              "text-xs font-bold truncate text-slate-800 dark:text-slate-100",
              task.is_completed && "line-through text-slate-400 dark:text-slate-500"
            )}
          >
            {task.title}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {task.competition_title || (task.category === "college" ? "Kuliah" : "Personal")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 pl-2">
        {task.priority === "urgent" && <span className="badge-urgent">Mendesak</span>}
        {task.priority === "high" && <span className="badge-high">Tinggi</span>}
        {task.due_date && (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
            {formatDate(task.due_date, "d MMM")}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Friendly Dashboard Page
// ============================================================================
export default function DashboardPage() {
  const { state, dispatch } = useAppState();

  const [isNewCompModalOpen, setIsNewCompModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"weekly" | "monthly" | "all">("monthly");

  // Filter prioritized tasks
  const prioritizedTasks = useMemo(() => {
    return getPrioritizedTasks(state.tasks)
      .filter((t) => !t.is_completed)
      .slice(0, 5);
  }, [state.tasks]);

  // Urgent upcoming deadlines (<7 days)
  const upcomingDeadlines = useMemo(() => {
    const deadlines: {
      id: string;
      stage_name: string;
      competitionTitle: string;
      competitionId: string;
      deadline: string;
      daysLeft: number;
    }[] = [];

    state.competitions.forEach((comp) => {
      comp.stages.forEach((stage) => {
        if (!stage.is_completed) {
          const cd = getCountdown(stage.deadline);
          if (cd.daysLeft >= 0 && cd.daysLeft <= 14) {
            deadlines.push({
              id: stage.id,
              stage_name: stage.stage_name,
              competitionTitle: comp.title,
              competitionId: comp.id,
              deadline: stage.deadline,
              daysLeft: cd.daysLeft,
            });
          }
        }
      });
    });

    return deadlines.sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  }, [state.competitions]);

  // Statistics
  const stats = useMemo(() => {
    const activeComps = state.competitions.filter(
      (c) => c.status !== "archived" && c.status !== "completed"
    ).length;
    const pendingTasks = state.tasks.filter((t) => !t.is_completed).length;
    const completedTasks = state.tasks.filter((t) => t.is_completed).length;
    const urgentDeadlines = upcomingDeadlines.filter((d) => d.daysLeft <= 3).length;
    return { activeComps, pendingTasks, completedTasks, urgentDeadlines };
  }, [state.competitions, state.tasks, upcomingDeadlines]);

  // Financial summary
  const financialSummary = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;
    state.expenses.forEach((e) => {
      if (e.type === "prize") {
        totalIncome += e.amount;
      } else {
        totalExpense += e.amount;
      }
    });
    return {
      totalExpense,
      totalIncome,
      net: totalIncome - totalExpense,
    };
  }, [state.expenses]);

  // Deadline dates for MiniCalendar
  const deadlineDates = useMemo(() => {
    return state.competitions.flatMap((c) =>
      c.stages.filter((s) => !s.is_completed).map((s) => new Date(s.deadline))
    );
  }, [state.competitions]);

  const activeCompetitionsList = useMemo(() => {
    return state.competitions.filter((c) => c.status !== "archived");
  }, [state.competitions]);

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* ==================================================================== */}
      {/* 1. WELCOME HEADER (Inspired by "Discover Jobs 🔥" in screenshot) */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-400">
            Welcome to CompeteFlow! 👋
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            Discover Competitions <span className="select-none">🔥</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewCompModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Tambah Lomba Baru</span>
          </button>
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="btn-secondary flex items-center gap-2 text-xs"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TOP CATEGORIES (Matching Top Companies circular cards in reference) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {TOP_CATEGORIES.map((cat, idx) => {
          const IconComp = cat.icon;
          const compCount = state.competitions.filter((c) =>
            c.category?.toLowerCase().includes(cat.name.toLowerCase().slice(0, 4))
          ).length;

          return (
            <div
              key={idx}
              className="card p-4 sm:p-5 text-center flex flex-col items-center justify-between gap-2.5 card-hover cursor-pointer group"
              onClick={() => setIsNewCompModalOpen(true)}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                  cat.iconBg
                )}
              >
                <IconComp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                  {cat.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {cat.example}
                </p>
              </div>
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                {compCount > 0 ? `${compCount} Lomba Aktif` : cat.estPrize}
              </span>
            </div>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 3. FEATURED COMPETITIONS (Matching the 3 gradient cards in reference!) */}
      {/* ==================================================================== */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Featured Competitions
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              ({activeCompetitionsList.length} aktif)
            </span>
          </div>
          <Link
            href="/kompetisi"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeCompetitionsList.length === 0 ? (
          <div className="card p-8 text-center space-y-3">
            <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500">Belum ada kompetisi aktif.</p>
            <button
              onClick={() => setIsNewCompModalOpen(true)}
              className="btn-primary text-xs"
            >
              Daftarkan Kompetisi Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCompetitionsList.slice(0, 3).map((comp, idx) => {
              const style = GRADIENT_CARD_STYLES[idx % GRADIENT_CARD_STYLES.length];
              const progress = calculateCompetitionProgress(comp.stages);
              const nextStage = comp.stages.find((s: any) => !s.is_completed);
              const countdown = nextStage ? getCountdown(nextStage.deadline) : null;

              return (
                <Link key={comp.id} href={`/kompetisi/${comp.id}`}>
                  <div
                    className={cn(
                      "p-5 sm:p-6 rounded-3xl text-white space-y-4 card-hover cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]",
                      style.gradient,
                      style.shadow
                    )}
                  >
                    {/* Background glow circle */}
                    <div className="w-32 h-32 bg-white/10 rounded-full absolute -right-6 -bottom-6 blur-2xl pointer-events-none" />

                    <div>
                      {/* Top Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner flex-shrink-0">
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-extrabold text-white truncate leading-snug">
                            {comp.title}
                          </h3>
                          <p className="text-xs text-white/80 font-medium truncate mt-0.5">
                            {comp.organizer}
                          </p>
                        </div>
                      </div>

                      {/* Pill Tags (Matching "Full-Time", "Junior" in screenshot) */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white">
                          {comp.category || "Kompetisi"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                          {comp.level}
                        </span>
                        {countdown && (
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                              countdown.daysLeft <= 2
                                ? "bg-rose-500 text-white animate-pulse"
                                : "bg-white/20 backdrop-blur-md text-white"
                            )}
                          >
                            ⏳ {countdown.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar with Glass Track */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-white/90">
                        <span className="truncate">
                          {nextStage ? nextStage.stage_name : "Semua Tahap Selesai"}
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden p-0.5">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs font-bold text-white/95">
                      <span>{comp.target_prize > 0 ? formatRupiah(comp.target_prize) : "Sertifikat"}</span>
                      <span className="text-[11px] font-semibold text-white/80">
                        {nextStage ? formatDate(nextStage.deadline, "d MMM yyyy") : "Tuntas"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. BOTTOM SPLIT: "Hot Tasks 🔥" & "Statistik / Kalender" */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Hot Tasks 🔥 (Matching "Hot Jobs 🔥" in reference) */}
        <div className="lg:col-span-7">
          <div className="card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Hot Tasks <span className="select-none">🔥</span>
                </h2>
                <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                  {stats.pendingTasks} pending
                </span>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                title="Tambah Tugas Baru"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {prioritizedTasks.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-xs text-slate-500">Semua tugas hari ini beres!</p>
                </div>
              ) : (
                prioritizedTasks.map((task) => (
                  <FriendlyTaskRow
                    key={task.id}
                    task={task}
                    onToggle={() =>
                      dispatch({ type: "TOGGLE_TASK", payload: task.id })
                    }
                  />
                ))
              )}
            </div>

            <Link
              href="/tugas"
              className="block pt-2 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Buka Smart Daily Agenda Lengkap →
            </Link>
          </div>
        </div>

        {/* Right Column: Statistics & Mini Calendar (Matching "Salary Trend" in reference) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Calendar Card */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Kalender Deadline
                </h3>
              </div>

              {/* Time Filter Pills (Matching Weekly, Monthly pills in screenshot) */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[10px] font-bold">
                <button
                  onClick={() => setTimeFilter("monthly")}
                  className={cn(
                    "px-2 py-1 rounded-lg transition-colors",
                    timeFilter === "monthly"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setTimeFilter("all")}
                  className={cn(
                    "px-2 py-1 rounded-lg transition-colors",
                    timeFilter === "all"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Semua
                </button>
              </div>
            </div>

            {/* Mini Calendar */}
            <MiniCalendar deadlineDates={deadlineDates} />
          </div>

          {/* Financial / ROI Trend Card */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Ringkasan Finansial
                  </h3>
                  <p className="text-[10px] text-slate-400">Hadiah & Anggaran Lomba</p>
                </div>
              </div>

              <Link
                href="/keuangan"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Detail →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400">Pengeluaran</p>
                <p className="text-xs sm:text-sm font-extrabold text-rose-500 mt-0.5">
                  {formatRupiah(financialSummary.totalExpense)}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400">Pemasukan Hadiah</p>
                <p className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatRupiah(financialSummary.totalIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals — Completely Preserved */}
      <NewCompetitionModal
        isOpen={isNewCompModalOpen}
        onClose={() => setIsNewCompModalOpen(false)}
      />
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        competitions={state.competitions}
      />
    </div>
  );
}
