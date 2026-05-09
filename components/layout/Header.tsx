"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Search, LogOut, Menu, X, Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import type { Profile } from "@/lib/types";

export default function Header({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");

  const isAdmin = profile?.role === "admin";

  const navLinks = [
    { href: "/", label: "Morning Brew" },
    { href: "/articles", label: "All Articles" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: <Shield size={12} /> }] : []),
  ];

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) window.location.href = `/articles?q=${encodeURIComponent(q.trim())}`;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1A1A1A]/95 backdrop-blur border-b border-[#3A3A3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#F45B69]/15 border border-[#F45B69]/30 flex items-center justify-center">
              <BookOpen size={14} className="text-[#F45B69]" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight hidden sm:block">{APP_NAME}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-[#F45B69]/10 text-[#F45B69]"
                    : "text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#2E2E2E]"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search articles..."
                className="bg-[#242424] border border-[#3A3A3A] rounded-lg pl-8 pr-4 py-1.5 text-[#F0F0F0] text-xs placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#F45B69]/50 w-48"
              />
            </div>
          </form>

          {/* Admin badge + sign out */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-[#D4956A] bg-[#D4956A]/10 border border-[#D4956A]/20 px-2 py-0.5 rounded-full">
                <Shield size={10} /> Admin
              </span>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-[#6A6A6A] hover:text-[#F45B69] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#2E2E2E]"
              title="Sign out"
            >
              <LogOut size={15} />
              <span className="hidden sm:block text-xs">Sign out</span>
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[#A0A0A0] p-1.5">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-[#3A3A3A] space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href ? "bg-[#F45B69]/10 text-[#F45B69]" : "text-[#A0A0A0]"
                }`}
              >
                {link.icon}{link.label}
              </Link>
            ))}
            <form onSubmit={handleSearch} className="mt-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search articles..."
                  className="w-full bg-[#242424] border border-[#3A3A3A] rounded-lg pl-8 pr-4 py-2 text-[#F0F0F0] text-sm placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#F45B69]/50"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
