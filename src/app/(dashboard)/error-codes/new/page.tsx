"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductPicker } from "../product-picker";

const severities = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

export default function NewErrorCodePage() {
  const [saving, setSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);

    const data: Record<string, unknown> = {
      code: (form.get("code") as string).trim(),
      name: (form.get("name") as string).trim(),
      description: (form.get("description") as string) || null,
      possible_causes: (form.get("possible_causes") as string) || null,
      solution: (form.get("solution") as string) || null,
      severity: form.get("severity") as string,
    };

    // Upload PDF if provided
    if (docFile) {
      const path = `${crypto.randomUUID()}/${docFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("error-code-docs")
        .upload(path, docFile, { contentType: docFile.type });

      if (!uploadError) {
        data.doc_storage_path = path;
        data.doc_file_name = docFile.name;
      }
    }

    const { data: created, error } = await supabase
      .from("wb_error_codes")
      .insert(data)
      .select()
      .single();

    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }

    // Assign products
    if (selectedProducts.length > 0) {
      await supabase.from("wb_error_code_products").insert(
        selectedProducts.map((pid) => ({
          error_code_id: created.id,
          product_id: pid,
        }))
      );
    }

    setSaving(false);
    router.push(`/error-codes/${created.id}`);
    router.refresh();
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link
        href="/error-codes"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Error Codes
      </Link>

      <h2 className="text-lg font-semibold mt-4 mb-6">New Error Code</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Code *</label>
            <input
              name="code"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
              placeholder="E1"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="High Pressure Protection"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Severity</label>
          <select
            name="severity"
            defaultValue="warning"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {severities.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="What this error code means..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Possible Causes</label>
          <textarea
            name="possible_causes"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Why this error might occur..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Solution</label>
          <textarea
            name="solution"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="How to resolve this error..."
          />
        </div>

        {/* PDF Document */}
        <div>
          <label className="block text-sm font-medium mb-1">Reference Document (PDF)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {docFile ? "Change File" : "Upload PDF"}
            </button>
            {docFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 8V2l6 6h-6z" />
                </svg>
                <span className="truncate max-w-[200px]">{docFile.name}</span>
                <button
                  type="button"
                  onClick={() => setDocFile(null)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Assignment */}
        <div>
          <label className="block text-sm font-medium mb-1">Applicable Products</label>
          <ProductPicker
            selected={selectedProducts}
            onChange={setSelectedProducts}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/error-codes"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating..." : "Create Error Code"}
          </button>
        </div>
      </form>
    </div>
  );
}
