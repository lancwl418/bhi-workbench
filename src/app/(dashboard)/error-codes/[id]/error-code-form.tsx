"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ErrorCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  possible_causes: string | null;
  solution: string | null;
  severity: string;
}

const severities = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

export function ErrorCodeForm({ errorCode }: { errorCode: ErrorCode }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const form = new FormData(e.currentTarget);

    const { error } = await supabase
      .from("wb_error_codes")
      .update({
        code: (form.get("code") as string).trim(),
        name: (form.get("name") as string).trim(),
        description: (form.get("description") as string) || null,
        possible_causes: (form.get("possible_causes") as string) || null,
        solution: (form.get("solution") as string) || null,
        severity: form.get("severity") as string,
      })
      .eq("id", errorCode.id);

    setSaving(false);
    if (error) {
      alert(error.message);
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              name="code"
              defaultValue={errorCode.code}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono font-semibold"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              defaultValue={errorCode.name}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              name="severity"
              defaultValue={errorCode.severity}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {severities.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={errorCode.description || ""}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="What this error code means..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Possible Causes</label>
          <textarea
            name="possible_causes"
            defaultValue={errorCode.possible_causes || ""}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Why this error might occur..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
          <textarea
            name="solution"
            defaultValue={errorCode.solution || ""}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="How to resolve this error..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm text-green-600">Saved</span>
        )}
      </div>
    </form>
  );
}
