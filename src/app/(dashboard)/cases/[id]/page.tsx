import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CaseStatusSelect } from "./case-status-select";
import { CaseComments } from "./case-comments";
import { CaseParts } from "./case-parts";
import { CaseSolution } from "./case-solution";
import { CasePhotos } from "./case-photos";

const categoryLabels: Record<string, string> = {
  missing_item: "Missing Item",
  parts_request: "Parts Request",
  installation: "Installation",
  error_code: "Error Code",
  product_malfunction: "Product Malfunction",
  return_request: "Return Request",
  warranty_claim: "Warranty Claim",
  general_inquiry: "General Inquiry",
};

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: caseData, error } = await supabase
    .from("wb_cases")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !caseData) notFound();

  const { data: comments } = await supabase
    .from("wb_case_comments")
    .select("*")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const { data: parts } = await supabase
    .from("wb_case_parts")
    .select("*, products(name, model_number), skus(sku_code)")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const { data: photos } = await supabase
    .from("wb_case_photos")
    .select("*")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  // Look up error code info if present
  let errorCodeInfo = null;
  if (caseData.error_code) {
    const { data } = await supabase
      .from("wb_error_codes")
      .select("id, code, name, description, solution, severity")
      .eq("code", caseData.error_code)
      .maybeSingle();
    errorCodeInfo = data;
  }

  // Look up linked warranty if exists
  let warranty = null;
  if (caseData.warranty_id) {
    const { data } = await supabase
      .from("warranties")
      .select("*")
      .eq("id", caseData.warranty_id)
      .single();
    warranty = data;
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/cases"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; All Cases
          </Link>
          <h2 className="text-xl font-semibold mt-1">
            {caseData.case_number}{" "}
            <span className="text-gray-400 font-normal">—</span>{" "}
            <span className="font-normal">{caseData.subject}</span>
          </h2>
          <div className="flex gap-3 mt-2 text-sm text-gray-500">
            <span>{caseData.brand}</span>
            <span>{categoryLabels[caseData.category] || caseData.category}</span>
            <span>{caseData.source}</span>
            <span>
              {new Date(caseData.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <CaseStatusSelect caseId={caseData.id} currentStatus={caseData.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column — main content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Description
            </h3>
            <p className="text-sm whitespace-pre-wrap">{caseData.description}</p>
          </section>

          {/* Photos */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Photos
            </h3>
            <CasePhotos caseId={caseData.id} photos={photos || []} />
          </section>

          {/* Solution */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Solution
            </h3>
            <CaseSolution caseId={caseData.id} currentSolution={caseData.solution} />
          </section>

          {/* Parts */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Related Parts
            </h3>
            <CaseParts caseId={caseData.id} parts={parts || []} />
          </section>

          {/* Comments / Activity Log */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Comments
            </h3>
            <CaseComments caseId={caseData.id} comments={comments || []} />
          </section>
        </div>

        {/* Right column — sidebar info */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Customer
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">Name</dt>
                <dd>{caseData.customer_name}</dd>
              </div>
              {caseData.customer_email && (
                <div>
                  <dt className="text-gray-400">Email</dt>
                  <dd>{caseData.customer_email}</dd>
                </div>
              )}
              {caseData.customer_phone && (
                <div>
                  <dt className="text-gray-400">Phone</dt>
                  <dd>{caseData.customer_phone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Product */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Product
            </h3>
            <dl className="space-y-2 text-sm">
              {caseData.model_number && (
                <div>
                  <dt className="text-gray-400">Model</dt>
                  <dd className="font-mono">{caseData.model_number}</dd>
                </div>
              )}
              {caseData.error_code && (
                <div>
                  <dt className="text-gray-400">Error Code</dt>
                  <dd className="font-mono text-red-600">{caseData.error_code}</dd>
                </div>
              )}
              {caseData.store && (
                <div>
                  <dt className="text-gray-400">Store</dt>
                  <dd>{caseData.store}</dd>
                </div>
              )}
              {caseData.po_number && (
                <div>
                  <dt className="text-gray-400">PO Number</dt>
                  <dd className="font-mono">{caseData.po_number}</dd>
                </div>
              )}
              {caseData.purchase_date && (
                <div>
                  <dt className="text-gray-400">Purchase Date</dt>
                  <dd>{new Date(caseData.purchase_date).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Error Code Lookup */}
          {caseData.error_code && errorCodeInfo && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Error Code Info
                </h3>
                <Link
                  href={`/error-codes/${errorCodeInfo.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Details
                </Link>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-mono font-semibold text-red-600">{errorCodeInfo.code}</span>
                  <span className="text-gray-500 ml-2">{errorCodeInfo.name}</span>
                </div>
                {errorCodeInfo.description && (
                  <p className="text-gray-600 text-xs">{errorCodeInfo.description}</p>
                )}
                {errorCodeInfo.solution && (
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Solution</p>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{errorCodeInfo.solution}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {caseData.error_code && !errorCodeInfo && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Error Code Info
              </h3>
              <p className="text-xs text-gray-400">
                No entry found for code <span className="font-mono font-semibold">{caseData.error_code}</span>
              </p>
              <Link
                href="/error-codes/new"
                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
              >
                Add this error code
              </Link>
            </div>
          )}

          {/* Linked Records */}
          {(caseData.warranty_id || caseData.order_id) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Linked Records
              </h3>
              <dl className="space-y-2 text-sm">
                {warranty && (
                  <div>
                    <dt className="text-gray-400">Warranty</dt>
                    <dd className="font-mono">
                      {warranty.warranty_number || warranty.id.slice(0, 8)}
                    </dd>
                  </div>
                )}
                {caseData.order_id && (
                  <div>
                    <dt className="text-gray-400">Order</dt>
                    <dd className="font-mono">{caseData.order_id.slice(0, 8)}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
