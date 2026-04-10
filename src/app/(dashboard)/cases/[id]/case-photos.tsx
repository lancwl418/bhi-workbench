"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Photo {
  id: string;
  storage_path: string;
  file_name: string;
  caption: string | null;
  created_at: string;
}

export function CasePhotos({
  caseId,
  photos,
}: {
  caseId: string;
  photos: Photo[];
}) {
  const [uploading, setUploading] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useState(() => {
    loadUrls();
  });

  async function loadUrls() {
    const urls: Record<string, string> = {};
    for (const photo of photos) {
      const { data } = await supabase.storage
        .from("case-photos")
        .createSignedUrl(photo.storage_path, 3600);
      if (data?.signedUrl) urls[photo.id] = data.signedUrl;
    }
    setPhotoUrls(urls);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${caseId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("case-photos")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        alert("Upload failed: " + uploadError.message);
        return;
      }

      await supabase.from("wb_case_photos").insert({
        case_id: caseId,
        storage_path: path,
        file_name: file.name,
        uploaded_by: user?.id,
      });

      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | File[]) {
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, []);

  async function handleDelete(photo: Photo) {
    if (!confirm("Delete this photo?")) return;
    await supabase.storage.from("case-photos").remove([photo.storage_path]);
    await supabase.from("wb_case_photos").delete().eq("id", photo.id);
    router.refresh();
  }

  const previewPhoto = previewIdx !== null ? photos[previewIdx] : null;

  return (
    <div className="space-y-3">
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              {photoUrls[photo.id] ? (
                <img
                  src={photoUrls[photo.id]}
                  alt={photo.file_name}
                  className="w-full h-36 object-cover cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setPreviewIdx(idx)}
                />
              ) : (
                <div className="w-full h-36 bg-gray-100 animate-pulse" />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{photo.file_name}</p>
                <p className="text-[10px] text-gray-300">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-colors p-6 text-center ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          <p className="text-sm text-gray-500">
            {uploading ? "Uploading..." : "Drag & drop photos here"}
          </p>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900 disabled:opacity-50 transition-colors"
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
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {previewIdx !== null && previewPhoto && photoUrls[previewPhoto.id] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setPreviewIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setPreviewIdx(null)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>

          {previewIdx > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); setPreviewIdx(previewIdx - 1); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          <img
            src={photoUrls[previewPhoto.id]}
            alt={previewPhoto.file_name}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {previewIdx < photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); setPreviewIdx(previewIdx + 1); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white/80">
            <p className="text-sm">{previewPhoto.file_name}</p>
            <p className="text-xs text-white/50">{previewIdx + 1} / {photos.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
