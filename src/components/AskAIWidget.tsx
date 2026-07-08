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
import { useCallback, useMemo, useState } from "react";

const API_URL = "/api/v1/chat/stream";

const SUGGESTIONS = [
  "Summarize Abhiram's writing themes",
  "What should I read first from the blog?",
  "Which posts are best for engineering leaders?",
  "Give me 3 actionable ideas from this site",
];

const EMPTY_STATE_EMOJIS = ["✨", "🤖", "📚", "🚀", "💡"];

type AssistantTypingIndicatorProps = {
  phase: "submitted" | "streaming";
  onStop: () => void;
};

function AssistantTypingIndicator({
  phase,
  onStop,
}: AssistantTypingIndicatorProps) {
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
            : "Generating response..."}
        </p>
        <p className="truncate text-[11px] text-cyan-700/90 dark:text-cyan-200/80">
          Grounding from Abhiram&apos;s site corpus
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

  const { messages, sendMessage, status, stop, error } = useChat({
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
  const showPendingAssistant = status === "submitted";
  const placeholder = "Ask about Abhiram's essays and notes…";

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
                <div className="relative flex min-h-[18rem] flex-col items-center justify-center overflow-hidden rounded-xl border border-neutral-200/80 bg-gradient-to-br from-cyan-50 to-amber-50 px-5 py-8 text-center dark:border-neutral-700 dark:from-cyan-950/30 dark:to-amber-950/30">
                  <div className="pointer-events-none absolute -top-8 -left-6 h-20 w-20 rounded-full bg-cyan-200/60 blur-xl dark:bg-cyan-700/30" />
                  <div className="pointer-events-none absolute -right-6 -bottom-10 h-24 w-24 rounded-full bg-amber-200/70 blur-xl dark:bg-amber-700/30" />

                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <img
                      src="/avatar.jpg"
                      alt="Abhiram"
                      className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-md dark:border-neutral-800"
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
                  const isStreamingAssistant =
                    status === "streaming" &&
                    message.role === "assistant" &&
                    message.id === lastMessage?.id;
                  const showInlineTypingIndicator =
                    isStreamingAssistant && text.trim().length === 0;

                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        <MessageResponse isAnimating={isStreamingAssistant}>
                          {showInlineTypingIndicator ? (
                            <AssistantTypingIndicator
                              phase="streaming"
                              onStop={() => {
                                void stop();
                              }}
                            />
                          ) : (
                            text
                          )}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                })
              )}

              {showPendingAssistant ? (
                <Message from="assistant">
                  <MessageContent>
                    <AssistantTypingIndicator
                      phase="submitted"
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
