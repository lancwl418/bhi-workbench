import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { NewCaseButton } from "./new-case-button";

const PAGE_SIZE = 50;

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  new: { label: "New", bg: "bg-blue-50", text: "text-blue-700" },
  in_progress: { label: "In Progress", bg: "bg-yellow-50", text: "text-yellow-700" },
  awaiting_customer: { label: "Awaiting", bg: "bg-purple-50", text: "text-purple-700" },
  resolved: { label: "Resolved", bg: "bg-green-50", text: "text-green-700" },
  closed: { label: "Closed", bg: "bg-gray-100", text: "text-gray-600" },
};

const categoryLabels: Record<string, string> = {
  missing_item: "Missing Item",
  parts_request: "Parts Request",
  installation: "Installation",
  error_code: "Error Code",
  product_malfunction: "Malfunction",
  return_request: "Return",
  warranty_claim: "Warranty",
  general_inquiry: "Inquiry",
};

const categoryColors: Record<string, string> = {
  missing_item: "bg-orange-50 text-orange-700",
  parts_request: "bg-cyan-50 text-cyan-700",
  installation: "bg-indigo-50 text-indigo-700",
  error_code: "bg-red-50 text-red-700",
  product_malfunction: "bg-red-50 text-red-700",
  return_request: "bg-amber-50 text-amber-700",
  warranty_claim: "bg-violet-50 text-violet-700",
  general_inquiry: "bg-gray-100 text-gray-600",
};

function buildHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/cases?${qs}` : "/cases";
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    brand?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServerSupabase();

  let query = supabase
    .from("wb_cases")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status) query = query.eq("status", params.status);
  if (params.brand) query = query.eq("brand", params.brand);
  if (params.category) query = query.eq("category", params.category);

  const { data: cases, error, count } = await query;

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Cases</h2>
          {params.status && (
            <span className="text-sm text-gray-500">
              / {params.status.replace("_", " ")}
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {totalCount}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/cases/import"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import CSV
          </Link>
          <NewCaseButton />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
          {error.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Case #</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody>
            {cases && cases.length > 0 ? (
              cases.map((c) => {
                const status = statusConfig[c.status] || { label: c.status, bg: "bg-gray-100", text: "text-gray-600" };
                return (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/cases/${c.id}`}
                        className="font-mono text-sm text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {c.case_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{c.brand}</td>
                    <td className="px-4 py-3.5 text-gray-900 font-medium">{c.customer_name}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${categoryColors[c.category] || "bg-gray-100 text-gray-600"}`}>
                        {categoryLabels[c.category] || c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px] truncate text-gray-600">
                      {c.subject}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">
                      {c.model_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">
                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-16 text-center text-gray-400"
                >
                  No cases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {from + 1}–{Math.min(from + PAGE_SIZE, totalCount)} of{" "}
            {totalCount}
          </p>
          <div className="flex gap-1">
            {page > 1 && (
              <Link
                href={buildHref({ ...params, page: String(page - 1) })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 shadow-sm transition-colors"
              >
                Previous
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 2 && p <= page + 2)
              )
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-2 py-1.5 text-sm text-gray-400">
                    ...
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildHref({ ...params, page: String(p) })}
                    className={`rounded-lg border px-3 py-1.5 text-sm shadow-sm transition-colors ${
                      p === page
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}

            {page < totalPages && (
              <Link
                href={buildHref({ ...params, page: String(page + 1) })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 shadow-sm transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
