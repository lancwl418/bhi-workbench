"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewReturnPage() {
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

    const data: Record<string, unknown> = {
      customer_name: (form.get("customer_name") as string) || "",
      customer_email: (form.get("customer_email") as string) || null,
      customer_phone: (form.get("customer_phone") as string) || null,
      brand: (form.get("brand") as string) || "",
      product_name: (form.get("product_name") as string) || "",
      model_number: (form.get("model_number") as string) || null,
      quantity: parseInt(form.get("quantity") as string, 10) || 1,
      po_number: (form.get("po_number") as string) || null,
      channel: (form.get("channel") as string) || null,
      notes: (form.get("notes") as string) || null,
    };

    const { data: created, error } = await supabase
      .from("wb_returns")
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
        .from("return-photos")
        .upload(path, file, { contentType: file.type });

      if (!uploadError) {
        await supabase.from("wb_return_photos").insert({
          return_id: created.id,
          storage_path: path,
          file_name: file.name,
          uploaded_by: user?.id,
        });
      }
    }

    setSaving(false);
    router.push(`/returns/${created.id}`);
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

  return (
    <div className="p-6 max-w-2xl">
      <Link
        href="/returns"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Returns
      </Link>

      <h2 className="text-xl font-semibold mt-4 mb-6">Log Return</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos — first priority */}
        <fieldset className="border rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium px-2">Photos</legend>
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
            <div className="grid grid-cols-3 gap-3">
              {pendingPhotos.map((file, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-28 object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-300">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className="rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50 p-6 text-center transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <p className="text-sm text-gray-500">
                {pendingPhotos.length > 0
                  ? `${pendingPhotos.length} photo${pendingPhotos.length > 1 ? "s" : ""} selected`
                  : "Take or upload photos of the return"}
              </p>
              <div className="flex gap-2 mt-1">
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
          </div>
        </fieldset>

        {/* Customer — basic info */}
        <fieldset className="border rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium px-2">Customer</legend>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="customer_name"
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
        </fieldset>

        {/* Product — basic info */}
        <fieldset className="border rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium px-2">Product</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                name="brand"
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="AUX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <input
                name="product_name"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model #</label>
              <input
                name="model_number"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qty</label>
              <input
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </fieldset>

        {/* Order Info */}
        <fieldset className="border rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium px-2">Order Info</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PO Number</label>
              <input
                name="po_number"
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="e.g. PO-12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <select
                name="channel"
                defaultValue=""
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="">Select platform...</option>
                <option value="homedepot">Home Depot</option>
                <option value="lowes">Lowe&apos;s</option>
                <option value="dsco">DSCO</option>
                <option value="global_industry">Global Industry</option>
                <option value="website">Website</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            rows={2}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Any quick notes..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Link
            href="/returns"
            className="rounded border px-4 py-2 text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Log Return"}
          </button>
        </div>
      </form>
    </div>
  );
}
