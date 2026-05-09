"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TrackRead({ userId, articleId }: { userId: string; articleId: string }) {
  const supabase = createClient();

  useEffect(() => {
    async function track() {
      await supabase
        .from("user_reads")
        .upsert({ user_id: userId, article_id: articleId }, { onConflict: "user_id,article_id" });
      try {
        await supabase.rpc("increment_read_count", { article_id: articleId });
      } catch {}
    }
    track();
  }, [userId, articleId]);

  return null;
}
