import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      return NextResponse.redirect(`${origin}${next}`);
    }
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Fall through to error redirect
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
}
