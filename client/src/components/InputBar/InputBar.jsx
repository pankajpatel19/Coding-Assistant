import { useEffect, useRef } from "react";
import { useRag } from "../../context/RagContext";

export function InputBar() {
  const { chat, indexing } = useRag();
  const inputRef = useRef(null);
  const input = chat.draftQuestion;

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea || textarea.disabled || !textarea.value) return;

    textarea.focus();
    textarea.select();
  }, [chat.draftSelectionVersion]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || chat.isAsking) return;
    chat.ask(input.trim());
    chat.setDraftQuestion("");
  };

  return (
    <div className="px-6 pb-6 pt-3 bg-base z-20 relative flex-shrink-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Textarea + Send */}
        <form onSubmit={handleSend} className="flex items-end gap-2.5">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={
                indexing.repo
                  ? "Ask the codebase a question..."
                  : "Waiting for repository index..."
              }
              disabled={!indexing.repo || chat.isAsking}
              value={input}
              onChange={(e) => chat.setDraftQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              className="w-full bg-surface border border-border text-txt rounded-xl px-5 py-4 pr-14 text-[14px] font-mono tracking-tight focus:border-cyan/40 focus:ring-4 focus:ring-cyan/5 outline-none transition-all resize-none shadow-sm disabled:opacity-20 placeholder:text-txt-muted/50 leading-relaxed"
            />

            {/* Status dot */}
            <div className="absolute right-12 bottom-4 flex items-center">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${chat.isAsking ? "bg-cyan animate-pulse" : "bg-border"}`}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!indexing.repo || !input.trim() || chat.isAsking}
              className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-lg bg-cyan text-[#04201a] disabled:opacity-0 transition-all hover:bg-[#00f0c0] active:scale-95 flex items-center justify-center"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925L10.788 10l-7.095 1.836-1.414 4.925a.75.75 0 00.826.95 44.896 44.896 0 0012.845-7.425.75.75 0 000-1.212A44.896 44.896 0 003.105 2.289z" />
              </svg>
            </button>
          </div>

          {/* Desktop mode switch */}
          <div className="hidden lg:flex flex-col bg-[#0e141c] border border-[#1e2b3a] p-[3px] rounded-lg mb-1 gap-[2px]">
            {["semantic", "keyword"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => chat.setMode(m)}
                className={`px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] rounded transition-all
                  ${chat.mode === m ? "bg-cyan text-[#04201a]" : "text-[#2a3a4a] hover:text-[#6a7f94]"}`}
              >
                {m[0]}
              </button>
            ))}
          </div>
        </form>

        {/* Keyboard hints */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-4 text-[9px] font-mono text-[#1e2b3a] uppercase tracking-[0.14em]">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-[#0e141c] border border-[#1e2b3a] px-1.5 py-0.5 rounded text-[9px]">
                Enter
              </kbd>
              <span>to send</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-[#1e2b3a]" />
            <span className="flex items-center gap-1.5">
              <kbd className="bg-[#0e141c] border border-[#1e2b3a] px-1.5 py-0.5 rounded text-[9px]">
                Shift
              </kbd>
              <span>+</span>
              <kbd className="bg-[#0e141c] border border-[#1e2b3a] px-1.5 py-0.5 rounded text-[9px]">
                Enter
              </kbd>
              <span>newline</span>
            </span>
          </div>

          {/* Mobile mode switch */}
          <div className="lg:hidden flex bg-[#0e141c] border border-[#1e2b3a] rounded-lg p-[3px] gap-[2px]">
            {["semantic", "keyword"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => chat.setMode(m)}
                className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] rounded transition-all
                  ${chat.mode === m ? "bg-cyan text-[#04201a]" : "text-[#2a3a4a]"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
