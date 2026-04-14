import Anthropic from "@anthropic-ai/sdk";

const CATEGORIES = [
  "return_request",
  "technical_support",
  "missing_item",
  "inspection_request",
  "others",
] as const;

type EmailCategory = (typeof CATEGORIES)[number];

interface ClassificationResult {
  category: EmailCategory;
  confidence: number;
  reason: string;
}

export async function classifyEmail(
  subject: string,
  body: string
): Promise<ClassificationResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Truncate body to avoid excessive token usage
  const truncatedBody = body.length > 3000 ? body.slice(0, 3000) + "..." : body;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Classify this customer email into one of these categories:
- return_request: Customer wants to return a product
- technical_support: Customer needs help with product issues, installation, troubleshooting
- missing_item: Customer reports missing items or parts from their order
- inspection_request: Customer requests product inspection or quality check
- others: Anything that doesn't fit above

Email subject: ${subject}
Email body:
${truncatedBody}

Respond in JSON only: {"category": "...", "confidence": 0.0-1.0, "reason": "one sentence why"}`,
      },
    ],
  });

  try {
    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: CATEGORIES.includes(parsed.category)
          ? parsed.category
          : "others",
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0)),
        reason: parsed.reason || "",
      };
    }
  } catch {
    // fallback
  }

  return { category: "others", confidence: 0, reason: "Classification failed" };
}
