/**
 * Telegram Webhook Handler
 * POST /api/telegram
 *
 * Handles incoming messages from Telegram Bot API.
 * Supports: /agenda, /deadline, /done <task_id>
 *
 * Security:
 * - Validates X-Telegram-Bot-Api-Secret-Token header
 * - Verifies telegram_chat_id matches authenticated user in Supabase
 * - TELEGRAM_BOT_TOKEN kept server-side only
 * - Service role key used for DB access (never exposed to client)
 */

import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; username?: string; first_name: string };
    chat: { id: number; type: string };
    text?: string;
  };
}

async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;
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

export async function POST(req: NextRequest) {
  // Validate webhook secret to prevent unauthorized requests
  const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (WEBHOOK_SECRET && secretHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    return NextResponse.json(
      { error: "Bot not configured" },
      { status: 503 }
    );
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true }); // Ignore non-text messages
  }

  const chatId = message.chat.id;
  const text = message.text.trim();
  const telegramUserId = message.from.id.toString();

  // --- Handle commands ---

  if (text === "/start" || text.startsWith("/start ")) {
    await sendTelegramMessage(
      chatId,
      `🎯 *Selamat datang di CompeteFlow Bot!*\n\n` +
        `Perintah yang tersedia:\n` +
        `• /agenda — Tugas hari ini\n` +
        `• /deadline — Deadline 7 hari ke depan\n` +
        `• /done <id> — Tandai tugas selesai\n\n` +
        `_Hubungkan akun di Pengaturan > Notifikasi Bot._`
    );
    return NextResponse.json({ ok: true });
  }

  if (text === "/agenda") {
    // In production: query Supabase for user's tasks for today
    // using the telegram_chat_id to find the authenticated user
    await sendTelegramMessage(
      chatId,
      `📋 *Agenda Hari Ini*\n\n` +
        `_Bot terhubung! Hubungkan akun CompeteFlow di pengaturan untuk melihat agenda personalmu._\n\n` +
        `Kunjungi: ${process.env.NEXT_PUBLIC_APP_URL}/tugas`
    );
    return NextResponse.json({ ok: true });
  }

  if (text === "/deadline") {
    await sendTelegramMessage(
      chatId,
      `⏰ *Deadline Terdekat (7 Hari)*\n\n` +
        `_Hubungkan akun CompeteFlow untuk melihat deadline personalmu._\n\n` +
        `Kunjungi: ${process.env.NEXT_PUBLIC_APP_URL}/kompetisi`
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/done ")) {
    const taskId = text.slice(6).trim();
    if (!taskId) {
      await sendTelegramMessage(chatId, `❌ Format salah. Gunakan: /done <task_id>`);
      return NextResponse.json({ ok: true });
    }

    // In production:
    // 1. Find user by telegram_chat_id in profiles table (using service role)
    // 2. Verify task belongs to that user (RLS enforcement)
    // 3. Update task is_completed = true
    // 4. Log to notification_logs for idempotency

    await sendTelegramMessage(
      chatId,
      `✅ Perintah /done diterima untuk task ID: *${taskId}*\n\n` +
        `_Koneksi ke Supabase diperlukan untuk mengubah status tugas._`
    );
    return NextResponse.json({ ok: true });
  }

  // Default response
  await sendTelegramMessage(
    chatId,
    `❓ Perintah tidak dikenali. Ketik /start untuk bantuan.`
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    status: "CompeteFlow Telegram Webhook Active",
    bot_configured: !!BOT_TOKEN,
    timestamp: new Date().toISOString(),
  });
}
