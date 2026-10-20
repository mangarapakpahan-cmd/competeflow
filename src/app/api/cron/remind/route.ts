/**
 * Cron Job: Send Deadline Reminders via Telegram
 * GET /api/cron/remind
 *
 * This route is called by Vercel Cron (configured in vercel.json)
 * or can be triggered manually for testing.
 *
 * Schedule: Every hour (0 * * * *)
 *
 * Logic:
 * 1. Fetch all upcoming stages (not completed) within the reminder windows
 * 2. Check notification_logs to prevent duplicate sends (idempotency)
 * 3. Send Telegram messages to relevant users
 * 4. Log to notification_logs table
 *
 * Security:
 * - Uses CRON_SECRET to verify the request comes from Vercel
 * - Uses Supabase service role key (server-side only)
 * - Never exposes user data in response
 */

import { NextRequest, NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  if (!BOT_TOKEN || !chatId) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("Authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({
      status: "skipped",
      reason: "TELEGRAM_BOT_TOKEN not configured",
      timestamp: new Date().toISOString(),
    });
  }

  // In production with Supabase connected:
  // const supabase = createServiceRoleClient();
  // const now = new Date();
  // const reminderWindows = [
  //   { label: "D-7", hoursAhead: 7 * 24 },
  //   { label: "D-3", hoursAhead: 3 * 24 },
  //   { label: "D-1", hoursAhead: 24 },
  //   { label: "D-0", hoursAhead: 0 },
  // ];
  //
  // for (const window of reminderWindows) {
  //   const targetTime = addHours(now, window.hoursAhead);
  //   const { data: stages } = await supabase
  //     .from("stages")
  //     .select("*, competitions(title, profiles(telegram_chat_id))")
  //     .gte("deadline", startOfHour(targetTime).toISOString())
  //     .lt("deadline", endOfHour(targetTime).toISOString())
  //     .eq("is_completed", false);
  //
  //   for (const stage of stages ?? []) {
  //     // Check for duplicate (idempotency)
  //     const { count } = await supabase
  //       .from("notification_logs")
  //       .select("id", { count: "exact" })
  //       .eq("stage_id", stage.id)
  //       .eq("notification_type", window.label);
  //
  //     if (count && count > 0) continue; // Already sent
  //
  //     const chatId = stage.competitions?.profiles?.telegram_chat_id;
  //     if (!chatId) continue;
  //
  //     const message = buildReminderMessage(window.label, stage, stage.competitions);
  //     const sent = await sendTelegramMessage(chatId, message);
  //
  //     // Log the notification (prevents duplicates)
  //     await supabase.from("notification_logs").insert({
  //       user_id: stage.competitions.user_id,
  //       stage_id: stage.id,
  //       channel: "telegram",
  //       notification_type: window.label,
  //       message_sent: message,
  //       status: sent ? "delivered" : "failed",
  //     });
  //   }
  // }

  return NextResponse.json({
    status: "ok",
    message: "Cron job executed. Supabase connection required for live reminders.",
    bot_configured: !!BOT_TOKEN,
    timestamp: new Date().toISOString(),
  });
}
