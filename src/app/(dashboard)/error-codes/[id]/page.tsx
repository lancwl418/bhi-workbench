import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ErrorCodeForm } from "./error-code-form";
import { DocUpload } from "./doc-upload";
import { ProductAssignment } from "./product-assignment";

const severityConfig: Record<string, { label: string; bg: string; text: string }> = {
  info: { label: "Info", bg: "bg-blue-50", text: "text-blue-700" },
  warning: { label: "Warning", bg: "bg-yellow-50", text: "text-yellow-700" },
  critical: { label: "Critical", bg: "bg-red-50", text: "text-red-700" },
};

export default async function ErrorCodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: ec, error } = await supabase
    .from("wb_error_codes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ec) notFound();

  const { data: assignments } = await supabase
    .from("wb_error_code_products")
    .select("*, products(id, name, model_number, category)")
    .eq("error_code_id", id);

  const sev = severityConfig[ec.severity] || severityConfig.warning;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/error-codes"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; All Error Codes
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-xl font-semibold font-mono">{ec.code}</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sev.bg} ${sev.text}`}>
              {sev.label}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{ec.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="col-span-2 space-y-6">
          <ErrorCodeForm errorCode={ec} />
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">
          {/* Document */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Reference Document
            </h3>
            <DocUpload
              errorCodeId={ec.id}
              currentPath={ec.doc_storage_path}
              currentName={ec.doc_file_name}
            />
          </div>

          {/* Product Assignment */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Applicable Products
            </h3>
            <ProductAssignment
              errorCodeId={ec.id}
              assignments={assignments || []}
            />
          </div>

          {/* Meta */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">Created</dt>
                <dd>{new Date(ec.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Updated</dt>
                <dd>{new Date(ec.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
