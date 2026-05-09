"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
type Mode = "signin" | "signup";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState(IS_DEMO ? "demo@genpact.com" : "");
  const [password, setPassword] = useState(IS_DEMO ? "demo1234" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");

    if (IS_DEMO) {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials");
      }
      setLoading(false);
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      error ? setError(error.message) : (window.location.href = "/");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      error ? setError(error.message) : setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F45B69]/20 border border-[#F45B69]/30 flex items-center justify-center">
            <BookOpen size={20} className="text-[#F45B69]" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">{APP_NAME}</span>
        </div>
        <p className="text-[#A0A0A0] text-sm">{APP_TAGLINE}</p>
      </div>

      <div className="w-full max-w-md bg-[#242424] rounded-2xl border border-[#3A3A3A] p-8">

        {/* Demo banner */}
        {IS_DEMO && (
          <div className="mb-6 flex items-start gap-3 bg-[#D4956A]/10 border border-[#D4956A]/25 rounded-xl px-4 py-3">
            <Zap size={15} className="text-[#D4956A] mt-0.5 shrink-0" />
            <div>
              <p className="text-[#D4956A] text-xs font-semibold mb-1">Demo Mode — no account needed</p>
              <p className="text-[#A0A0A0] text-xs">Credentials are pre-filled. Just click Sign In.</p>
            </div>
          </div>
        )}

        <h2 className="text-white text-xl font-semibold mb-1">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h2>
        <p className="text-[#A0A0A0] text-sm mb-6">
          {mode === "signin" ? "Sign in to access your knowledge feed." : "Join the Genpact learning community."}
        </p>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-[#F45B69]/10 border border-[#F45B69]/30 text-[#F45B69] text-sm">{error}</div>}
        {message && <div className="mb-4 px-4 py-3 rounded-lg bg-[#D4956A]/10 border border-[#D4956A]/30 text-[#D4956A] text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@genpact.com" icon={<Mail size={15} />} />
          <div className="relative">
            <Input label="Password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" icon={<Lock size={15} />} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-2.5 text-[#6A6A6A] hover:text-[#A0A0A0]">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        {!IS_DEMO && (
          <div className="mt-5 text-center">
            <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}
              className="text-[#A0A0A0] text-sm hover:text-[#F45B69] transition-colors"
            >
              {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
