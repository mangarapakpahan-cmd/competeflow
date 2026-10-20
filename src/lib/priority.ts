/**
 * CompeteFlow — Smart Priority Algorithm
 *
 * Priority Score formula (deterministic, documented):
 *
 * base_priority_weight:
 *   urgent = 1000
 *   high   = 500
 *   medium = 200
 *   low    = 50
 *
 * deadline_urgency:
 *   < 2 hours  → +5000
 *   < 24 hours → +3000
 *   < 48 hours → +2000  (competition tasks with deadline <48h get elevated)
 *   < 72 hours → +1000
 *   < 7 days   → +200
 *   no deadline → 0
 *
 * category_weight:
 *   competition → +100
 *   college     → +50
 *   work        → +30
 *   personal    → +10
 *
 * Final score = base_priority_weight + deadline_urgency + category_weight
 * Higher score = higher priority (displayed at top)
 *
 * Completed tasks are excluded before sorting.
 */

import { Task, PrioritizedTask, TaskPriority, TaskCategory } from "@/types";

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 1000,
  high: 500,
  medium: 200,
  low: 50,
};

const CATEGORY_WEIGHTS: Record<TaskCategory, number> = {
  competition: 100,
  college: 50,
  work: 30,
  personal: 10,
};

function getDeadlineUrgency(due_date: string | undefined, category: TaskCategory): number {
  if (!due_date) return 0;

  const now = new Date();
  const due = new Date(due_date);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs < 0) {
    // Overdue: very high urgency
    return 6000;
  }

  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 2) return 5000;
  if (diffHours < 24) return 3000;
  // Competition tasks with <48h deadline: elevated priority per PRD
  if (diffHours < 48) return category === "competition" ? 2500 : 2000;
  if (diffHours < 72) return 1000;
  if (diffHours < 168) return 200; // <7 days
  return 0;
}

export function calculatePriorityScore(task: Task): number {
  const base = PRIORITY_WEIGHTS[task.priority] ?? 50;
  const deadline = getDeadlineUrgency(task.due_date, task.category);
  const category = CATEGORY_WEIGHTS[task.category] ?? 10;
  return base + deadline + category;
}

/**
 * Sorts active (non-completed) tasks by priority score descending.
 * Completed tasks are filtered out.
 */
export function getPrioritizedTasks(tasks: Task[]): PrioritizedTask[] {
  return tasks
    .filter((t) => !t.is_completed)
    .map((t) => {
      const score = calculatePriorityScore(t);
      const hoursUntilDue = t.due_date
        ? (new Date(t.due_date).getTime() - Date.now()) / (1000 * 60 * 60)
        : undefined;
      return { ...t, priority_score: score, hours_until_due: hoursUntilDue };
    })
    .sort((a, b) => b.priority_score - a.priority_score);
}

/**
 * Returns tasks due today (for Daily Agenda widget).
 */
export function getTodayTasks(tasks: Task[]): Task[] {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return tasks.filter((t) => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    return due >= todayStart && due < todayEnd;
  });
}

/**
 * Returns true if a task is overdue.
 */
export function isOverdue(task: Task): boolean {
  if (!task.due_date || task.is_completed) return false;
  return new Date(task.due_date) < new Date();
}

/**
 * Returns true if a stage deadline is within N days.
 */
export function isUrgentDeadline(deadline: string, withinDays: number): boolean {
  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= withinDays;
}
