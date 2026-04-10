"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_customer", label: "Awaiting Customer" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export function CaseStatusSelect({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    const update: Record<string, unknown> = { status: newStatus };

    if (newStatus === "resolved" || newStatus === "closed") {
      update.resolved_at = new Date().toISOString();
    }

    await supabase.from("wb_cases").update(update).eq("id", caseId);
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="rounded border px-3 py-2 text-sm font-medium"
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
