import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EmailCategorySelect } from "./email-category-select";

const categoryConfig: Record<string, { label: string; bg: string; text: string }> = {
  return_request: { label: "Return Request", bg: "bg-orange-50", text: "text-orange-700" },
  technical_support: { label: "Technical Support", bg: "bg-blue-50", text: "text-blue-700" },
  missing_item: { label: "Missing Item", bg: "bg-red-50", text: "text-red-700" },
  inspection_request: { label: "Inspection Request", bg: "bg-purple-50", text: "text-purple-700" },
  others: { label: "Others", bg: "bg-gray-100", text: "text-gray-600" },
};

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: email, error } = await supabase
    .from("wb_emails")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !email) notFound();

  // Mark as read
  if (!email.is_read) {
    await supabase
      .from("wb_emails")
      .update({ is_read: true })
      .eq("id", id);
  }

  const cat = categoryConfig[email.category] || categoryConfig.others;

  return (
    <div className="p-6 max-w-5xl">
      <Link
        href="/emails"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; All Emails
      </Link>

      <div className="mt-4 grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {email.subject || "(no subject)"}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                {email.from_name || email.from_email}
              </span>
              {email.from_name && (
                <span className="text-gray-400">&lt;{email.from_email}&gt;</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(email.received_at).toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              {email.to_email && (
                <span className="ml-3">To: {email.to_email}</span>
              )}
            </div>
          </div>

          {/* Email body */}
          <div className="border rounded-lg p-5 bg-white">
            {email.body_html ? (
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: email.body_html }}
              />
            ) : (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {email.body_text || "(empty)"}
              </pre>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              AI Classification
            </h3>
            <div className="space-y-3">
              <div>
                <dt className="text-xs text-gray-400 mb-1">Category</dt>
                <EmailCategorySelect
                  emailId={email.id}
                  currentCategory={email.category}
                />
              </div>
              {email.category_confidence != null && (
                <div>
                  <dt className="text-xs text-gray-400">Confidence</dt>
                  <dd className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${email.category_confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(email.category_confidence * 100)}%
                      </span>
                    </div>
                  </dd>
                </div>
              )}
              {email.category_reason && (
                <div>
                  <dt className="text-xs text-gray-400">Reason</dt>
                  <dd className="text-sm text-gray-600">{email.category_reason}</dd>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sender</h3>
            <dl className="space-y-2 text-sm">
              {email.from_name && (
                <div>
                  <dt className="text-gray-400">Name</dt>
                  <dd>{email.from_name}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-400">Email</dt>
                <dd className="break-all">{email.from_email}</dd>
              </div>
            </dl>
          </div>

          {(email.case_id || email.return_id) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Linked Records
              </h3>
              <div className="space-y-2 text-sm">
                {email.case_id && (
                  <Link
                    href={`/cases/${email.case_id}`}
                    className="block text-blue-600 hover:underline"
                  >
                    View Linked Case
                  </Link>
                )}
                {email.return_id && (
                  <Link
                    href={`/returns/${email.return_id}`}
                    className="block text-blue-600 hover:underline"
                  >
                    View Linked Return
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
