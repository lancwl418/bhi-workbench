import { createServiceSupabase } from "@/lib/supabase/server";
import Papa from "papaparse";

export const maxDuration = 60;

// Map "Regarding" field to wb_case_category enum
function mapCategory(regarding: string): string {
  const r = regarding.toLowerCase();
  if (r.includes("missing item") || r.includes("replacement") || r.includes("asking for parts"))
    return "parts_request";
  if (r.includes("installation")) return "installation";
  if (r.includes("error") || r.includes("fault")) return "error_code";
  if (r.includes("malfunction") || r.includes("not working") || r.includes("defect"))
    return "product_malfunction";
  if (r.includes("return")) return "return_request";
  if (r.includes("warranty")) return "warranty_claim";
  return "general_inquiry";
}

// Map CSV status to wb_case_status enum
function mapStatus(status: string): string {
  const s = status.toLowerCase().trim();
  if (s === "done" || s === "resolved" || s === "closed") return "resolved";
  if (s === "in progress" || s === "working") return "in_progress";
  if (s === "awaiting" || s === "waiting") return "awaiting_customer";
  if (s === "new" || s === "open") return "new";
  return "resolved"; // default for historical data
}

// Parse the structured CallExperts body
function parseBody(body: string) {
  const result: Record<string, string> = {};

  const fields: [string, string][] = [
    ["Regarding", "regarding"],
    ["Name of the Caller", "name"],
    ["Caller's Phone #", "phone"],
    ["Caller's Email", "email"],
    ["Model", "model"],
    ["PO Number", "po_number"],
    ["Date", "date"],
    ["Store", "store"],
  ];

  for (const [label, key] of fields) {
    const regex = new RegExp(`${label}\\s*:\\s*(.+?)\\s*$`, "m");
    const match = body.match(regex);
    if (match) {
      result[key] = match[1].trim();
    }
  }

  // Extract the free-text description (after Store line, before Caller ID)
  const storeMatch = body.match(/Store\s*:\s*.+?\n([\s\S]*?)(?:Caller ID|---)/);
  if (storeMatch) {
    result.description = storeMatch[1].trim();
  }

  return result;
}

function safeTimestamp(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function parsePurchaseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.toLowerCase() === "unknown") return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
  const supabase = await createServiceSupabase();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();

  const parsed = Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    return Response.json(
      { error: "CSV parse error", details: parsed.errors.slice(0, 5) },
      { status: 400 }
    );
  }

  const rows = parsed.data as string[][];
  // Skip header row
  const dataRows = rows.slice(1);

  let skipped = 0;
  const errors: string[] = [];
  const batch: Record<string, unknown>[] = [];

  for (const row of dataRows) {
    const [timestamp, brand, subject, body, status, , note] = row;

    if (!timestamp || !brand) {
      skipped++;
      continue;
    }

    const fields = parseBody(body || "");

    const email =
      fields.email && !fields.email.toLowerCase().includes("no email") && !fields.email.toLowerCase().includes("refused")
        ? fields.email
        : null;

    const poNumber =
      fields.po_number && fields.po_number.toLowerCase() !== "unknown"
        ? fields.po_number
        : null;

    const store =
      fields.store && fields.store.toLowerCase() !== "unknown"
        ? fields.store
        : null;

    batch.push({
      brand: brand.trim(),
      source: "phone",
      category: mapCategory(fields.regarding || ""),
      subject: subject.trim(),
      description: fields.description || body || "",
      status: mapStatus(status || ""),
      customer_name: fields.name || "",
      customer_email: email,
      customer_phone: fields.phone || null,
      model_number: fields.model || null,
      store,
      po_number: poNumber,
      purchase_date: parsePurchaseDate(fields.date || ""),
      raw_body: body || null,
      notes: note?.trim() || null,
      created_at: safeTimestamp(timestamp),
      resolved_at: mapStatus(status || "") === "resolved" ? safeTimestamp(timestamp) : null,
    });
  }

  // Insert in batches of 200
  let imported = 0;
  for (let i = 0; i < batch.length; i += 200) {
    const chunk = batch.slice(i, i + 200);
    const { error, count } = await supabase.from("wb_cases").insert(chunk);
    if (error) {
      errors.push(`Batch ${Math.floor(i / 200) + 1}: ${error.message}`);
      skipped += chunk.length;
    } else {
      imported += chunk.length;
    }
  }

  return Response.json({
    imported,
    skipped,
    total: dataRows.length,
    errors: errors.slice(0, 10),
  });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
