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

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const showPendingAssistant = isBusy && lastMessage?.role !== "assistant";
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
                <ConversationEmptyState
                  title="Ask me about this site"
                  description="Grounded mode uses only content from Abhiram's site corpus."
                />
              ) : (
                messages.map(message => {
                  const text = message.parts
                    .filter(part => part.type === "text")
                    .map(part => part.text)
                    .join("");
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

              {showPendingAssistant ? (
                <Message from="assistant">
                  <MessageContent>
                    <div className="text-muted-foreground animate-pulse text-sm">
                      Thinking...
                    </div>
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
