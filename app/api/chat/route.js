import Anthropic from "@anthropic-ai/sdk";
import { adminReady, verifyToken } from "../../../lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
const MAX_MESSAGES = 40;
const MAX_CHARS = 12000;

const SYSTEM = `You are ShamsAI, a warm, sharp and fast AI assistant.
- Answer in the language the user writes in. If they write Roman Urdu, reply in Roman Urdu.
- Be clear and concise. Use short paragraphs, and lists or code blocks only when they help.
- If you are not sure about something, say so instead of guessing.`;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  // 1) Who is asking? Only signed-in users can use the AI.
  const idToken = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (adminReady) {
    const uid = await verifyToken(idToken);
    if (!uid) return json({ error: "Please sign in again." }, 401);
  } else if (process.env.NODE_ENV === "production") {
    return json({ error: "Server sign-in check is not configured." }, 500);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "ANTHROPIC_API_KEY is missing on the server." }, 500);
  }

  // 2) Validate the input.
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json({ error: "Send a message first." }, 400);
  }

  // 3) Stream the answer token by token for instant-feeling replies.
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: MODEL,
          max_tokens: 2048,
          system: SYSTEM,
          messages,
        });
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode("\n\n[ShamsAI could not finish this reply. Try again.]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
