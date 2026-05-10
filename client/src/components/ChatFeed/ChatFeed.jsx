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
        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-txt-muted font-mono text-lg mb-4">
          _
        </div>
        <h2 className="text-txt font-semibold text-[15px] tracking-tight mb-2">
          Initialize Conversation
        </h2>
        <p className="text-txt-muted text-[12px] max-w-[220px] leading-relaxed">
          Index a repository from the sidebar, then ask questions about the code
          logic.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            "Explain folder structure",
            "How does Auth work?",
            "API routes?",
          ].map((q) => (
            <button
              type="button"
              key={q}
              onClick={() => chat.selectDraftQuestion(q)}
              className="px-3 py-1.5 rounded-full border border-border-dim text-[10px] text-txt-muted cursor-pointer hover:border-cyan-border hover:text-cyan transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-6 scroll-smooth">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 px-4">
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
        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-2 self-start animate-fade-up">
      <div className="flex items-center gap-2 text-[9px] font-mono text-cyan uppercase font-semibold tracking-[0.16em]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-dot" />
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
