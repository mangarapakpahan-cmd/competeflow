"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { getPrioritizedTasks } from "@/lib/priority";
import {
  formatDate,
  formatRelativeTime,
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  CheckSquare, Plus, Search, Filter, CheckCircle2, Circle,
  Trash2, Edit3, Clock, Tag, Trophy, BookOpen, Briefcase, User,
  SortAsc, Zap, Star,
} from "lucide-react";
import { Task, TaskCategory } from "@/types";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { isOverdue } from "@/lib/priority";

const PRIORITY_CONFIG = {
  urgent: { cls: "badge-urgent", dot: "bg-red-500", label: "Mendesak" },
  high: { cls: "badge-high", dot: "bg-amber-500", label: "Tinggi" },
  medium: { cls: "badge-medium", dot: "bg-blue-500", label: "Sedang" },
  low: { cls: "badge-low", dot: "bg-slate-600", label: "Rendah" },
};

const CATEGORY_ICON: Record<TaskCategory, React.ElementType> = {
  competition: Trophy,
  college: BookOpen,
  work: Briefcase,
  personal: User,
};

const CATEGORY_COLOR: Record<TaskCategory, string> = {
  competition: "text-violet-400",
  college: "text-blue-400",
  work: "text-amber-400",
  personal: "text-slate-400",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "competition", label: "🏆 Lomba" },
  { value: "college", label: "📚 Kuliah" },
  { value: "work", label: "💼 Kerja" },
  { value: "personal", label: "👤 Personal" },
  { value: "completed", label: "✅ Selesai" },
];

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pConfig = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const overdue = isOverdue(task);
  const CategoryIcon = CATEGORY_ICON[task.category];

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-xl border transition-all",
        task.is_completed
          ? "bg-slate-100/60 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/40 opacity-50"
          : overdue
          ? "bg-red-500/5 border-red-500/25 hover:border-red-500/40"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none"
      )}
    >
      {/* Checkbox */}
      <button onClick={onToggle} className="flex-shrink-0 mt-0.5">
        {task.is_completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
        ) : (
          <Circle
            className={cn(
              "w-5 h-5",
              overdue ? "text-red-500 dark:text-red-400" : "text-slate-400 dark:text-slate-600 hover:text-green-500 dark:hover:text-green-400"
            )}
          />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p
            className={cn(
              "text-sm font-medium leading-tight",
              task.is_completed
                ? "line-through text-slate-400 dark:text-slate-500"
                : "text-slate-900 dark:text-white"
            )}
          >
            {task.title}
          </p>
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md", pConfig.cls)}>
            {pConfig.label}
          </span>
          {overdue && !task.is_completed && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
              TERLAMBAT
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className={cn("flex items-center gap-1 text-[11px] font-medium", CATEGORY_COLOR[task.category])}>
            <CategoryIcon className="w-3 h-3" />
            {TASK_CATEGORY_LABELS[task.category]}
          </span>

          {task.competition_title && (
            <span className="text-[11px] font-medium text-violet-700 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
              {task.competition_title}
            </span>
          )}

          {task.due_date && (
            <span className={cn("flex items-center gap-1 text-[11px]", overdue && !task.is_completed ? "text-red-500 dark:text-red-400 font-semibold" : "text-slate-500")}>
              <Clock className="w-3 h-3" />
              {task.is_completed
                ? formatDate(task.due_date, "d MMM")
                : formatRelativeTime(task.due_date)}
            </span>
          )}
        </div>

        {task.notes && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {task.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function TugasPage() {
  const { state, dispatch } = useAppState();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);

  const pendingTasks = useMemo(
    () => getPrioritizedTasks(state.tasks),
    [state.tasks]
  );

  const completedTasks = useMemo(
    () =>
      state.tasks
        .filter((t) => t.is_completed)
        .sort(
          (a, b) =>
            new Date(b.completed_at || 0).getTime() -
            new Date(a.completed_at || 0).getTime()
        ),
    [state.tasks]
  );

  const displayTasks = useMemo(() => {
    let base =
      filter === "completed" ? completedTasks : pendingTasks;

    if (filter !== "all" && filter !== "completed") {
      base = base.filter((t) => t.category === filter);
    }

    if (search) {
      const q = search.toLowerCase();
      base = base.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.competition_title?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
      );
    }

    return base;
  }, [pendingTasks, completedTasks, filter, search]);

  function handleDelete(id: string) {
    dispatch({ type: "DELETE_TASK", payload: id });
  }

  function handleEdit(task: Task) {
    setEditTask(task);
    setIsModalOpen(true);
  }

  const stats = {
    pending: state.tasks.filter((t) => !t.is_completed).length,
    completed: state.tasks.filter((t) => t.is_completed).length,
    urgent: state.tasks.filter(
      (t) => !t.is_completed && (t.priority === "urgent" || t.priority === "high")
    ).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Smart Daily Agenda</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{stats.pending} pending</span>
            {" · "}
            <span className="text-red-500 dark:text-red-400 font-semibold">{stats.urgent} mendesak</span>
            {" · "}
            <span className="text-green-600 dark:text-green-400 font-semibold">{stats.completed} selesai</span>
          </p>
        </div>
        <button
          onClick={() => { setEditTask(undefined); setIsModalOpen(true); }}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Tugas
        </button>
      </div>

      {/* Priority Algorithm Notice */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
        <Zap className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">Algoritma Prioritas Otomatis</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            Tugas diurutkan otomatis berdasarkan: Bobot prioritas + Urgensi deadline (tugas lomba &lt;48 jam
            otomatis naik ke atas) + Kategori. Tugas yang telah selesai otomatis diarsipkan.
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tugas..."
            className="input-base pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                filter === f.value
                  ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30 font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {displayTasks.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {filter === "completed"
              ? "Belum ada tugas selesai"
              : search
              ? "Tidak ada tugas yang cocok"
              : "Semua tugas selesai! 🎉"}
          </h3>
          {!search && filter === "all" && (
            <button
              onClick={() => { setEditTask(undefined); setIsModalOpen(true); }}
              className="btn-primary text-xs mt-3 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Tugas Baru
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => dispatch({ type: "TOGGLE_TASK", payload: task.id })}
              onEdit={() => handleEdit(task)}
              onDelete={() => handleDelete(task.id)}
            />
          ))}
        </div>
      )}

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTask(undefined); }}
        competitions={state.competitions}
        editTask={editTask}
      />
    </div>
  );
}
