"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      await new Promise((r) => setTimeout(r, 600));
      window.location.href = "/dashboard";
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      } else {
        setSuccess(true);
        setIsLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="card w-full max-w-md text-center p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cek Email Kamu!</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Kami telah mengirimkan link konfirmasi ke{" "}
            <span className="text-green-600 dark:text-green-400 font-semibold">{email}</span>. Klik
            link tersebut untuk mengaktifkan akunmu.
          </p>
          <Link href="/login" className="btn-primary inline-flex items-center gap-2">
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
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
          <p className="text-slate-600 dark:text-slate-400 text-sm">Mulai perjalanan kompetisimu sekarang</p>
        </div>

        <div className="card p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Buat Akun Baru</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              Masuk di sini
            </Link>
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap Kamu"
                  className="input-base pl-9"
                  required={process.env.NEXT_PUBLIC_DEMO_MODE !== "true"}
                />
              </div>
            </div>

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
                  placeholder="Min. 8 karakter"
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
                  Mendaftar...
                </>
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-600 mt-4">
          CompeteFlow © 2026 — Platform manajemen kompetisi pribadi
        </p>
      </div>
    </div>
  );
}
