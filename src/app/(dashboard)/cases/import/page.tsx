"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
  errors: string[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cases/import", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Server error: " + text.slice(0, 200));
        setUploading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Upload failed: " + (err as Error).message);
    }

    setUploading(false);
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/cases" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to Cases
      </Link>

      <h2 className="text-xl font-semibold mt-4 mb-6">Import Cases from CSV</h2>

      <div className="border rounded-lg p-6 space-y-4">
        <div className="text-sm text-gray-600 space-y-1">
          <p>Upload a CSV file with the following columns:</p>
          <p className="font-mono text-xs bg-gray-50 p-2 rounded">
            Timestamp, Brand, Subject, Body, Status, Assignee, Note
          </p>
          <p>The Body field will be parsed to extract customer name, phone, email, model, PO number, store, and description.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import"}
          </button>
        </form>

        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded bg-green-50 p-4 space-y-2">
            <p className="text-sm font-medium text-green-800">
              Import complete
            </p>
            <div className="text-sm text-green-700 space-y-1">
              <p>Imported: {result.imported}</p>
              <p>Skipped: {result.skipped}</p>
              <p>Total rows: {result.total}</p>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-2 text-xs text-red-600 space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push("/cases")}
              className="mt-2 rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
            >
              View Cases
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
