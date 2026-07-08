import {
  convertToModelMessages,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const MODEL = "gpt-5-nano";
const GROUNDED_SYSTEM_PROMPT = `You are Ask AI for Abhiram Chakkiyar's personal website.
Answer the reader's question using ONLY the site content provided below as CONTEXT.
- If the answer isn't in the context, say so plainly and point to the closest relevant essay.
- Cite essay titles, and include their URL when useful.
- Keep answers concise and practical. Never invent facts that aren't in the context.`;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let corpusPromise: Promise<string> | null = null;

function getRequestOrigin(req: any): string | null {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = forwardedHost || req.headers.host;
  if (!host) return null;

  const proto =
    typeof forwardedProto === "string" && forwardedProto.length > 0
      ? forwardedProto.split(",")[0].trim()
      : "https";
  return `${proto}://${host}`;
}

async function loadCorpus(req: any): Promise<string> {
  if (corpusPromise) return corpusPromise;

  const origin = getRequestOrigin(req);
  if (!origin) return "";

  corpusPromise = fetch(`${origin}/llms-full.txt`)
    .then(async response => {
      if (!response.ok) return "";
      return response.text();
    })
    .catch(() => "")
    .then(text => {
      if (!text) corpusPromise = null;
      return text;
    });

  return corpusPromise;
}

function parseBody(req: any): any {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body ?? {};
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST,OPTIONS");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        "Server misconfiguration: OPENAI_API_KEY is not set. Add it in Vercel project environment variables.",
    });
    return;
  }

  const body = parseBody(req);
  const incomingMessages: UIMessage[] = Array.isArray(body.messages)
    ? body.messages
    : [];

  try {
    const corpus = await loadCorpus(req);
    const systemPrompt = `${GROUNDED_SYSTEM_PROMPT}\n\n=== CONTEXT ===\n${corpus}`;

    const modelMessages = await convertToModelMessages(
      incomingMessages.map(({ id: _id, ...message }) => message)
    );

    const result = streamText({
      model: openai(MODEL),
      messages: modelMessages,
      system: systemPrompt,
    });

    const stream = toUIMessageStream({
      stream: result.stream,
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream,
    });
  } catch (error) {
    res.status(502).json({
      error: "Failed to stream response from OpenAI",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
