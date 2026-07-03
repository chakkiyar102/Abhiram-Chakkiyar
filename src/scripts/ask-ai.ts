/**
 * Ask AI — a small answering machine for Abhiram's site.
 *
 * Pure Q&A: no page automation, no agent tools. Grounds on the build-time
 * corpus at /llms-full.txt and asks the existing OpenAI-backed Vercel function
 * (/api/v1/chat/completions, keyed by OPENAI_API_KEY) for an answer.
 *
 * ponytail: non-streaming — the /api/v1 proxy buffers the upstream response
 * anyway, so streaming would need a server change for no real gain at this size.
 */

const API_URL = "/api/v1/chat/completions";
const CORPUS_URL = "/llms-full.txt";
const MODEL = "gpt-5.4-mini";

const SYSTEM_PROMPT = `You are Ask AI for Abhiram Chakkiyar's personal website.
Answer the reader's question using ONLY the site content provided below as CONTEXT.
- If the answer isn't in the context, say so plainly and point to the closest relevant essay.
- Cite essay titles, and include their URL when useful.
- Keep answers concise and practical. Never invent facts that aren't in the context.`;

type Msg = { role: "system" | "user" | "assistant"; content: string };

let corpusPromise: Promise<string> | null = null;
const history: Msg[] = [];

function loadCorpus(): Promise<string> {
  // ponytail: fetch the corpus once per page session, then reuse.
  if (!corpusPromise) {
    corpusPromise = fetch(CORPUS_URL)
      .then(r => (r.ok ? r.text() : ""))
      .catch(() => "");
  }
  return corpusPromise;
}

function ensurePanel(): HTMLElement {
  let panel = document.getElementById("ask-ai-panel");
  if (panel) return panel;

  panel = document.createElement("div");
  panel.id = "ask-ai-panel";
  panel.className =
    "fixed bottom-24 right-5 z-50 hidden w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900";
  panel.innerHTML = `
    <div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
      <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Ask AI</span>
      <button id="ask-ai-close" type="button" aria-label="Close" class="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">&times;</button>
    </div>
    <div id="ask-ai-log" class="flex max-h-[50vh] flex-col gap-3 overflow-y-auto px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200">
      <p class="text-neutral-500 dark:text-neutral-400">Ask me anything about Abhiram's essays and notes.</p>
    </div>
    <form id="ask-ai-form" class="flex gap-2 border-t border-neutral-200 p-3 dark:border-neutral-700">
      <input id="ask-ai-input" type="text" autocomplete="off" placeholder="Ask a question…"
        class="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100" />
      <button type="submit" aria-label="Send"
        class="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300">Send</button>
    </form>`;
  document.body.appendChild(panel);
  return panel;
}

function addBubble(text: string, who: "user" | "ai"): HTMLElement {
  const log = document.getElementById("ask-ai-log")!;
  const el = document.createElement("div");
  el.className =
    who === "user"
      ? "self-end rounded-lg bg-neutral-900 px-3 py-2 text-white dark:bg-neutral-100 dark:text-neutral-900"
      : "self-start whitespace-pre-wrap";
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

async function ask(question: string) {
  addBubble(question, "user");
  const answer = addBubble("…", "ai");
  history.push({ role: "user", content: question });

  try {
    const corpus = await loadCorpus();
    const messages: Msg[] = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n=== CONTEXT ===\n${corpus}` },
      ...history,
    ];
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.3, stream: false }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || data?.error || `HTTP ${res.status}`);
    const reply = data?.choices?.[0]?.message?.content?.trim() || "No answer returned.";
    answer.textContent = reply;
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    answer.textContent = `Sorry — couldn't reach the assistant. ${
      err instanceof Error ? err.message : ""
    }`.trim();
    history.pop(); // drop the unanswered user turn so retry isn't polluted
  }
  document.getElementById("ask-ai-log")!.scrollTop = 1e9;
}

function togglePanel(open?: boolean) {
  const panel = ensurePanel();
  const show = open ?? panel.classList.contains("hidden");
  panel.classList.toggle("hidden", !show);
  panel.classList.toggle("flex", show);
  if (show) (document.getElementById("ask-ai-input") as HTMLInputElement)?.focus();
}

// Single delegated listener on document — survives Astro view-transition body swaps.
if (!(window as any).__askAIWired) {
  (window as any).__askAIWired = true;

  document.addEventListener("click", e => {
    const t = e.target as HTMLElement;
    if (t.closest("#ask-ai-trigger")) togglePanel();
    else if (t.closest("#ask-ai-close")) togglePanel(false);
  });

  document.addEventListener("submit", e => {
    const form = (e.target as HTMLElement).closest("#ask-ai-form");
    if (!form) return;
    e.preventDefault();
    const input = document.getElementById("ask-ai-input") as HTMLInputElement;
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    ask(q);
  });
}
