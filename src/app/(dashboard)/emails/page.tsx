import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { SyncButton } from "./sync-button";
import { ConnectGmail } from "./connect-gmail";

const PAGE_SIZE = 50;

const categoryConfig: Record<string, { label: string; bg: string; text: string }> = {
  return_request: { label: "Return Request", bg: "bg-orange-50", text: "text-orange-700" },
  technical_support: { label: "Technical Support", bg: "bg-blue-50", text: "text-blue-700" },
  missing_item: { label: "Missing Item", bg: "bg-red-50", text: "text-red-700" },
  inspection_request: { label: "Inspection Request", bg: "bg-purple-50", text: "text-purple-700" },
  others: { label: "Others", bg: "bg-gray-100", text: "text-gray-600" },
};

function buildHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/emails?${qs}` : "/emails";
}

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServerSupabase();

  // Check if Gmail is connected
  const { data: token } = await supabase
    .from("wb_gmail_tokens")
    .select("email")
    .limit(1)
    .single();

  let query = supabase
    .from("wb_emails")
    .select("*", { count: "exact" })
    .order("received_at", { ascending: false })
    .range(from, to);

  if (params.category) query = query.eq("category", params.category);

  const { data: emails, error, count } = await query;

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
          {params.category && (
            <span className="text-sm text-gray-500">
              / {categoryConfig[params.category]?.label || params.category}
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {totalCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {token ? (
            <>
              <span className="text-xs text-gray-400">{token.email}</span>
              <SyncButton />
            </>
          ) : (
            <ConnectGmail />
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1 mb-4">
        <Link
          href="/emails"
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            !params.category
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </Link>
        {Object.entries(categoryConfig).map(([key, cfg]) => (
          <Link
            key={key}
            href={`/emails?category=${key}`}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              params.category === key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cfg.label}
          </Link>
        ))}
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {emails && emails.length > 0 ? (
              emails.map((e) => {
                const cat = categoryConfig[e.category] || categoryConfig.others;
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors ${
                      !e.is_read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      {!e.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/emails/${e.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        <div className={`text-gray-900 ${!e.is_read ? "font-semibold" : "font-medium"}`}>
                          {e.from_name || e.from_email}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">
                          {e.from_email}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 max-w-[300px]">
                      <Link
                        href={`/emails/${e.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        <div className={`truncate ${!e.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {e.subject || "(no subject)"}
                        </div>
                        {e.body_text && (
                          <div className="text-xs text-gray-400 truncate max-w-[300px] mt-0.5">
                            {e.body_text.slice(0, 100)}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.bg} ${cat.text}`}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm whitespace-nowrap">
                      {new Date(e.received_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                  {token
                    ? "No emails yet. Click Sync to pull emails from Gmail."
                    : "Connect your Gmail account to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {from + 1}–{Math.min(from + PAGE_SIZE, totalCount)} of {totalCount}
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
