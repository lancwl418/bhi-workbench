"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "initiated", label: "Initiated" },
  { value: "label_issued", label: "Label Issued" },
  { value: "in_transit", label: "In Transit" },
  { value: "received", label: "Received" },
  { value: "inspected", label: "Inspected" },
  { value: "completed", label: "Completed" },
];

export function ReturnStatusSelect({
  returnId,
  currentStatus,
}: {
  returnId: string;
  currentStatus: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    const update: Record<string, unknown> = { status: newStatus };

    if (newStatus === "completed") {
      update.completed_at = new Date().toISOString();
    }

    await supabase.from("wb_returns").update(update).eq("id", returnId);
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
