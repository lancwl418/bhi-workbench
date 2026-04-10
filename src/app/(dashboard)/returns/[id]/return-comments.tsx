"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export function ReturnComments({
  returnId,
  comments,
}: {
  returnId: string;
  comments: Comment[];
}) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("wb_return_comments").insert({
      return_id: returnId,
      author_id: user?.id,
      author_name: user?.email || "Unknown",
      content: content.trim(),
    });

    setContent("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <p className="text-sm text-gray-400">No comments yet</p>
      )}

      {comments.map((c) => (
        <div key={c.id} className="border-l-2 border-gray-200 pl-3 py-1">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-medium text-gray-600">{c.author_name}</span>
            <span>{new Date(c.created_at).toLocaleString()}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="rounded bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
