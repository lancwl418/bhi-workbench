"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DocUpload({
  errorCodeId,
  currentPath,
  currentName,
}: {
  errorCodeId: string;
  currentPath: string | null;
  currentName: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // Remove old file if exists
    if (currentPath) {
      await supabase.storage.from("error-code-docs").remove([currentPath]);
    }

    const path = `${errorCodeId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("error-code-docs")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    await supabase
      .from("wb_error_codes")
      .update({ doc_storage_path: path, doc_file_name: file.name })
      .eq("id", errorCodeId);

    setUploading(false);
    e.target.value = "";
    router.refresh();
  }

  async function handleDownload() {
    if (!currentPath) return;
    const { data } = await supabase.storage
      .from("error-code-docs")
      .createSignedUrl(currentPath, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }

  async function handleRemove() {
    if (!currentPath || !confirm("Remove this document?")) return;
    await supabase.storage.from("error-code-docs").remove([currentPath]);
    await supabase
      .from("wb_error_codes")
      .update({ doc_storage_path: null, doc_file_name: null })
      .eq("id", errorCodeId);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleUpload}
      />

      {currentName ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 8V2l6 6h-6zM9 13h6v2H9v-2zm0 4h6v2H9v-2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{currentName}</p>
            <p className="text-xs text-gray-400">PDF Document</p>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400 py-2">No document uploaded</div>
      )}

      <div className="flex flex-wrap gap-2">
        {currentName && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </button>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {uploading ? "Uploading..." : currentName ? "Replace" : "Upload PDF"}
        </button>
        {currentName && (
          <button
            onClick={handleRemove}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
