/**
 * CompeteFlow — Formatting Utilities
 */

import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

/**
 * Format a number as Indonesian Rupiah.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string, fmt = "d MMM yyyy"): string {
  try {
    return format(new Date(dateStr), fmt, { locale: idLocale });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date with time.
 */
export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, "d MMM yyyy, HH:mm");
}

/**
 * Human-readable relative time ("3 hari lagi", "kemarin", etc.)
 */
export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: idLocale,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Returns a countdown string for a deadline.
 */
export function getCountdown(deadline: string): {
  label: string;
  isUrgent: boolean;
  isPast: boolean;
  daysLeft: number;
} {
  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (isPast(due)) {
    return { label: "Sudah lewat", isUrgent: false, isPast: true, daysLeft: diffDays };
  }
  if (isToday(due)) {
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    return {
      label: diffHours <= 1 ? "Kurang dari 1 jam!" : `H-0 (${diffHours} jam)`,
      isUrgent: true,
      isPast: false,
      daysLeft: 0,
    };
  }
  if (isTomorrow(due)) {
    return { label: "Besok (H-1)!", isUrgent: true, isPast: false, daysLeft: 1 };
  }
  if (diffDays <= 3) {
    return { label: `H-${diffDays}`, isUrgent: true, isPast: false, daysLeft: diffDays };
  }
  if (diffDays <= 7) {
    return { label: `${diffDays} hari lagi`, isUrgent: false, isPast: false, daysLeft: diffDays };
  }
  return {
    label: formatDate(deadline, "d MMM"),
    isUrgent: false,
    isPast: false,
    daysLeft: diffDays,
  };
}

/**
 * Returns a color class based on deadline urgency.
 */
export function getDeadlineColorClass(daysLeft: number, isPastDeadline: boolean): string {
  if (isPastDeadline) return "text-red-500";
  if (daysLeft <= 1) return "text-red-400";
  if (daysLeft <= 3) return "text-amber-400";
  if (daysLeft <= 7) return "text-yellow-400";
  return "text-slate-300";
}

/**
 * Calculate competition progress from stages.
 */
export function calculateCompetitionProgress(
  stages: { is_completed: boolean }[]
): number {
  if (stages.length === 0) return 0;
  const completed = stages.filter((s) => s.is_completed).length;
  return Math.round((completed / stages.length) * 100);
}

/**
 * Label map for competition status (Indonesian).
 */
export const COMPETITION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  registered: "Terdaftar",
  in_progress: "Berlangsung",
  finalist: "Finalis",
  completed: "Selesai",
  archived: "Diarsipkan",
};

/**
 * Label map for competition levels (Indonesian).
 */
export const COMPETITION_LEVEL_LABELS: Record<string, string> = {
  university: "Kampus",
  regional: "Regional",
  national: "Nasional",
  international: "Internasional",
};

/**
 * Label map for task categories (Indonesian).
 */
export const TASK_CATEGORY_LABELS: Record<string, string> = {
  competition: "Lomba",
  college: "Kuliah",
  work: "Kerja",
  personal: "Personal",
};

/**
 * Label map for task priorities (Indonesian).
 */
export const TASK_PRIORITY_LABELS: Record<string, string> = {
  urgent: "Mendesak",
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

/**
 * Label map for final results (Indonesian).
 */
export const FINAL_RESULT_LABELS: Record<string, string> = {
  champion_1: "Juara 1",
  champion_2: "Juara 2",
  champion_3: "Juara 3",
  runner_up: "Runner Up / Harapan",
  finalist: "Finalis",
  semifinalist: "Semifinalis",
  honorable_mention: "Best Category",
  participant: "Peserta",
};

/**
 * Label map for expense types (Indonesian).
 */
export const EXPENSE_TYPE_LABELS: Record<string, string> = {
  registration: "Biaya Pendaftaran",
  operational: "Biaya Operasional",
  prize: "Hadiah / Pemasukan",
  reimbursement: "Reimbursement",
};
