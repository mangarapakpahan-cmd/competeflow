"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { getCountdown, formatDate } from "@/lib/format";
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  ExternalLink,
  X,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "urgent" | "warning" | "info" | "success";
  link?: string;
  isRead: boolean;
}

export function NotificationCenter() {
  const { state } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [browserPerm, setBrowserPerm] = useState<string>("default");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  // Compute live notifications from real app state
  useEffect(() => {
    const list: NotificationItem[] = [];

    // 1. Check all uncompleted stages with upcoming deadlines
    state.competitions.forEach((comp) => {
      comp.stages.forEach((stage) => {
        if (!stage.is_completed) {
          const cd = getCountdown(stage.deadline);
          if (cd.isPast) {
            list.push({
              id: `stage-past-${stage.id}`,
              title: `Deadline Terlewat: ${stage.stage_name}`,
              message: `Tahapan pada lomba "${comp.title}" sudah melewati batas waktu.`,
              time: formatDate(stage.deadline, "d MMM, HH:mm"),
              type: "urgent",
              link: `/kompetisi/${comp.id}`,
              isRead: false,
            });
          } else if (cd.daysLeft <= 3) {
            list.push({
              id: `stage-urgent-${stage.id}`,
              title: `Mendesak (${cd.label}): ${stage.stage_name}`,
              message: `Batas waktu pengumpulan untuk "${comp.title}" semakin dekat!`,
              time: formatDate(stage.deadline, "d MMM, HH:mm"),
              type: cd.daysLeft <= 1 ? "urgent" : "warning",
              link: `/kompetisi/${comp.id}`,
              isRead: false,
            });
          }
        }
      });
    });

    // 2. Check overdue tasks
    const now = new Date();
    state.tasks.forEach((task) => {
      if (!task.is_completed && task.due_date) {
        const due = new Date(task.due_date);
        if (due < now) {
          list.push({
            id: `task-overdue-${task.id}`,
            title: `Tugas Terlambat: ${task.title}`,
            message: task.competition_title
              ? `Tugas lomba "${task.competition_title}" belum diselesaikan.`
              : "Tugas harian melewati batas waktu.",
            time: formatDate(task.due_date, "d MMM"),
            type: "urgent",
            link: "/tugas",
            isRead: false,
          });
        }
      }
    });

    // 3. System database notification
    list.push({
      id: "sys-db-active",
      title: "Database Lokal Aktif",
      message: "Data kompetisi, to-do, dan anggaran tersimpan otomatis di komputer Anda.",
      time: "Sistem",
      type: "success",
      link: "/admin",
      isRead: false,
    });

    setNotifications(list);
  }, [state.competitions, state.tasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const requestBrowserNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setBrowserPerm(permission);
      if (permission === "granted") {
        new Notification("CompeteFlow Siap!", {
          body: "Pengingat deadline otomatis dan notifikasi bot sekarang aktif di browser Anda.",
          icon: "/favicon.ico",
        });
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        title="Pusat Notifikasi"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-500/20">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Tandai dibaca
              </button>
            )}
          </div>

          {/* Browser Notification Banner if not granted */}
          {browserPerm !== "granted" && (
            <div className="p-3 bg-green-500/10 border-b border-green-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Izinkan notifikasi desktop untuk alert deadline seketika
                </p>
              </div>
              <button
                onClick={requestBrowserNotification}
                className="px-2.5 py-1 bg-green-600 dark:bg-green-500 hover:bg-green-500 text-slate-950 text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                Aktifkan
              </button>
            </div>
          )}

          {/* List of Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Tidak ada notifikasi baru saat ini.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer",
                    !item.isRead && "bg-slate-50/70 dark:bg-slate-800/30"
                  )}
                >
                  {/* Icon status */}
                  <div className="flex-shrink-0 mt-0.5">
                    {item.type === "urgent" && (
                      <div className="w-6 h-6 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {item.type === "warning" && (
                      <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {item.type === "success" && (
                      <div className="w-6 h-6 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {item.type === "info" && (
                      <div className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Trophy className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={cn(
                          "text-xs font-bold leading-snug",
                          item.type === "urgent"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-900 dark:text-white"
                        )}
                      >
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.time}
                      </span>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-semibold text-green-600 dark:text-green-400 hover:underline flex items-center gap-0.5"
                        >
                          Buka <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-center">
            <Link
              href="/notifikasi"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Pengaturan Bot Telegram & Notifikasi →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
