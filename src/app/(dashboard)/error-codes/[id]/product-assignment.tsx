"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ProductPicker } from "../product-picker";

interface Assignment {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    model_number: string;
    category: string;
  } | null;
}

export function ProductAssignment({
  errorCodeId,
  assignments,
}: {
  errorCodeId: string;
  assignments: Assignment[];
}) {
  const currentIds = assignments.map((a) => a.product_id);
  const [selected, setSelected] = useState<string[]>(currentIds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const toAdd = selected.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !selected.includes(id));

    if (toRemove.length > 0) {
      await supabase
        .from("wb_error_code_products")
        .delete()
        .eq("error_code_id", errorCodeId)
        .in("product_id", toRemove);
    }

    if (toAdd.length > 0) {
      await supabase.from("wb_error_code_products").insert(
        toAdd.map((pid) => ({
          error_code_id: errorCodeId,
          product_id: pid,
        }))
      );
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  const hasChanges =
    selected.length !== currentIds.length ||
    selected.some((id) => !currentIds.includes(id));

  return (
    <div className="space-y-3">
      <ProductPicker selected={selected} onChange={setSelected} />

      {hasChanges && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-xs text-green-600">Saved</span>}
        </div>
      )}
    </div>
  );
}
