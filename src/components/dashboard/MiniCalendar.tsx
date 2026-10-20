"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  deadlineDates: Date[];
}

export function MiniCalendar({ deadlineDates }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Offset for day-of-week alignment (Mon=0)
  const startDow = (getDay(monthStart) + 6) % 7; // 0=Mon
  const paddingDays = Array.from({ length: startDow });

  const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  function hasDeadline(date: Date) {
    return deadlineDates.some((d) => isSameDay(d, date));
  }

  function getDeadlineCount(date: Date) {
    return deadlineDates.filter((d) => isSameDay(d, date)).length;
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-200 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: idLocale })}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-1 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Padding days */}
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day) => {
          const deadline = hasDeadline(day);
          const count = getDeadlineCount(day);
          const todayDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "relative flex items-center justify-center rounded-xl text-[11px] h-7 w-7 mx-auto font-bold transition-all",
                todayDay &&
                  "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30",
                !todayDay &&
                  deadline &&
                  "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-extrabold ring-1 ring-rose-500/25",
                !todayDay &&
                  !deadline &&
                  "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
              )}
            >
              {format(day, "d")}
              {deadline && !todayDay && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-600" />
          <span className="text-[10px] font-semibold text-slate-500">Hari ini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-[10px] font-semibold text-slate-500">Deadline</span>
        </div>
      </div>
    </div>
  );
}
