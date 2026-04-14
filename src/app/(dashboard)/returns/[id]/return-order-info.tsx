"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const platformOptions = [
  { value: "homedepot", label: "Home Depot" },
  { value: "lowes", label: "Lowe's" },
  { value: "dsco", label: "DSCO" },
  { value: "global_industry", label: "Global Industry" },
  { value: "website", label: "Website" },
  { value: "others", label: "Others" },
];

const platformLabels: Record<string, string> = Object.fromEntries(
  platformOptions.map((o) => [o.value, o.label])
);

export function ReturnOrderInfo({
  returnId,
  currentPoNumber,
  currentChannel,
}: {
  returnId: string;
  currentPoNumber: string | null;
  currentChannel: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [poNumber, setPoNumber] = useState(currentPoNumber || "");
  const [channel, setChannel] = useState(currentChannel || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("wb_returns")
      .update({
        po_number: poNumber || null,
        channel: channel || null,
      })
      .eq("id", returnId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Order Info</h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">PO Number</label>
            <input
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full rounded border px-2.5 py-1.5 text-sm"
              placeholder="e.g. PO-12345"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Platform</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full rounded border px-2.5 py-1.5 text-sm bg-white"
            >
              <option value="">Select platform...</option>
              {platformOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setPoNumber(currentPoNumber || "");
                setChannel(currentChannel || "");
                setEditing(false);
              }}
              className="rounded border px-2.5 py-1 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-blue-600 px-2.5 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-gray-400">PO Number</dt>
            <dd className={currentPoNumber ? "font-mono" : "text-gray-300"}>
              {currentPoNumber || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">Platform</dt>
            <dd className={currentChannel ? "" : "text-gray-300"}>
              {currentChannel ? platformLabels[currentChannel] || currentChannel : "—"}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
