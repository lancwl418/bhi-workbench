"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setResult(data.error || "Sync failed");
        return;
      }

      setResult(`Synced ${data.synced} new emails (${data.skipped} already existed)`);
      router.refresh();
    } catch {
      setResult("Sync failed — check console");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className="text-xs text-gray-500">{result}</span>
      )}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
      >
        <svg
          className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M4.031 9.865"
          />
        </svg>
        {syncing ? "Syncing..." : "Sync"}
      </button>
    </div>
  );
}
