"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { calculateCompetitionProgress, formatDate, formatRupiah, COMPETITION_STATUS_LABELS, COMPETITION_LEVEL_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getCountdown } from "@/lib/format";
import {
  Trophy, Plus, Search, Filter, ExternalLink, ChevronRight,
  Target, Calendar, DollarSign, Star, Trash2, Edit3, Archive,
  SortAsc, Globe, Users,
} from "lucide-react";
import Link from "next/link";
import { NewCompetitionModal } from "@/components/competition/NewCompetitionModal";
import { Competition } from "@/types";

const STATUS_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "registered", label: "Terdaftar" },
  { value: "in_progress", label: "Berlangsung" },
  { value: "finalist", label: "Finalis" },
  { value: "completed", label: "Selesai" },
  { value: "archived", label: "Diarsipkan" },
];

function CompetitionCard({
  comp,
  onEdit,
  onDelete,
}: {
  comp: Competition;
  onEdit: (c: Competition) => void;
  onDelete: (id: string) => void;
}) {
  const progress = calculateCompetitionProgress(comp.stages);
  const nextStage = comp.stages.find((s) => !s.is_completed);
  const completedStages = comp.stages.filter((s) => s.is_completed).length;

  const nextDeadline = nextStage ? getCountdown(nextStage.deadline) : null;

  return (
    <div className="card card-hover group p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {comp.title}
            </h3>
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", `status-${comp.status}`)}>
              {COMPETITION_STATUS_LABELS[comp.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400">{comp.organizer}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">{comp.category}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">{COMPETITION_LEVEL_LABELS[comp.level]}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(comp)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(comp.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-slate-500">
            Progress — {completedStages}/{comp.stages.length} tahapan
          </span>
          <span className="text-[11px] font-bold text-green-600 dark:text-green-400">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className={cn(
              "progress-bar-fill",
              progress === 100
                ? "bg-gradient-to-r from-emerald-500 to-green-400"
                : "bg-gradient-to-r from-green-600 to-green-400"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Next deadline + Finance row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {nextStage && nextDeadline ? (
            <span
              className={cn(
                "font-medium",
                nextDeadline.daysLeft <= 1
                  ? "text-red-500 dark:text-red-400"
                  : nextDeadline.daysLeft <= 3
                  ? "text-amber-500 dark:text-amber-400"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              {nextStage.stage_name}: {nextDeadline.label}
            </span>
          ) : (
            <span className="text-slate-500">Semua tahapan selesai</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{formatRupiah(comp.registration_fee)}</span>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <Link
          href={`/kompetisi/${comp.id}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          Detail & Milestone <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        {comp.official_url && (
          <a
            href={comp.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-500 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function KompetisiPage() {
  const { state, dispatch } = useAppState();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editComp, setEditComp] = useState<Competition | undefined>(undefined);

  const filteredCompetitions = useMemo(() => {
    return state.competitions.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.organizer.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [state.competitions, search, statusFilter]);

  function handleDelete(id: string) {
    if (confirm("Hapus kompetisi ini? Semua data terkait (tahapan, file) akan hilang.")) {
      dispatch({ type: "DELETE_COMPETITION", payload: id });
    }
  }

  function handleEdit(comp: Competition) {
    setEditComp(comp);
    setIsModalOpen(true);
  }

  const activeCount = state.competitions.filter(
    (c) => c.status === "in_progress" || c.status === "registered"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Kompetisi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {state.competitions.length} total &bull;{" "}
            <span className="text-green-600 dark:text-green-400 font-medium">{activeCount} aktif</span>
          </p>
        </div>
        <button
          onClick={() => { setEditComp(undefined); setIsModalOpen(true); }}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Lomba
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari lomba, penyelenggara, kategori..."
            className="input-base pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30 font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Competition Grid */}
      {filteredCompetitions.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {search || statusFilter !== "all"
              ? "Tidak ada kompetisi yang sesuai filter"
              : "Belum ada kompetisi terdaftar"}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {!search && statusFilter === "all" && "Mulai dengan menambahkan lomba pertamamu."}
          </p>
          {!search && statusFilter === "all" && (
            <button
              onClick={() => { setEditComp(undefined); setIsModalOpen(true); }}
              className="btn-primary text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Kompetisi Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCompetitions.map((comp) => (
            <CompetitionCard
              key={comp.id}
              comp={comp}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* New/Edit Modal */}
      <NewCompetitionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditComp(undefined); }}
        editCompetition={editComp}
      />
    </div>
  );
}
