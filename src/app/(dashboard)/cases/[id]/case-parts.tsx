"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Part {
  id: string;
  part_name: string;
  quantity: number;
  fulfilled: boolean;
  notes: string | null;
  products: { name: string; model_number: string } | null;
  skus: { sku_code: string } | null;
}

export function CaseParts({
  caseId,
  parts,
}: {
  caseId: string;
  parts: Part[];
}) {
  const [adding, setAdding] = useState(false);
  const [partName, setPartName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const supabase = createClient();
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!partName.trim()) return;

    await supabase.from("wb_case_parts").insert({
      case_id: caseId,
      part_name: partName.trim(),
      quantity,
    });

    setPartName("");
    setQuantity(1);
    setAdding(false);
    router.refresh();
  }

  async function toggleFulfilled(partId: string, current: boolean) {
    await supabase
      .from("wb_case_parts")
      .update({ fulfilled: !current })
      .eq("id", partId);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {parts.length === 0 && !adding && (
        <p className="text-sm text-gray-400">No parts linked</p>
      )}

      {parts.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between border rounded px-3 py-2 text-sm"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={p.fulfilled}
              onChange={() => toggleFulfilled(p.id, p.fulfilled)}
              className="rounded"
            />
            <span className={p.fulfilled ? "line-through text-gray-400" : ""}>
              {p.part_name}
            </span>
            {p.skus && (
              <span className="text-xs font-mono text-gray-400">
                {p.skus.sku_code}
              </span>
            )}
          </div>
          <span className="text-gray-500">x{p.quantity}</span>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="Part name"
            className="flex-1 rounded border px-3 py-2 text-sm"
            autoFocus
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            className="w-16 rounded border px-2 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded bg-gray-800 px-3 py-2 text-sm text-white"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="rounded border px-3 py-2 text-sm"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add Part
        </button>
      )}
    </div>
  );
}
