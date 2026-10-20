"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  CheckSquare,
  FolderOpen,
  Award,
  ShieldCheck,
} from "lucide-react";

const MOBILE_ITEMS = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
  { href: "/kompetisi", label: "Lomba", icon: Trophy },
  { href: "/tugas", label: "Tugas", icon: CheckSquare },
  { href: "/vault", label: "Vault", icon: FolderOpen },
  { href: "/prestasi", label: "Prestasi", icon: Award },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-only fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#181d33]/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 safe-area-pb transition-colors shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-colors min-w-[48px]",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
