"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff, Clock, Globe, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { NotificationPrefs } from "@/lib/types";

const TIMEZONES = [
  { value: "America/New_York",    label: "Eastern (ET)" },
  { value: "America/Chicago",     label: "Central (CT)" },
  { value: "America/Denver",      label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "Europe/London",       label: "London (GMT/BST)" },
  { value: "Europe/Paris",        label: "Paris (CET)" },
  { value: "Europe/Warsaw",       label: "Warsaw (CET)" },
  { value: "Asia/Kolkata",        label: "India (IST)" },
  { value: "Asia/Singapore",      label: "Singapore (SGT)" },
  { value: "Asia/Tokyo",          label: "Tokyo (JST)" },
  { value: "Australia/Sydney",    label: "Sydney (AEST)" },
];

function hourLabel(h: number): string {
  if (h === 0)  return "12:00 AM (midnight)";
  if (h < 12)   return `${h}:00 AM`;
  if (h === 12) return "12:00 PM (noon)";
  return `${h - 12}:00 PM`;
}

interface Props {
  initial: NotificationPrefs;
  unsubscribeSuccess?: boolean;
}

export default function NotificationPrefsForm({ initial, unsubscribeSuccess }: Props) {
  const [prefs, setPrefs] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setError("");
    setSaved(false);
    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            daily_email: prefs.daily_email,
            delivery_hour: prefs.delivery_hour,
            tz: prefs.tz,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
        setSaved(true);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not save preferences");
      }
    });
  }

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/[0.07] p-6 max-w-lg">
      {unsubscribeSuccess && (
        <div className="flex items-center gap-2 mb-5 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
          <CheckCircle2 size={14} /> You&apos;ve been unsubscribed from the daily digest.
        </div>
      )}

      {/* Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
            prefs.daily_email
              ? "bg-[#D4956A]/15 border-[#D4956A]/30"
              : "bg-white/[0.03] border-white/[0.08]"
          }`}>
            {prefs.daily_email
              ? <Bell size={16} className="text-[#D4956A]" />
              : <BellOff size={16} className="text-[#4A4A4A]" />}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Daily Morning Brew</p>
            <p className="text-[#5A5A5A] text-xs">
              {prefs.daily_email
                ? "You'll receive today's curated articles by email"
                : "Email digest is currently off"}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={() => set("daily_email", !prefs.daily_email)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            prefs.daily_email ? "bg-[#D4956A]" : "bg-[#2A2A2A] border border-white/[0.08]"
          }`}
          role="switch"
          aria-checked={prefs.daily_email}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              prefs.daily_email ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Delivery settings — only shown when enabled */}
      {prefs.daily_email && (
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          {/* Delivery time */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider mb-2">
              <Clock size={11} /> Delivery time
            </label>
            <select
              value={prefs.delivery_hour}
              onChange={(e) => set("delivery_hour", Number(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#D0D0D0] text-sm focus:outline-none focus:border-[#D4956A]/40 transition-colors"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{hourLabel(i)}</option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider mb-2">
              <Globe size={11} /> Timezone
            </label>
            <select
              value={prefs.tz}
              onChange={(e) => set("tz", e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#D0D0D0] text-sm focus:outline-none focus:border-[#D4956A]/40 transition-colors"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="mt-5 flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
          Save preferences
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
            <CheckCircle2 size={13} /> Saved
          </span>
        )}
        {error && <span className="text-[#F45B69] text-xs">{error}</span>}
      </div>
    </div>
  );
}
