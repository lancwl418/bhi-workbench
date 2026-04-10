"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function CaseSolution({
  caseId,
  currentSolution,
}: {
  caseId: string;
  currentSolution: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [solution, setSolution] = useState(currentSolution || "");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("wb_cases")
      .update({ solution: solution.trim() || null })
      .eq("id", caseId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div>
        {currentSolution ? (
          <p className="text-sm whitespace-pre-wrap">{currentSolution}</p>
        ) : (
          <p className="text-sm text-gray-400">No solution recorded</p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          {currentSolution ? "Edit" : "Add Solution"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={solution}
        onChange={(e) => setSolution(e.target.value)}
        rows={3}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Describe how this issue was resolved..."
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-gray-800 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setSolution(currentSolution || "");
          }}
          className="rounded border px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
