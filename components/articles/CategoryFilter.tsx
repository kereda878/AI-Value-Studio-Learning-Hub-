"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";

interface CategoryFilterProps {
  counts: Record<string, number>;
  activeCategory?: string;
}

export default function CategoryFilter({ counts, activeCategory }: CategoryFilterProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-[#242424] rounded-xl border border-[#3A3A3A] p-3">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <LayoutGrid size={12} className="text-[#6A6A6A]" />
        <span className="text-[#6A6A6A] text-xs font-medium uppercase tracking-wider">Categories</span>
      </div>
      <div className="space-y-0.5">
        <Link href="/articles" className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory ? "bg-[#F45B69]/10 text-[#F45B69]" : "text-[#A0A0A0] hover:bg-[#2E2E2E] hover:text-[#F0F0F0]"}`}>
          <span>All Articles</span>
          <span className="text-xs text-[#6A6A6A]">{total}</span>
        </Link>
        {CATEGORIES.map(cat => {
          const color = CATEGORY_COLORS[cat];
          const isActive = activeCategory === cat;
          return (
            <Link
              key={cat}
              href={`/articles?category=${encodeURIComponent(cat)}`}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "text-[#F0F0F0]" : "text-[#A0A0A0] hover:bg-[#2E2E2E] hover:text-[#F0F0F0]"}`}
              style={isActive ? { backgroundColor: `${color}15` } : {}}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span style={isActive ? { color } : {}}>{cat}</span>
              </div>
              {counts[cat] != null && <span className="text-xs text-[#6A6A6A]">{counts[cat]}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
