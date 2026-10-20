"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  FolderOpen, Plus, Search, FileText, Image, File, ExternalLink,
  Trash2, Download, Link2, Globe, Code, Palette, BookOpen, Layers,
  Upload, Star, X, CheckCircle2,
} from "lucide-react";
import { VaultFile, CompetitionLink, LinkType } from "@/types";

const FILE_TYPE_ICON: Record<string, React.ElementType> = {
  "application/pdf": FileText,
  "image/jpeg": Image,
  "image/png": Image,
};

const LINK_TYPE_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  drive: { icon: "📁", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
  figma: { icon: "🎨", color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10" },
  github: { icon: "💻", color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-700/50" },
  docs: { icon: "📄", color: "text-blue-600 dark:text-blue-300", bg: "bg-blue-500/10" },
  portal: { icon: "🌐", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  other: { icon: "🔗", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-700/50" },
};

function FileCard({ file, onDelete }: { file: VaultFile; onDelete: () => void }) {
  const isImage = file.mime_type?.startsWith("image/");
  const Icon = FILE_TYPE_ICON[file.mime_type ?? ""] ?? File;

  return (
    <div className="group card p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-3">
      {/* Icon + Info */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          isImage ? "bg-amber-500/10" : "bg-red-500/10"
        )}>
          <Icon className={cn("w-5 h-5", isImage ? "text-amber-500 dark:text-amber-400" : "text-red-500 dark:text-red-400")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{file.file_name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-slate-500">{file.category}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[10px] text-slate-500">{file.file_size}</span>
            {file.is_general ? (
              <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                Umum
              </span>
            ) : file.competition_title ? (
              <span className="text-[10px] font-medium text-violet-700 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                {file.competition_title}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => alert(`Mengunduh file: ${file.file_name}`)}
          className="flex-1 text-xs text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center justify-center gap-1 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Unduh
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-xs text-slate-600 dark:text-slate-400 hover:text-red-500 flex items-center justify-center gap-1 py-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus
        </button>
      </div>
    </div>
  );
}

// Upload Modal
function UploadFileModal({
  isOpen,
  onClose,
  competitions,
}: {
  isOpen: boolean;
  onClose: () => void;
  competitions: { id: string; title: string }[];
}) {
  const { dispatch } = useAppState();
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState("KTM / Identitas");
  const [isGeneral, setIsGeneral] = useState(true);
  const [competitionId, setCompetitionId] = useState("");
  const [fileSizeStr, setFileSizeStr] = useState("1.2 MB");
  const [mimeType, setMimeType] = useState("application/pdf");
  const [fileSelected, setFileSelected] = useState(false);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file melebihi batas maksimal 10 MB!");
      return;
    }

    setFileName(file.name);
    setMimeType(file.type || "application/pdf");
    const mb = file.size / (1024 * 1024);
    setFileSizeStr(mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`);
    setFileSelected(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileName.trim()) return;

    const selectedComp = competitions.find((c) => c.id === competitionId);

    const newFile: VaultFile = {
      id: `file-${Date.now()}`,
      file_name: fileName.trim(),
      category,
      file_size: fileSizeStr,
      mime_type: mimeType,
      is_general: isGeneral,
      competition_id: !isGeneral && competitionId ? competitionId : undefined,
      competition_title: !isGeneral ? selectedComp?.title : undefined,
    };

    dispatch({ type: "ADD_VAULT_FILE", payload: newFile });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content mx-4 max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
            Upload Berkas Baru
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Berkas (PDF, JPG, PNG &bull; Max 10 MB) *
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-green-500/10 file:text-green-700 dark:file:text-green-400 hover:file:bg-green-500/20 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Berkas *
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Contoh: KTM_NamaLengkap.pdf"
              className="input-base"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kategori Berkas
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-base"
            >
              <option value="KTM / Identitas">KTM / Identitas</option>
              <option value="CV / Portofolio">CV / Portofolio</option>
              <option value="Surat Keterangan Aktif">Surat Keterangan Aktif</option>
              <option value="Transkrip Nilai">Transkrip Nilai</option>
              <option value="Proposal / Karya">Proposal / Karya</option>
              <option value="Slide Presentasi">Slide Presentasi</option>
              <option value="Dokumen Lain">Dokumen Lain</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipe Penyimpanan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setIsGeneral(true); setCompetitionId(""); }}
                className={cn(
                  "py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center",
                  isGeneral
                    ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                )}
              >
                Umum (Reusable)
              </button>
              <button
                type="button"
                onClick={() => setIsGeneral(false)}
                className={cn(
                  "py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center",
                  !isGeneral
                    ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                )}
              >
                Khusus Lomba
              </button>
            </div>
          </div>

          {!isGeneral && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tautkan ke Kompetisi *
              </label>
              <select
                value={competitionId}
                onChange={(e) => setCompetitionId(e.target.value)}
                className="input-base"
                required
              >
                <option value="">— Pilih Kompetisi —</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1">
              Simpan ke Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Cloud Link Modal
function AddLinkModal({
  isOpen,
  onClose,
  competitions,
}: {
  isOpen: boolean;
  onClose: () => void;
  competitions: { id: string; title: string; links: CompetitionLink[] }[];
}) {
  const { state, dispatch } = useAppState();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("drive");
  const [competitionId, setCompetitionId] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !url.trim() || !competitionId) return;

    const targetComp = state.competitions.find((c) => c.id === competitionId);
    if (!targetComp) return;

    const newLink: CompetitionLink = {
      id: `link-${Date.now()}`,
      label: label.trim(),
      url: url.trim(),
      link_type: linkType,
      competition_id: competitionId,
    };

    const updatedComp = {
      ...targetComp,
      links: [...targetComp.links, newLink],
    };

    dispatch({ type: "UPDATE_COMPETITION", payload: updatedComp });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content mx-4 max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            Tambah Cloud Link
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Label Link *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Figma UI/UX Prototype, Berkas Submission"
              className="input-base"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              URL Link *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="input-base"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Jenis Layanan
              </label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as LinkType)}
                className="input-base"
              >
                <option value="drive">Google Drive</option>
                <option value="figma">Figma</option>
                <option value="github">GitHub</option>
                <option value="docs">Google Docs</option>
                <option value="portal">Portal Submission</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kompetisi *
              </label>
              <select
                value={competitionId}
                onChange={(e) => setCompetitionId(e.target.value)}
                className="input-base"
                required
              >
                <option value="">— Pilih —</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1">
              Simpan Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VaultPage() {
  const { state, dispatch } = useAppState();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "general" | "competition">("all");
  const [activeTab, setActiveTab] = useState<"files" | "links">("files");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const filteredFiles = useMemo(() => {
    return state.vaultFiles.filter((f) => {
      const matchSearch =
        !search ||
        f.file_name.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase()) ||
        f.competition_title?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "general" && f.is_general) ||
        (filter === "competition" && !f.is_general);
      return matchSearch && matchFilter;
    });
  }, [state.vaultFiles, search, filter]);

  const allLinks = useMemo(() => {
    return state.competitions.flatMap((c) =>
      c.links.map((l) => ({ ...l, competitionTitle: c.title }))
    );
  }, [state.competitions]);

  const filteredLinks = useMemo(() => {
    if (!search) return allLinks;
    const q = search.toLowerCase();
    return allLinks.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.competitionTitle?.toLowerCase().includes(q)
    );
  }, [allLinks, search]);

  function handleDeleteFile(id: string) {
    if (confirm("Hapus berkas ini dari Vault?")) {
      dispatch({ type: "DELETE_VAULT_FILE", payload: id });
    }
  }

  const generalFiles = state.vaultFiles.filter((f) => f.is_general);
  const competitionFiles = state.vaultFiles.filter((f) => !f.is_general);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Dokumen & Link Vault</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {state.vaultFiles.length} berkas &bull; {allLinks.length} link cloud
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" />
            Tambah Link
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Berkas
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(["files", "links"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-colors",
              activeTab === tab
                ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            {tab === "files"
              ? `Berkas (${state.vaultFiles.length})`
              : `Link Cloud (${allLinks.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "files" ? "Cari berkas..." : "Cari link..."}
            className="input-base pl-9"
          />
        </div>
        {activeTab === "files" && (
          <div className="flex gap-1.5">
            {[
              { value: "all", label: "Semua" },
              { value: "general", label: "Berkas Umum" },
              { value: "competition", label: "Per Lomba" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as any)}
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
        )}
      </div>

      {/* FILES TAB */}
      {activeTab === "files" && (
        <div className="space-y-6">
          {/* General Vault */}
          {(filter === "all" || filter === "general") && generalFiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Berkas Umum (Reusable)</h2>
                <span className="text-xs text-slate-500">{generalFiles.length} file</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {generalFiles
                  .filter((f) => !search || f.file_name.toLowerCase().includes(search.toLowerCase()))
                  .map((file) => (
                    <FileCard key={file.id} file={file} onDelete={() => handleDeleteFile(file.id)} />
                  ))}
              </div>
            </div>
          )}

          {/* Competition Files */}
          {(filter === "all" || filter === "competition") && competitionFiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Berkas Per Kompetisi</h2>
                <span className="text-xs text-slate-500">{competitionFiles.length} file</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {competitionFiles
                  .filter(
                    (f) =>
                      !search ||
                      f.file_name.toLowerCase().includes(search.toLowerCase()) ||
                      f.competition_title?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((file) => (
                    <FileCard key={file.id} file={file} onDelete={() => handleDeleteFile(file.id)} />
                  ))}
              </div>
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {search ? "Tidak ada berkas yang cocok" : "Belum ada berkas tersimpan"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* LINKS TAB */}
      {activeTab === "links" && (
        <div className="space-y-3">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Belum ada link tersimpan. Klik &quot;Tambah Link&quot; di atas untuk menambahkan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredLinks.map((link) => {
                const config = LINK_TYPE_ICON[link.link_type] ?? LINK_TYPE_ICON.other;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all",
                      config.bg
                    )}
                  >
                    <span className="text-2xl">{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-bold truncate", config.color)}>
                        {link.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{link.url}</p>
                      {link.competitionTitle && (
                        <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-0.5 truncate font-medium">
                          {link.competitionTitle}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-400 flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        competitions={state.competitions}
      />
      <AddLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        competitions={state.competitions}
      />
    </div>
  );
}
