import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

const PAGE_SIZE = 50;

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  initiated: { label: "Initiated", bg: "bg-blue-50", text: "text-blue-700" },
  label_issued: { label: "Label Issued", bg: "bg-indigo-50", text: "text-indigo-700" },
  in_transit: { label: "In Transit", bg: "bg-yellow-50", text: "text-yellow-700" },
  received: { label: "Received", bg: "bg-orange-50", text: "text-orange-700" },
  inspected: { label: "Inspected", bg: "bg-purple-50", text: "text-purple-700" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700" },
};

const reasonLabels: Record<string, string> = {
  product_defect: "Defect",
  installation_error: "Install Error",
  shipping_damage: "Shipping Dmg",
  wrong_item: "Wrong Item",
  customer_changed_mind: "Changed Mind",
  missing_parts: "Missing Parts",
  other: "Other",
};

const reasonColors: Record<string, string> = {
  product_defect: "bg-red-50 text-red-700",
  installation_error: "bg-orange-50 text-orange-700",
  shipping_damage: "bg-amber-50 text-amber-700",
  wrong_item: "bg-cyan-50 text-cyan-700",
  customer_changed_mind: "bg-gray-100 text-gray-600",
  missing_parts: "bg-violet-50 text-violet-700",
  other: "bg-gray-100 text-gray-600",
};

const platformLabels: Record<string, string> = {
  homedepot: "Home Depot",
  lowes: "Lowe's",
  dsco: "DSCO",
  global_industry: "Global Industry",
  website: "Website",
  others: "Others",
};

const outcomeConfig: Record<string, { label: string; bg: string; text: string }> = {
  refund: { label: "Refund", bg: "bg-green-50", text: "text-green-700" },
  replacement: { label: "Replacement", bg: "bg-blue-50", text: "text-blue-700" },
  repair: { label: "Repair", bg: "bg-yellow-50", text: "text-yellow-700" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700" },
};

function buildHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/returns?${qs}` : "/returns";
}

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    reason?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServerSupabase();

  let query = supabase
    .from("wb_returns")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status) query = query.eq("status", params.status);
  if (params.reason) query = query.eq("reason", params.reason);

  const { data: returns, error, count } = await query;

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Returns</h2>
          {params.status && (
            <span className="text-sm text-gray-500">
              / {params.status.replace("_", " ")}
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {totalCount}
          </span>
        </div>
        <Link
          href="/returns/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Return
        </Link>
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Return #</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">PO #</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody>
            {returns && returns.length > 0 ? (
              returns.map((r) => {
                const status = statusConfig[r.status] || { label: r.status, bg: "bg-gray-100", text: "text-gray-600" };
                const outcome = r.outcome ? outcomeConfig[r.outcome] : null;
                return (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/returns/${r.id}`}
                        className="font-mono text-sm text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {r.return_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-gray-900 font-medium">{r.customer_name}</td>
                    <td className="px-4 py-3.5 max-w-[160px] truncate text-gray-600">
                      {r.product_name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">
                      {r.model_number}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">
                      {r.po_number || <span className="text-gray-300">--</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">
                      {r.channel ? platformLabels[r.channel] || r.channel : <span className="text-gray-300">--</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${reasonColors[r.reason] || "bg-gray-100 text-gray-600"}`}>
                        {reasonLabels[r.reason] || r.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {outcome ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${outcome.bg} ${outcome.text}`}>
                          {outcome.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-16 text-center text-gray-400"
                >
                  No returns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
