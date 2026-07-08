"use client";

import {
  Conversation,
  ConversationContent,
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
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "/api/v1/chat/stream";

const SUGGESTIONS = [
  "Summarize Abhiram's writing themes",
  "What should I read first from the blog?",
  "Which posts are best for engineering leaders?",
  "Give me 3 actionable ideas from this site",
];

const EMPTY_STATE_EMOJIS = ["✨", "🤖", "📚", "🚀", "💡"];

const WAITING_STATUS_LINES = {
  submitted: [
    "Loading the grounded site corpus...",
    "Preparing context from essays and notes...",
    "Starting the response pipeline...",
  ],
  streaming: [
    "Synthesizing ideas from published posts...",
    "Cross-checking themes before final wording...",
    "Drafting a concise grounded answer...",
  ],
  waiting: [
    "Still aligning your question with relevant posts...",
    "Connecting themes across writing, UX, and engineering notes...",
    "Working through the corpus to avoid a shallow answer...",
  ],
} as const;

type AssistantTypingIndicatorProps = {
  phase: "submitted" | "streaming" | "waiting";
  onStop: () => void;
};

function AssistantTypingIndicator({
  phase,
  onStop,
}: AssistantTypingIndicatorProps) {
  const lines = WAITING_STATUS_LINES[phase];
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    setLineIndex(0);
    const timer = window.setInterval(() => {
      setLineIndex(current => (current + 1) % lines.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [lines]);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-cyan-200/70 bg-cyan-50/60 px-3 py-2 dark:border-cyan-800 dark:bg-cyan-950/20">
      <div
        className="inline-flex items-center gap-1"
        aria-hidden="true"
        aria-label="Assistant is typing"
      >
        {[0, 1, 2].map(index => (
          <span
            key={index}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-600 dark:bg-cyan-300"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-cyan-900 dark:text-cyan-100">
          {phase === "submitted"
            ? "Connecting to assistant..."
            : phase === "streaming"
              ? "Generating response..."
              : "Still working on your answer..."}
        </p>
        <p className="truncate text-[11px] text-cyan-700/90 dark:text-cyan-200/80">
          {lines[lineIndex]}
        </p>
      </div>
      <button
        type="button"
        onClick={onStop}
        className="shrink-0 rounded-md border border-cyan-300 px-2 py-1 text-[11px] font-medium text-cyan-800 transition-colors hover:bg-cyan-100 dark:border-cyan-700 dark:text-cyan-200 dark:hover:bg-cyan-900/40"
      >
        Stop
      </button>
    </div>
  );
}

export default function AskAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: API_URL,
      }),
    []
  );

  const { messages, sendMessage, setMessages, status, stop, clearError, error } =
    useChat({
      transport,
    });

  const getMessageText = useCallback(
    (message: (typeof messages)[number]) =>
      message.parts
        .filter(part => part.type === "text")
        .map(part => part.text)
        .join(""),
    []
  );

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const placeholder = "Ask about Abhiram's essays and notes…";

  const latestUserIndex = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role === "user") {
        return index;
      }
    }
    return -1;
  }, [messages]);

  const latestAssistantWithTextIndex = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message?.role !== "assistant") continue;
      if (getMessageText(message).trim().length > 0) {
        return index;
      }
    }
    return -1;
  }, [getMessageText, messages]);

  const waitingForAssistant = latestUserIndex > latestAssistantWithTextIndex;
  const showProgressIndicator = waitingForAssistant && !error;
  const progressPhase =
    status === "submitted"
      ? "submitted"
      : status === "streaming"
        ? "streaming"
        : "waiting";

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const question = message.text.trim();
      if (!question || isBusy) return;
      setInput("");
      void sendMessage({ text: question });
    },
    [isBusy, sendMessage]
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      if (isBusy) return;
      setInput("");
      void sendMessage({ text: suggestion });
    },
    [isBusy, sendMessage]
  );

  const handleNewChat = useCallback(() => {
    if (isBusy) {
      void stop();
    }
    setInput("");
    setMessages([]);
    clearError();
  }, [clearError, isBusy, setMessages, stop]);

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
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Ask AI
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNewChat}
                disabled={messages.length === 0 && !error}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                New chat
              </button>
              <button
                type="button"
                aria-label="Close Ask AI"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </header>

          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="gap-4 px-4 py-3">
              {messages.length === 0 ? (
                <div className="relative flex min-h-[18rem] flex-col items-center justify-center overflow-hidden rounded-xl border border-neutral-200/80 bg-gradient-to-br from-cyan-50 to-amber-50 px-5 py-8 text-center dark:border-neutral-700 dark:from-cyan-950/30 dark:to-amber-950/30">
                  <div className="pointer-events-none absolute -top-8 -left-6 h-20 w-20 rounded-full bg-cyan-200/60 blur-xl dark:bg-cyan-700/30" />
                  <div className="pointer-events-none absolute -right-6 -bottom-10 h-24 w-24 rounded-full bg-amber-200/70 blur-xl dark:bg-amber-700/30" />

                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <img
                      src="/avatar.jpg"
                      alt="Abhiram"
                      className="h-24 w-24 rounded-2xl border-2 border-white bg-white object-contain p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                      loading="lazy"
                    />
                    <div className="space-y-1">
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-neutral-100">
                        Ask me about this site
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-neutral-300">
                        Grounded mode uses only content from Abhiram&apos;s site
                        corpus.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {EMPTY_STATE_EMOJIS.map((emoji, index) => (
                        <span
                          key={`${emoji}-${index}`}
                          className="inline-flex h-8 w-8 animate-bounce items-center justify-center rounded-full border border-cyan-200/80 bg-white/75 text-base shadow-sm dark:border-cyan-700 dark:bg-neutral-900/70"
                          style={{ animationDelay: `${index * 140}ms` }}
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map(message => {
                  const text = getMessageText(message);
                  if (message.role === "assistant" && text.trim().length === 0) {
                    return null;
                  }
                  const isStreamingAssistant =
                    status === "streaming" &&
                    message.role === "assistant" &&
                    message.id === lastMessage?.id;

                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        <MessageResponse isAnimating={isStreamingAssistant}>
                          {text}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                })
              )}

              {showProgressIndicator ? (
                <Message from="assistant">
                  <MessageContent>
                    <AssistantTypingIndicator
                      phase={progressPhase}
                      onStop={() => {
                        void stop();
                      }}
                    />
                  </MessageContent>
                </Message>
              ) : null}

              {error ? (
                <Message from="assistant">
                  <MessageContent>
                    <MessageResponse>{`Sorry, I couldn't reach the assistant. ${error.message}`}</MessageResponse>
                  </MessageContent>
                </Message>
              ) : null}
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
                  onStop={() => {
                    void stop();
                  }}
                  disabled={!isBusy && input.trim().length === 0}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      ) : null}
    </>
  );
}
