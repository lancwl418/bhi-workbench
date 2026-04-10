"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const outcomes = [
  { value: "refund", label: "Refund" },
  { value: "replacement", label: "Replacement" },
  { value: "repair", label: "Repair" },
  { value: "rejected", label: "Rejected" },
];

export function ReturnOutcome({
  returnId,
  currentOutcome,
  currentNotes,
}: {
  returnId: string;
  currentOutcome: string | null;
  currentNotes: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [outcome, setOutcome] = useState(currentOutcome || "");
  const [notes, setNotes] = useState(currentNotes || "");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("wb_returns")
      .update({
        outcome: outcome || null,
        outcome_notes: notes.trim() || null,
      })
      .eq("id", returnId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div>
        {currentOutcome ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">
                {outcomes.find((o) => o.value === currentOutcome)?.label ||
                  currentOutcome}
              </span>
            </p>
            {currentNotes && (
              <p className="text-gray-600 whitespace-pre-wrap">
                {currentNotes}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No outcome recorded</p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          {currentOutcome ? "Edit" : "Set Outcome"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <select
        value={outcome}
        onChange={(e) => setOutcome(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
      >
        <option value="">— Select outcome —</option>
        {outcomes.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Notes about the outcome..."
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
            setOutcome(currentOutcome || "");
            setNotes(currentNotes || "");
          }}
          className="rounded border px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
