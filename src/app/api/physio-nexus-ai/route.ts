import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };
type WorkersAI = {
  run: (
    model: string,
    input: { messages: Array<{ role: "system" | "user" | "assistant"; content: string }> }
  ) => Promise<unknown>;
};

const SYSTEM_PROMPT = `You are PNA AI, the official educational assistant for Physio Nexus Academy (PNA), founded by Dr. Sajjad Raza PT in Pakistan.
Be accurate, warm, concise, and useful. Support physiotherapy education, musculoskeletal assessment concepts, rehabilitation principles, evidence-based practice, academy resources, and workshop information when known.
Use plain English or Roman Urdu according to the user's language. Do not invent PNA event dates, fees, credentials, research evidence, or website policies; if unsure, say so and direct the user to the official PNA contact channels.
For clinical questions, provide educational information only, highlight red flags and uncertainty, and never claim to diagnose a patient. Encourage in-person assessment for individual cases and urgent medical care for emergencies. Do not ask users to share names, phone numbers, medical record numbers, or other identifying patient information.`;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonError("Send a JSON request.", 415);
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 8) {
    return jsonError("Please send up to 8 recent chat messages.", 400);
  }

  const messages: ChatMessage[] = [];
  for (const item of body.messages) {
    if (
      !item ||
      typeof item !== "object" ||
      !("role" in item) ||
      !("content" in item) ||
      !["user", "assistant"].includes(String(item.role)) ||
      typeof item.content !== "string" ||
      !item.content.trim() ||
      item.content.length > 1200
    ) {
      return jsonError("One of the messages is invalid or too long.", 400);
    }
    messages.push({ role: item.role as ChatMessage["role"], content: item.content.trim() });
  }

  if (messages[messages.length - 1]?.role !== "user") {
    return jsonError("Your latest message must be a user message.", 400);
  }

  try {
    const context = getCloudflareContext();
    const ai = (context.env as unknown as { AI?: WorkersAI }).AI;
    if (!ai || typeof ai.run !== "function") {
      console.error("PNA AI binding is missing. Check the Cloudflare Workers AI binding.");
      return jsonError("PNA AI is not configured yet. Please try again later.", 503);
    }

    const result = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(({ role, content }) => ({ role, content })),
      ],
    });

    const reply =
      result && typeof result === "object" && "response" in result && typeof result.response === "string"
        ? result.response.trim()
        : "";

    if (!reply) {
      console.error("PNA AI returned an empty or unexpected response.");
      return jsonError("PNA AI could not generate a reply. Please try again.", 502);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("PNA AI request failed:", error instanceof Error ? error.message : "Unknown error");
    return jsonError("PNA AI is temporarily unavailable. Please try again shortly.", 503);
  }
}
