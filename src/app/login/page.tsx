"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Chrome } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Demo mode: direct redirect
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      await new Promise((r) => setTimeout(r, 600));
      window.location.href = "/dashboard";
      return;
    }

    // Supabase auth
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      window.location.href = "/dashboard";
      return;
    }
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setError("Google sign-in gagal.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tight">
              <span className="text-slate-900 dark:text-white">Compete</span>
              <span className="text-green-500">Flow</span>
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Kelola kompetisi, deadline & prestasi dalam satu platform
          </p>
        </div>

        {/* Card */}
        <div className="card p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Masuk ke Akun</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              Daftar gratis
            </Link>
          </p>

          {/* Demo mode notice */}
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2">
              <Zap className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400">Mode Demo Aktif</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Klik masuk untuk langsung menjelajahi aplikasi dengan database lokal. Tidak perlu akun nyata.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  className="input-base pl-9"
                  required={process.env.NEXT_PUBLIC_DEMO_MODE !== "true"}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-9 pr-10"
                  required={process.env.NEXT_PUBLIC_DEMO_MODE !== "true"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full btn-primary flex items-center justify-center gap-2",
                isLoading && "opacity-60 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400">atau</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full btn-secondary flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Chrome className="w-4 h-4 text-blue-500" />
            Masuk dengan Google
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-600 mt-4">
          CompeteFlow © 2026 — Platform manajemen kompetisi pribadi
        </p>
      </div>
    </div>
  );
}
