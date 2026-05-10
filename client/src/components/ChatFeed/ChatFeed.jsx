import { useEffect, useRef } from "react";
import { useRag } from "../../context/RagContext";
import { UserMessage, AiMessage, ErrorMessage } from "./Message";

export function ChatFeed() {
  const { chat } = useRag();
  const { messages, isAsking } = chat;
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isAsking]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-up">
        <div className="w-12 h-12 rounded-2xl bg-overlay border border-border flex items-center justify-center text-txt-muted text-xl mb-6">
          <span className="animate-pulse">_</span>
        </div>
        <h2 className="text-txt font-bold text-lg tracking-tight mb-2">
          Initialize Conversation
        </h2>
        <p className="text-txt-soft text-sm max-w-xs leading-relaxed">
          Index a repository from the sidebar, then ask questions about the code
          logic.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-lg text-[11px] text-txt-muted">
          {[
            "Explain folder structure",
            "How does Auth work?",
            "API routes?",
          ].map((q) => (
            <div
              key={q}
              className="px-4 py-2 rounded-full border border-border-dim"
            >
              {q}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-8 space-y-8 scroll-smooth">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {messages.map((msg) =>
          msg.role === "user" ? (
            <UserMessage key={msg.id} {...msg} />
          ) : msg.role === "assistant" ? (
            <AiMessage key={msg.id} {...msg} />
          ) : (
            <ErrorMessage key={msg.id} {...msg} />
          ),
        )}
        {isAsking && <TypingIndicator />}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-4 px-4 self-start animate-fade-up">
      <div className="flex items-center gap-2 text-[10px] font-mono text-cyan uppercase font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
        Thinking
      </div>
      <div className="flex gap-1">
        <div className="w-1 h-1 rounded-full bg-cyan/40 bounce-1" />
        <div className="w-1 h-1 rounded-full bg-cyan/40 bounce-2" />
        <div className="w-1 h-1 rounded-full bg-cyan/40 bounce-3" />
      </div>
    </div>
  );
}
