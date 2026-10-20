"use client";

import { useState } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { Competition, Stage, CompetitionLink, CompetitionLevel, CompetitionStatus } from "@/types";
import { X, Trophy, Plus, Trash2, Link2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCompetition?: Competition;
}

const CATEGORIES = [
  "UI/UX Design",
  "Karya Tulis Ilmiah",
  "Hackathon / Software",
  "Business Plan",
  "Essay",
  "Desain Grafis",
  "Videografi / Fotografi",
  "Debat / Pidato",
  "Sains & Teknologi",
  "Lainnya",
];

const DEFAULT_STAGES = [
  "Registrasi & Pembayaran",
  "Pengumpulan Berkas Administrasi",
  "Submit Karya Tahap 1 / Penyisihan",
  "Pengumuman Tahap 1",
  "Pembuatan Prototipe / Slide Final",
  "Gladi Resik & Pitching / Presentasi",
  "Pengumuman Pemenang",
];

export function NewCompetitionModal({
  isOpen,
  onClose,
  editCompetition,
}: NewCompetitionModalProps) {
  const { dispatch } = useAppState();
  const isEdit = !!editCompetition;

  const [title, setTitle] = useState(editCompetition?.title ?? "");
  const [organizer, setOrganizer] = useState(editCompetition?.organizer ?? "");
  const [category, setCategory] = useState(editCompetition?.category ?? CATEGORIES[0]);
  const [level, setLevel] = useState<CompetitionLevel>(editCompetition?.level ?? "national");
  const [status, setStatus] = useState<CompetitionStatus>(editCompetition?.status ?? "draft");
  const [officialUrl, setOfficialUrl] = useState(editCompetition?.official_url ?? "");
  const [contactPerson, setContactPerson] = useState(editCompetition?.contact_person ?? "");
  const [registrationFee, setRegistrationFee] = useState(
    editCompetition?.registration_fee?.toString() ?? "0"
  );
  const [targetPrize, setTargetPrize] = useState(
    editCompetition?.target_prize?.toString() ?? "0"
  );
  const [notes, setNotes] = useState(editCompetition?.notes ?? "");

  // Stages
  const [stages, setStages] = useState<
    { name: string; deadline: string; notes: string }[]
  >(
    editCompetition?.stages.map((s) => ({
      name: s.stage_name,
      deadline: s.deadline ? s.deadline.slice(0, 16) : "",
      notes: s.notes ?? "",
    })) ??
      DEFAULT_STAGES.map((name) => ({ name, deadline: "", notes: "" }))
  );

  // Links
  const [links, setLinks] = useState<{ label: string; url: string; type: string }[]>(
    editCompetition?.links.map((l) => ({
      label: l.label,
      url: l.url,
      type: l.link_type,
    })) ?? []
  );

  const [activeTab, setActiveTab] = useState<"info" | "stages" | "links">("info");

  if (!isOpen) return null;

  function handleAddStage() {
    setStages((prev) => [...prev, { name: "", deadline: "", notes: "" }]);
  }

  function handleRemoveStage(i: number) {
    setStages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleAddLink() {
    setLinks((prev) => [...prev, { label: "", url: "", type: "drive" }]);
  }

  function handleRemoveLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !organizer.trim()) return;

    const newStages: Stage[] = stages
      .filter((s) => s.name.trim())
      .map((s, i) => ({
        id: editCompetition?.stages[i]?.id ?? `st-${Date.now()}-${i}`,
        competition_id: editCompetition?.id ?? `comp-${Date.now()}`,
        stage_name: s.name.trim(),
        deadline: s.deadline ? new Date(s.deadline).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        stage_order: i + 1,
        is_completed: editCompetition?.stages[i]?.is_completed ?? false,
        notes: s.notes || undefined,
      }));

    const newLinks: CompetitionLink[] = links
      .filter((l) => l.label.trim() && l.url.trim())
      .map((l, i) => ({
        id: editCompetition?.links[i]?.id ?? `l-${Date.now()}-${i}`,
        label: l.label.trim(),
        url: l.url.trim(),
        link_type: l.type as any,
        competition_id: editCompetition?.id ?? `comp-${Date.now()}`,
      }));

    const competition: Competition = {
      id: editCompetition?.id ?? `comp-${Date.now()}`,
      title: title.trim(),
      organizer: organizer.trim(),
      category,
      level,
      status,
      official_url: officialUrl || undefined,
      contact_person: contactPerson || undefined,
      registration_fee: parseFloat(registrationFee) || 0,
      target_prize: parseFloat(targetPrize) || 0,
      notes: notes || undefined,
      stages: newStages,
      links: newLinks,
      created_at: editCompetition?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      dispatch({ type: "UPDATE_COMPETITION", payload: competition });
    } else {
      dispatch({ type: "ADD_COMPETITION", payload: competition });
    }

    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content mx-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Kompetisi" : "Tambah Kompetisi Baru"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-6 pt-4">
          {(["info", "stages", "links"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {tab === "info" ? "Info Dasar" : tab === "stages" ? "Tahapan" : "Link & Vault"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* TAB: INFO */}
          {activeTab === "info" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Kompetisi *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Gemastik XIX — UX Design Competition"
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Penyelenggara *
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="Nama Institusi / Panitia"
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-base"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tingkat
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CompetitionLevel)}
                    className="input-base"
                  >
                    <option value="university">Kampus</option>
                    <option value="regional">Regional</option>
                    <option value="national">Nasional</option>
                    <option value="international">Internasional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CompetitionStatus)}
                    className="input-base"
                  >
                    <option value="draft">Draft</option>
                    <option value="registered">Terdaftar</option>
                    <option value="in_progress">Berlangsung</option>
                    <option value="finalist">Finalis</option>
                    <option value="completed">Selesai</option>
                    <option value="archived">Diarsipkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Biaya Pendaftaran (Rp)
                  </label>
                  <input
                    type="number"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value)}
                    min="0"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Hadiah (Rp)
                  </label>
                  <input
                    type="number"
                    value={targetPrize}
                    onChange={(e) => setTargetPrize(e.target.value)}
                    min="0"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    URL Portal Resmi
                  </label>
                  <input
                    type="url"
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    placeholder="https://..."
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kontak Panitia
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Email / WhatsApp panitia"
                    className="input-base"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Catatan
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan penting tentang kompetisi ini..."
                    rows={2}
                    className="input-base resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: STAGES */}
          {activeTab === "stages" && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Definisikan tahapan kompetisi beserta deadline masing-masing.
              </p>
              <div className="space-y-3">
                {stages.map((stage, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) =>
                          setStages((prev) =>
                            prev.map((s, idx) =>
                              idx === i ? { ...s, name: e.target.value } : s
                            )
                          )
                        }
                        placeholder="Nama tahapan..."
                        className="input-base flex-1 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(i)}
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-7">
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                          Deadline
                        </label>
                        <input
                          type="datetime-local"
                          value={stage.deadline}
                          onChange={(e) =>
                            setStages((prev) =>
                              prev.map((s, idx) =>
                                idx === i ? { ...s, deadline: e.target.value } : s
                              )
                            )
                          }
                          className="input-base py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                          Catatan
                        </label>
                        <input
                          type="text"
                          value={stage.notes}
                          onChange={(e) =>
                            setStages((prev) =>
                              prev.map((s, idx) =>
                                idx === i ? { ...s, notes: e.target.value } : s
                              )
                            )
                          }
                          placeholder="Persyaratan, format, dll."
                          className="input-base py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddStage}
                className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-green-500/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Tahapan
              </button>
            </div>
          )}

          {/* TAB: LINKS */}
          {activeTab === "links" && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simpan link penting — Google Drive, Figma, GitHub, dan portal submission.
              </p>
              <div className="space-y-3">
                {links.map((link, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          setLinks((prev) =>
                            prev.map((l, idx) =>
                              idx === i ? { ...l, label: e.target.value } : l
                            )
                          )
                        }
                        placeholder="Label link (contoh: Figma Prototype)"
                        className="input-base flex-1 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(i)}
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pl-6">
                      <div className="col-span-2">
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) =>
                            setLinks((prev) =>
                              prev.map((l, idx) =>
                                idx === i ? { ...l, url: e.target.value } : l
                              )
                            )
                          }
                          placeholder="https://..."
                          className="input-base py-2 text-xs"
                        />
                      </div>
                      <div>
                        <select
                          value={link.type}
                          onChange={(e) =>
                            setLinks((prev) =>
                              prev.map((l, idx) =>
                                idx === i ? { ...l, type: e.target.value } : l
                              )
                            )
                          }
                          className="input-base py-2 text-xs"
                        >
                          <option value="drive">Drive</option>
                          <option value="figma">Figma</option>
                          <option value="github">GitHub</option>
                          <option value="docs">Google Docs</option>
                          <option value="portal">Portal Submit</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-green-500/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Link
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1">
              {isEdit ? "Simpan Perubahan" : "Tambah Kompetisi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
