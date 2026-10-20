"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { AppStateProvider, useAppState } from "@/lib/context/AppStateContext";
import { NewCompetitionModal } from "@/components/competition/NewCompetitionModal";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [isNewCompModalOpen, setIsNewCompModalOpen] = useState(false);
  const { state } = useAppState();

  const activeCompetitions = state.competitions.filter(
    (c) => c.status !== "archived" && c.status !== "completed"
  ).length;
  const pendingTasks = state.tasks.filter((t) => !t.is_completed).length;

  return (
    <div className="min-h-screen bg-[#f6f8fc] dark:bg-[#0f1322] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar — desktop only */}
      <Sidebar
        activeCompetitions={activeCompetitions}
        pendingTasks={pendingTasks}
      />

      {/* Main content area */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        <TopNav onQuickAdd={() => setIsNewCompModalOpen(true)} />
        <main className="flex-1 px-4 sm:px-8 py-7 pb-24 lg:pb-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Global New Competition Modal */}
      <NewCompetitionModal
        isOpen={isNewCompModalOpen}
        onClose={() => setIsNewCompModalOpen(false)}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppStateProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AppStateProvider>
  );
}
