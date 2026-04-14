import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import {
  getGmailClient,
  extractBody,
  getHeader,
  parseFromField,
} from "@/lib/gmail";
import { classifyEmail } from "@/lib/classify-email";

export const maxDuration = 120; // Allow up to 2 minutes for sync

export async function POST() {
  const supabase = await createServiceSupabase();

  // 1. Get stored Gmail tokens
  const { data: tokenRow } = await supabase
    .from("wb_gmail_tokens")
    .select("*")
    .limit(1)
    .single();

  if (!tokenRow) {
    return NextResponse.json(
      { error: "Gmail not connected. Please authorize first." },
      { status: 400 }
    );
  }

  const gmail = getGmailClient({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token,
    expiry_date: tokenRow.expiry_date,
  });

  // 2. Fetch message IDs from this year
  const allMessageIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const list = await gmail.users.messages.list({
      userId: "me",
      q: "after:2026/01/01",
      maxResults: 100,
      pageToken,
    });

    if (list.data.messages) {
      allMessageIds.push(...list.data.messages.map((m) => m.id!));
    }
    pageToken = list.data.nextPageToken || undefined;
  } while (pageToken);

  if (allMessageIds.length === 0) {
    return NextResponse.json({ synced: 0, skipped: 0 });
  }

  // 3. Check which emails we already have
  const { data: existing } = await supabase
    .from("wb_emails")
    .select("gmail_id")
    .in("gmail_id", allMessageIds);

  const existingIds = new Set((existing || []).map((e) => e.gmail_id));
  const newIds = allMessageIds.filter((id) => !existingIds.has(id));

  // 4. Fetch and classify new emails
  let synced = 0;

  for (const msgId of newIds) {
    try {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: msgId,
        format: "full",
      });

      const headers = msg.data.payload?.headers;
      const subject = getHeader(headers, "Subject");
      const fromRaw = getHeader(headers, "From");
      const toRaw = getHeader(headers, "To");
      const dateStr = getHeader(headers, "Date");
      const { name: fromName, email: fromEmail } = parseFromField(fromRaw);
      const { text, html } = extractBody(msg.data.payload!);

      // Classify with AI
      const classification = await classifyEmail(subject, text || html);

      await supabase.from("wb_emails").insert({
        gmail_id: msgId,
        thread_id: msg.data.threadId,
        subject,
        from_name: fromName,
        from_email: fromEmail,
        to_email: toRaw,
        body_text: text || null,
        body_html: html || null,
        received_at: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
        category: classification.category,
        category_confidence: classification.confidence,
        category_reason: classification.reason,
      });

      synced++;
    } catch (err) {
      console.error(`Failed to sync message ${msgId}:`, err);
    }
  }

  return NextResponse.json({
    synced,
    skipped: existingIds.size,
    total: allMessageIds.length,
  });
}
