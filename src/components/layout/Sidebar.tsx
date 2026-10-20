"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  CheckSquare,
  FolderOpen,
  Wallet,
  Award,
  Bell,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Flame,
} from "lucide-react";

const NAV_ITEMS = [
  {
    group: "MENU UTAMA",
    items: [
      {
        href: "/dashboard",
        label: "Dasbor",
        icon: LayoutDashboard,
        description: "Ringkasan & agenda",
      },
      {
        href: "/kompetisi",
        label: "Kompetisi",
        icon: Trophy,
        description: "Kelola lomba & milestone",
      },
      {
        href: "/tugas",
        label: "Tugas Harian",
        icon: CheckSquare,
        description: "Smart daily agenda",
      },
    ],
  },
  {
    group: "ASET & KEUANGAN",
    items: [
      {
        href: "/vault",
        label: "Dokumen & Link",
        icon: FolderOpen,
        description: "Vault berkas & cloud",
      },
      {
        href: "/keuangan",
        label: "Keuangan",
        icon: Wallet,
        description: "Budget & hadiah",
      },
    ],
  },
  {
    group: "EVALUASI",
    items: [
      {
        href: "/prestasi",
        label: "Prestasi & CV",
        icon: Award,
        description: "Pencapaian & retrospeksi",
      },
      {
        href: "/notifikasi",
        label: "Notifikasi Bot",
        icon: Bell,
        description: "Setup Telegram",
      },
    ],
  },
  {
    group: "SISTEM",
    items: [
      {
        href: "/admin",
        label: "Admin Panel",
        icon: ShieldCheck,
        description: "Database, backup & log",
      },
    ],
  },
];

interface SidebarProps {
  activeCompetitions?: number;
  pendingTasks?: number;
}

export function Sidebar({ activeCompetitions = 0, pendingTasks = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="desktop-only fixed left-0 top-0 h-full w-[240px] bg-white dark:bg-[#181d33] border-r border-slate-100 dark:border-slate-800/80 flex flex-col z-40 transition-colors shadow-[0_0_25px_rgba(0,0,0,0.02)]">
      {/* Friendly Logo */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Compete
            </span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              Flow
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-normal -mt-0.5">
              Personal Edition
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {group.group}
            </p>
            <ul className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "sidebar-item",
                        isActive && "sidebar-item-active"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-500"
                        )}
                      />
                      <span className="flex-1">{label}</span>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Friendly Promo Card & Settings */}
      <div className="px-3 pb-3 space-y-2.5">
        {/* Friendly Gradient Card (Inspired by reference "Upgrade to pro" card) */}
        <div className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/20 space-y-2 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-xs font-bold leading-tight">Target Juara 2026</p>
              <p className="text-[10px] text-white/80">Pantau progres lombamu</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[11px] font-semibold">
            <span>{activeCompetitions} Lomba Aktif</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
              {pendingTasks} Tugas
            </span>
          </div>
        </div>

        <Link
          href="/pengaturan"
          className={cn(
            "sidebar-item",
            pathname === "/pengaturan" && "sidebar-item-active"
          )}
        >
          <Settings
            className={cn(
              "w-4 h-4",
              pathname === "/pengaturan"
                ? "text-white"
                : "text-slate-400 dark:text-slate-500"
            )}
          />
          <span className="text-xs sm:text-sm">Pengaturan</span>
        </Link>
      </div>
    </aside>
  );
}
