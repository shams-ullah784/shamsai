import Anthropic from "@anthropic-ai/sdk";
import { adminReady, verifyToken } from "../../../lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 40;
const MAX_CHARS = 12000;

const SYSTEM = `You are ShamsAI, a warm, sharp and fast AI assistant.
- Identity: your name is ShamsAI. You were created and built by Shams Mehsud. If anyone asks who you are, who made you, who created you or who owns you, say that you are ShamsAI and that Shams Mehsud created you. Say it with pride, in one or two friendly sentences.
- If asked which technology or company's model runs under the hood, answer honestly that you are an AI language model and that you do not have the details. Never claim that another company or person built you.
- Answer in the language the user writes in. If they write Roman Urdu, reply in Roman Urdu.
- Be clear and concise. Use short paragraphs, and lists or code blocks only when they help.
- If you are not sure about something, say so instead of guessing.`;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/* Which AI to use: Anthropic if its key exists, otherwise Gemini (free tier). */
function pickProvider() {
  const forced = (process.env.AI_PROVIDER || "").toLowerCase();
  if (forced === "gemini" || forced === "anthropic") return forced;
  return process.env.ANTHROPIC_API_KEY ? "anthropic" : "gemini";
}

/* ---------- Anthropic (paid) ---------- */
async function* streamAnthropic(messages) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = client.messages.stream({
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
    max_tokens: 2048,
    system: SYSTEM,
    messages,
  });
  for await (const event of response) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

/* ---------- Gemini (free tier) ---------- */
async function* streamGemini(messages) {
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    }),
  });

  if (!res.ok || !res.body) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err?.error?.message || "";
    } catch {}
    console.error(`Gemini error ${res.status} (model: ${model}): ${detail}`);
    if (res.status === 429) throw new Error("Free limit reached. Wait a minute and try again.");
    throw new Error(`Gemini error ${res.status} (model: ${model}). ${detail}`.trim());
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try {
        const data = JSON.parse(line.slice(5).trim());
        const parts = data?.candidates?.[0]?.content?.parts || [];
        for (const p of parts) if (p.text && !p.thought) yield p.text;
      } catch {
        /* ignore partial lines */
      }
    }
  }
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

  const provider = pickProvider();
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    return json({ error: "ANTHROPIC_API_KEY is missing on the server." }, 500);
  }
  if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
    return json({ error: "No AI key found. Add GEMINI_API_KEY (free) to .env.local and restart." }, 500);
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

  // 3) Stream the answer piece by piece for instant-feeling replies.
  const encoder = new TextEncoder();
  const source = provider === "gemini" ? streamGemini(messages) : streamAnthropic(messages);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const text of source) controller.enqueue(encoder.encode(text));
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n[${err?.message || "ShamsAI could not finish this reply. Try again."}]`));
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
