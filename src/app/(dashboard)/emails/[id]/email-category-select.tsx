"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const options = [
  { value: "return_request", label: "Return Request" },
  { value: "technical_support", label: "Technical Support" },
  { value: "missing_item", label: "Missing Item" },
  { value: "inspection_request", label: "Inspection Request" },
  { value: "others", label: "Others" },
];

export function EmailCategorySelect({
  emailId,
  currentCategory,
}: {
  emailId: string;
  currentCategory: string;
}) {
  const [value, setValue] = useState(currentCategory);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = e.target.value;
    setValue(newVal);
    setSaving(true);

    await supabase
      .from("wb_emails")
      .update({ category: newVal })
      .eq("id", emailId);

    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={saving}
      className="w-full rounded border px-2.5 py-1.5 text-sm bg-white disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
