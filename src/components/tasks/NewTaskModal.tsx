"use client";

import { useState } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { Task, TaskCategory, TaskPriority, Competition } from "@/types";
import { X, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitions?: Competition[];
  editTask?: Task;
  defaultCategory?: TaskCategory;
}

export function NewTaskModal({
  isOpen,
  onClose,
  competitions = [],
  editTask,
  defaultCategory = "personal",
}: NewTaskModalProps) {
  const { dispatch } = useAppState();
  const isEdit = !!editTask;

  const [title, setTitle] = useState(editTask?.title ?? "");
  const [notes, setNotes] = useState(editTask?.notes ?? "");
  const [category, setCategory] = useState<TaskCategory>(
    editTask?.category ?? defaultCategory
  );
  const [priority, setPriority] = useState<TaskPriority>(
    editTask?.priority ?? "medium"
  );
  const [dueDate, setDueDate] = useState(
    editTask?.due_date ? editTask.due_date.slice(0, 16) : ""
  );
  const [competitionId, setCompetitionId] = useState(
    editTask?.competition_id ?? ""
  );
  const [stageId, setStageId] = useState(editTask?.stage_id ?? "");

  const selectedComp = competitions.find((c) => c.id === competitionId);
  const availableStages = selectedComp?.stages || [];

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const task: Task = {
      id: editTask?.id ?? `task-${Date.now()}`,
      title: title.trim(),
      notes: notes || undefined,
      category,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      is_completed: editTask?.is_completed ?? false,
      competition_id: competitionId || undefined,
      competition_title: selectedComp?.title,
      stage_id: stageId || undefined,
      created_at: editTask?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      dispatch({ type: "UPDATE_TASK", payload: task });
    } else {
      dispatch({ type: "ADD_TASK", payload: task });
    }

    onClose();
  }

  const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
    { value: "urgent", label: "Mendesak", color: "badge-urgent" },
    { value: "high", label: "Tinggi", color: "badge-high" },
    { value: "medium", label: "Sedang", color: "badge-medium" },
    { value: "low", label: "Rendah", color: "badge-low" },
  ];

  const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
    { value: "competition", label: "🏆 Lomba" },
    { value: "college", label: "📚 Kuliah" },
    { value: "work", label: "💼 Kerja" },
    { value: "personal", label: "👤 Personal" },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content mx-4 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Tugas" : "Tambah Tugas Baru"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Judul Tugas *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deskripsi singkat tugas..."
              className="input-base"
              required
              autoFocus
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as TaskCategory;
                  setCategory(newCat);
                  if (newCat !== "competition") {
                    setCompetitionId("");
                    setStageId("");
                  }
                }}
                className="input-base"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="input-base"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Competition link */}
          {category === "competition" && competitions.length > 0 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tautkan ke Kompetisi
                </label>
                <select
                  value={competitionId}
                  onChange={(e) => {
                    setCompetitionId(e.target.value);
                    setStageId("");
                  }}
                  className="input-base"
                >
                  <option value="">— Tidak ditautkan —</option>
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {availableStages.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tahapan / Milestone (opsional)
                  </label>
                  <select
                    value={stageId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      setStageId(sId);
                      if (sId && !dueDate) {
                        const targetStage = availableStages.find((st) => st.id === sId);
                        if (targetStage?.deadline) {
                          setDueDate(targetStage.deadline.slice(0, 16));
                        }
                      }
                    }}
                    className="input-base"
                  >
                    <option value="">— Tidak ditautkan ke tahapan tertentu —</option>
                    {availableStages.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.stage_name} {st.is_completed ? "(Selesai)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Due date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Deadline (opsional)
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-base"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail tambahan, link, atau instruksi..."
              rows={2}
              className="input-base resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1">
              {isEdit ? "Simpan Perubahan" : "Tambah Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
