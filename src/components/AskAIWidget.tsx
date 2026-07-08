"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import type { ChatStatus } from "ai";

const API_URL = "/api/v1/chat/completions";
const CORPUS_URL = "/llms-full.txt";
const MODEL = "gpt-5-nano";

const GROUNDED_SYSTEM_PROMPT = `You are Ask AI for Abhiram Chakkiyar's personal website.
Answer the reader's question using ONLY the site content provided below as CONTEXT.
- If the answer isn't in the context, say so plainly and point to the closest relevant essay.
- Cite essay titles, and include their URL when useful.
- Keep answers concise and practical. Never invent facts that aren't in the context.`;

const SUGGESTIONS = [
  "Summarize Abhiram's writing themes",
  "What should I read first from the blog?",
  "Which posts are best for engineering leaders?",
  "Give me 3 actionable ideas from this site",
];

type Role = "user" | "assistant";
type ChatMessage = { id: string; role: Role; content: string };
type UpstreamMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

let corpusPromise: Promise<string> | null = null;

const loadCorpus = async (): Promise<string> => {
  if (!corpusPromise) {
    corpusPromise = fetch(CORPUS_URL)
      .then(res => (res.ok ? res.text() : ""))
      .catch(() => "");
  }
  return corpusPromise;
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export default function AskAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const isBusy = status === "submitted" || status === "streaming";
  const placeholder = "Ask about Abhiram's essays and notes…";

  const submitQuestion = useCallback(
    async (question: string) => {
      if (isBusy) return;

      const userMessage: ChatMessage = {
        id: makeId(),
        role: "user",
        content: question,
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setStatus("submitted");

      try {
        const corpus = await loadCorpus();
        const systemPrompt = `${GROUNDED_SYSTEM_PROMPT}\n\n=== CONTEXT ===\n${corpus}`;

        const upstreamMessages: UpstreamMessage[] = [
          { role: "system", content: systemPrompt },
          ...nextMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ];

        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: MODEL,
            messages: upstreamMessages,
            stream: false,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data?.error?.message || data?.error || `HTTP ${res.status}`
          );
        }

        const answer =
          data?.choices?.[0]?.message?.content?.trim() || "No answer returned.";
        setMessages(prev => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: answer,
          },
        ]);
        setStatus("ready");
      } catch (error) {
        const detail = error instanceof Error ? error.message : "";
        setMessages(prev => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: `Sorry, I couldn't reach the assistant. ${detail}`.trim(),
          },
        ]);
        setStatus("error");
      }
    },
    [isBusy, messages]
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const question = message.text.trim();
      if (!question) return;
      setInput("");
      void submitQuestion(question);
    },
    [submitQuestion]
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setInput("");
      void submitQuestion(suggestion);
    },
    [submitQuestion]
  );

  return (
    <>
      <button
        id="ask-ai-trigger"
        type="button"
        aria-label="Ask AI"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed right-5 bottom-24 z-50 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg transition-transform hover:scale-105 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        Ask AI
      </button>

      {isOpen ? (
        <section
          id="ask-ai-panel"
          className="fixed right-5 bottom-24 z-50 flex h-[min(72vh,40rem)] w-[min(94vw,30rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          aria-label="Ask AI panel"
        >
          <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Ask AI
              </span>
            </div>
            <button
              type="button"
              aria-label="Close Ask AI"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <XIcon className="size-4" />
            </button>
          </header>

          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="gap-4 px-4 py-3">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Ask me about this site"
                  description="Grounded mode uses only content from Abhiram's site corpus."
                />
              ) : (
                messages.map(message => (
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      <MessageResponse>{message.content}</MessageResponse>
                    </MessageContent>
                  </Message>
                ))
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="grid gap-3 border-t border-neutral-200 p-3 dark:border-neutral-700">
            <Suggestions className="pb-1">
              {SUGGESTIONS.map(suggestion => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={handleSuggestion}
                  disabled={isBusy}
                />
              ))}
            </Suggestions>

            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea
                  placeholder={placeholder}
                  value={input}
                  onChange={event => setInput(event.target.value)}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit
                  status={status}
                  disabled={isBusy || input.trim().length === 0}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      ) : null}
    </>
  );
}
