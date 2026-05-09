"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseBookmarkResult {
  saved: boolean;
  saving: boolean;
  toggle: (e?: React.MouseEvent) => Promise<void>;
}

export function useBookmark(
  userId: string | undefined,
  articleId: string,
  initialSaved = false
): UseBookmarkResult {
  const supabase = createClient();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  const toggle = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!userId || saving) return;

    setSaving(true);
    if (saved) {
      await supabase.from("user_saves").delete().match({ user_id: userId, article_id: articleId });
      setSaved(false);
    } else {
      await supabase.from("user_saves").insert({ user_id: userId, article_id: articleId });
      setSaved(true);
    }
    setSaving(false);
  }, [userId, articleId, saved, saving, supabase]);

  return { saved, saving, toggle };
}
