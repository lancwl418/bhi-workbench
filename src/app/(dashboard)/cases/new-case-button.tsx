"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const categories = [
  { value: "missing_item", label: "Missing Item" },
  { value: "parts_request", label: "Parts Request" },
  { value: "installation", label: "Installation" },
  { value: "error_code", label: "Error Code" },
  { value: "product_malfunction", label: "Product Malfunction" },
  { value: "return_request", label: "Return Request" },
  { value: "warranty_claim", label: "Warranty Claim" },
  { value: "general_inquiry", label: "General Inquiry" },
];

const sources = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "platform", label: "Platform" },
  { value: "manual", label: "Manual" },
];

export function NewCaseButton() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      brand: form.get("brand") as string,
      source: form.get("source") as string,
      category: form.get("category") as string,
      subject: form.get("subject") as string,
      description: form.get("description") as string,
      customer_name: form.get("customer_name") as string,
      customer_email: form.get("customer_email") as string || null,
      customer_phone: form.get("customer_phone") as string || null,
      model_number: form.get("model_number") as string || null,
      error_code: form.get("error_code") as string || null,
      store: form.get("store") as string || null,
      po_number: form.get("po_number") as string || null,
    };

    const { data: created, error } = await supabase
      .from("wb_cases")
      .insert(data)
      .select()
      .single();

    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }

    // Upload staged photos
    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (const file of pendingPhotos) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${created.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("case-photos")
        .upload(path, file, { contentType: file.type });

      if (!uploadError) {
        await supabase.from("wb_case_photos").insert({
          case_id: created.id,
          storage_path: path,
          file_name: file.name,
          uploaded_by: user?.id,
        });
      }
    }

    setSaving(false);
    setPendingPhotos([]);
    setOpen(false);
    router.push(`/cases/${created.id}`);
    router.refresh();
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setPendingPhotos((prev) => [...prev, ...Array.from(files)]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPendingPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New Case
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">New Case</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand *</label>
              <input
                name="brand"
                required
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="AUX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select
                name="source"
                className="w-full rounded border px-3 py-2 text-sm"
              >
                {sources.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              name="category"
              required
              className="w-full rounded border px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 text-gray-700">
              Customer Info
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Name *
                </label>
                <input
                  name="customer_name"
                  required
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="customer_email"
                  type="email"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  name="customer_phone"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 text-gray-700">
              Product Info
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Model Number
                </label>
                <input
                  name="model_number"
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="ASW-H12U3/JIRIDI-US"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Error Code
                </label>
                <input
                  name="error_code"
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="E1, F3..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Store</label>
                <input
                  name="store"
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="Lowes, Home Depot..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  PO Number
                </label>
                <input
                  name="po_number"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              name="subject"
              required
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Full details of the customer issue..."
            />
          </div>

          {/* Photos */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 text-gray-700">Photos</h4>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotos}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotos}
            />

            {pendingPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {pendingPhotos.map((file, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-300">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Take Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
