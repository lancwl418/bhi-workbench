import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

const severityConfig: Record<string, { label: string; bg: string; text: string }> = {
  info: { label: "Info", bg: "bg-blue-50", text: "text-blue-700" },
  warning: { label: "Warning", bg: "bg-yellow-50", text: "text-yellow-700" },
  critical: { label: "Critical", bg: "bg-red-50", text: "text-red-700" },
};

export default async function ErrorCodesPage() {
  const supabase = await createServerSupabase();

  const { data: errorCodes, error } = await supabase
    .from("wb_error_codes")
    .select("*, wb_error_code_products(product_id, products(name, model_number))")
    .order("code", { ascending: true });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Error Codes</h2>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {errorCodes?.length || 0}
          </span>
        </div>
        <Link
          href="/error-codes/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Error Code
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Doc</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
            </tr>
          </thead>
          <tbody>
            {errorCodes && errorCodes.length > 0 ? (
              errorCodes.map((ec: any) => {
                const sev = severityConfig[ec.severity] || severityConfig.warning;
                const products = ec.wb_error_code_products || [];
                return (
                  <tr key={ec.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/error-codes/${ec.id}`}
                        className="font-mono text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {ec.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 max-w-[200px] truncate">
                      {ec.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sev.bg} ${sev.text}`}>
                        {sev.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {products.length > 0 ? (
                          products.slice(0, 3).map((p: any) => (
                            <span
                              key={p.product_id}
                              className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                            >
                              {p.products?.model_number || p.products?.name || "—"}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-300">--</span>
                        )}
                        {products.length > 3 && (
                          <span className="text-xs text-gray-400">+{products.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {ec.doc_file_name ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 8V2l6 6h-6zM9 13h6v2H9v-2zm0 4h6v2H9v-2z" />
                          </svg>
                          PDF
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-sm">
                      {new Date(ec.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                  No error codes yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
