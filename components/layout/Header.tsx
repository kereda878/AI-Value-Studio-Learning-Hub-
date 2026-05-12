"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Search, LogOut, Menu, X, Shield, Settings } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import type { Profile } from "@/lib/types";

export default function Header({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");

  const isAdmin = profile?.role === "admin";
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? "U";

  const navLinks = [
    { href: "/", label: "Morning Brew" },
    { href: "/articles", label: "Library" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
    { href: "/settings", label: "Settings" },
  ];

  async function signOut() {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      await fetch("/api/auth/demo-login", { method: "DELETE" });
    } else {
      await supabase.auth.signOut();
    }
    window.location.href = "/auth/login";
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) window.location.href = `/articles?q=${encodeURIComponent(q.trim())}`;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#111111]/95 header-blur border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F45B69]/30 to-[#D4956A]/20 border border-[#F45B69]/30 flex items-center justify-center shadow-[0_0_12px_rgba(244,91,105,0.2)] group-hover:shadow-[0_0_20px_rgba(244,91,105,0.35)] transition-shadow">
              <BookOpen size={15} className="text-[#F45B69]" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight hidden sm:block">{APP_NAME}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {navLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-white bg-white/[0.08]"
                      : "text-[#7A7A7A] hover:text-[#D0D0D0] hover:bg-white/[0.05]"
                  }`}
                >
                  {link.href === "/admin" && <Shield size={12} className="text-[#D4956A]" />}
                  {link.href === "/settings" && <Settings size={12} className="text-[#A0A0A0]" />}
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#F45B69] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A4A]" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search articles..."
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-[#D0D0D0] text-xs placeholder:text-[#4A4A4A] focus:outline-none focus:border-[#F45B69]/40 focus:bg-white/[0.06] w-44 transition-all"
              />
            </div>
          </form>

          {/* User controls */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-[#D4956A] bg-[#D4956A]/10 border border-[#D4956A]/20 px-2.5 py-1 rounded-full uppercase tracking-wide">
                <Shield size={9} /> Admin
              </span>
            )}

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F45B69]/40 to-[#D4956A]/40 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {initials}
            </div>

            <button
              onClick={signOut}
              title="Sign out"
              className="flex items-center gap-1.5 text-[#5A5A5A] hover:text-[#F45B69] transition-colors p-2 rounded-xl hover:bg-white/[0.05]"
            >
              <LogOut size={14} />
              <span className="hidden sm:block text-xs">Sign out</span>
            </button>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[#7A7A7A] p-1.5">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-white/[0.06] space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-white/[0.08] text-white"
                    : "text-[#7A7A7A] hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {link.href === "/admin" && <Shield size={12} className="text-[#D4956A]" />}
                {link.href === "/settings" && <Settings size={12} className="text-[#A0A0A0]" />}
                {link.label}
              </Link>
            ))}
            <form onSubmit={handleSearch} className="mt-3 px-1">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A4A]" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-[#D0D0D0] text-sm placeholder:text-[#4A4A4A] focus:outline-none focus:border-[#F45B69]/40"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
