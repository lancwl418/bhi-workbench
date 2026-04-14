import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/gmail";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    return NextResponse.json(
      { error: "No refresh token — try revoking app access in Google and re-authorizing" },
      { status: 400 }
    );
  }

  // Get the email address for this account
  oauth2Client.setCredentials(tokens);
  const { google } = await import("googleapis");
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: "me" });

  const supabase = await createServiceSupabase();

  // Upsert token — only keep one Gmail connection
  const { data: existing } = await supabase
    .from("wb_gmail_tokens")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    await supabase
      .from("wb_gmail_tokens")
      .update({
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        email: profile.data.emailAddress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("wb_gmail_tokens").insert({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      email: profile.data.emailAddress,
    });
  }

  // Redirect back to emails page
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/emails?connected=1`);
}
