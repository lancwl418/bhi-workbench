import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReturnStatusSelect } from "./return-status-select";
import { ReturnOutcome } from "./return-outcome";
import { ReturnComments } from "./return-comments";
import { ReturnPhotos } from "./return-photos";

const reasonLabels: Record<string, string> = {
  product_defect: "Product Defect",
  installation_error: "Installation Error",
  shipping_damage: "Shipping Damage",
  wrong_item: "Wrong Item",
  customer_changed_mind: "Changed Mind",
  missing_parts: "Missing Parts",
  other: "Other",
};

const conditionLabels: Record<string, string> = {
  new_sealed: "New / Sealed",
  like_new: "Like New",
  minor_damage: "Minor Damage",
  major_damage: "Major Damage",
  defective: "Defective",
  incomplete: "Incomplete",
};

export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: ret, error } = await supabase
    .from("wb_returns")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ret) notFound();

  const { data: comments } = await supabase
    .from("wb_return_comments")
    .select("*")
    .eq("return_id", id)
    .order("created_at", { ascending: true });

  const { data: photos } = await supabase
    .from("wb_return_photos")
    .select("*")
    .eq("return_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/returns"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; All Returns
          </Link>
          <h2 className="text-xl font-semibold mt-1">
            {ret.return_number}{" "}
            <span className="text-gray-400 font-normal">—</span>{" "}
            <span className="font-normal">{ret.product_name}</span>
          </h2>
          <div className="flex gap-3 mt-2 text-sm text-gray-500">
            <span>{ret.brand}</span>
            <span>{reasonLabels[ret.reason] || ret.reason}</span>
            <span>{new Date(ret.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <ReturnStatusSelect returnId={ret.id} currentStatus={ret.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Reason */}
          {ret.reason_detail && (
            <section className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Return Reason Details
              </h3>
              <p className="text-sm whitespace-pre-wrap">{ret.reason_detail}</p>
            </section>
          )}

          {/* Inspection */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Inspection
            </h3>
            {ret.received_date ? (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-400">Received Date</dt>
                  <dd>{new Date(ret.received_date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Condition</dt>
                  <dd>{ret.condition ? conditionLabels[ret.condition] || ret.condition : "—"}</dd>
                </div>
                {ret.condition_notes && (
                  <div className="col-span-2">
                    <dt className="text-gray-400">Condition Notes</dt>
                    <dd className="whitespace-pre-wrap">{ret.condition_notes}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-gray-400">Not yet received</p>
            )}
          </section>

          {/* Photos */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Photos
            </h3>
            <ReturnPhotos returnId={ret.id} photos={photos || []} />
          </section>

          {/* Outcome */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Outcome
            </h3>
            <ReturnOutcome
              returnId={ret.id}
              currentOutcome={ret.outcome}
              currentNotes={ret.outcome_notes}
            />
          </section>

          {/* Comments */}
          <section className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Comments
            </h3>
            <ReturnComments returnId={ret.id} comments={comments || []} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Customer</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">Name</dt>
                <dd>{ret.customer_name}</dd>
              </div>
              {ret.customer_email && (
                <div>
                  <dt className="text-gray-400">Email</dt>
                  <dd>{ret.customer_email}</dd>
                </div>
              )}
              {ret.customer_phone && (
                <div>
                  <dt className="text-gray-400">Phone</dt>
                  <dd>{ret.customer_phone}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Product</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">Product</dt>
                <dd>{ret.product_name}</dd>
              </div>
              {ret.model_number && (
                <div>
                  <dt className="text-gray-400">Model</dt>
                  <dd className="font-mono">{ret.model_number}</dd>
                </div>
              )}
              {ret.sku_code && (
                <div>
                  <dt className="text-gray-400">SKU</dt>
                  <dd className="font-mono">{ret.sku_code}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-400">Qty</dt>
                <dd>{ret.quantity}</dd>
              </div>
            </dl>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Logistics
            </h3>
            <dl className="space-y-2 text-sm">
              {ret.tracking_number && (
                <div>
                  <dt className="text-gray-400">Tracking</dt>
                  <dd className="font-mono">{ret.tracking_number}</dd>
                </div>
              )}
              {ret.carrier && (
                <div>
                  <dt className="text-gray-400">Carrier</dt>
                  <dd>{ret.carrier}</dd>
                </div>
              )}
              {ret.po_number && (
                <div>
                  <dt className="text-gray-400">PO Number</dt>
                  <dd className="font-mono">{ret.po_number}</dd>
                </div>
              )}
              {ret.channel && (
                <div>
                  <dt className="text-gray-400">Channel</dt>
                  <dd>{ret.channel}</dd>
                </div>
              )}
            </dl>
          </div>

          {ret.case_id && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Linked Case
              </h3>
              <Link
                href={`/cases/${ret.case_id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Case
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
