// =============================================================================
// CompeteFlow — Core Type Definitions
// =============================================================================

export type CompetitionStatus =
  | "draft"
  | "registered"
  | "in_progress"
  | "finalist"
  | "completed"
  | "archived";

export type CompetitionLevel =
  | "university"
  | "regional"
  | "national"
  | "international";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskCategory = "competition" | "college" | "work" | "personal";

export type LinkType =
  | "drive"
  | "figma"
  | "github"
  | "docs"
  | "portal"
  | "other";

export type ExpenseType = "registration" | "operational" | "prize" | "reimbursement" | "expense";

export type FinalResult =
  | "champion_1"
  | "champion_2"
  | "champion_3"
  | "runner_up"
  | "finalist"
  | "semifinalist"
  | "honorable_mention"
  | "participant";

// -----------------------------------------------------------------------------
// Stage / Milestone
// -----------------------------------------------------------------------------
export interface Stage {
  id: string;
  competition_id?: string;
  stage_name: string;
  deadline: string; // ISO string
  stage_order: number;
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
}

// -----------------------------------------------------------------------------
// Competition Link
// -----------------------------------------------------------------------------
export interface CompetitionLink {
  id: string;
  label: string;
  url: string;
  link_type: LinkType;
  competition_id?: string;
}

// -----------------------------------------------------------------------------
// Competition
// -----------------------------------------------------------------------------
export interface Competition {
  id: string;
  user_id?: string;
  title: string;
  organizer: string;
  category: string;
  level: CompetitionLevel;
  status: CompetitionStatus;
  official_url?: string;
  contact_person?: string;
  notes?: string;
  registration_fee: number;
  target_prize: number;
  stages: Stage[];
  links: CompetitionLink[];
  created_at?: string;
  updated_at?: string;
}

// -----------------------------------------------------------------------------
// Task
// -----------------------------------------------------------------------------
export interface Task {
  id: string;
  user_id?: string;
  title: string;
  notes?: string;
  category: TaskCategory;
  priority: TaskPriority;
  due_date?: string; // ISO string, optional
  is_completed: boolean;
  completed_at?: string;
  competition_id?: string;
  competition_title?: string;
  stage_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Computed task with priority score
export interface PrioritizedTask extends Task {
  priority_score: number;
  hours_until_due?: number;
}

// -----------------------------------------------------------------------------
// Vault File
// -----------------------------------------------------------------------------
export interface VaultFile {
  id: string;
  user_id?: string;
  file_name: string;
  category: string;
  file_size: string; // formatted string for display, e.g. "2.4 MB"
  file_size_bytes?: number;
  mime_type?: string;
  is_general: boolean;
  competition_id?: string;
  competition_title?: string;
  storage_path?: string;
  created_at?: string;
}

// -----------------------------------------------------------------------------
// Expense & Income Record
// -----------------------------------------------------------------------------
export interface ExpenseRecord {
  id: string;
  user_id?: string;
  competition_id?: string;
  competition_title: string;
  description: string;
  type: ExpenseType;
  amount: number;
  date: string; // ISO date string
  receipt_url?: string;
  created_at?: string;
}

// Financial summary per competition
export interface FinancialSummary {
  competition_id: string;
  competition_title: string;
  total_expense: number;
  total_income: number;
  net_result: number;
  reimbursement_pending: number;
  reimbursement_received: number;
}

// -----------------------------------------------------------------------------
// Retrospective / Achievement
// -----------------------------------------------------------------------------
export interface Retrospective {
  id: string;
  user_id?: string;
  competition_id: string;
  competition_title?: string;
  competition_category?: string;
  competition_level?: CompetitionLevel;
  final_result: FinalResult;
  prize_amount: number;
  certificate_file_path?: string;
  what_went_well?: string;
  what_to_improve?: string;
  judge_feedback?: string;
  tags?: string[];
  year?: number;
  created_at?: string;
  updated_at?: string;
}

// Achievement statistics
export interface AchievementStats {
  total_competitions: number;
  wins: number; // champion_1 | champion_2 | champion_3
  finalists: number; // finalist | semifinalist
  win_rate: number; // wins / total_completed * 100
  finalist_rate: number; // finalists / total_completed * 100
  total_prize_earned: number;
}

// -----------------------------------------------------------------------------
// Telegram Notification
// -----------------------------------------------------------------------------
export interface NotificationLog {
  id: string;
  user_id: string;
  stage_id?: string;
  task_id?: string;
  channel: "telegram";
  notification_type: "D-7" | "D-3" | "D-1" | "D-0" | "daily_digest";
  message_sent: string;
  sent_at: string;
  status: "delivered" | "failed" | "pending";
}

// User Telegram config
export interface TelegramConfig {
  telegram_chat_id?: string;
  telegram_username?: string;
  notification_enabled: boolean;
}

// -----------------------------------------------------------------------------
// User Profile
// -----------------------------------------------------------------------------
export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  telegram_chat_id?: string;
  telegram_username?: string;
  notification_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

// -----------------------------------------------------------------------------
// Dashboard Stats
// -----------------------------------------------------------------------------
export interface DashboardStats {
  active_competitions: number;
  pending_tasks: number;
  completed_tasks: number;
  upcoming_deadlines_7d: number;
  urgent_deadlines_3d: number;
}

// Quick action types
export type QuickActionType = "competition" | "task" | "expense";
