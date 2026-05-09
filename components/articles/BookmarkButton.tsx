"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmark } from "@/lib/hooks/useBookmark";

interface BookmarkButtonProps {
  userId: string;
  articleId: string;
  initialSaved: boolean;
}

export default function BookmarkButton({ userId, articleId, initialSaved }: BookmarkButtonProps) {
  const { saved, saving, toggle } = useBookmark(userId, articleId, initialSaved);

  return (
    <button
      onClick={() => toggle()}
      disabled={saving}
      className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-colors ${
        saved
          ? "bg-[#D4956A]/10 border-[#D4956A]/30 text-[#D4956A]"
          : "bg-[#242424] border-[#3A3A3A] text-[#A0A0A0] hover:border-[#D4956A]/30 hover:text-[#D4956A]"
      }`}
    >
      {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
