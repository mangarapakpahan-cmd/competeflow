import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeDays(dateStr: string): string {
  if (!dateStr) return "-";
  const now = new Date();
  const target = new Date(dateStr);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const pastDays = Math.abs(diffDays);
    return pastDays === 0 ? "Hari Ini (Lewat)" : `Lewat ${pastDays} hari`;
  }
  if (diffDays === 0) return "Hari Ini (H-0)";
  if (diffDays === 1) return "Besok (H-1)";
  if (diffDays <= 7) return `H-${diffDays} (${diffDays} hari)`;
  return `${diffDays} hari lagi`;
}

export * from "./format";
