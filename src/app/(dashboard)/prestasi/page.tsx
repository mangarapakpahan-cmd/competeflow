"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { formatRupiah, FINAL_RESULT_LABELS, COMPETITION_LEVEL_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Award, Plus, Trophy,
  Edit3, Trash2, Download, Search, Check, Copy, X,
} from "lucide-react";
import { Retrospective, FinalResult } from "@/types";

const RESULT_CONFIG: Record<FinalResult, { color: string; bg: string; icon: string }> = {
  champion_1: { color: "text-amber-500 dark:text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: "🥇" },
  champion_2: { color: "text-slate-600 dark:text-slate-300", bg: "bg-slate-500/10 border-slate-400/20", icon: "🥈" },
  champion_3: { color: "text-amber-700 dark:text-amber-600", bg: "bg-amber-600/10 border-amber-600/20", icon: "🥉" },
  runner_up: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: "🏅" },
  finalist: { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: "🎯" },
  semifinalist: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: "📋" },
  honorable_mention: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "⭐" },
  participant: { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-500/10 border-slate-400/20", icon: "📌" },
};

function AchievementCard({
  retro,
  onEdit,
  onDelete,
}: {
  retro: Retrospective;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = RESULT_CONFIG[retro.final_result] ?? RESULT_CONFIG.participant;

  return (
    <div className={cn("card p-5 space-y-4 group border", config.bg)}>
      <div className="flex items-start gap-3">
        <span className="text-3xl select-none">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-sm font-black", config.color)}>
              {FINAL_RESULT_LABELS[retro.final_result]}
            </span>
            {retro.year && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{retro.year}</span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {retro.competition_title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            {retro.competition_category && (
              <span>{retro.competition_category}</span>
            )}
            {retro.competition_level && (
              <span>· {COMPETITION_LEVEL_LABELS[retro.competition_level]}</span>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-500">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {retro.prize_amount > 0 && (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">
            {formatRupiah(retro.prize_amount)}
          </span>
        </div>
      )}

      {retro.tags && retro.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {retro.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        {isExpanded ? "Sembunyikan" : "Lihat"} retrospeksi →
      </button>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          {retro.what_went_well && (
            <div>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-green-400 uppercase tracking-wide mb-1">
                ✅ Yang Berjalan Baik
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{retro.what_went_well}</p>
            </div>
          )}
          {retro.what_to_improve && (
            <div>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">
                🔧 Perlu Ditingkatkan
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{retro.what_to_improve}</p>
            </div>
          )}
          {retro.judge_feedback && (
            <div>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                💬 Masukan Juri
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">{retro.judge_feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddRetrospectiveModal({
  isOpen,
  onClose,
  editRetro,
}: {
  isOpen: boolean;
  onClose: () => void;
  editRetro?: Retrospective;
}) {
  const { state, dispatch } = useAppState();
  const [selectedCompId, setSelectedCompId] = useState(editRetro?.competition_id ?? "");
  const [title, setTitle] = useState(editRetro?.competition_title ?? "");
  const [category, setCategory] = useState(editRetro?.competition_category ?? "");
  const [result, setResult] = useState<FinalResult>(editRetro?.final_result ?? "champion_1");
  const [prize, setPrize] = useState(editRetro?.prize_amount?.toString() ?? "0");
  const [whatWentWell, setWhatWentWell] = useState(editRetro?.what_went_well ?? "");
  const [whatToImprove, setWhatToImprove] = useState(editRetro?.what_to_improve ?? "");
  const [judgeFeedback, setJudgeFeedback] = useState(editRetro?.judge_feedback ?? "");
  const [tags, setTags] = useState(editRetro?.tags?.join(", ") ?? "");
  const [year, setYear] = useState(editRetro?.year?.toString() ?? new Date().getFullYear().toString());

  if (!isOpen) return null;

  function handleSelectCompetition(compId: string) {
    setSelectedCompId(compId);
    if (!compId) return;
    const comp = state.competitions.find((c) => c.id === compId);
    if (comp) {
      setTitle(comp.title);
      setCategory(comp.category);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const retro: Retrospective = {
      id: editRetro?.id ?? `r-${Date.now()}`,
      competition_id: selectedCompId || editRetro?.competition_id || `rc-${Date.now()}`,
      competition_title: title.trim(),
      competition_category: category || undefined,
      final_result: result,
      prize_amount: parseFloat(prize) || 0,
      what_went_well: whatWentWell || undefined,
      what_to_improve: whatToImprove || undefined,
      judge_feedback: judgeFeedback || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      year: parseInt(year) || new Date().getFullYear(),
      created_at: editRetro?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (editRetro) {
      dispatch({ type: "UPDATE_RETROSPECTIVE", payload: retro });
    } else {
      dispatch({ type: "ADD_RETROSPECTIVE", payload: retro });
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content mx-4 max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            {editRetro ? "Edit Prestasi" : "Tambah Prestasi & Retrospeksi"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {state.competitions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih dari Kompetisi Terdaftar (opsional)
              </label>
              <select
                value={selectedCompId}
                onChange={(e) => handleSelectCompetition(e.target.value)}
                className="input-base"
              >
                <option value="">— Ketik manual atau pilih dari daftar —</option>
                {state.competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.organizer})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Kompetisi *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-base"
              placeholder="Contoh: Gemastik UX Design"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hasil Akhir</label>
              <select value={result} onChange={(e) => setResult(e.target.value as FinalResult)} className="input-base">
                {Object.entries(FINAL_RESULT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="UI/UX, KTI, ..." className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tahun</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min="2020" max="2030" className="input-base" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hadiah / Prize Money (Rp)</label>
            <input type="number" value={prize} onChange={(e) => setPrize(e.target.value)} min="0" className="input-base" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">✅ Yang Berjalan Baik</label>
            <textarea value={whatWentWell} onChange={(e) => setWhatWentWell(e.target.value)} rows={2} className="input-base resize-none" placeholder="Kekuatan karya atau presentasi..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">🔧 Perlu Ditingkatkan</label>
            <textarea value={whatToImprove} onChange={(e) => setWhatToImprove(e.target.value)} rows={2} className="input-base resize-none" placeholder="Kelemahan atau poin kritis juri..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">💬 Masukan / Q&A Juri</label>
            <textarea value={judgeFeedback} onChange={(e) => setJudgeFeedback(e.target.value)} rows={2} className="input-base resize-none" placeholder="Catatan feedback juri..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tags (pisahkan koma)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Pitching, UI/UX, Prototype" className="input-base" />
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1">{editRetro ? "Simpan Perubahan" : "Tambah Prestasi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExportCvModal({
  isOpen,
  onClose,
  retrospectives,
}: {
  isOpen: boolean;
  onClose: () => void;
  retrospectives: Retrospective[];
}) {
  const [copiedType, setCopiedType] = useState<"md" | "linkedin" | null>(null);

  const markdownContent = useMemo(() => {
    let out = `# Ringkasan Prestasi & Kompetisi\n\n`;
    retrospectives.forEach((r, idx) => {
      const resultName = FINAL_RESULT_LABELS[r.final_result] || r.final_result;
      out += `### ${idx + 1}. ${r.competition_title} (${r.year || "N/A"})\n`;
      out += `- **Prestasi:** ${resultName}\n`;
      if (r.competition_category) out += `- **Bidang:** ${r.competition_category}\n`;
      if (r.prize_amount > 0) out += `- **Hadiah:** ${formatRupiah(r.prize_amount)}\n`;
      if (r.what_went_well) out += `- **Highlight:** ${r.what_went_well}\n`;
      out += `\n`;
    });
    return out;
  }, [retrospectives]);

  const linkedinContent = useMemo(() => {
    let out = `🏆 Rekap Perjalanan Kompetisi & Prestasi\n\n`;
    retrospectives.forEach((r) => {
      const config = RESULT_CONFIG[r.final_result] ?? RESULT_CONFIG.participant;
      const resultName = FINAL_RESULT_LABELS[r.final_result] || r.final_result;
      out += `${config.icon} ${resultName} — ${r.competition_title} (${r.year || "Terkini"})\n`;
      if (r.competition_category) out += `   Bidang: ${r.competition_category}\n`;
      if (r.what_went_well) out += `   Highlight: ${r.what_went_well}\n`;
      out += `\n`;
    });
    out += `#Kompetisi #PrestasiMahasiswa #Achievement #CompeteFlow`;
    return out;
  }, [retrospectives]);

  if (!isOpen) return null;

  async function handleCopy(type: "md" | "linkedin", text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content mx-4 max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ekspor Ringkasan Prestasi (CV & LinkedIn)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Format Markdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Format Markdown (Untuk CV / Portofolio)</span>
              <button
                onClick={() => handleCopy("md", markdownContent)}
                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
              >
                {copiedType === "md" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === "md" ? "Tersalin!" : "Salin Markdown"}
              </button>
            </div>
            <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {markdownContent}
            </pre>
          </div>

          {/* Format LinkedIn */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Format LinkedIn Post</span>
              <button
                onClick={() => handleCopy("linkedin", linkedinContent)}
                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
              >
                {copiedType === "linkedin" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === "linkedin" ? "Tersalin!" : "Salin LinkedIn"}
              </button>
            </div>
            <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {linkedinContent}
            </pre>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs">Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default function PrestasiPage() {
  const { state, dispatch } = useAppState();
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editRetro, setEditRetro] = useState<Retrospective | undefined>();

  const years = useMemo(() => {
    const ys = new Set(state.retrospectives.map((r) => r.year?.toString()).filter(Boolean));
    return Array.from(ys).sort((a, b) => parseInt(b!) - parseInt(a!));
  }, [state.retrospectives]);

  const filtered = useMemo(() => {
    return state.retrospectives.filter((r) => {
      const matchSearch = !search || r.competition_title?.toLowerCase().includes(search.toLowerCase());
      const matchYear = yearFilter === "all" || r.year?.toString() === yearFilter;
      const matchResult = resultFilter === "all" || r.final_result === resultFilter;
      return matchSearch && matchYear && matchResult;
    });
  }, [state.retrospectives, search, yearFilter, resultFilter]);

  const stats = useMemo(() => {
    const total = state.retrospectives.length;
    const wins = state.retrospectives.filter(
      (r) => ["champion_1", "champion_2", "champion_3"].includes(r.final_result)
    ).length;
    const finalists = state.retrospectives.filter(
      (r) => ["finalist", "semifinalist", "runner_up"].includes(r.final_result)
    ).length;
    const totalPrize = state.retrospectives.reduce((sum, r) => sum + (r.prize_amount ?? 0), 0);
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const finalistRate = total > 0 ? Math.round(((wins + finalists) / total) * 100) : 0;
    return { total, wins, finalists, totalPrize, winRate, finalistRate };
  }, [state.retrospectives]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Prestasi & Achievement Vault</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{state.retrospectives.length} catatan prestasi terdokumentasi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportOpen(true)}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Ekspor untuk CV atau LinkedIn"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CV
          </button>
          <button onClick={() => { setEditRetro(undefined); setIsModalOpen(true); }} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Tambah Prestasi
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Total Kompetisi</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-amber-500 dark:text-yellow-400">{stats.wins}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Juara (1/2/3)</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Win Rate: {stats.winRate}%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-violet-600 dark:text-violet-400">{stats.finalists}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Finalis / Runner Up</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Top Rate: {stats.finalistRate}%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-lg font-black text-amber-600 dark:text-amber-400">{formatRupiah(stats.totalPrize)}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Total Hadiah</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kompetisi..." className="input-base pl-9" />
        </div>
        {years.length > 0 && (
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="input-base sm:w-36">
            <option value="all">Semua Tahun</option>
            {years.map((y) => <option key={y} value={y!}>{y}</option>)}
          </select>
        )}
      </div>

      {/* Achievements Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Belum ada catatan prestasi</h3>
          <p className="text-xs text-slate-500 mb-4">Tambahkan hasil dan retrospeksi kompetisi yang telah Anda ikuti.</p>
          <button onClick={() => { setEditRetro(undefined); setIsModalOpen(true); }} className="btn-primary text-xs inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Tambah Prestasi Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((retro) => (
            <AchievementCard
              key={retro.id}
              retro={retro}
              onEdit={() => { setEditRetro(retro); setIsModalOpen(true); }}
              onDelete={() => dispatch({ type: "DELETE_RETROSPECTIVE", payload: retro.id })}
            />
          ))}
        </div>
      )}

      <AddRetrospectiveModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditRetro(undefined); }}
        editRetro={editRetro}
      />

      <ExportCvModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        retrospectives={state.retrospectives}
      />
    </div>
  );
}
